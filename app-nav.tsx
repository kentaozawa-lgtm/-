'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, List, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppNavProps {
  profile: {
    role: string
  }
}

export function AppNav({ profile }: AppNavProps) {
  const pathname = usePathname()
  const isAdmin = profile.role === 'admin'

  const navItems = [
    {
      href: '/scan',
      label: '撮影',
      icon: Camera,
    },
    {
      href: '/receipts',
      label: '一覧',
      icon: List,
    },
    ...(isAdmin
      ? [
          {
            href: '/admin/masters',
            label: '管理',
            icon: Settings,
          },
        ]
      : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
