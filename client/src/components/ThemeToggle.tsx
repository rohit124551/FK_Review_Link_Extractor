"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-300 hover:scale-105 active:scale-95 group"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/0 to-violet-500/0 group-hover:from-indigo-500/10 group-hover:to-violet-500/10 transition-all duration-300" />
      <Sun className="h-[18px] w-[18px] hidden dark:block transition-transform duration-300" />
      <Moon className="h-[18px] w-[18px] block dark:hidden transition-transform duration-300" />
    </button>
  )
}
