import { describe, it, expect } from 'vitest';
import {
  validateUrl,
  validateText,
  validateEmail,
  validatePhone,
  validateSms,
  validateWifi,
  validateVcard,
  validateMecard,
  validateCalendar,
  validateGeo,
  validateCrypto,
  validateEpc,
  validateWhatsapp,
  validateSocial,
  validateAppstore,
} from '../validators';

// ---------------------------------------------------------------------------
// validateUrl
// ---------------------------------------------------------------------------
describe('validateUrl', () => {
  it('passes for a valid URL with protocol', () => {
    const result = validateUrl({ url: 'https://example.com' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('passes for a valid URL without protocol', () => {
    expect(validateUrl({ url: 'example.com' }).valid).toBe(true);
  });

  it('passes for URL with path', () => {
    expect(validateUrl({ url: 'https://example.com/path' }).valid).toBe(true);
  });

  it('fails when url is missing', () => {
    const result = validateUrl({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('URL is required.');
  });

  it('fails when url is empty string', () => {
    expect(validateUrl({ url: '' }).valid).toBe(false);
  });

  it('fails when url is whitespace only', () => {
    expect(validateUrl({ url: '   ' }).valid).toBe(false);
  });

  it('fails for an invalid URL format', () => {
    const result = validateUrl({ url: 'not a url' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('does not appear to be valid');
  });
});

// ---------------------------------------------------------------------------
// validateText
// ---------------------------------------------------------------------------
describe('validateText', () => {
  it('passes for non-empty text', () => {
    expect(validateText({ text: 'Hello' }).valid).toBe(true);
  });

  it('fails when text is missing', () => {
    const result = validateText({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Text content is required.');
  });

  it('fails when text is empty', () => {
    expect(validateText({ text: '' }).valid).toBe(false);
  });

  it('fails when text is whitespace only', () => {
    expect(validateText({ text: '   ' }).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateEmail
// ---------------------------------------------------------------------------
describe('validateEmail', () => {
  it('passes for a valid email address', () => {
    expect(validateEmail({ to: 'user@example.com' }).valid).toBe(true);
  });

  it('passes with optional fields', () => {
    expect(validateEmail({ to: 'a@b.com', subject: 'Hi', body: 'text' }).valid).toBe(true);
  });

  it('fails when to is missing', () => {
    const result = validateEmail({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Recipient email address (to) is required.');
  });

  it('fails when to is empty', () => {
    expect(validateEmail({ to: '' }).valid).toBe(false);
  });

  it('fails for an invalid email format', () => {
    const result = validateEmail({ to: 'not-an-email' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Recipient email address is not valid.');
  });

  it('fails for email without TLD', () => {
    expect(validateEmail({ to: 'user@host' }).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validatePhone
// ---------------------------------------------------------------------------
describe('validatePhone', () => {
  it('passes for a valid phone number', () => {
    expect(validatePhone({ number: '+27123456789' }).valid).toBe(true);
  });

  it('fails when number is missing', () => {
    const result = validatePhone({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Phone number is required.');
  });

  it('fails when number is empty', () => {
    expect(validatePhone({ number: '' }).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateSms
// ---------------------------------------------------------------------------
describe('validateSms', () => {
  it('passes for a valid phone number', () => {
    expect(validateSms({ number: '+27123456789' }).valid).toBe(true);
  });

  it('passes with optional message', () => {
    expect(validateSms({ number: '+27123456789', message: 'Hello' }).valid).toBe(true);
  });

  it('fails when number is missing', () => {
    const result = validateSms({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Phone number is required.');
  });

  it('fails when number is empty', () => {
    expect(validateSms({ number: '' }).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateWifi
// ---------------------------------------------------------------------------
describe('validateWifi', () => {
  it('passes for valid wifi data', () => {
    expect(validateWifi({ ssid: 'MyNet', encryption: 'WPA', password: 'pass' }).valid).toBe(true);
  });

  it('passes for WEP encryption', () => {
    expect(validateWifi({ ssid: 'Net', encryption: 'WEP' }).valid).toBe(true);
  });

  it('passes for nopass encryption', () => {
    expect(validateWifi({ ssid: 'Open', encryption: 'nopass' }).valid).toBe(true);
  });

  it('fails when ssid is missing', () => {
    const result = validateWifi({ encryption: 'WPA' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('SSID (network name) is required.');
  });

  it('fails when encryption is invalid', () => {
    const result = validateWifi({ ssid: 'Net', encryption: 'INVALID' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Encryption must be WPA, WEP, or nopass.');
  });

  it('fails when both ssid and encryption are missing', () => {
    const result = validateWifi({});
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// validateVcard
// ---------------------------------------------------------------------------
describe('validateVcard', () => {
  it('passes with firstName only', () => {
    expect(validateVcard({ firstName: 'John' }).valid).toBe(true);
  });

  it('passes with lastName only', () => {
    expect(validateVcard({ lastName: 'Doe' }).valid).toBe(true);
  });

  it('passes with both names', () => {
    expect(validateVcard({ firstName: 'John', lastName: 'Doe' }).valid).toBe(true);
  });

  it('fails when neither name is provided', () => {
    const result = validateVcard({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least a first name or last name is required.');
  });

  it('fails when names are empty strings', () => {
    expect(validateVcard({ firstName: '', lastName: '' }).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateMecard
// ---------------------------------------------------------------------------
describe('validateMecard', () => {
  it('passes with firstName', () => {
    expect(validateMecard({ firstName: 'John' }).valid).toBe(true);
  });

  it('passes with lastName', () => {
    expect(validateMecard({ lastName: 'Doe' }).valid).toBe(true);
  });

  it('passes with name field (compatibility)', () => {
    expect(validateMecard({ name: 'John Doe' }).valid).toBe(true);
  });

  it('fails when no name fields are provided', () => {
    const result = validateMecard({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least a first name or last name is required.');
  });
});

// ---------------------------------------------------------------------------
// validateCalendar
// ---------------------------------------------------------------------------
describe('validateCalendar', () => {
  it('passes with title and startDate', () => {
    expect(validateCalendar({ title: 'Meeting', startDate: '2026-03-25T14:00:00Z' }).valid).toBe(
      true,
    );
  });

  it('passes with a Date object as startDate', () => {
    expect(validateCalendar({ title: 'Event', startDate: new Date() }).valid).toBe(true);
  });

  it('fails when title is missing', () => {
    const result = validateCalendar({ startDate: '2026-01-01' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Event title is required.');
  });

  it('fails when startDate is missing', () => {
    const result = validateCalendar({ title: 'Event' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Start date is required.');
  });

  it('fails when both are missing', () => {
    const result = validateCalendar({});
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// validateGeo
// ---------------------------------------------------------------------------
describe('validateGeo', () => {
  it('passes for valid coordinates', () => {
    expect(validateGeo({ latitude: 37.7749, longitude: -122.4194 }).valid).toBe(true);
  });

  it('passes for boundary values', () => {
    expect(validateGeo({ latitude: 90, longitude: 180 }).valid).toBe(true);
    expect(validateGeo({ latitude: -90, longitude: -180 }).valid).toBe(true);
  });

  it('passes for zero coordinates', () => {
    expect(validateGeo({ latitude: 0, longitude: 0 }).valid).toBe(true);
  });

  it('fails when latitude is out of range', () => {
    const result = validateGeo({ latitude: 91, longitude: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Latitude must be between -90 and 90.');
  });

  it('fails when longitude is out of range', () => {
    const result = validateGeo({ latitude: 0, longitude: 181 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Longitude must be between -180 and 180.');
  });

  it('fails when latitude is not a number', () => {
    const result = validateGeo({ latitude: 'abc', longitude: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Latitude is required and must be a number.');
  });

  it('fails when both are missing', () => {
    const result = validateGeo({});
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// validateCrypto
// ---------------------------------------------------------------------------
describe('validateCrypto', () => {
  it('passes for valid bitcoin data with currency field', () => {
    expect(validateCrypto({ currency: 'bitcoin', address: 'addr123' }).valid).toBe(true);
  });

  it('passes for valid ethereum data with type field', () => {
    expect(validateCrypto({ type: 'ethereum', address: '0xABC' }).valid).toBe(true);
  });

  it('passes for litecoin', () => {
    expect(validateCrypto({ currency: 'litecoin', address: 'Laddr' }).valid).toBe(true);
  });

  it('fails when address is missing', () => {
    const result = validateCrypto({ currency: 'bitcoin' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Wallet address is required.');
  });

  it('fails when currency is invalid', () => {
    const result = validateCrypto({ currency: 'dogecoin', address: 'addr' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Currency must be one of: bitcoin, ethereum, litecoin.');
  });

  it('fails when currency is missing', () => {
    const result = validateCrypto({ address: 'addr' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Currency must be one of: bitcoin, ethereum, litecoin.');
  });
});

// ---------------------------------------------------------------------------
// validateEpc
// ---------------------------------------------------------------------------
describe('validateEpc', () => {
  it('passes for valid name and IBAN', () => {
    expect(validateEpc({ name: 'Red Cross', iban: 'DE89370400440532013000' }).valid).toBe(true);
  });

  it('fails when name is missing', () => {
    const result = validateEpc({ iban: 'DE1234' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Recipient name is required.');
  });

  it('fails when IBAN is missing', () => {
    const result = validateEpc({ name: 'Test' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('IBAN is required.');
  });

  it('fails when name exceeds 70 characters', () => {
    const result = validateEpc({ name: 'A'.repeat(71), iban: 'DE1234' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Recipient name must be 70 characters or fewer.');
  });

  it('passes when name is exactly 70 characters', () => {
    expect(validateEpc({ name: 'A'.repeat(70), iban: 'DE1234' }).valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateWhatsapp
// ---------------------------------------------------------------------------
describe('validateWhatsapp', () => {
  it('passes for a valid number', () => {
    expect(validateWhatsapp({ number: '+27123456789' }).valid).toBe(true);
  });

  it('fails when number is missing', () => {
    const result = validateWhatsapp({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('WhatsApp phone number is required.');
  });

  it('fails when number is empty', () => {
    expect(validateWhatsapp({ number: '' }).valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateSocial
// ---------------------------------------------------------------------------
describe('validateSocial', () => {
  it('passes when at least one link has a URL', () => {
    const result = validateSocial({
      links: [{ platform: 'Instagram', url: 'https://instagram.com/test' }],
    });
    expect(result.valid).toBe(true);
  });

  it('fails when links is empty array', () => {
    const result = validateSocial({ links: [] });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least one social link is required.');
  });

  it('fails when links is missing', () => {
    const result = validateSocial({});
    expect(result.valid).toBe(false);
  });

  it('fails when all links have empty URLs', () => {
    const result = validateSocial({
      links: [
        { platform: 'A', url: '' },
        { platform: 'B', url: '   ' },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least one social link with a non-empty URL is required.');
  });
});

// ---------------------------------------------------------------------------
// validateAppstore
// ---------------------------------------------------------------------------
describe('validateAppstore', () => {
  it('passes with appName and iOS URL', () => {
    expect(
      validateAppstore({ appName: 'My App', iosUrl: 'https://apps.apple.com/app/id123' }).valid,
    ).toBe(true);
  });

  it('passes with appName and Android URL', () => {
    expect(
      validateAppstore({
        appName: 'My App',
        androidUrl: 'https://play.google.com/store/apps/details?id=com.example',
      }).valid,
    ).toBe(true);
  });

  it('passes with both store URLs', () => {
    expect(
      validateAppstore({
        appName: 'App',
        iosUrl: 'https://ios.example.com',
        androidUrl: 'https://android.example.com',
      }).valid,
    ).toBe(true);
  });

  it('fails when appName is missing', () => {
    const result = validateAppstore({ iosUrl: 'https://ios.example.com' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('App name is required.');
  });

  it('fails when no store URLs are provided', () => {
    const result = validateAppstore({ appName: 'My App' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least one store URL (iOS or Android) is required.');
  });

  it('fails when both appName and URLs are missing', () => {
    const result = validateAppstore({});
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});
