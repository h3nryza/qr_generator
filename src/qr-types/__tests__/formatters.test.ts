import { describe, it, expect } from 'vitest';
import {
  formatUrl,
  formatText,
  formatEmail,
  formatPhone,
  formatSms,
  formatWifi,
  formatVCard,
  formatMeCard,
  formatCalendar,
  formatGeo,
  formatCrypto,
  formatEpc,
  formatWhatsApp,
  formatSocialHub,
  formatAppStore,
} from '../formatters';

// ---------------------------------------------------------------------------
// formatUrl
// ---------------------------------------------------------------------------
describe('formatUrl', () => {
  it('returns a URL with existing https:// unchanged', () => {
    expect(formatUrl({ url: 'https://example.com' })).toBe('https://example.com');
  });

  it('returns a URL with existing http:// unchanged', () => {
    expect(formatUrl({ url: 'http://example.com' })).toBe('http://example.com');
  });

  it('auto-prepends https:// when protocol is missing', () => {
    expect(formatUrl({ url: 'example.com' })).toBe('https://example.com');
  });

  it('trims whitespace from the URL', () => {
    expect(formatUrl({ url: '  example.com  ' })).toBe('https://example.com');
  });

  it('appends a single UTM parameter', () => {
    const result = formatUrl({ url: 'https://example.com', utmSource: 'flyer' });
    expect(result).toBe('https://example.com?utm_source=flyer');
  });

  it('appends multiple UTM parameters', () => {
    const result = formatUrl({
      url: 'https://example.com',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'spring',
      utmTerm: 'qr',
      utmContent: 'banner',
    });
    expect(result).toContain('utm_source=google');
    expect(result).toContain('utm_medium=cpc');
    expect(result).toContain('utm_campaign=spring');
    expect(result).toContain('utm_term=qr');
    expect(result).toContain('utm_content=banner');
  });

  it('uses & separator when URL already has query params', () => {
    const result = formatUrl({ url: 'https://example.com?page=1', utmSource: 'test' });
    expect(result).toBe('https://example.com?page=1&utm_source=test');
  });

  it('does not append UTM string when no UTM params are provided', () => {
    const result = formatUrl({ url: 'https://example.com' });
    expect(result).not.toContain('?');
  });
});

// ---------------------------------------------------------------------------
// formatText
// ---------------------------------------------------------------------------
describe('formatText', () => {
  it('returns the text as-is', () => {
    expect(formatText({ text: 'Hello, world!' })).toBe('Hello, world!');
  });

  it('preserves whitespace and special characters', () => {
    const text = '  line1\nline2\ttab  ';
    expect(formatText({ text })).toBe(text);
  });

  it('handles empty string', () => {
    expect(formatText({ text: '' })).toBe('');
  });
});

// ---------------------------------------------------------------------------
// formatEmail
// ---------------------------------------------------------------------------
describe('formatEmail', () => {
  it('returns mailto: with just the recipient', () => {
    expect(formatEmail({ to: 'user@example.com' })).toBe('mailto:user@example.com');
  });

  it('trims whitespace from the recipient', () => {
    expect(formatEmail({ to: '  user@example.com  ' })).toBe('mailto:user@example.com');
  });

  it('includes subject and body', () => {
    const result = formatEmail({ to: 'a@b.com', subject: 'Hello', body: 'Hi there' });
    expect(result).toBe('mailto:a@b.com?subject=Hello&body=Hi%20there');
  });

  it('includes cc and bcc', () => {
    const result = formatEmail({ to: 'a@b.com', cc: 'c@d.com', bcc: 'e@f.com' });
    expect(result).toContain('cc=c%40d.com');
    expect(result).toContain('bcc=e%40f.com');
  });

  it('includes all params together', () => {
    const result = formatEmail({
      to: 'a@b.com',
      cc: 'c@d.com',
      bcc: 'e@f.com',
      subject: 'Test',
      body: 'Body',
    });
    expect(result).toMatch(/^mailto:a@b\.com\?/);
    expect(result).toContain('cc=');
    expect(result).toContain('bcc=');
    expect(result).toContain('subject=Test');
    expect(result).toContain('body=Body');
  });
});

