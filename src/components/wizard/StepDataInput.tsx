/**
 * @file StepDataInput.tsx
 * @description Step 2 of the QR code wizard — renders a dynamic form based on
 * the selected {@link QRType}. Each QR type has its own set of input fields
 * that map to the corresponding data payload interface defined in
 * {@link module:types}.
 *
 * The component is fully controlled: it receives the current data object and
 * fires `onChange` with the updated payload on every field change.
 *
 * @module components/wizard/StepDataInput
 *
 * @example
 * ```tsx
 * <StepDataInput
 *   qrType="url"
 *   data={{ url: 'https://example.com' }}
 *   onChange={(newData) => setQrData(newData)}
 *   errors={[]}
 * />
 * ```
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

import type { QRType } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props for the {@link StepDataInput} component.
 */
interface StepDataInputProps {
  /** The currently selected QR code type — determines which form is shown. */
  qrType: QRType;
  /** Current data payload (shape depends on {@link qrType}). */
  data: Record<string, unknown>;
  /** Callback fired when any field value changes. Receives the full updated data. */
  onChange: (data: Record<string, unknown>) => void;
  /** Validation error messages to display above the form. */
  errors: string[];
}

// ---------------------------------------------------------------------------
// Shared styling helpers
// ---------------------------------------------------------------------------

/**
 * Consistent inline styles for text input fields.
 * Uses CSS custom properties for theming.
 */
const INPUT_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--bg)',
  border: '1px solid var(--border)',
  color: 'var(--text-h)',
};

/**
 * Consistent inline styles for form labels.
 */
const LABEL_STYLE: React.CSSProperties = {
  color: 'var(--text-h)',
};

/**
 * Consistent inline styles for helper/description text.
 */
const HINT_STYLE: React.CSSProperties = {
  color: 'var(--text)',
};

/**
 * Common Tailwind classes applied to standard text inputs.
 */
const INPUT_CLASS =
  'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]';

/**
 * Common Tailwind classes applied to textareas.
 */
const TEXTAREA_CLASS =
  'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)] resize-y';

/**
 * Common Tailwind classes for select elements.
 */
const SELECT_CLASS =
  'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--accent)]';

// ---------------------------------------------------------------------------
// Field helper components
// ---------------------------------------------------------------------------

/**
 * Props for the internal {@link Field} helper component.
 */
interface FieldProps {
  /** The visible label text for the field. */
  label: string;
  /** Whether the field is required. Appends a red asterisk to the label. */
  required?: boolean;
  /** Optional hint text displayed below the label. */
  hint?: string;
  /** Child input element(s). */
  children: React.ReactNode;
}

/**
 * Field wraps a form control with a label and optional hint.
 *
 * @param props - {@link FieldProps}
 * @returns A labeled form field wrapper.
 */
