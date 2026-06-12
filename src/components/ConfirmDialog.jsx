import Modal from '@/components/Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  variant = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="text-center">
        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4
          ${variant === 'danger' ? 'bg-rose-500/10' : 'bg-amber-500/10'}`}
        >
          <AlertTriangle
            className={`w-7 h-7 ${variant === 'danger' ? 'text-rose-500' : 'text-amber-500'}`}
          />
        </div>

        <p className="dark:text-gray-300 text-gray-600 mb-6 text-sm leading-relaxed">
          {message}
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="btn-ghost dark:text-gray-300 text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
