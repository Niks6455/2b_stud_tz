export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  commentRequired?: boolean
  comment?: string
  onCommentChange?: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}
