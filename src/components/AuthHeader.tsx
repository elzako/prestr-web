'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Popover,
  PopoverButton,
  PopoverBackdrop,
  PopoverPanel,
} from '@headlessui/react'
import clsx from 'clsx'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Logo } from '@/components/Logo'
import { NavLink } from '@/components/NavLink'
import { logout } from '@/lib/auth-actions'
import type { AuthHeaderProps } from '@/types'

function MobileNavIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 overflow-visible stroke-slate-700"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(
          'origin-center transition',
          open && 'scale-90 opacity-0',
        )}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(
          'origin-center transition',
          !open && 'scale-90 opacity-0',
        )}
      />
    </svg>
  )
}

function UserMenu({ user, userProfile }: AuthHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  const displayName =
    userProfile?.metadata?.firstName && userProfile?.metadata?.lastName
      ? `${userProfile.metadata.firstName} ${userProfile.metadata.lastName}`
      : user?.user_metadata?.full_name
        ? user.user_metadata.full_name
        : user?.email?.split('@')[0]

  return (
    <Popover className="relative">
      <PopoverButton className="flex items-center text-sm font-medium text-slate-700 hover:text-slate-900 focus:outline-none">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
          {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="ml-2 hidden md:block">{displayName}</span>
        <svg
          className="ml-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </PopoverButton>

      <PopoverBackdrop className="fixed inset-0 z-10" />
      <PopoverPanel className="ring-opacity-5 absolute right-0 z-20 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none">
        <Link
          href="/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Your Profile
        </Link>
        <Link
          href="/settings"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Settings
        </Link>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </PopoverPanel>
    </Popover>
  )
}

function MobileNavigation({ user, userProfile }: AuthHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  return (
    <Popover>
      <PopoverButton
        className="relative z-10 flex h-8 w-8 items-center justify-center focus:not-data-focus:outline-hidden"
        aria-label="Toggle Navigation"
      >
        {({ open }) => <MobileNavIcon open={open} />}
      </PopoverButton>
      <PopoverBackdrop
        transition
        className="fixed inset-0 bg-slate-300/50 duration-150 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in"
      />
      <PopoverPanel
        transition
        className="absolute inset-x-0 top-full mt-4 flex origin-top flex-col rounded-2xl bg-white p-4 text-lg tracking-tight text-slate-900 shadow-xl ring-1 ring-slate-900/5 data-closed:scale-95 data-closed:opacity-0 data-enter:duration-150 data-enter:ease-out data-leave:duration-100 data-leave:ease-in"
      >
        <Link href="/profile" className="block w-full p-2">
          Profile
        </Link>
        <Link href="/settings" className="block w-full p-2">
          Settings
        </Link>
        <hr className="m-2 border-slate-300/40" />
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="block w-full p-2 text-left disabled:opacity-50"
        >
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </button>
      </PopoverPanel>
    </Popover>
  )
}

export function AuthHeader({ user, userProfile }: AuthHeaderProps) {
  return (
    <header className="py-10">
      <Container>
        <nav className="relative z-50 flex justify-between">
          <div className="flex items-center md:gap-x-12">
            <Link href="/" aria-label="Home">
              <Logo className="h-10 w-auto" />
            </Link>
            <div className="hidden md:flex md:gap-x-6">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/presentations">Presentations</NavLink>
              <NavLink href="/organizations">Organizations</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            <div className="hidden md:block">
              <UserMenu user={user} userProfile={userProfile} />
            </div>
            <div className="-mr-1 md:hidden">
              <MobileNavigation user={user} userProfile={userProfile} />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  )
}
