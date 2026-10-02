'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'
import avatar from '../../../public/avatar.jpg'

export interface NavLink {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Records', href: '/' },
  { label: 'About', href: '/about/' },
]

function isCurrent(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname.startsWith('/records')
  return pathname.startsWith(href.replace(/\/$/, ''))
}

export function Header() {
  const pathname = usePathname()

  return (
    <header className="no-print border-b border-rule">
      <div className="mx-auto flex max-w-4xl flex-col gap-1 px-4 pt-4 pb-2 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src={avatar}
            alt=""
            width={44}
            height={44}
            priority
            className="size-11 shrink-0 rounded-full border border-border object-cover"
          />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg group-hover:text-stamp">
              Botanical and Horticultural Records
            </span>
            <span className="label">D.C. Chambers</span>
          </span>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <nav aria-label="Main navigation" className="-ml-2 flex items-center sm:ml-0">
            {NAV_LINKS.map((link) => {
              const current = isCurrent(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={current ? 'page' : undefined}
                  className={cn(
                    'label flex h-9 items-center px-2 transition-colors hover:text-stamp active:text-foreground',
                    current && 'text-foreground underline decoration-stamp decoration-2 underline-offset-4',
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
