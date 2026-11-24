import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { IntroSplash } from '@/components/layout/intro-splash'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <IntroSplash />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
