import React, { useState } from "react"
import { Link } from "react-router-dom"
import { createPageUrl } from "./Components/utils"
import { Button } from "./Components/ui/button"
import {
  Home,
  Trophy,
  BookOpen,
  Target,
  User,
  Menu,
  X,
  Sparkles,
  BarChart3,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Layout({ children, currentPageName = "Home" }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Home", icon: Home, path: "Home" },
    { name: "Dashboard", icon: BarChart3, path: "Dashboard" },
    { name: "Learning Paths", icon: BookOpen, path: "LearningPaths" },
    { name: "Challenges", icon: Target, path: "Challenges" },
    { name: "Leaderboard", icon: Trophy, path: "Leaderboard" },
    { name: "Profile", icon: User, path: "Profile" },
  ]

  const isHomePage = currentPageName === "Home"

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav
        className={`sticky top-0 z-50 ${
          isHomePage
            ? "bg-slate-900 border-b border-slate-800"
            : "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              SkillUp Nexus
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-2">
            {navigation.map((item) => (
              <Link key={item.name} to={createPageUrl(item.path)}>
                <Button variant="ghost">
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="md:hidden bg-slate-900"
            >
              <div className="p-4 space-y-2">
                {navigation.map((item) => (
                  <Link key={item.name} to={createPageUrl(item.path)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="p-6">{children}</main>
    </div>
  )
}