function Field({ label, required, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={LABEL_STYLE}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {hint && (
        <span className="text-xs" style={HINT_STYLE}>
          {hint}
        </span>
      )}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-type form renderers
// ---------------------------------------------------------------------------

/**
 * Shared callback type for field updates used by all sub-form renderers.
 *
 * @param key - The payload field name to update.
 * @param value - The new value for that field.
 */
type FieldUpdater = (key: string, value: unknown) => void;

/**
 * Renders the URL form with optional collapsible UTM parameters.
 *
 * @param data - Current URL data payload.
 * @param update - Field updater callback.
 * @returns JSX for the URL input form.
 */
function UrlForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  const [showUtm, setShowUtm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Field label="URL" required hint="The website address to encode">
        <input
          type="url"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="https://example.com"
          value={(data.url as string) ?? ''}
          onChange={(e) => update('url', e.target.value)}
        />
      </Field>

      {/* Collapsible UTM section */}
      <button
        type="button"
        onClick={() => setShowUtm(!showUtm)}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: 'var(--accent)' }}
      >
        {showUtm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        UTM Parameters
      </button>

      {showUtm && (
        <div className="flex flex-col gap-3 rounded-lg p-4" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
          <Field label="Source" hint="e.g. google, newsletter, flyer">
            <input
              type="text"
              className={INPUT_CLASS}
              style={INPUT_STYLE}
              placeholder="google"
              value={(data.utmSource as string) ?? ''}
              onChange={(e) => update('utmSource', e.target.value)}
            />
          </Field>
          <Field label="Medium" hint="e.g. cpc, email, print">
            <input
              type="text"
              className={INPUT_CLASS}
              style={INPUT_STYLE}
              placeholder="cpc"
              value={(data.utmMedium as string) ?? ''}
              onChange={(e) => update('utmMedium', e.target.value)}
            />
          </Field>
          <Field label="Campaign" hint="e.g. summer-sale, launch-2026">
            <input
              type="text"
              className={INPUT_CLASS}
              style={INPUT_STYLE}
              placeholder="summer-sale"
              value={(data.utmCampaign as string) ?? ''}
              onChange={(e) => update('utmCampaign', e.target.value)}
            />
          </Field>
          <Field label="Term" hint="Paid keyword (optional)">
            <input
              type="text"
              className={INPUT_CLASS}
              style={INPUT_STYLE}
              placeholder=""
              value={(data.utmTerm as string) ?? ''}
              onChange={(e) => update('utmTerm', e.target.value)}
            />
          </Field>
          <Field label="Content" hint="Ad variation identifier (optional)">
            <input
              type="text"
              className={INPUT_CLASS}
              style={INPUT_STYLE}
              placeholder=""
              value={(data.utmContent as string) ?? ''}
              onChange={(e) => update('utmContent', e.target.value)}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

/**
 * Renders the plain text form with a textarea.
 *
 * @param data - Current text data payload.
 * @param update - Field updater callback.
 * @returns JSX for the text input form.
 */
function TextForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <Field label="Text" required hint="Plain text content to encode">
      <textarea
        className={TEXTAREA_CLASS}
        style={INPUT_STYLE}
        rows={5}
        placeholder="Enter your text here..."
        value={(data.text as string) ?? ''}
        onChange={(e) => update('text', e.target.value)}
      />
    </Field>
  );
}

/**
 * Renders the email form with To, Subject, and Body fields.
 *
 * @param data - Current email data payload.
 * @param update - Field updater callback.
 * @returns JSX for the email input form.
 */
function EmailForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="To" required hint="Recipient email address">
        <input
          type="email"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="recipient@example.com"
          value={(data.to as string) ?? ''}
          onChange={(e) => update('to', e.target.value)}
        />
      </Field>
      <Field label="Subject" hint="Email subject line">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="Subject"
          value={(data.subject as string) ?? ''}
          onChange={(e) => update('subject', e.target.value)}
        />
      </Field>
      <Field label="Body" hint="Email body text">
        <textarea
          className={TEXTAREA_CLASS}
          style={INPUT_STYLE}
          rows={4}
          placeholder="Your message..."
          value={(data.body as string) ?? ''}
          onChange={(e) => update('body', e.target.value)}
        />
      </Field>
    </div>
  );
}

/**
 * Renders the phone number form.
 *
 * @param data - Current phone data payload.
 * @param update - Field updater callback.
 * @returns JSX for the phone input form.
 */
function PhoneForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <Field label="Phone Number" required hint="Include country code (e.g. +27 123 456 7890)">
      <input
        type="tel"
        className={INPUT_CLASS}
        style={INPUT_STYLE}
        placeholder="+27 123 456 7890"
        value={(data.number as string) ?? ''}
        onChange={(e) => update('number', e.target.value)}
      />
    </Field>
  );
}

/**
 * Renders the SMS form with phone number and message fields.
 *
 * @param data - Current SMS data payload.
 * @param update - Field updater callback.
 * @returns JSX for the SMS input form.
 */
function SmsForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Phone Number" required hint="Include country code">
        <input
          type="tel"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="+27 123 456 7890"
          value={(data.number as string) ?? ''}
          onChange={(e) => update('number', e.target.value)}
        />
      </Field>
      <Field label="Message" hint="Pre-filled SMS text (optional)">
        <textarea
          className={TEXTAREA_CLASS}
          style={INPUT_STYLE}
          rows={3}
          placeholder="Your message..."
          value={(data.message as string) ?? ''}
          onChange={(e) => update('message', e.target.value)}
        />
      </Field>
    </div>
  );
}

/**
 * Renders the WiFi form with SSID, password, encryption, and hidden fields.
 *
 * @param data - Current WiFi data payload.
 * @param update - Field updater callback.
 * @returns JSX for the WiFi input form.
 */
function WifiForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Network Name (SSID)" required>
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="MyWiFiNetwork"
          value={(data.ssid as string) ?? ''}
          onChange={(e) => update('ssid', e.target.value)}
        />
      </Field>
      <Field label="Password">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="Password"
          value={(data.password as string) ?? ''}
          onChange={(e) => update('password', e.target.value)}
        />
      </Field>
      <Field label="Encryption">
        <select
          className={SELECT_CLASS}
          style={INPUT_STYLE}
          value={(data.encryption as string) ?? 'WPA'}
          onChange={(e) => update('encryption', e.target.value)}
        >
          <option value="WPA">WPA/WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">None (Open)</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm" style={LABEL_STYLE}>
        <input
          type="checkbox"
          checked={(data.hidden as boolean) ?? false}
          onChange={(e) => update('hidden', e.target.checked)}
          className="h-4 w-4 rounded accent-[var(--accent)]"
        />
        Hidden network
      </label>
    </div>
  );
}

/**
 * Renders the vCard form with contact detail fields.
 *
 * @param data - Current vCard data payload.
 * @param update - Field updater callback.
 * @returns JSX for the vCard input form.
 */
function VCardForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First Name" required>
          <input
            type="text"
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            placeholder="John"
            value={(data.firstName as string) ?? ''}
            onChange={(e) => update('firstName', e.target.value)}
          />
        </Field>
        <Field label="Last Name" required>
          <input
            type="text"
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            placeholder="Doe"
            value={(data.lastName as string) ?? ''}
            onChange={(e) => update('lastName', e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Phone">
          <input
            type="tel"
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            placeholder="+27 123 456 7890"
            value={(data.phone as string) ?? ''}
            onChange={(e) => update('phone', e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            placeholder="john@example.com"
            value={(data.email as string) ?? ''}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Organization">
          <input
            type="text"
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            placeholder="Acme Corp"
            value={(data.organization as string) ?? ''}
            onChange={(e) => update('organization', e.target.value)}
          />
        </Field>
        <Field label="Title">
          <input
            type="text"
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            placeholder="Software Engineer"
            value={(data.title as string) ?? ''}
            onChange={(e) => update('title', e.target.value)}
          />
        </Field>
      </div>
      <Field label="Website URL">
        <input
          type="url"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="https://example.com"
          value={(data.url as string) ?? ''}
          onChange={(e) => update('url', e.target.value)}
        />
      </Field>
      <Field label="Address">
        <textarea
          className={TEXTAREA_CLASS}
          style={INPUT_STYLE}
          rows={2}
          placeholder="123 Main St, City, Country"
          value={(data.address as string) ?? ''}
          onChange={(e) => update('address', e.target.value)}
        />
      </Field>
    </div>
  );
}

/**
 * Renders the MeCard form with compact contact fields.
 *
 * @param data - Current MeCard data payload.
 * @param update - Field updater callback.
 * @returns JSX for the MeCard input form.
 */
function MeCardForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Name" required hint="Full name (Last, First)">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="Doe, John"
          value={(data.name as string) ?? ''}
          onChange={(e) => update('name', e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Phone">
          <input
            type="tel"
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            placeholder="+27 123 456 7890"
            value={(data.phone as string) ?? ''}
            onChange={(e) => update('phone', e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            placeholder="john@example.com"
            value={(data.email as string) ?? ''}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
      </div>
      <Field label="URL">
        <input
          type="url"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="https://example.com"
          value={(data.url as string) ?? ''}
          onChange={(e) => update('url', e.target.value)}
        />
      </Field>
      <Field label="Address">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="123 Main St, City"
          value={(data.address as string) ?? ''}
          onChange={(e) => update('address', e.target.value)}
        />
      </Field>
      <Field label="Note">
        <textarea
          className={TEXTAREA_CLASS}
          style={INPUT_STYLE}
          rows={2}
          placeholder="Additional notes..."
          value={(data.note as string) ?? ''}
          onChange={(e) => update('note', e.target.value)}
        />
      </Field>
    </div>
  );
}

/**
 * Renders the calendar event form with date/time pickers.
 *
 * @param data - Current calendar data payload.
 * @param update - Field updater callback.
 * @returns JSX for the calendar event input form.
 */
function CalendarForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  /** Whether the all-day toggle is active. */
  const isAllDay = (data.allDay as boolean) ?? false;

  return (
    <div className="flex flex-col gap-4">
      <Field label="Event Title" required>
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="Team Meeting"
          value={(data.title as string) ?? ''}
          onChange={(e) => update('title', e.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm" style={LABEL_STYLE}>
        <input
          type="checkbox"
          checked={isAllDay}
          onChange={(e) => update('allDay', e.target.checked)}
          className="h-4 w-4 rounded accent-[var(--accent)]"
        />
        All-day event
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Start Date" required>
          <input
            type={isAllDay ? 'date' : 'datetime-local'}
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            value={(data.startDate as string) ?? ''}
            onChange={(e) => update('startDate', e.target.value)}
          />
        </Field>
        <Field label="End Date">
          <input
            type={isAllDay ? 'date' : 'datetime-local'}
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            value={(data.endDate as string) ?? ''}
            onChange={(e) => update('endDate', e.target.value)}
          />
        </Field>
      </div>
      <Field label="Location">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="Conference Room A"
          value={(data.location as string) ?? ''}
          onChange={(e) => update('location', e.target.value)}
        />
      </Field>
      <Field label="Description">
        <textarea
          className={TEXTAREA_CLASS}
          style={INPUT_STYLE}
          rows={3}
          placeholder="Event details..."
          value={(data.description as string) ?? ''}
          onChange={(e) => update('description', e.target.value)}
        />
      </Field>
    </div>
  );
}

/**
 * Renders the geolocation form with latitude and longitude inputs.
 *
 * @param data - Current geo data payload.
 * @param update - Field updater callback.
 * @returns JSX for the geo input form.
 */
function GeoForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Latitude" required hint="-90 to 90">
          <input
            type="number"
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            placeholder="37.7749"
            min={-90}
            max={90}
            step="any"
            value={(data.latitude as number) ?? ''}
            onChange={(e) => update('latitude', e.target.value ? Number(e.target.value) : '')}
          />
        </Field>
        <Field label="Longitude" required hint="-180 to 180">
          <input
            type="number"
            className={INPUT_CLASS}
            style={INPUT_STYLE}
            placeholder="-122.4194"
            min={-180}
            max={180}
            step="any"
            value={(data.longitude as number) ?? ''}
            onChange={(e) => update('longitude', e.target.value ? Number(e.target.value) : '')}
          />
        </Field>
      </div>
      <Field label="Label" hint="Human-readable location name (optional)">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="San Francisco"
          value={(data.label as string) ?? ''}
          onChange={(e) => update('label', e.target.value)}
        />
      </Field>
    </div>
  );
}

/**
 * Renders the cryptocurrency payment form.
 *
 * @param data - Current crypto data payload.
 * @param update - Field updater callback.
 * @returns JSX for the crypto input form.
 */
function CryptoForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Currency" required>
        <select
          className={SELECT_CLASS}
          style={INPUT_STYLE}
          value={(data.currency as string) ?? 'bitcoin'}
          onChange={(e) => update('currency', e.target.value)}
        >
          <option value="bitcoin">Bitcoin (BTC)</option>
          <option value="ethereum">Ethereum (ETH)</option>
          <option value="litecoin">Litecoin (LTC)</option>
        </select>
      </Field>
      <Field label="Wallet Address" required>
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
          value={(data.address as string) ?? ''}
          onChange={(e) => update('address', e.target.value)}
        />
      </Field>
      <Field label="Amount" hint="Payment amount (optional)">
        <input
          type="number"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="0.001"
          min={0}
          step="any"
          value={(data.amount as number) ?? ''}
          onChange={(e) => update('amount', e.target.value ? Number(e.target.value) : undefined)}
        />
      </Field>
      <Field label="Label" hint="Name or description for the payment">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="Donation"
          value={(data.label as string) ?? ''}
          onChange={(e) => update('label', e.target.value)}
        />
      </Field>
      <Field label="Message" hint="Human-readable memo">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="Thanks for your support"
          value={(data.message as string) ?? ''}
          onChange={(e) => update('message', e.target.value)}
        />
      </Field>
    </div>
  );
}

/**
 * Renders the EPC/SEPA bank transfer form.
 *
 * @param data - Current EPC data payload.
 * @param update - Field updater callback.
 * @returns JSX for the EPC input form.
 */
function EpcForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Beneficiary Name" required hint="Max 70 characters">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="Red Cross"
          maxLength={70}
          value={(data.name as string) ?? ''}
          onChange={(e) => update('name', e.target.value)}
        />
      </Field>
      <Field label="IBAN" required>
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="DE89370400440532013000"
          value={(data.iban as string) ?? ''}
          onChange={(e) => update('iban', e.target.value)}
        />
      </Field>
      <Field label="BIC / SWIFT" hint="8 or 11 characters (optional for domestic)">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="COBADEFFXXX"
          maxLength={11}
          value={(data.bic as string) ?? ''}
          onChange={(e) => update('bic', e.target.value)}
        />
      </Field>
      <Field label="Amount (EUR)" hint="Max 999,999,999.99">
        <input
          type="number"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="50.00"
          min={0}
          max={999999999.99}
          step="0.01"
          value={(data.amount as number) ?? ''}
          onChange={(e) => update('amount', e.target.value ? Number(e.target.value) : undefined)}
        />
      </Field>
      <Field label="Reference" hint="Structured payment reference (e.g. invoice number)">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="INV-2026-001"
          value={(data.reference as string) ?? ''}
          onChange={(e) => update('reference', e.target.value)}
        />
      </Field>
      <Field label="Remittance Text" hint="Unstructured text (optional)">
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="Donation for charity"
          value={(data.text as string) ?? ''}
          onChange={(e) => update('text', e.target.value)}
        />
      </Field>
    </div>
  );
}

