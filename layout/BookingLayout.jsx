import PageShell from './PageShell.jsx'
import StepIndicator from './StepIndicator.jsx'

const BookingLayout = ({ currentStep, children, wide = false }) => {
  return (
    <PageShell
      title="Book a Charging Slot"
      showSteps
      wide={wide}
      stepsSlot={<StepIndicator currentStep={currentStep} />}
    >
      <div className="card rounded-2xl p-6 mt-5">
        {children}
      </div>
    </PageShell>
  )
}

export default BookingLayout
