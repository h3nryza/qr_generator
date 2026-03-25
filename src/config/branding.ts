/**
 * @fileoverview White-label branding configuration.
 *
 * All user-facing brand strings, colours, and metadata are centralised here
 * so that a white-label deployer can customise the application by editing a
 * single file (or overriding at build-time via environment variables).
 *
 * @module config/branding
 */

/**
 * Shape of a single footer link.
 */
export interface FooterLink {
  /** Display text for the link. */
  label: string;
  /** Absolute URL the link points to. */
  url: string;
}

/**
 * Shape of the branding configuration object.
 */
export interface BrandingConfig {
  /** Application display name shown in the header and title bar. */
  appName: string;
  /** Short tagline shown below the app name. */
  tagline: string;
  /** Path to the logo image (relative to the public directory). */
  logo: string;
  /** Primary brand colour (used for buttons, links, active states). */
  primaryColor: string;
  /** Accent colour (used for highlights and secondary actions). */
  accentColor: string;
  /** Footer configuration. */
  footer: {
    /** Copyright / attribution text. */
    text: string;
    /** External links displayed in the footer. */
    links: FooterLink[];
  };
  /** HTML `<meta>` tag values for SEO and social sharing. */
  meta: {
    /** Page title (used in `<title>` and `og:title`). */
    title: string;
    /** Page description (used in `<meta name="description">` and `og:description`). */
    description: string;
  };
}

/**
 * Default branding configuration for the public QR Code Generator.
 *
 * Override individual values for white-label deployments. The `logo` path
 * is relative to the Vite `base` path configured in `vite.config.ts`.
 */
export const branding: BrandingConfig = {
  appName: 'QR Code Generator',
  tagline: 'Free, Open Source QR Code Generator',
  logo: '/qr_generator/favicon.svg',
  primaryColor: '#6366f1',
  accentColor: '#8b5cf6',
  footer: {
    text: '\u00A9 2026 QR Code Generator',
    links: [
      {
        label: 'GitHub',
        url: 'https://github.com/h3nryza/qr_generator',
      },
      {
        label: 'License',
        url: 'https://github.com/h3nryza/qr_generator/blob/main/LICENSE',
      },
    ],
  },
  meta: {
    title: 'QR Code Generator \u2014 Free, Open Source',
    description:
      'Create customizable QR codes for URLs, WiFi, vCards, and more. Free, open source, no tracking.',
  },
};
