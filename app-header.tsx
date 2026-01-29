'use client'

import Link from 'next/link'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppHeaderProps {
  profile: {
    display_name: string
    role: string
    organizations: {
      name: string
    } | null
  }
}

export function AppHeader({ profile }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="font-semibold text-lg">
          領収書読み取り
        </div>
        <Link href="/account">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
