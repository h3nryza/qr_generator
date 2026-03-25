/**
 * @file StepTypeSelect.tsx
 * @description Step 1 of the QR code wizard — presents a grid of QR type cards
 * grouped by category (Links, Contact, Data, Payment). Each card shows a
 * lucide-react icon, a name, and a short description.
 *
 * The user selects one type to proceed to the data entry step.
 *
 * @module components/wizard/StepTypeSelect
 *
 * @example
 * ```tsx
 * <StepTypeSelect
 *   selectedType="url"
 *   onSelect={(type) => setQrType(type)}
 * />
 * ```
 */

import type { LucideIcon } from 'lucide-react';
import {
  Globe,
  Type,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  Contact,
  Contact2,
  CalendarDays,
  MapPin,
  Bitcoin,
  Landmark,
  MessageCircle,
  Share2,
  Smartphone,
} from 'lucide-react';

import type { QRType } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props for the {@link StepTypeSelect} component.
 */
interface StepTypeSelectProps {
  /** The currently selected QR code type. */
  selectedType: QRType;
  /** Callback fired when the user selects a QR type card. */
  onSelect: (type: QRType) => void;
}

// ---------------------------------------------------------------------------
// Type metadata
// ---------------------------------------------------------------------------

/**
 * Metadata for a single QR code type displayed in the selection grid.
 */
interface QRTypeCard {
  /** The QR type identifier. */
  type: QRType;
  /** Human-readable display name. */
  name: string;
  /** Short description shown below the name. */
  description: string;
  /** Lucide icon component to render. */
  icon: LucideIcon;
  /** Category group for visual grouping in the grid. */
  category: 'Links' | 'Contact' | 'Data' | 'Payment';
}

/**
 * Complete list of all 15 QR types with their display metadata.
 *
 * Grouped into four categories:
 * - **Links** — URL, Text, WhatsApp, Social, App Store
 * - **Contact** — Email, Phone, SMS, vCard, MeCard
 * - **Data** — WiFi, Calendar, Geo
 * - **Payment** — Crypto, EPC
 */
const QR_TYPE_CARDS: readonly QRTypeCard[] = [
  // Links
  {
    type: 'url',
    name: 'URL',
    description: 'Link to any website with optional UTM tracking',
    icon: Globe,
    category: 'Links',
  },
  {
    type: 'text',
    name: 'Text',
    description: 'Plain text message or note',
    icon: Type,
    category: 'Links',
  },
  {
    type: 'whatsapp',
    name: 'WhatsApp',
    description: 'Open a WhatsApp chat with pre-filled message',
    icon: MessageCircle,
    category: 'Links',
  },
  {
    type: 'social',
    name: 'Social Media',
    description: 'Hub linking to multiple social profiles',
    icon: Share2,
    category: 'Links',
  },
  {
    type: 'appstore',
    name: 'App Store',
    description: 'Smart link to iOS and Android app stores',
    icon: Smartphone,
    category: 'Links',
  },

  // Contact
  {
    type: 'email',
    name: 'Email',
    description: 'Pre-composed email with recipient, subject, and body',
    icon: Mail,
    category: 'Contact',
  },
  {
    type: 'phone',
    name: 'Phone',
    description: 'Direct dial a phone number',
    icon: Phone,
    category: 'Contact',
  },
  {
    type: 'sms',
    name: 'SMS',
    description: 'Pre-filled text message to a phone number',
    icon: MessageSquare,
    category: 'Contact',
  },
  {
    type: 'vcard',
    name: 'vCard',
    description: 'Full digital business card (vCard 3.0)',
    icon: Contact,
    category: 'Contact',
  },
  {
    type: 'mecard',
    name: 'MeCard',
    description: 'Compact contact card (MeCard format)',
    icon: Contact2,
    category: 'Contact',
  },

  // Data
  {
    type: 'wifi',
    name: 'WiFi',
    description: 'Auto-connect to a WiFi network',
    icon: Wifi,
    category: 'Data',
  },
  {
    type: 'calendar',
    name: 'Calendar Event',
    description: 'Add an event to the calendar',
    icon: CalendarDays,
    category: 'Data',
  },
  {
    type: 'geo',
    name: 'Location',
    description: 'Geographic coordinates with an optional label',
    icon: MapPin,
    category: 'Data',
  },

  // Payment
  {
    type: 'crypto',
    name: 'Crypto',
    description: 'Bitcoin, Ethereum, or Litecoin payment address',
    icon: Bitcoin,
    category: 'Payment',
  },
  {
    type: 'epc',
    name: 'EPC / SEPA',
    description: 'European SEPA bank transfer (EPC069-12)',
    icon: Landmark,
    category: 'Payment',
  },
] as const;

/**
 * Ordered list of category names, used to render groups in a consistent order.
 */
const CATEGORY_ORDER: readonly string[] = ['Links', 'Contact', 'Data', 'Payment'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * StepTypeSelect renders a categorized grid of QR code type cards.
 *
 * Each category is rendered as a labeled section with cards in a responsive
 * grid. The currently selected card is highlighted with the accent color.
 * Clicking a card fires {@link StepTypeSelectProps.onSelect}.
 *
 * @param props - {@link StepTypeSelectProps}
 * @returns A React element containing the type selection grid.
 */
function StepTypeSelect({ selectedType, onSelect }: StepTypeSelectProps) {
  /**
   * Groups the flat card list by category for sectioned rendering.
   *
   * @returns A Map from category name to its array of QR type cards.
   */
  function getGroupedCards(): Map<string, QRTypeCard[]> {
    const grouped = new Map<string, QRTypeCard[]>();

    for (const category of CATEGORY_ORDER) {
      const cards = QR_TYPE_CARDS.filter((c) => c.category === category);
      if (cards.length > 0) {
        grouped.set(category, cards);
      }
    }

    return grouped;
  }

  const grouped = getGroupedCards();

  return (
    <div className="flex flex-col gap-6">
      {/* Section title */}
      <div>
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--text-h)' }}
        >
          Choose QR Code Type
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--text)' }}
        >
          Select the type of content you want to encode in your QR code.
        </p>
      </div>

      {/* Category groups */}
      {Array.from(grouped.entries()).map(([category, cards]) => (
        <section key={category} className="flex flex-col gap-3">
          {/* Category label */}
          <h3
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text)' }}
          >
            {category}
          </h3>

          {/* Card grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {cards.map((card) => {
              /** Whether this card represents the currently selected type. */
              const isSelected = card.type === selectedType;
              const Icon = card.icon;

              return (
                <button
                  key={card.type}
                  type="button"
                  onClick={() => onSelect(card.type)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 shadow-md' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--accent-light, rgba(99, 102, 241, 0.1))'
                      : 'var(--bg)',
                    border: `1px solid ${
                      isSelected ? 'var(--accent)' : 'var(--border)'
                    }`,
                    ringColor: isSelected ? 'var(--accent)' : undefined,
                    // Tailwind ring-color via style since it uses a CSS var
                    '--tw-ring-color': isSelected ? 'var(--accent)' : 'transparent',
                  } as React.CSSProperties}
                  aria-pressed={isSelected}
                >
                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--accent)'
                        : 'var(--surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-h)',
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  {/* Name */}
                  <span
                    className="text-sm font-medium leading-tight"
                    style={{
                      color: isSelected ? 'var(--accent)' : 'var(--text-h)',
                    }}
                  >
                    {card.name}
                  </span>

                  {/* Description */}
                  <span
                    className="text-xs leading-snug"
                    style={{ color: 'var(--text)' }}
                  >
                    {card.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default StepTypeSelect;