/**
 * Renders the WhatsApp form with phone number and message fields.
 *
 * @param data - Current WhatsApp data payload.
 * @param update - Field updater callback.
 * @returns JSX for the WhatsApp input form.
 */
function WhatsAppForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Phone Number" required hint="International format, e.g. +27123456789">
        <input
          type="tel"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="+27123456789"
          value={(data.number as string) ?? ''}
          onChange={(e) => update('number', e.target.value)}
        />
      </Field>
      <Field label="Message" hint="Pre-filled message (optional)">
        <textarea
          className={TEXTAREA_CLASS}
          style={INPUT_STYLE}
          rows={3}
          placeholder="Hello! I'm interested in..."
          value={(data.message as string) ?? ''}
          onChange={(e) => update('message', e.target.value)}
        />
      </Field>
    </div>
  );
}

/**
 * Represents a single social link row in the Social form.
 */
interface SocialLinkRow {
  /** Platform name (e.g. "Instagram", "Twitter"). */
  platform: string;
  /** Profile URL. */
  url: string;
}

/**
 * Renders the Social Media Hub form with dynamic add/remove rows.
 *
 * @param data - Current social data payload.
 * @param onChange - Full data update callback (used to replace the links array).
 * @returns JSX for the social media input form.
 */
function SocialForm({ data, onChange }: { data: Record<string, unknown>; onChange: (data: Record<string, unknown>) => void }) {
  /** Current list of social link rows. */
  const links: SocialLinkRow[] = (data.links as SocialLinkRow[]) ?? [{ platform: '', url: '' }];

  /**
   * Updates a single link row and propagates the full data object.
   *
   * @param index - The row index to update.
   * @param field - The field within the row ('platform' or 'url').
   * @param value - The new value.
   */
  function updateLink(index: number, field: 'platform' | 'url', value: string) {
    const updated = links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link,
    );
    onChange({ ...data, links: updated });
  }

  /**
   * Appends a new empty link row.
   */
  function addLink() {
    onChange({ ...data, links: [...links, { platform: '', url: '' }] });
  }

  /**
   * Removes a link row by index.
   *
   * @param index - The row index to remove.
   */
  function removeLink(index: number) {
    const filtered = links.filter((_, i) => i !== index);
    onChange({ ...data, links: filtered.length > 0 ? filtered : [{ platform: '', url: '' }] });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={HINT_STYLE}>
        Add your social media profiles. Each row needs a platform name and URL.
      </p>

      {links.map((link, index) => (
        <div
          key={index}
          className="flex items-start gap-2"
        >
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <input
              type="text"
              className={`${INPUT_CLASS} sm:w-1/3`}
              style={INPUT_STYLE}
              placeholder="Platform (e.g. Instagram)"
              value={link.platform}
              onChange={(e) => updateLink(index, 'platform', e.target.value)}
            />
            <input
              type="url"
              className={`${INPUT_CLASS} sm:flex-1`}
              style={INPUT_STYLE}
              placeholder="https://instagram.com/yourprofile"
              value={link.url}
              onChange={(e) => updateLink(index, 'url', e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => removeLink(index)}
            className="mt-2 shrink-0 rounded-lg p-2 transition-colors hover:opacity-70"
            style={{ color: 'var(--text)' }}
            aria-label={`Remove ${link.platform || 'link'}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLink}
        className="flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
        style={{
          color: 'var(--accent)',
          border: '1px solid var(--accent)',
        }}
      >
        <Plus size={14} />
        Add Platform
      </button>
    </div>
  );
}

/**
 * Renders the App Store links form with iOS and Android URL fields.
 *
 * @param data - Current app store data payload.
 * @param update - Field updater callback.
 * @returns JSX for the app store input form.
 */
function AppStoreForm({ data, update }: { data: Record<string, unknown>; update: FieldUpdater }) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="App Name" required>
        <input
          type="text"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="My Awesome App"
          value={(data.appName as string) ?? ''}
          onChange={(e) => update('appName', e.target.value)}
        />
      </Field>
      <Field label="iOS App Store URL" hint="Link to the App Store listing">
        <input
          type="url"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="https://apps.apple.com/app/my-app/id123456"
          value={(data.iosUrl as string) ?? ''}
          onChange={(e) => update('iosUrl', e.target.value)}
        />
      </Field>
      <Field label="Google Play Store URL" hint="Link to the Play Store listing">
        <input
          type="url"
          className={INPUT_CLASS}
          style={INPUT_STYLE}
          placeholder="https://play.google.com/store/apps/details?id=com.example"
          value={(data.androidUrl as string) ?? ''}
          onChange={(e) => update('androidUrl', e.target.value)}
        />
      </Field>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Title map
// ---------------------------------------------------------------------------

/**
 * Human-readable titles for each QR type, displayed at the top of the form.
 */
const TYPE_TITLES: Record<QRType, string> = {
  url: 'URL',
  text: 'Text',
  email: 'Email',
  phone: 'Phone Number',
  sms: 'SMS Message',
  wifi: 'WiFi Network',
  vcard: 'vCard Contact',
  mecard: 'MeCard Contact',
  calendar: 'Calendar Event',
  geo: 'Location',
  crypto: 'Cryptocurrency Payment',
  epc: 'EPC / SEPA Payment',
  whatsapp: 'WhatsApp Message',
  social: 'Social Media Hub',
  appstore: 'App Store Links',
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * StepDataInput renders the appropriate data entry form for the currently
 * selected QR code type. All forms are fully controlled via the `data`
 * and `onChange` props.
 *
 * Validation errors are displayed as a list above the form when present.
 *
 * @param props - {@link StepDataInputProps}
 * @returns A React element containing the dynamic data entry form.
 */
function StepDataInput({ qrType, data, onChange, errors }: StepDataInputProps) {
  /**
   * Creates a field-level updater that merges a single key/value pair
   * into the current data object and fires onChange.
   *
   * @param key - The field name to update.
   * @param value - The new value for that field.
   */
  function update(key: string, value: unknown) {
    onChange({ ...data, [key]: value });
  }

  /**
   * Renders the form component for the active QR type.
   *
   * @returns The form JSX for the current type.
   */
  function renderForm() {
    switch (qrType) {
      case 'url':
        return <UrlForm data={data} update={update} />;
      case 'text':
        return <TextForm data={data} update={update} />;
      case 'email':
        return <EmailForm data={data} update={update} />;
      case 'phone':
        return <PhoneForm data={data} update={update} />;
      case 'sms':
        return <SmsForm data={data} update={update} />;
      case 'wifi':
        return <WifiForm data={data} update={update} />;
      case 'vcard':
        return <VCardForm data={data} update={update} />;
      case 'mecard':
        return <MeCardForm data={data} update={update} />;
      case 'calendar':
        return <CalendarForm data={data} update={update} />;
      case 'geo':
        return <GeoForm data={data} update={update} />;
      case 'crypto':
        return <CryptoForm data={data} update={update} />;
      case 'epc':
        return <EpcForm data={data} update={update} />;
      case 'whatsapp':
        return <WhatsAppForm data={data} update={update} />;
      case 'social':
        return <SocialForm data={data} onChange={onChange} />;
      case 'appstore':
        return <AppStoreForm data={data} update={update} />;
      default:
        return (
          <p className="text-sm" style={HINT_STYLE}>
            Unknown QR type. Please go back and select a type.
          </p>
        );
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <div>
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--text-h)' }}
        >
          Enter {TYPE_TITLES[qrType]} Data
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--text)' }}
        >
          Fill in the fields below. Required fields are marked with an asterisk.
        </p>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div
          className="rounded-lg p-3"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <ul className="flex flex-col gap-1">
            {errors.map((error, i) => (
              <li key={i} className="text-sm text-red-500">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dynamic form */}
      {renderForm()}
    </div>
  );
}

export default StepDataInput;
