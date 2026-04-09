'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, HelpCircle, History, Settings, Sliders } from 'lucide-react'

const topLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Help', href: '/help', icon: HelpCircle },
  { name: 'History', href: '/history', icon: History },
  { name: 'Control', href: '/control', icon: Sliders },
]

const bottomLink = { name: 'Settings', href: '/settings', icon: Settings }

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-zinc-900 text-white p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-8">SmartHome</h2>

      {/* Top links */}
      <nav className="flex flex-col gap-3">
        {topLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                pathname === link.href
                  ? 'bg-zinc-700'
                  : 'hover:bg-zinc-800'
              }`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom (Settings) */}
      <div className="mt-auto pt-4 border-t border-zinc-700">
        <Link
          href={bottomLink.href}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            pathname === bottomLink.href
              ? 'bg-zinc-700'
              : 'hover:bg-zinc-800'
          }`}
        >
          <bottomLink.icon size={18} />
          {bottomLink.name}
        </Link>
      </div>
    </aside>
  )
}