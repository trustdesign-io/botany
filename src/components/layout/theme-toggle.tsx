'use client'

import { MoonIcon, SunIcon } from 'lucide-react'

/** Switches between the paper and dark themes and remembers the choice. */
export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle('dark')
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light')
    } catch {
      // Storage can be unavailable (private windows); the switch still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-secondary"
    >
      <SunIcon size={18} className="hidden dark:block" aria-hidden="true" />
      <MoonIcon size={18} className="dark:hidden" aria-hidden="true" />
    </button>
  )
}
