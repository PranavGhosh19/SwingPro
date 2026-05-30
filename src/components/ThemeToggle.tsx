
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-xl h-10 w-10 bg-white/5 border border-white/10 hover:bg-primary/10 hover:text-primary transition-all relative overflow-hidden group"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 90, scale: theme === "dark" ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="absolute"
      >
        <Moon className="h-5 w-5 text-primary" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: theme === "light" ? 0 : -90, scale: theme === "light" ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="absolute"
      >
        <Sun className="h-5 w-5 text-accent" />
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
