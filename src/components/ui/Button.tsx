import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  iconLeft?: ReactNode
  iconRight?: ReactNode
  className?: string
}

export default function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  className = '',
  children,
  ...props
}: ButtonProps){
  const base = 'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed'
  const sizeCls = size === 'sm'
    ? 'px-3 py-1.5 text-sm'
    : size === 'lg'
      ? 'px-5 py-2.5 text-base'
      : 'px-4 py-2 text-sm'
  const variantCls = {
    primary: 'bg-gradient-to-r from-brand-500 to-brand-600 text-black hover:from-brand-600 hover:to-brand-700 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 font-semibold',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/20'
  }[variant]
  return (
    <button className={`${base} ${sizeCls} ${variantCls} ${className}`} {...props}>
      {iconLeft && <span className="mr-2 text-lg">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2 text-lg">{iconRight}</span>}
    </button>
  )
}