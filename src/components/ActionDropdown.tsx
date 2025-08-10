'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/20/solid'
import { ReactNode } from 'react'

export interface ActionItem {
  id: string
  label: string
  icon: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

interface ActionDropdownProps {
  items: ActionItem[]
  trigger?: 'kebab' | 'button'
  buttonLabel?: string
  className?: string
}

export default function ActionDropdown({
  items,
  trigger = 'kebab',
  buttonLabel = 'Actions',
  className = '',
}: ActionDropdownProps) {
  if (items.length === 0) return null

  const groupedItems = items.reduce((acc, item, index) => {
    const groupIndex = Math.floor(index / 3) // Group every 3 items
    if (!acc[groupIndex]) acc[groupIndex] = []
    acc[groupIndex].push(item)
    return acc
  }, [] as ActionItem[][])

  return (
    <Menu as="div" className={`relative inline-block ${className}`}>
      <MenuButton
        className={`inline-flex items-center ${
          trigger === 'kebab'
            ? 'rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            : 'justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50'
        }`}
      >
        {trigger === 'kebab' ? (
          <>
            <span className="sr-only">Open options</span>
            <EllipsisVerticalIcon className="h-5 w-5" />
          </>
        ) : (
          <>
            {buttonLabel}
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" />
          </>
        )}
      </MenuButton>

      <MenuItems
        transition
        className="ring-opacity-5 absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in"
      >
        {groupedItems.map((group, groupIndex) => (
          <div key={groupIndex} className="py-1">
            {group.map((item) => (
              <MenuItem key={item.id} disabled={item.disabled}>
                <button
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={`group flex w-full items-center px-4 py-2 text-sm ${
                    item.disabled
                      ? 'cursor-not-allowed text-gray-400'
                      : item.variant === 'danger'
                        ? 'text-red-700 data-[focus]:bg-red-100 data-[focus]:text-red-900'
                        : 'text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900'
                  } data-[focus]:outline-none`}
                >
                  <div
                    className={`mr-3 h-5 w-5 ${
                      item.disabled
                        ? 'text-gray-300'
                        : item.variant === 'danger'
                          ? 'text-red-400 group-data-[focus]:text-red-500'
                          : 'text-gray-400 group-data-[focus]:text-gray-500'
                    }`}
                  >
                    {item.icon}
                  </div>
                  {item.label}
                </button>
              </MenuItem>
            ))}
          </div>
        ))}
      </MenuItems>
    </Menu>
  )
}
