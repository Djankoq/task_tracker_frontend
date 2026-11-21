import { useId, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import styles from '../ui/Input.module.css'
export function SelectField({ label, error, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; children: ReactNode }) {
  const id = useId()
  return <div className={styles.field}><label htmlFor={id}>{label}{props.required ? ' *' : ''}</label>
    <select {...props} id={id} className={styles.input + ' select-input'} aria-invalid={Boolean(error)} aria-describedby={error ? id + '-error' : undefined}>{children}</select>
    {error && <span id={id + '-error'} className={styles.error} role="alert">{error}</span>}
  </div>
}
export function TextareaField({ label, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  const id = useId()
  return <div className={styles.field}><label htmlFor={id}>{label}{props.required ? ' *' : ''}</label>
    <textarea {...props} id={id} className={styles.input} aria-invalid={Boolean(error)} aria-describedby={error ? id + '-error' : undefined} rows={4} />
    {error && <span id={id + '-error'} className={styles.error} role="alert">{error}</span>}
  </div>
}
