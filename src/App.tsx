/**
 * @fileoverview Root application component for the QR Code Generator.
 *
 * Manages top-level state (wizard step, QR type, data, customization, dark
 * mode) and renders the wizard layout with a responsive sidebar/preview split.
 *
 * @module App
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Moon, Sun, QrCode } from 'lucide-react';
import { branding } from './config/branding';
import { DEFAULT_CUSTOMIZATION } from './config/defaults';
import type { WizardStep, QRType, QRCustomization } from './types';
import WizardContainer from './components/wizard/WizardContainer';
import QRPreview from './components/common/QRPreview';
import Footer from './components/layout/Footer';
import { QR_TYPE_REGISTRY } from './qr-types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** localStorage key for the dark-mode preference. */
const DARK_MODE_KEY = 'qr-generator-dark-mode';

/** Ordered list of wizard steps for navigation. */
const WIZARD_STEPS: readonly { key: WizardStep; label: string }[] = [
  { key: 'type', label: '1. Type' },
  { key: 'data', label: '2. Data' },
  { key: 'customize', label: '3. Style' },
  { key: 'export', label: '4. Export' },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Root application component.
 *
 * Renders the full-page wizard layout including the header, step indicator,
 * main content area, live QR preview panel, and footer.
 */
function App() {
  // State
  const [currentStep, setCurrentStep] = useState<WizardStep>('type');
  const [qrType, setQrType] = useState<QRType>('url');
  const [qrData, setQrData] = useState<Record<string, unknown>>({});
  const [customization, setCustomization] = useState<QRCustomization>(DEFAULT_CUSTOMIZATION);
  const [isDark, setIsDark] = useState<boolean>(
    () => document.documentElement.classList.contains('dark'),
  );

  // Dark mode toggle
  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem(DARK_MODE_KEY, String(next));
      return next;
    });
  }, []);

  // System theme listener
  useEffect(() => {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    if (stored !== null) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Wizard navigation
  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === currentStep);

  const goNext = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = WIZARD_STEPS.findIndex((s) => s.key === prev);
      return idx < WIZARD_STEPS.length - 1 ? WIZARD_STEPS[idx + 1].key : prev;
    });
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = WIZARD_STEPS.findIndex((s) => s.key === prev);
      return idx > 0 ? WIZARD_STEPS[idx - 1].key : prev;
    });
  }, []);

  const goToStep = useCallback(
    (step: WizardStep) => {
      const targetIdx = WIZARD_STEPS.findIndex((s) => s.key === step);
      if (targetIdx <= stepIndex + 1) setCurrentStep(step);
    },
    [stepIndex],
  );

  // QR type selection resets data
  const handleTypeSelect = useCallback((type: QRType) => {
    setQrType(type);
    setQrData({});
  }, []);

  // Build the QR data string using the formatter for the current type
  const dataString = useMemo(() => {
    try {
      const config = QR_TYPE_REGISTRY[qrType];
      if (config && Object.keys(qrData).length > 0) {
        return config.format(qrData);
      }
    } catch {
      // Ignore format errors during typing
    }
    return '';
  }, [qrType, qrData]);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <QrCode className="h-7 w-7 text-[var(--color-primary)]" aria-hidden="true" />
            <h1 className="text-lg font-semibold tracking-tight text-[var(--color-text)] sm:text-xl">
              {branding.appName}
            </h1>
          </div>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Step indicator */}
        <nav className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8" aria-label="Wizard steps">
          <ol className="flex items-center gap-2">
            {WIZARD_STEPS.map((step, idx) => {
              const isCurrent = step.key === currentStep;
              const isCompleted = idx < stepIndex;
              const isAccessible = idx <= stepIndex + 1;
              return (
                <li key={step.key} className="flex flex-1 items-center">
                  <button
                    type="button"
                    disabled={!isAccessible}
                    onClick={() => goToStep(step.key)}
                    className={[
                      'flex w-full items-center justify-center rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                      isCurrent
                        ? 'bg-[var(--color-primary)] text-white'
                        : isCompleted
                          ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                          : isAccessible
                            ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                            : 'cursor-not-allowed bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] opacity-50',
                    ].join(' ')}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {step.label}
                  </button>
                  {idx < WIZARD_STEPS.length - 1 && (
                    <div
                      className={[
                        'mx-1 hidden h-0.5 w-6 sm:block',
                        isCompleted ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      {/* Main content — two-column layout */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        {/* Left: Wizard steps */}
        <section
          className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-[var(--shadow-sm)] sm:p-6"
          aria-label="Step content"
        >
          <WizardContainer
            currentStep={currentStep}
            qrType={qrType}
            qrData={qrData}
            customization={customization}
            onQrTypeChange={handleTypeSelect}
            onQrDataChange={setQrData}
            onCustomizationChange={setCustomization}
            onNext={goNext}
            onBack={goBack}
          />
        </section>

        {/* Right: Live preview */}
        <aside
          className="flex shrink-0 flex-col items-center justify-start rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-[var(--shadow-sm)] lg:w-80"
          aria-label="QR code preview"
        >
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-secondary)]">
            Preview
          </h3>
          <QRPreview dataString={dataString} customization={customization} />
          <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
            QR code preview updates in real time.
          </p>
        </aside>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
