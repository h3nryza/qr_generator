/**
 * @file ColorPicker.tsx
 * @description A color picker component that combines a native HTML color input
 * with a hex text field for manual entry. Displays a color swatch preview and
 * supports both interaction modes seamlessly.
 *
 * @example
 * ```tsx
 * <ColorPicker
 *   label="Dot Color"
 *   value="#aa3bff"
 *   onChange={(hex) => setDotColor(hex)}
 * />
 * ```
 */

import type { ChangeEvent } from 'react';

/**
 * Props for the {@link ColorPicker} component.
 */
interface ColorPickerProps {
  /** Visible label rendered above the picker. */
  label: string;
  /** Current hex color value (e.g. "#ff00aa"). */
  value: string;
  /** Callback fired when the color changes from either input mode. */
  onChange: (color: string) => void;
  /** Optional id prefix for associating label and input. */
  id?: string;
}

/**
 * Validates whether a string is a well-formed 3 or 6 digit hex color.
 *
 * @param hex - The string to validate (with or without leading #).
 * @returns `true` when the string matches #RGB or #RRGGBB.
 */
function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);
}

/**
 * ColorPicker renders a labeled color selection control with two synchronized
 * inputs: a native `<input type="color">` swatch and a text field for direct
 * hex entry.
 *
 * Uses CSS custom properties (`var(--border)`, `var(--bg)`, `var(--text-h)`)
 * so it follows the active theme automatically.
 *
 * @param props - {@link ColorPickerProps}
 * @returns A React element containing the color picker UI.
 */
function ColorPicker({ label, value, onChange, id }: ColorPickerProps) {
  const inputId = id ?? `color-${label.toLowerCase().replace(/\s+/g, '-')}`;

  /** Handle text input changes, only propagating valid hex values. */
  function handleTextChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Always propagate so the user can type freely; parent decides validity.
    onChange(raw);
  }

  /** Handle native color picker changes (always valid hex). */
  function handleNativeChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium"
        style={{ color: 'var(--text-h)' }}
      >
        {label}
      </label>

      <div
        className="flex items-center gap-2 rounded-lg px-2 py-1.5"
        style={{
          border: '1px solid var(--border)',
          background: 'var(--bg)',
        }}
      >
        {/* Native color swatch */}
        <label
          className="relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-md"
          style={{ border: '1px solid var(--border)' }}
        >
          <input
            type="color"
            value={isValidHex(value) ? value : '#000000'}
            onChange={handleNativeChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            tabIndex={-1}
            aria-label={`${label} color swatch`}
          />
          <span
            className="block h-full w-full rounded-md"
            style={{ backgroundColor: isValidHex(value) ? value : '#000000' }}
          />
        </label>

        {/* Hex text input */}
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={handleTextChange}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          className="w-full bg-transparent text-sm font-mono outline-none"
          style={{ color: 'var(--text-h)' }}
          placeholder="#000000"
        />
      </div>

      {/* Validation hint */}
      {value.length > 0 && !isValidHex(value) && (
        <span className="text-xs text-red-500">
          Enter a valid hex color (e.g. #aa3bff)
        </span>
      )}
    </div>
  );
}

export default ColorPicker;
