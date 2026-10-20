import React from 'react';
import { swatchColour } from '../utils/catalog.js';

/** Size / colour chooser built on native radio inputs (keyboard arrows + screen readers work for free). */
export default function OptionPicker({ idPrefix, kind, label, options, value, onChange, isAvailable, error, compact = false }) {
  const errorId = `${idPrefix}-${kind}-error`;
  return (
    <fieldset className={`option-group ${compact ? 'compact' : ''}`} aria-describedby={error ? errorId : undefined}>
      <legend>{label}{value ? <span className="option-value">: {value}</span> : null}</legend>
      <div className="option-list">
        {options.map((opt) => {
          const available = isAvailable(opt);
          const id = `${idPrefix}-${kind}-${opt.replace(/\W+/g, '_')}`;
          const swatch = kind === 'colour' ? swatchColour(opt) : null;
          return (
            <div className="option" key={opt}>
              <input type="radio" id={id} name={`${idPrefix}-${kind}`} value={opt} checked={value === opt} disabled={!available} onChange={() => onChange(opt)} />
              <label htmlFor={id} className={`${kind} ${available ? '' : 'unavailable'}`} title={available ? opt : `${opt} — unavailable`}>
                {swatch ? <span className="swatch" style={{ background: swatch }} aria-hidden="true" /> : null}
                <span>{opt}</span>
                {!available ? <span className="sr-only"> (unavailable)</span> : null}
              </label>
            </div>
          );
        })}
      </div>
      {error ? <p className="field-error" id={errorId} role="alert">{error}</p> : null}
    </fieldset>
  );
}
