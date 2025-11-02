import { ReactNode } from 'react'

type Accent = 'brand' | 'blue' | 'green' | 'red' | 'orange' | 'purple'
const accentMap: Record<Accent, string> = {
  brand: 'from-brand-500 to-brand-600',
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600',
  orange: 'from-orange-500 to-orange-600',
  purple: 'from-purple-500 to-purple-600',
}

export interface PageHeaderProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  accent?: Accent
}

export default function PageHeader({ icon, title, subtitle, accent = 'brand' }: PageHeaderProps){
  return (
    <div className="flex items-center space-x-2 md:space-x-3">
      {icon && (
        <div className={`w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br ${accentMap[accent]} rounded-xl flex items-center justify-center`}>
          <span className="text-white text-base md:text-lg">{icon}</span>
        </div>
      )}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        {subtitle && <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}