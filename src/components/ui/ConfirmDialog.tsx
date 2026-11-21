import { useEffect, useId, useRef } from 'react'
import { Button } from './Button'
import styles from './ConfirmDialog.module.css'
export function ConfirmDialog({ name, busy, error, onCancel, onConfirm }: {
  name: string; busy: boolean; error: string; onCancel: () => void; onConfirm: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const node = dialog.current
    node?.showModal()
    return () => node?.close()
  }, [])
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={(event) => { event.preventDefault(); if (!busy) onCancel() }}>
    <h2 id={titleId}>Удалить запись?</h2>
    <p id={descriptionId}>«{name}» будет удалена из базы. Отменить удаление нельзя. Связанные данные могут препятствовать удалению.</p>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <div className={styles.actions}>
      <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>Отмена</Button>
      <Button className={styles.danger} onClick={onConfirm} disabled={busy}>{busy ? 'Удаление…' : 'Удалить'}</Button>
    </div>
  </dialog>
}
