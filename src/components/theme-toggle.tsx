'use client'

import { useTheme } from './theme-provider'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">Theme</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setTheme('light')}
          className={`rounded-lg p-2 hover:bg-muted/50 ${
            theme === 'light' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
          }`}
          title="Light theme"
        >
          <SunIcon className="h-5 w-5" />
          <span className="sr-only">Light theme</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`rounded-lg p-2 hover:bg-muted/50 ${
            theme === 'dark' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
          }`}
          title="Dark theme"
        >
          <MoonIcon className="h-5 w-5" />
          <span className="sr-only">Dark theme</span>
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`rounded-lg p-2 hover:bg-muted/50 ${
            theme === 'system' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
          }`}
          title="System theme"
        >
          <ComputerDesktopIcon className="h-5 w-5" />
          <span className="sr-only">System theme</span>
        </button>
      </div>
    </div>
  )
} 