import { useId, type InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id || generatedId
  const description = error || hint
  const descriptionId = `${inputId}-description`
  return (
    <div className={`${styles.field} ${className}`}>
      <label htmlFor={inputId}>{label}{props.required && <span className={styles.required}> *</span>}</label>
      <input {...props} id={inputId} className={styles.input} aria-invalid={Boolean(error)} aria-describedby={[props['aria-describedby'], description ? descriptionId : undefined].filter(Boolean).join(' ') || undefined} />
      {description && <span id={descriptionId} className={error ? styles.error : styles.hint} role={error ? 'alert' : undefined}>{description}</span>}
    </div>
  )
}
