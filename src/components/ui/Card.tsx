import { ReactNode } from 'react'

type Variant = 'solid' | 'glass'
type Accent = 'brand' | 'blue' | 'green' | 'red' | 'orange' | 'purple'

export interface CardProps {
  title?: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  variant?: Variant
  accent?: Accent
}

const accentMap: Record<Accent, string> = {
  brand: 'from-brand-500 to-brand-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600',
  orange: 'from-orange-500 to-orange-600',
  purple: 'from-purple-500 to-purple-600',
}

export default function Card({
  title,
  description,
  icon,
  actions,
  children,
  className = '',
  variant = 'solid',
  accent = 'brand',
}: CardProps){
  const baseSolid = 'rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow'
  const baseGlass = 'relative rounded-2xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow transform-gpu hover:-translate-y-0.5'

  if (variant === 'glass') {
    return (
      <div className={`group relative rounded-2xl p-[1px] bg-gradient-to-br ${accentMap[accent]} opacity-40 dark:opacity-30`}> 
        <section className={`${baseGlass} ${className}`}>
          {(title || actions) && (
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {icon && (
                  <div className={`w-10 h-10 bg-gradient-to-br ${accentMap[accent]} rounded-xl flex items-center justify-center text-white`}>
                    <span className="text-lg">{icon}</span>
                  </div>
                )}
                <div>
                  {title && <h2 className="text-lg font-semibold dark:text-gray-100">{title}</h2>}
                  {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
                </div>
              </div>
              {actions && <div className="flex items-center space-x-2">{actions}</div>}
            </div>
          )}
          {children}
        </section>
        {/* 轻微玻璃高光 */}
        <div className="pointer-events-none absolute left-3 top-3 w-24 h-24 rounded-full bg-white/40 dark:bg-white/10 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
      </div>
    )
  }

  return (
    <section className={`${baseSolid} ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={`w-10 h-10 bg-gradient-to-br ${accentMap[accent]} rounded-xl flex items-center justify-center text-white`}>
                <span className="text-lg">{icon}</span>
              </div>
            )}
            <div>
              {title && <h2 className="text-lg font-semibold dark:text-gray-100">{title}</h2>}
              {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}