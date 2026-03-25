/**
 * @file WizardContainer.tsx
 * @description Main wizard orchestrator component that renders the correct
 * step panel based on the current {@link WizardStep}. Receives all state and
 * callbacks from the parent (App.tsx) and delegates to the appropriate step
 * component.
 *
 * The wizard follows a four-step flow:
 * 1. **Type** — Choose a QR code type
 * 2. **Data** — Enter content for the chosen type
 * 3. **Customize** — Adjust visual appearance
 * 4. **Export** — Download or copy the generated QR code
 *
 * @module components/wizard/WizardContainer
 *
 * @example
 * ```tsx
 * <WizardContainer
 *   currentStep="type"
 *   qrType="url"
 *   qrData={{}}
 *   customization={DEFAULT_CUSTOMIZATION}
 *   onQrTypeChange={setQrType}
 *   onQrDataChange={setQrData}
 *   onCustomizationChange={setCustomization}
 *   onNext={handleNext}
 *   onBack={handleBack}
 * />
 * ```
 */

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { QRType, QRCustomization, WizardStep } from '../../types';
import { QR_TYPE_REGISTRY } from '../../qr-types';
import StepTypeSelect from './StepTypeSelect';
import StepDataInput from './StepDataInput';
import StepCustomize from './StepCustomize';
import StepExport from './StepExport';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props accepted by the {@link WizardContainer} component.
 *
 * All state lives in the parent — this component is a pure orchestrator
 * that maps the current step to its corresponding panel.
 */
interface WizardContainerProps {
  /** The currently active wizard step. */
  currentStep: WizardStep;
  /** The selected QR code content type. */
  qrType: QRType;
  /** Current payload data (shape varies by {@link qrType}). */
  qrData: Record<string, unknown>;
  /** Current visual customization settings. */
  customization: QRCustomization;
  /** Callback to update the selected QR type. */
  onQrTypeChange: (type: QRType) => void;
  /** Callback to update the QR data payload. */
  onQrDataChange: (data: Record<string, unknown>) => void;
  /** Callback to update the visual customization. */
  onCustomizationChange: (customization: QRCustomization) => void;
  /** Advance to the next wizard step. */
  onNext: () => void;
  /** Return to the previous wizard step. */
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Step metadata
// ---------------------------------------------------------------------------

/**
 * Ordered list of wizard steps with human-readable labels.
 * Used for the progress indicator and navigation logic.
 */
const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'type', label: 'Type' },
  { key: 'data', label: 'Data' },
  { key: 'customize', label: 'Customize' },
  { key: 'export', label: 'Export' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * WizardContainer orchestrates the multi-step QR code creation flow.
 *
 * It renders:
 * 1. A horizontal step indicator showing progress through the wizard.
 * 2. The active step panel (type selection, data entry, customization,
 *    or export).
 * 3. Back / Next navigation buttons that respect step boundaries.
 *
 * @param props - {@link WizardContainerProps}
 * @returns A React element containing the full wizard UI.
 */
function WizardContainer({
  currentStep,
  qrType,
  qrData,
  customization,
  onQrTypeChange,
  onQrDataChange,
  onCustomizationChange,
  onNext,
  onBack,
}: WizardContainerProps) {
  /** Numeric index of the current step (0-based). */
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  /** Whether the Back button should be visible. */
  const showBack = currentIndex > 0;

  /** Whether the Next button should be visible (hidden on the final step). */
  const showNext = currentIndex < STEPS.length - 1;

  /**
   * Memoized QR data string for the export step.
   * Serializes the current qrData payload to a JSON string so the export
   * panel can pass it to the QR rendering engine.
   */
  const dataString = useMemo(() => {
    try {
      const config = QR_TYPE_REGISTRY[qrType];
      if (config && Object.keys(qrData).length > 0) {
        return config.format(qrData);
      }
    } catch {
      // Fall back to empty string on format error
    }
    return '';
  }, [qrType, qrData]);

  /**
   * Renders the panel component for the active step.
   *
   * @returns The React element for the current step.
   */
  function renderStep() {
    switch (currentStep) {
      case 'type':
        return (
          <StepTypeSelect
            selectedType={qrType}
            onSelect={(type) => {
              onQrTypeChange(type);
            }}
          />
        );

      case 'data':
        return (
          <StepDataInput
            qrType={qrType}
            data={qrData}
            onChange={onQrDataChange}
            errors={[]}
          />
        );

      case 'customize':
        return (
          <StepCustomize
            customization={customization}
            onChange={onCustomizationChange}
          />
        );

      case 'export':
        return (
          <StepExport
            dataString={dataString}
            customization={customization}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ----------------------------------------------------------------- */}
      {/* Step progress indicator                                           */}
      {/* ----------------------------------------------------------------- */}
      <nav aria-label="Wizard progress" className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          /** Whether this step is the active one. */
          const isActive = index === currentIndex;
          /** Whether this step has already been completed. */
          const isCompleted = index < currentIndex;

          return (
            <div key={step.key} className="flex items-center gap-2">
              {/* Step circle */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isActive
                    ? 'shadow-sm'
                    : isCompleted
                      ? 'shadow-sm'
                      : ''
                }`}
                style={{
                  backgroundColor: isActive
                    ? 'var(--accent)'
                    : isCompleted
                      ? 'var(--accent)'
                      : 'var(--surface)',
                  color: isActive || isCompleted
                    ? '#ffffff'
                    : 'var(--text)',
                  border: `2px solid ${
                    isActive || isCompleted
                      ? 'var(--accent)'
                      : 'var(--border)'
                  }`,
                }}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? '✓' : index + 1}
              </div>

              {/* Step label */}
              <span
                className="hidden text-sm font-medium sm:inline"
                style={{
                  color: isActive
                    ? 'var(--text-h)'
                    : 'var(--text)',
                }}
              >
                {step.label}
              </span>

              {/* Connector line between steps */}
              {index < STEPS.length - 1 && (
                <div
                  className="mx-1 h-0.5 w-6 rounded-full sm:w-10"
                  style={{
                    backgroundColor: isCompleted
                      ? 'var(--accent)'
                      : 'var(--border)',
                  }}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* ----------------------------------------------------------------- */}
      {/* Active step panel                                                 */}
      {/* ----------------------------------------------------------------- */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {renderStep()}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Navigation buttons                                                */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center justify-between">
        {/* Back button */}
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
            }}
          >
            <ChevronLeft size={16} />
            Back
          </button>
        ) : (
          <div />
        )}

        {/* Next button */}
        {showNext && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--accent)',
            }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default WizardContainer;
