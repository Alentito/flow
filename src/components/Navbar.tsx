"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    const shouldBeDark = stored ? stored === 'dark' : Boolean(prefersDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDark);
    window.localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background-light dark:bg-background-dark backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-tight text-primary">Flow</span>
            </Link>
            <div className="hidden md:flex space-x-6 text-sm font-medium text-text-muted-light dark:text-text-muted-dark">
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <Link href="/member/rooms" className="hover:text-primary transition-colors">Brainstorm</Link>
              <Link href="/projects" className="hover:text-primary transition-colors">Projects</Link>
              <Link href="/showcase" className="hover:text-primary transition-colors">Showcase</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              aria-label="Toggle theme"
              className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark text-text-muted-light dark:text-text-muted-dark transition-colors"
              onClick={toggleTheme}
              disabled={!mounted}
            >
              <span className="material-icons-outlined text-xl">brightness_medium</span>
            </button>
            <Link href="/login" className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-hover transition-colors">Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
