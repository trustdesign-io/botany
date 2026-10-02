import type { ReactNode } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10 print:max-w-none print:p-0">
        {children}
      </main>
      <Footer />
    </div>
  )
}
