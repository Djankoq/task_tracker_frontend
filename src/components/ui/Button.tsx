import type { ButtonHTMLAttributes, ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary'

function className(variant: Variant, extra = '') {
  return `${styles.button} ${styles[variant]} ${extra}`
}

export function Button({ variant = 'primary', className: extra, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={className(variant, extra)} {...props} />
}

export function ButtonLink({ variant = 'primary', className: extra, ...props }: Omit<ComponentProps<typeof Link>, 'className'> & { variant?: Variant; className?: string }) {
  return <Link className={className(variant, extra)} {...props} />
}
