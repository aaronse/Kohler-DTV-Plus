import { useState } from 'react';
import { outletIcon } from '../api/outlets';
import { isScaldRange, usableOutlets, type Outlet, type ShowerModel } from '../api/model';
import type { Theme } from '../state/useTheme';
import { CloseIcon, HomeIcon, MassageIcon, SpeedIcon } from './Icons';

interface Props {
  model: ShowerModel;
  selection: Set<number>;
  targetTemp: number;
  massage: number;
  busy: boolean;
  theme: Theme;
  onToggleOutlet: (position: number) => void;
  onStart: () => void;
  onStop: () => void;
  onMassage: (mode: number) => void;
  onHome: () => void;
}

const MASSAGE_MODES = [
  { value: 0, label: 'off' },
  { value: 1, label: 'single' },
  { value: 2, label: 'wave' },
];

function OutletButton({
  outlet,
  selected,
  flowing,
  theme,
  onToggle,
}: {
  outlet: Outlet;
  selected: boolean;
  flowing: boolean;
  theme: Theme;
  onToggle: () => void;
}) {
  return (
    <button
      className="outlet"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`${outlet.label}, outlet ${outlet.position}`}
      title={outlet.label}
    >
      <img src={outletIcon(outlet.typeId, selected, theme)} alt="" draggable={false} />
      {flowing && <span className="flowing" aria-label="flowing" />}
      <span className="outlet-label">{outlet.label}</span>
    </button>
  );
}

export function ShowerScreen({
  model,
  selection,
  targetTemp,
  massage,
  busy,
  theme,
  onToggleOutlet,
  onStart,
  onStop,
  onMassage,
  onHome,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [speed, setSpeed] = useState(1);

  const valve = model.valves[0];
  const outlets = usableOutlets(valve);
  const running = model.showerOn;
  // Before water flows the big numeral is the target; once it flows the guide
  // shows measured temperature above and target below. This controller does not
  // publish a measured value, so the target stays authoritative and we mark it.
  const shown = running ? valve.targetTemp || targetTemp : targetTemp;
  const anyMassageCapable = outlets.some((o) => o.massageCapable);
  const hot = isScaldRange(targetTemp, model.units);

  return (
    <>
      <div className="screen-body">
        <div className="temp-slab">
          <div className={`temp-row${hot ? ' hot' : ''}`}>
            <span className="temp-value">{Math.round(shown)}</span>
            <span className="temp-deg">°</span>
          </div>
          <div className="temp-rule" />
          <div className="temp-target">target: {Math.round(targetTemp)}°</div>
          {hot && (
            <div className="temp-warning" role="status">
              above {model.units === 'F' ? '109°F' : '43°C'} — can scald
            </div>
          )}
          {valve.statusText && valve.statusText.toLowerCase() !== 'off' && (
            <div className="temp-caption">{valve.statusText}</div>
          )}
        </div>

        <div className="outlet-grid">
          {outlets.map((o) => (
            <OutletButton
              key={o.position}
              outlet={o}
              selected={selection.has(o.position)}
              flowing={running && selection.has(o.position)}
              theme={theme}
              onToggle={() => onToggleOutlet(o.position)}
            />
          ))}
          {outlets.length === 0 && (
            <p className="sys-note" style={{ gridColumn: '1 / -1' }}>
              No outlets are configured on valve 1.
            </p>
          )}
        </div>

        <div className="action-bar">
          <button className="action bare" onClick={onHome}>
            <span className="glyph">
              <HomeIcon />
            </span>
            home
          </button>

          {running ? (
            <button
              className={`action danger${busy ? ' busy' : ''}`}
              onClick={onStop}
              disabled={busy}
            >
              <span className="glyph">stop</span>
            </button>
          ) : (
            <button
              className={`action primary${busy ? ' busy' : ''}`}
              onClick={onStart}
              disabled={busy || outlets.length === 0}
            >
              <span className="glyph">start</span>
            </button>
          )}

          <button
            className="action bare"
            onClick={() => setSheetOpen(true)}
            disabled={!model.massageEnabled || !anyMassageCapable}
          >
            <span className="glyph">
              <MassageIcon />
            </span>
            massage
          </button>
        </div>
      </div>

      {sheetOpen && (
        <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <span>massage options</span>
              <button onClick={() => setSheetOpen(false)} aria-label="close">
                <CloseIcon />
              </button>
            </div>

            {MASSAGE_MODES.map((m) => (
              <button
                key={m.value}
                className={`radio-row${massage === m.value ? ' on' : ''}`}
                onClick={() => onMassage(m.value)}
              >
                <span className="radio-dot" />
                {m.label}
              </button>
            ))}

            <div className="radio-row" style={{ justifyContent: 'space-between' }}>
              <span>speed</span>
              <button
                onClick={() => setSpeed((s) => (s % 3) + 1)}
                aria-label={`cycling speed ${speed} of 3`}
              >
                <SpeedIcon level={speed} />
              </button>
            </div>

            <p className="sys-note" style={{ marginTop: 4 }}>
              Massage cycles water between fittings enabled for it — here:{' '}
              {outlets
                .filter((o) => o.massageCapable)
                .map((o) => o.label)
                .join(', ') || 'none'}
              .
            </p>
          </div>
        </div>
      )}
    </>
  );
}
