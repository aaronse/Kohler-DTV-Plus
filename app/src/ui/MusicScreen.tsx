import { useEffect, useRef, useState } from 'react';
import * as api from '../api/client';
import type { ShowerModel } from '../api/model';
import { HomeIcon, PauseIcon, PlayIcon } from './Icons';

interface Props {
  model: ShowerModel;
  onHome: () => void;
}

export function MusicScreen({ model, onHome }: Props) {
  const [volume, setVolume] = useState(model.audio.volume);
  const [busy, setBusy] = useState(false);
  const touched = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track the controller until the user takes the slider.
  useEffect(() => {
    if (!touched.current) setVolume(model.audio.volume);
  }, [model.audio.volume]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onVolume = (next: number) => {
    touched.current = true;
    setVolume(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void api.setVolume(next).catch(() => {});
      touched.current = false;
    }, 400);
  };

  const toggle = async () => {
    setBusy(true);
    try {
      if (model.audio.playing) await api.musicOff(volume);
      else await api.musicOn(volume);
    } catch {
      /* surfaced by the status strip on the next poll */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen-body">
      <div className="music-pane">
        <div className="vol-column">
          <input
            className="vol-slider"
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => onVolume(Number(e.target.value))}
            aria-label="volume"
          />
          volume
        </div>

        <div className="music-main">
          <div className="music-device">
            {model.audio.installed ? 'Amplifier K-99696' : 'No amplifier'}
          </div>
          <div className="music-sub">
            {model.audio.playing ? 'playing' : 'stopped'} · {volume}%
            {model.audio.muted ? ' · muted' : ''}
          </div>
          <div className="music-sub">
            Source is whatever is paired to the amplifier over Bluetooth or line-in.
          </div>
        </div>
      </div>

      <div className="action-bar">
        <button className="action bare" onClick={onHome}>
          <span className="glyph">
            <HomeIcon />
          </span>
          home
        </button>
        <button
          className={`action bare${busy ? ' busy' : ''}`}
          onClick={toggle}
          disabled={busy || !model.audio.installed}
        >
          <span className="glyph">{model.audio.playing ? <PauseIcon /> : <PlayIcon />}</span>
          {model.audio.playing ? 'pause' : 'play'}
        </button>
        <span />
      </div>
    </div>
  );
}
