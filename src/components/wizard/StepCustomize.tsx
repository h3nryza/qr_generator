/**
 * @file StepCustomize.tsx
 * @description Step 3 of the QR code wizard — a comprehensive customization
 * panel allowing users to adjust colors, dot styles, corner styles, logos,
 * error correction, size, and apply templates.
 *
 * Organized into collapsible sections for a clean, scannable layout.
 *
 * @module components/wizard/StepCustomize
 *
 * @example
 * ```tsx
 * <StepCustomize
 *   customization={customization}
 *   onChange={(c) => setCustomization(c)}
 * />
 * ```
 */

import { useState, useRef, type ChangeEvent } from 'react';
import {
  Palette,
  Grid3X3,
  CornerUpRight,
  Image,
  ShieldCheck,
  Maximize2,
  Sparkles,
} from 'lucide-react';

import type { QRCustomization } from '../../types';
import { ERROR_CORRECTION_OPTIONS } from '../../config/defaults';
import { TEMPLATES } from '../../config/templates';
import ColorPicker from '../common/ColorPicker';
import Slider from '../common/Slider';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props for the {@link StepCustomize} component.
 */
interface StepCustomizeProps {
  /** Current visual customization settings. */
  customization: QRCustomization;
  /** Callback fired when any customization value changes. */
  onChange: (customization: QRCustomization) => void;
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

/**
 * Inline style for section headings.
 */
const HEADING_STYLE: React.CSSProperties = {
  color: 'var(--text-h)',
};

/**
 * Inline style for secondary/descriptive text.
 */
const TEXT_STYLE: React.CSSProperties = {
  color: 'var(--text)',
};

// ---------------------------------------------------------------------------
// Dot style options
// ---------------------------------------------------------------------------

/**
 * Available dot (data module) shape options for the QR code.
 * Each entry pairs a machine value with a human-readable label.
 */
const DOT_TYPES: { value: QRCustomization['dotsType']; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
];

/**
 * Available corner square (finder pattern outer ring) shape options.
 */
const CORNER_SQUARE_TYPES: { value: QRCustomization['cornersSquareType']; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Rounded' },
  { value: 'dot', label: 'Dot' },
];

/**
 * Available corner dot (finder pattern centre) shape options.
 */
const CORNER_DOT_TYPES: { value: QRCustomization['cornersDotType']; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dot', label: 'Dot' },
];

// ---------------------------------------------------------------------------
// Section wrapper component
// ---------------------------------------------------------------------------

/**
 * Props for the internal {@link Section} collapsible wrapper.
 */
interface SectionProps {
  /** Section title displayed in the toggle header. */
  title: string;
  /** Lucide icon component shown beside the title. */
  icon: React.ReactNode;
  /** Whether the section is initially expanded. @default true */
  defaultOpen?: boolean;
  /** Child content rendered when the section is open. */
  children: React.ReactNode;
}

/**
 * Section renders a collapsible panel with a header containing an icon and
 * title. Sections can be toggled open and closed to reduce visual clutter.
 *
 * @param props - {@link SectionProps}
 * @returns A collapsible section element.
 */
function Section({ title, icon, defaultOpen = true, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Section toggle header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold transition-colors hover:opacity-80"
        style={{
          backgroundColor: 'var(--bg)',
          color: 'var(--text-h)',
        }}
        aria-expanded={isOpen}
      >
        {icon}
        <span className="flex-1">{title}</span>
        <span
          className="text-xs transition-transform"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--text)',
          }}
        >
          ▼
        </span>
      </button>

      {/* Section content */}
      {isOpen && (
        <div
          className="flex flex-col gap-4 p-4"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual style selector grid
// ---------------------------------------------------------------------------

/**
 * Props for the internal {@link StyleGrid} selector component.
 */
interface StyleGridProps<T extends string> {
  /** List of options with value and label. */
  options: { value: T; label: string }[];
  /** Currently selected value. */
  selected: T;
  /** Callback fired when the user selects an option. */
  onSelect: (value: T) => void;
}

/**
 * StyleGrid renders a row of selectable buttons for choosing a visual style.
 * The active option is highlighted with the accent color.
 *
 * @typeParam T - The type of the option values.
 * @param props - {@link StyleGridProps}
 * @returns A row of style option buttons.
 */
function StyleGrid<T extends string>({ options, selected, onSelect }: StyleGridProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        /** Whether this option is the currently selected one. */
        const isActive = option.value === selected;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              isActive ? 'shadow-sm' : ''
            }`}
            style={{
              backgroundColor: isActive ? 'var(--accent)' : 'var(--bg)',
              color: isActive ? '#ffffff' : 'var(--text-h)',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
            }}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * StepCustomize renders a comprehensive customization panel for the QR code.
 *
 * The panel is organized into the following sections:
 * 1. **Colors** — Dot, background, corner square, and corner dot colors
 * 2. **Dot Style** — Shape of the data module dots
 * 3. **Corner Style** — Shape of finder pattern outer rings and centres
 * 4. **Logo** — Upload a center logo image with size/margin controls
 * 5. **Error Correction** — Reed-Solomon error correction level
 * 6. **Size** — QR code width and quiet-zone margin
 * 7. **Templates** — Quick-apply preset styles
 *
 * @param props - {@link StepCustomizeProps}
 * @returns A React element containing the full customization UI.
 */
function StepCustomize({ customization, onChange }: StepCustomizeProps) {
  /** Ref for the hidden file input used in logo upload. */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Creates a partial updater that merges one or more customization fields
   * into the current object and fires onChange.
   *
   * @param partial - An object containing the fields to update.
   */
  function patch(partial: Partial<QRCustomization>) {
    onChange({ ...customization, ...partial });
  }

  /**
   * Handles logo file selection. Reads the file as a data URL and
   * stores it in the customization's `logo` field.
   *
   * Also sets sane defaults for logoSize and logoMargin if they are
   * not already configured.
   *
   * @param e - The file input change event.
   */
  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      patch({
        logo: reader.result as string,
        logoSize: customization.logoSize ?? 0.2,
        logoMargin: customization.logoMargin ?? 5,
      });
    };
    reader.readAsDataURL(file);
  }

  /**
   * Removes the current logo from the customization.
   */
  function removeLogo() {
    patch({
      logo: undefined,
      logoSize: undefined,
      logoMargin: undefined,
    });
    // Clear the file input so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  /**
   * Applies a template's customization overrides on top of the
   * current settings.
   *
   * @param templateCustomization - The partial customization from the template.
   */
  function applyTemplate(templateCustomization: Partial<QRCustomization>) {
    onChange({ ...customization, ...templateCustomization });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold" style={HEADING_STYLE}>
          Customize Appearance
        </h2>
        <p className="mt-1 text-sm" style={TEXT_STYLE}>
          Fine-tune the look of your QR code or apply a template to get started quickly.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Colors section                                                    */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Colors" icon={<Palette size={16} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ColorPicker
            label="Dot Color"
            value={customization.dotsColor}
            onChange={(color) => patch({ dotsColor: color })}
          />
          <ColorPicker
            label="Background Color"
            value={customization.backgroundColor}
            onChange={(color) => patch({ backgroundColor: color })}
          />
          <ColorPicker
            label="Corner Square Color"
            value={customization.cornersSquareColor}
            onChange={(color) => patch({ cornersSquareColor: color })}
          />
          <ColorPicker
            label="Corner Dot Color"
            value={customization.cornersDotColor}
            onChange={(color) => patch({ cornersDotColor: color })}
          />
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* Dot Style section                                                 */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Dot Style" icon={<Grid3X3 size={16} />}>
        <p className="text-xs" style={TEXT_STYLE}>
          Choose the shape of the data modules (dots) in the QR code.
        </p>
        <StyleGrid
          options={DOT_TYPES}
          selected={customization.dotsType}
          onSelect={(value) => patch({ dotsType: value })}
        />
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* Corner Style section                                              */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Corner Style" icon={<CornerUpRight size={16} />}>
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-2 text-xs font-medium" style={HEADING_STYLE}>
              Corner Squares (outer ring)
            </p>
            <StyleGrid
              options={CORNER_SQUARE_TYPES}
              selected={customization.cornersSquareType}
              onSelect={(value) => patch({ cornersSquareType: value })}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium" style={HEADING_STYLE}>
              Corner Dots (centre)
            </p>
            <StyleGrid
              options={CORNER_DOT_TYPES}
              selected={customization.cornersDotType}
              onSelect={(value) => patch({ cornersDotType: value })}
            />
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* Logo section                                                      */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Logo" icon={<Image size={16} />} defaultOpen={false}>
        <p className="text-xs" style={TEXT_STYLE}>
          Upload an image to place at the centre of the QR code. Use High error
          correction for best results with logos.
        </p>

        {/* File upload area */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg)',
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
            }}
          >
            {customization.logo ? 'Change Logo' : 'Upload Logo'}
          </button>

          {customization.logo && (
            <button
              type="button"
              onClick={removeLogo}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:opacity-80"
              style={{
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              Remove
            </button>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleLogoUpload}
            className="hidden"
            aria-label="Upload logo image"
          />
        </div>

        {/* Logo preview */}
        {customization.logo && (
          <div className="flex flex-col gap-3">
            <div
              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg"
              style={{ border: '1px solid var(--border)' }}
            >
              <img
                src={customization.logo}
                alt="Logo preview"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Logo size slider */}
            <Slider
              label="Logo Size"
              value={Math.round((customization.logoSize ?? 0.2) * 100)}
              min={5}
              max={40}
              step={1}
              unit="%"
              onChange={(v) => patch({ logoSize: v / 100 })}
            />

            {/* Logo margin slider */}
            <Slider
              label="Logo Margin"
              value={customization.logoMargin ?? 5}
              min={0}
              max={20}
              step={1}
              unit="px"
              onChange={(v) => patch({ logoMargin: v })}
            />
          </div>
        )}
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* Error Correction section                                          */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Error Correction" icon={<ShieldCheck size={16} />} defaultOpen={false}>
        <p className="text-xs" style={TEXT_STYLE}>
          Higher error correction makes the QR code more resilient to damage but
          increases its density. Use "High" when adding a logo.
        </p>

        <div className="flex flex-col gap-2">
          {ERROR_CORRECTION_OPTIONS.map((option) => {
            /** Whether this is the currently selected level. */
            const isSelected = customization.errorCorrectionLevel === option.value;

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors ${
                  isSelected ? 'ring-1' : ''
                }`}
                style={{
                  backgroundColor: isSelected
                    ? 'var(--accent-light, rgba(99, 102, 241, 0.08))'
                    : 'var(--bg)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  '--tw-ring-color': isSelected ? 'var(--accent)' : 'transparent',
                } as React.CSSProperties}
              >
                <input
                  type="radio"
                  name="errorCorrection"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => patch({ errorCorrectionLevel: option.value })}
                  className="mt-0.5 accent-[var(--accent)]"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium" style={HEADING_STYLE}>
                    {option.label}
                  </span>
                  <span className="text-xs" style={TEXT_STYLE}>
                    {option.description}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* Size section                                                      */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Size" icon={<Maximize2 size={16} />} defaultOpen={false}>
        <Slider
          label="Width"
          value={customization.width}
          min={100}
          max={1200}
          step={10}
          unit="px"
          onChange={(v) => patch({ width: v, height: v })}
        />
        <Slider
          label="Margin"
          value={customization.margin}
          min={0}
          max={50}
          step={1}
          unit="px"
          onChange={(v) => patch({ margin: v })}
        />
      </Section>

      {/* ----------------------------------------------------------------- */}
      {/* Template Quick Apply section                                      */}
      {/* ----------------------------------------------------------------- */}
      <Section title="Quick Templates" icon={<Sparkles size={16} />} defaultOpen={false}>
        <p className="text-xs" style={TEXT_STYLE}>
          Apply a template to instantly restyle your QR code. Your current colors
          and styles will be overwritten.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template.customization)}
              className="flex flex-col items-center gap-1.5 rounded-lg p-3 text-center transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Template color preview swatch */}
              <div className="flex gap-1">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor: template.customization.dotsColor ?? '#000',
                    border: '1px solid var(--border)',
                  }}
                />
                <span
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor: template.customization.backgroundColor ?? '#fff',
                    border: '1px solid var(--border)',
                  }}
                />
                <span
                  className="h-4 w-4 rounded-full"
                  style={{
                    backgroundColor: template.customization.cornersSquareColor ?? '#000',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>

              {/* Template name */}
              <span
                className="text-xs font-medium leading-tight"
                style={HEADING_STYLE}
              >
                {template.name}
              </span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

export default StepCustomize;
