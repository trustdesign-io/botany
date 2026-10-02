'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MenuIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './logo'

export interface NavLink {
  label: string
  href: string
}

interface HeaderProps {
  /** Site/brand name forwarded to the Logo. */
  siteName?: string
  /** Navigation links shown in the header. */
  navLinks?: NavLink[]
}

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: 'About', href: '/about' },
]

export function Header({
  siteName,
  navLinks = DEFAULT_NAV_LINKS,
}: HeaderProps) {
  const pathname = usePathname()

  // Store the pathname at which the menu was opened.
  // Deriving isOpen from this means navigation auto-closes the menu without setState-in-effect.
  const [openedAtPathname, setOpenedAtPathname] = useState<string | null>(null)
  const mobileOpen = openedAtPathname === pathname

  const closeMobile = useCallback(() => setOpenedAtPathname(null), [])

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMobile() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen, closeMobile])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Logo name={siteName} />

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={cn(
                'text-sm transition-colors duration-200 hover:text-foreground',
                pathname === link.href
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setOpenedAtPathname((v) => v === null ? pathname : null)}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 cursor-pointer"
        >
          {mobileOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {/* Mobile nav panel — aria-hidden when closed so AT skips contents */}
      <div
        id="mobile-nav"
        aria-hidden={!mobileOpen}
        className={cn(
          'md:hidden border-t border-border bg-background overflow-hidden transition-all duration-200',
          mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
        )}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col px-4 py-4 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              tabIndex={mobileOpen ? undefined : -1}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={cn(
                'flex items-center h-10 rounded-md px-3 text-sm transition-colors duration-200',
                pathname === link.href
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
