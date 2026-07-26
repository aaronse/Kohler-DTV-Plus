/**
 * Line icons redrawn from the K-99693 interface artwork in Kohler's user guide
 * (1241234-5-D). Single-weight strokes, round caps, 24x24 grid.
 */
interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

/** Water droplet — the [shower] tile. */
export const DropIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M12 3.2c2.9 3.4 5 6.1 5 8.9a5 5 0 0 1-10 0c0-2.8 2.1-5.5 5-8.9Z" />
  </svg>
);

/** Head and shoulders — the [users] tile. */
export const UserIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <circle cx="12" cy="7.4" r="3.4" />
    <path d="M5.6 20.2c0-3.6 2.9-6 6.4-6s6.4 2.4 6.4 6" />
  </svg>
);

/** Beamed note — the [music] tile. */
export const MusicIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M9.6 17.2V5.6l8-1.6v11.2" />
    <circle cx="7.4" cy="17.4" r="2.2" />
    <circle cx="15.4" cy="15.4" r="2.2" />
  </svg>
);

/** Lotus — the [spa] tile. */
export const SpaIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M12 19.4c-3.6 0-6.6-2-8-4.6 1.5-1 3.2-1.3 4.7-1" />
    <path d="M12 19.4c3.6 0 6.6-2 8-4.6-1.5-1-3.2-1.3-4.7-1" />
    <path d="M12 19.2c-2-1.8-3.1-4-3.1-6.2 0-2.5 1.2-4.7 3.1-6.4 1.9 1.7 3.1 3.9 3.1 6.4 0 2.2-1.1 4.4-3.1 6.2Z" />
  </svg>
);

/** Rounded square — the [stop everything] tile. */
export const StopSquareIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <rect x="6.6" y="6.6" width="10.8" height="10.8" rx="2.2" />
  </svg>
);

/** Radiating dial — the [settings] tile. */
export const SettingsIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <circle cx="12" cy="13.4" r="3.1" />
    <circle cx="12" cy="13.4" r="0.9" fill="currentColor" stroke="none" />
    <path d="M12 3.6v2.2M6 5.2l1.2 1.9M18 5.2l-1.2 1.9M3.4 9.4l2.1.8M20.6 9.4l-2.1.8" />
  </svg>
);

/** House — returns to the home screen. */
export const HomeIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M4.2 11.4 12 4.8l7.8 6.6" />
    <path d="M6.2 10.4v8.4h11.6v-8.4" />
    <path d="M10.3 18.8v-4.2h3.4v4.2" />
  </svg>
);

/** The fanned "W" Kohler uses for [massage]. */
export const MassageIcon = ({ size = 24, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M4.4 6.6 8 17.6l4-8.4 4 8.4 3.6-11" />
    <path d="M7.2 6.6 8 9.4M16.8 6.6 16 9.4" />
  </svg>
);

/** Power — the leftmost key below the glass. */
export const PowerIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M12 3.6v7.6" />
    <path d="M7.4 6.4a6.6 6.6 0 1 0 9.2 0" />
  </svg>
);

export const ChevronUpIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M5.4 14.6 12 8.4l6.6 6.2" />
  </svg>
);

export const ChevronDownIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M5.4 9.4 12 15.6l6.6-6.2" />
  </svg>
);

/** Double chevron shown beside the temperature while it is moving. */
export const TrendIcon = ({ size = 26, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M5 12.6 12 6l7 6.6" />
    <path d="M5 18.4 12 11.8l7 6.6" />
  </svg>
);

export const PlayIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M9 6.6 17.2 12 9 17.4V6.6Z" />
  </svg>
);

export const PauseIcon = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <path d="M9.6 6.4v11.2M14.4 6.4v11.2" />
  </svg>
);

export const CloseIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" />
  </svg>
);

/** Speed indicator in the massage sheet: 1-3 filled arrows. */
export const SpeedIcon = ({ level, size = 22 }: { level: number; size?: number }) => (
  <svg {...base(size)} width={size * 1.6} viewBox="0 0 38 24" aria-hidden>
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d="M8 6.4 14 12l-6 5.6V6.4Z"
        transform={`translate(${i * 10 - 6} 0)`}
        fill={i < level ? 'currentColor' : 'none'}
      />
    ))}
  </svg>
);
