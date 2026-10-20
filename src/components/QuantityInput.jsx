import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { MAX_QUANTITY } from '../utils/catalog.js';

export default function QuantityInput({ id, value, onChange, compact = false }) {
  const n = Number(value);
  const set = (next) => onChange(String(Math.min(MAX_QUANTITY, Math.max(1, next))));
  return (
    <div className={`quantity ${compact ? 'compact' : ''}`}>
      <button type="button" aria-label="Decrease quantity" onClick={() => set((Number.isFinite(n) ? n : 1) - 1)} disabled={n <= 1}><Minus size={16} aria-hidden="true" /></button>
      <input id={id} type="number" inputMode="numeric" min="1" max={MAX_QUANTITY} value={value} aria-label="Quantity"
        onChange={(e) => onChange(e.target.value)} onBlur={() => set(Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1)} />
      <button type="button" aria-label="Increase quantity" onClick={() => set((Number.isFinite(n) ? n : 0) + 1)} disabled={n >= MAX_QUANTITY}><Plus size={16} aria-hidden="true" /></button>
    </div>
  );
}