// ---------------------------------------------------------------------------
// formatPhone
// ---------------------------------------------------------------------------
describe('formatPhone', () => {
  it('returns tel: URI with the number', () => {
    expect(formatPhone({ number: '+27123456789' })).toBe('tel:+27123456789');
  });

  it('strips spaces from the number', () => {
    expect(formatPhone({ number: '+27 123 456 7890' })).toBe('tel:+271234567890');
  });

  it('strips dashes and parentheses', () => {
    expect(formatPhone({ number: '(012) 345-6789' })).toBe('tel:0123456789');
  });

  it('trims leading/trailing whitespace', () => {
    expect(formatPhone({ number: '  +27123456789  ' })).toBe('tel:+27123456789');
  });
});

// ---------------------------------------------------------------------------
// formatSms
// ---------------------------------------------------------------------------
describe('formatSms', () => {
  it('returns SMSTO: URI with number only', () => {
    expect(formatSms({ number: '+27123456789' })).toBe('SMSTO:+27123456789');
  });

  it('includes message when provided', () => {
    expect(formatSms({ number: '+27123456789', message: 'Hello!' })).toBe(
      'SMSTO:+27123456789:Hello!',
    );
  });

  it('strips spaces and dashes from the number', () => {
    expect(formatSms({ number: '+27 123-456-7890', message: 'Hi' })).toBe(
      'SMSTO:+271234567890:Hi',
    );
  });
});

// ---------------------------------------------------------------------------
// formatWifi
// ---------------------------------------------------------------------------
describe('formatWifi', () => {
  it('formats a basic WPA network', () => {
    const result = formatWifi({ ssid: 'MyNet', password: 'pass123', encryption: 'WPA' });
    expect(result).toBe('WIFI:T:WPA;S:MyNet;P:pass123;H:false;;');
  });

  it('formats an open network (nopass)', () => {
    const result = formatWifi({ ssid: 'OpenNet', encryption: 'nopass' });
    expect(result).toBe('WIFI:T:nopass;S:OpenNet;P:;H:false;;');
  });

  it('sets hidden flag to true', () => {
    const result = formatWifi({ ssid: 'Hidden', password: 'x', encryption: 'WPA', hidden: true });
    expect(result).toContain('H:true');
  });

  it('escapes special characters in SSID and password', () => {
    const result = formatWifi({ ssid: 'My;Net', password: 'pa:ss', encryption: 'WEP' });
    expect(result).toContain('S:My\\;Net');
    expect(result).toContain('P:pa\\:ss');
  });

  it('escapes backslash, comma, and quote characters', () => {
    const result = formatWifi({ ssid: 'a\\b,c"d', password: '', encryption: 'WPA' });
    expect(result).toContain('S:a\\\\b\\,c\\"d');
  });
});

// ---------------------------------------------------------------------------
// formatVCard
// ---------------------------------------------------------------------------
describe('formatVCard', () => {
  it('produces BEGIN:VCARD and END:VCARD wrapper', () => {
    const result = formatVCard({ firstName: 'John' });
    expect(result).toMatch(/^BEGIN:VCARD/);
    expect(result).toMatch(/END:VCARD$/);
  });

  it('includes VERSION:3.0', () => {
    const result = formatVCard({ firstName: 'John' });
    expect(result).toContain('VERSION:3.0');
  });

  it('formats N and FN fields with prefix and suffix', () => {
    const result = formatVCard({
      prefix: 'Dr.',
      firstName: 'John',
      lastName: 'Doe',
      suffix: 'Jr.',
    });
    expect(result).toContain('N:Doe;John;;Dr.;Jr.');
    expect(result).toContain('FN:Dr. John Doe Jr.');
  });

  it('includes organization with department', () => {
    const result = formatVCard({
      firstName: 'A',
      organization: 'Acme Corp',
      department: 'Engineering',
    });
    expect(result).toContain('ORG:Acme Corp;Engineering');
  });

  it('includes title', () => {
    const result = formatVCard({ firstName: 'A', title: 'CEO' });
    expect(result).toContain('TITLE:CEO');
  });

  it('includes phone numbers with types', () => {
    const result = formatVCard({
      firstName: 'A',
      phones: [
        { number: '+271234', type: 'CELL' },
        { number: '+275678', type: 'WORK' },
      ],
    });
    expect(result).toContain('TEL;TYPE=CELL:+271234');
    expect(result).toContain('TEL;TYPE=WORK:+275678');
  });

  it('includes email addresses with types', () => {
    const result = formatVCard({
      firstName: 'A',
      emails: [{ address: 'a@b.com', type: 'WORK' }],
    });
    expect(result).toContain('EMAIL;TYPE=WORK:a@b.com');
  });

  it('includes address', () => {
    const result = formatVCard({
      firstName: 'A',
      address: { street: '123 Main', city: 'Town', state: 'ST', postalCode: '12345', country: 'ZA' },
    });
    expect(result).toContain('ADR;TYPE=WORK:;;123 Main;Town;ST;12345;ZA');
  });

  it('includes URL, birthday, photo, note, and social URLs', () => {
    const result = formatVCard({
      firstName: 'A',
      url: 'https://example.com',
      birthday: '1990-01-15',
      photoUrl: 'https://img.example.com/photo.jpg',
      note: 'A note',
      socialUrls: [{ platform: 'Twitter', url: 'https://twitter.com/a' }],
    });
    expect(result).toContain('URL:https://example.com');
    expect(result).toContain('BDAY:19900115');
    expect(result).toContain('PHOTO;VALUE=URI:https://img.example.com/photo.jpg');
    expect(result).toContain('NOTE:A note');
    expect(result).toContain('X-SOCIALPROFILE;TYPE=twitter:https://twitter.com/a');
  });
});

