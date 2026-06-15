import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../layout/PageShell'

const Login = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [errors, setErrors] = useState([])
  const [resent, setResent] = useState(false)
  const [demoOtp, setDemoOtp] = useState('')

  const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))

  const validateMobile = (value) => {
    if (!/^[6-9][0-9]{9}$/.test(value)) {
      return ['Enter a valid 10-digit mobile number']
    }
    return []
  }

  const handleSendOtp = (e) => {
    e.preventDefault()
    const validationErrors = validateMobile(mobile)
    if (validationErrors.length) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setResent(false)
    setDemoOtp(generateOtp())
    setStep(2)
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(otp)) {
      setErrors(['Enter a valid 6-digit OTP'])
      return
    }
    setErrors([])
    navigate('/book/details', { state: { mobile } })
  }

  const handleResendOtp = () => {
    setResent(true)
    setDemoOtp(generateOtp())
    setOtp('')
    setErrors([])
  }

  const handleChangeNumber = () => {
    setStep(1)
    setOtp('')
    setResent(false)
    setErrors([])
  }

  return (
    <PageShell title="Sign in to book">
      <div className="card rounded-2xl p-6">
        {errors.length > 0 && (
          <div className="mb-4 rounded-xl err-box p-3 space-y-1">
            {errors.map((err) => (
              <p key={err} className="err-text text-sm flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <circle cx="7" cy="7" r="6" stroke="#dc2626" strokeWidth="1.5" />
                  <path d="M7 4v3M7 9.5v.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {err}
              </p>
            ))}
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="mb-5">
              <h2 className="page-title text-lg font-semibold">Your mobile number</h2>
              <p className="page-sub text-sm mt-1">We&apos;ll send a one-time code to verify you</p>
            </div>

            <form onSubmit={handleSendOtp}>
              <div>
                <label className="block label-text text-xs mono uppercase tracking-widest mb-2">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <span className="inp rounded-xl px-3 py-3 text-sm mono text-gray-500 flex items-center shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    placeholder="98765 43210"
                    className="inp w-full rounded-xl px-4 py-3 text-sm mono"
                    required
                    autoComplete="tel-national"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-green w-full mt-6 rounded-xl py-3 text-white text-sm font-semibold flex items-center justify-center gap-2"
              >
                Send OTP
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-5">
              <h2 className="page-title text-lg font-semibold">Enter OTP</h2>
              <p className="page-sub text-sm mt-1">
                Code sent to{' '}
                <span className="mono text-gray-700">+91 {mobile}</span>
              </p>
            </div>

            {resent && (
              <div className="rounded-xl info-box p-3 mb-4">
                <p className="info-text text-xs mono">New OTP sent.</p>
              </div>
            )}

            <div className="rounded-xl info-box p-3 mb-4 flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0">
                <circle cx="7" cy="7" r="6" stroke="#16a34a" strokeWidth="1.2" />
                <path d="M7 5v3M7 9.5v.3" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <p className="info-text text-xs mono">
                Demo mode — your OTP is <strong>{demoOtp}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div>
                <label className="block label-text text-xs mono uppercase tracking-widest mb-2">
                  6-digit code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  pattern="\d{6}"
                  placeholder="······"
                  className="inp w-full rounded-xl px-4 py-3 otp-input"
                  required
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>
              <button
                type="submit"
                className="btn-green w-full mt-6 rounded-xl py-3 text-white text-sm font-semibold flex items-center justify-center gap-2"
              >
                Verify &amp; continue
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>

            <div className="flex items-center justify-between mt-4 gap-3">
              <button
                type="button"
                onClick={handleChangeNumber}
                className="text-gray-500 text-xs mono hover:text-green-700 transition-colors"
              >
                Change number
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-green-700 text-xs mono hover:text-green-800 transition-colors"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}
      </div>
    </PageShell>
  )
}

export default Login
