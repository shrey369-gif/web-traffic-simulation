'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Zap, Map, Home } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scenario', label: 'Scenarios', icon: Map },
  { href: '/insights', label: 'Insights', icon: Zap },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-void/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="px-6 py-3 flex items-center justify-between max-w-screen-2xl mx-auto">
        <Link href="/" className="font-mono text-xs tracking-widest text-stark-muted uppercase hover:text-stark transition-colors">
          TrafficSim
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                    isActive
                      ? 'text-acid'
                      : 'text-stark-dim hover:text-stark'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-acid"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