// ---------------------------------------------------------------------------
// formatMeCard
// ---------------------------------------------------------------------------
describe('formatMeCard', () => {
  it('formats name as Last,First', () => {
    const result = formatMeCard({ lastName: 'Doe', firstName: 'John' });
    expect(result).toMatch(/^MECARD:/);
    expect(result).toContain('N:Doe\\,John');
    expect(result).toMatch(/;;$/);
  });

  it('includes phone, email, org, url, address, note', () => {
    const result = formatMeCard({
      lastName: 'Doe',
      phone: '+271234',
      email: 'a@b.com',
      organization: 'Acme',
      url: 'https://x.com',
      address: '123 Main St',
      note: 'Hi',
    });
    expect(result).toContain('TEL:+271234');
    expect(result).toContain('EMAIL:a@b.com');
    expect(result).toContain('ORG:Acme');
    expect(result).toContain('URL:https://x.com');
    expect(result).toContain('ADR:123 Main St');
    expect(result).toContain('NOTE:Hi');
  });

  it('escapes special characters in organization', () => {
    const result = formatMeCard({ firstName: 'A', organization: 'A;B' });
    expect(result).toContain('ORG:A\\;B');
  });

  it('handles first name only', () => {
    const result = formatMeCard({ firstName: 'Alice' });
    expect(result).toContain('N:Alice');
  });
});

// ---------------------------------------------------------------------------
// formatCalendar
// ---------------------------------------------------------------------------
describe('formatCalendar', () => {
  it('produces VCALENDAR with VEVENT wrapper', () => {
    const result = formatCalendar({ title: 'Test', startDate: '2026-03-25T14:00:00Z' });
    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('VERSION:2.0');
    expect(result).toContain('BEGIN:VEVENT');
    expect(result).toContain('END:VEVENT');
    expect(result).toContain('END:VCALENDAR');
  });

  it('includes SUMMARY, DTSTART, and DTEND', () => {
    const result = formatCalendar({
      title: 'Meeting',
      startDate: '2026-03-25T14:00:00Z',
      endDate: '2026-03-25T15:00:00Z',
    });
    expect(result).toContain('SUMMARY:Meeting');
    expect(result).toContain('DTSTART:20260325T140000Z');
    expect(result).toContain('DTEND:20260325T150000Z');
  });

  it('formats all-day events with VALUE=DATE', () => {
    const result = formatCalendar({
      title: 'Holiday',
      startDate: '2026-12-25T00:00:00Z',
      endDate: '2026-12-26T00:00:00Z',
      allDay: true,
    });
    expect(result).toContain('DTSTART;VALUE=DATE:20261225');
    expect(result).toContain('DTEND;VALUE=DATE:20261226');
  });

  it('includes location and description', () => {
    const result = formatCalendar({
      title: 'Test',
      startDate: '2026-01-01T00:00:00Z',
      location: 'Room A',
      description: 'A meeting',
    });
    expect(result).toContain('LOCATION:Room A');
    expect(result).toContain('DESCRIPTION:A meeting');
  });

  it('includes VALARM when reminder is set', () => {
    const result = formatCalendar({
      title: 'Test',
      startDate: '2026-01-01T00:00:00Z',
      reminder: 15,
    });
    expect(result).toContain('BEGIN:VALARM');
    expect(result).toContain('TRIGGER:-PT15M');
    expect(result).toContain('ACTION:DISPLAY');
    expect(result).toContain('END:VALARM');
  });

  it('omits VALARM when reminder is 0 or not set', () => {
    const result = formatCalendar({ title: 'Test', startDate: '2026-01-01T00:00:00Z' });
    expect(result).not.toContain('VALARM');

    const result2 = formatCalendar({
      title: 'Test',
      startDate: '2026-01-01T00:00:00Z',
      reminder: 0,
    });
    expect(result2).not.toContain('VALARM');
  });
});

