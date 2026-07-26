"""
Kohler DTV+ HTTP Client Library

A purpose-built HTTP client that handles the quirks of the Kohler DTV+
controller's embedded web server:

  - Only 2 concurrent HTTP sessions are supported
  - CGI responses often lack a Content-Length header
  - Hung connections timeout after ~20 seconds server-side
  - The server does not always close sockets cleanly

Usage:
    from kohler_http import KohlerClient

    client = KohlerClient("192.168.1.100")
    result = client.get("/values.cgi")
    print(result["body"])
"""

import socket
import time
import json
import sys
from typing import Optional, Dict, Tuple


class KohlerClient:
    """
    HTTP client designed for the Kohler DTV+ controller.

    Each request opens a fresh TCP connection with Connection: close,
    reads until the server closes the socket (since Content-Length is
    often missing), and aggressively tears down the socket afterward.

    A minimum 500ms delay is enforced between requests to avoid
    exhausting the controller's 2-session limit.
    """

    CONNECT_TIMEOUT = 3.0
    READ_TIMEOUT = 5.0
    REQUEST_SPACING = 0.5
    MAX_RESPONSE = 65536

    def __init__(self, host: str, port: int = 80):
        self.host = host
        self.port = port
        self._last_request = 0.0

    def get(self, path: str, params: Optional[Dict[str, str]] = None) -> dict:
        """Send a GET request. Returns dict with success, status_code, body, error, elapsed_ms."""
        return self._request("GET", path, params)

    def _request(self, method: str, path: str, params: Optional[Dict[str, str]] = None) -> dict:
        self._enforce_spacing()

        result = {
            "success": False,
            "status_code": 0,
            "body": "",
            "error": None,
            "elapsed_ms": 0,
        }

        # Build URL with query string
        url = path
        if params:
            query = "&".join(f"{k}={v}" for k, v in params.items())
            separator = "&" if "?" in path else "?"
            url = f"{path}{separator}{query}"

        # Build raw HTTP request
        raw_request = (
            f"{method} {url} HTTP/1.0\r\n"
            f"Host: {self.host}\r\n"
            f"Connection: close\r\n"
            f"User-Agent: KohlerClient/1.0\r\n"
            f"\r\n"
        ).encode("utf-8")

        start = time.time()
        sock = None

        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.CONNECT_TIMEOUT)
            sock.connect((self.host, self.port))

            sock.sendall(raw_request)

            status_code, body = self._read_response(sock)
            result["success"] = True
            result["status_code"] = status_code
            result["body"] = body

        except socket.timeout:
            result["error"] = "Connection timeout"
        except ConnectionRefusedError:
            result["error"] = "Connection refused — is the controller powered on?"
        except OSError as e:
            result["error"] = str(e)
        finally:
            if sock:
                try:
                    sock.shutdown(socket.SHUT_RDWR)
                except OSError:
                    pass
                sock.close()
            self._last_request = time.time()
            result["elapsed_ms"] = int((time.time() - start) * 1000)

        return result

    def _read_response(self, sock: socket.socket) -> Tuple[int, str]:
        """Read until the server closes the connection."""
        sock.settimeout(self.READ_TIMEOUT)
        chunks = []
        total = 0

        while total < self.MAX_RESPONSE:
            try:
                data = sock.recv(4096)
                if not data:
                    break
                chunks.append(data)
                total += len(data)
            except socket.timeout:
                break

        raw = b"".join(chunks).decode("utf-8", errors="replace")

        # Parse HTTP response if present; otherwise treat as raw CGI output
        if raw.startswith("HTTP/"):
            try:
                header_end = raw.index("\r\n\r\n")
                status_line = raw[:raw.index("\r\n")]
                status_code = int(status_line.split()[1])
                body = raw[header_end + 4:]
                return status_code, body
            except (ValueError, IndexError):
                return 0, raw
        else:
            return 200, raw

    def _enforce_spacing(self):
        """Wait if needed to avoid hammering the controller's 2-session limit."""
        elapsed = time.time() - self._last_request
        if elapsed < self.REQUEST_SPACING:
            time.sleep(self.REQUEST_SPACING - elapsed)

    def get_json(self, path: str, params: Optional[Dict[str, str]] = None) -> Optional[dict]:
        """GET request that parses the response body as JSON. Returns None on failure."""
        result = self.get(path, params)
        if result["success"] and result["body"]:
            try:
                return json.loads(result["body"])
            except json.JSONDecodeError:
                return None
        return None


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python kohler_http.py <controller_ip>")
        print("Example: python kohler_http.py 192.168.1.100")
        sys.exit(1)

    host = sys.argv[1]
    print(f"Testing connection to {host}...")

    client = KohlerClient(host)
    result = client.get("/ftp_status.cgi")

    print(f"  Success: {result['success']}")
    print(f"  Status:  {result['status_code']}")
    print(f"  Elapsed: {result['elapsed_ms']}ms")
    if result["error"]:
        print(f"  Error:   {result['error']}")
    if result["body"]:
        print(f"  Body:    {result['body'][:200]}")
