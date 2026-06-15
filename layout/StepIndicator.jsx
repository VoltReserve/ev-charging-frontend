import { BOOKING_STEPS } from './bookingStepConfig.js'

const StepIndicator = ({ currentStep }) => {
  const getStepClass = (stepId) => {
    if (stepId < currentStep) return 'step-done'
    if (stepId === currentStep) return 'step-active'
    return 'step-idle'
  }

  const getLabelClass = (stepId) => {
    if (stepId < currentStep) return 'text-green-700'
    if (stepId === currentStep) return 'text-green-600 font-semibold'
    return 'text-gray-400'
  }

  const StepIcon = ({ stepId }) => {
    if (stepId < currentStep) {
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
    return stepId
  }

  return (
    <div className="flex items-center gap-0">
      {BOOKING_STEPS.map((step, index) => (
        <span key={step.id} className="contents">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs mono font-bold ${getStepClass(step.id)}`}>
              <StepIcon stepId={step.id} />
            </div>
            <span className={`text-[10px] mono mt-1 ${getLabelClass(step.id)}`}>
              {step.label}
            </span>
          </div>
          {index < BOOKING_STEPS.length - 1 && (
            <div className={`h-px flex-1 mb-4 ${step.id < currentStep ? 'step-line-done' : 'step-line-idle'}`} />
          )}
        </span>
      ))}
    </div>
  )
}

export default StepIndicator