// ---------------------------------------------------------------------------
// formatGeo
// ---------------------------------------------------------------------------
describe('formatGeo', () => {
  it('returns geo: URI with lat and lon', () => {
    expect(formatGeo({ latitude: 37.7749, longitude: -122.4194 })).toBe(
      'geo:37.7749,-122.4194',
    );
  });

  it('appends label as ?q= parameter', () => {
    const result = formatGeo({ latitude: 37.7749, longitude: -122.4194, label: 'San Francisco' });
    expect(result).toBe('geo:37.7749,-122.4194?q=San+Francisco');
  });

  it('handles zero coordinates', () => {
    expect(formatGeo({ latitude: 0, longitude: 0 })).toBe('geo:0,0');
  });
});

// ---------------------------------------------------------------------------
// formatCrypto
// ---------------------------------------------------------------------------
describe('formatCrypto', () => {
  it('formats a bitcoin URI with amount and message', () => {
    const result = formatCrypto({
      type: 'bitcoin',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      amount: 0.5,
      message: 'Payment',
    });
    expect(result).toBe(
      'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.5&message=Payment',
    );
  });

  it('formats an ethereum URI using "value" instead of "amount"', () => {
    const result = formatCrypto({
      type: 'ethereum',
      address: '0xABC123',
      amount: 1.0,
    });
    expect(result).toContain('ethereum:0xABC123');
    expect(result).toContain('value=1');
  });

  it('formats litecoin URI', () => {
    const result = formatCrypto({ type: 'litecoin', address: 'Laddr123' });
    expect(result).toBe('litecoin:Laddr123');
  });

  it('includes label with encoding', () => {
    const result = formatCrypto({
      type: 'bitcoin',
      address: 'addr1',
      label: 'My Wallet',
    });
    expect(result).toContain('label=My%20Wallet');
  });

  it('trims the address', () => {
    const result = formatCrypto({ type: 'bitcoin', address: '  addr1  ' });
    expect(result).toBe('bitcoin:addr1');
  });
});

// ---------------------------------------------------------------------------
// formatEpc
// ---------------------------------------------------------------------------
describe('formatEpc', () => {
  it('produces the EPC069-12 12-line format', () => {
    const result = formatEpc({
      name: 'Red Cross',
      iban: 'DE89 3704 0044 0532 0130 00',
      bic: 'COBADEFFXXX',
      amount: 50.0,
      reference: 'INV-2026-001',
    });
    const lines = result.split('\n');
    expect(lines[0]).toBe('BCD');
    expect(lines[1]).toBe('002');
    expect(lines[2]).toBe('1');
    expect(lines[3]).toBe('SCT');
    expect(lines[4]).toBe('COBADEFFXXX');
    expect(lines[5]).toBe('Red Cross');
    expect(lines[6]).toBe('DE89370400440532013000');
    expect(lines[7]).toBe('EUR50.00');
    expect(lines[8]).toBe('');
    expect(lines[9]).toBe('INV-2026-001');
    expect(lines[10]).toBe('');
    expect(lines[11]).toBe('');
    expect(lines).toHaveLength(12);
  });

  it('handles missing optional fields', () => {
    const result = formatEpc({ name: 'Test', iban: 'DE1234' });
    const lines = result.split('\n');
    expect(lines[4]).toBe(''); // no BIC
    expect(lines[7]).toBe(''); // no amount
    expect(lines[9]).toBe(''); // no reference
  });

  it('truncates name to 70 characters', () => {
    const longName = 'A'.repeat(100);
    const result = formatEpc({ name: longName, iban: 'DE1234' });
    const lines = result.split('\n');
    expect(lines[5]).toHaveLength(70);
  });

  it('includes unstructured text', () => {
    const result = formatEpc({ name: 'X', iban: 'Y', text: 'For invoice 42' });
    const lines = result.split('\n');
    expect(lines[10]).toBe('For invoice 42');
  });
});

