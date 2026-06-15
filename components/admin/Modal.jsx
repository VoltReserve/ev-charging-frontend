import { useEffect } from 'react'

const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return undefined

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="admin-modal-root" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <button type="button" className="admin-modal-backdrop" onClick={onClose} aria-label="Close" />
      <div className="admin-modal-panel">
        <div className="admin-modal-header">
          <h2 id="admin-modal-title" className="text-gray-900 font-semibold text-base pr-4">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="admin-modal-close" aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
