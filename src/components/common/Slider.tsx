/**
 * @file Slider.tsx
 * @description A labeled range slider component that displays its current value
 * alongside the label. Supports configurable min, max, step, and an optional
 * unit suffix (e.g. "px", "%").
 *
 * @example
 * ```tsx
 * <Slider
 *   label="Width"
 *   value={300}
 *   min={100}
 *   max={1000}
 *   step={10}
 *   unit="px"
 *   onChange={(v) => setWidth(v)}
 * />
 * ```
 */

import type { ChangeEvent } from 'react';

/**
 * Props for the {@link Slider} component.
 */
interface SliderProps {
  /** Visible label rendered to the left of the current value. */
  label: string;
  /** Current numeric value of the slider. */
  value: number;
  /** Minimum allowed value. */
  min: number;
  /** Maximum allowed value. */
  max: number;
  /** Increment between selectable values. @default 1 */
  step?: number;
  /** Optional unit suffix shown after the value (e.g. "px"). */
  unit?: string;
  /** Callback fired when the slider value changes. */
  onChange: (value: number) => void;
  /** Optional id for associating the label element. */
  id?: string;
}

/**
 * Slider renders a horizontal range input with a label and real-time value
 * readout. It uses the accent color CSS custom property for the filled portion
 * of the track.
 *
 * @param props - {@link SliderProps}
 * @returns A React element containing the labeled slider.
 */
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  id,
}: SliderProps) {
  const inputId = id ?? `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(Number(e.target.value));
  }

  /** Calculate fill percentage for the custom track styling. */
  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label row with current value */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: 'var(--text-h)' }}
        >
          {label}
        </label>
        <span
          className="text-sm font-mono tabular-nums"
          style={{ color: 'var(--text)' }}
        >
          {value}
          {unit}
        </span>
      </div>

      {/* Range input */}
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${String(fillPercent)}%, var(--border) ${String(fillPercent)}%, var(--border) 100%)`,
        }}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      />

      {/* Min / max labels */}
      <div
        className="flex justify-between text-xs"
        style={{ color: 'var(--text)' }}
      >
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

export default Slider;