// ---------------------------------------------------------------------------
// formatWhatsApp
// ---------------------------------------------------------------------------
describe('formatWhatsApp', () => {
  it('returns wa.me URL with digits only', () => {
    expect(formatWhatsApp({ number: '+27123456789' })).toBe('https://wa.me/27123456789');
  });

  it('strips non-digit characters from number', () => {
    expect(formatWhatsApp({ number: '+27 (12) 345-6789' })).toBe('https://wa.me/27123456789');
  });

  it('appends message as ?text= parameter', () => {
    const result = formatWhatsApp({ number: '27123456789', message: 'Hello there' });
    expect(result).toBe('https://wa.me/27123456789?text=Hello%20there');
  });

  it('returns URL without ?text when no message', () => {
    const result = formatWhatsApp({ number: '123' });
    expect(result).toBe('https://wa.me/123');
    expect(result).not.toContain('?');
  });
});

// ---------------------------------------------------------------------------
// formatSocialHub
// ---------------------------------------------------------------------------
describe('formatSocialHub', () => {
  it('returns JSON with links array', () => {
    const result = formatSocialHub({
      links: [{ platform: 'Instagram', url: 'https://instagram.com/test' }],
    });
    const parsed = JSON.parse(result);
    expect(parsed.links).toHaveLength(1);
    expect(parsed.links[0].platform).toBe('Instagram');
    expect(parsed.links[0].url).toBe('https://instagram.com/test');
  });

  it('includes title when provided', () => {
    const result = formatSocialHub({
      title: 'Follow Us',
      links: [{ platform: 'X', url: 'https://x.com/test' }],
    });
    const parsed = JSON.parse(result);
    expect(parsed.title).toBe('Follow Us');
  });

  it('omits title when empty or whitespace', () => {
    const result = formatSocialHub({
      title: '   ',
      links: [{ platform: 'X', url: 'https://x.com/test' }],
    });
    const parsed = JSON.parse(result);
    expect(parsed.title).toBeUndefined();
  });

  it('filters out links with empty URLs', () => {
    const result = formatSocialHub({
      links: [
        { platform: 'A', url: 'https://a.com' },
        { platform: 'B', url: '' },
        { platform: 'C', url: '   ' },
      ],
    });
    const parsed = JSON.parse(result);
    expect(parsed.links).toHaveLength(1);
    expect(parsed.links[0].platform).toBe('A');
  });

  it('trims URLs in links', () => {
    const result = formatSocialHub({
      links: [{ platform: 'A', url: '  https://a.com  ' }],
    });
    const parsed = JSON.parse(result);
    expect(parsed.links[0].url).toBe('https://a.com');
  });
});

// ---------------------------------------------------------------------------
// formatAppStore
// ---------------------------------------------------------------------------
describe('formatAppStore', () => {
  it('returns the single URL directly when only one store URL is provided', () => {
    const result = formatAppStore({
      appName: 'My App',
      iosUrl: 'https://apps.apple.com/app/my-app/id123',
    });
    expect(result).toBe('https://apps.apple.com/app/my-app/id123');
  });

  it('returns a single Android URL directly', () => {
    const result = formatAppStore({
      appName: 'My App',
      androidUrl: 'https://play.google.com/store/apps/details?id=com.example',
    });
    expect(result).toBe('https://play.google.com/store/apps/details?id=com.example');
  });

  it('returns a data URI when multiple URLs are provided', () => {
    const result = formatAppStore({
      appName: 'My App',
      iosUrl: 'https://apps.apple.com/app/id123',
      androidUrl: 'https://play.google.com/store/apps/details?id=com.example',
    });
    expect(result).toMatch(/^data:text\/html;charset=utf-8,/);
    const html = decodeURIComponent(result.replace('data:text/html;charset=utf-8,', ''));
    expect(html).toContain('My App');
    expect(html).toContain('apps.apple.com');
    expect(html).toContain('play.google.com');
  });

  it('includes fallback URL in the redirect page', () => {
    const result = formatAppStore({
      appName: 'App',
      iosUrl: 'https://ios.example.com',
      androidUrl: 'https://android.example.com',
      fallbackUrl: 'https://fallback.example.com',
    });
    const html = decodeURIComponent(result.replace('data:text/html;charset=utf-8,', ''));
    expect(html).toContain('fallback.example.com');
  });
});
