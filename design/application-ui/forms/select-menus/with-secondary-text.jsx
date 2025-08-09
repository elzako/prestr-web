/**
 * @description A with secondary text select menu component for dropdown option selection.
 * @tags forms, select menus, with, secondary, text, tailwind-ui, component
 * @source https://tailwindui.com/components/application-ui/forms/select-menus
 */
'use client'

import { useState } from 'react'
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'

const people = [
  { id: 1, name: 'Wade Cooper', username: '@wadecooper' },
  { id: 2, name: 'Arlene Mccoy', username: '@arlenemccoy' },
  { id: 3, name: 'Devon Webb', username: '@devonwebb' },
  { id: 4, name: 'Tom Cook', username: '@tomcook' },
  { id: 5, name: 'Tanya Fox', username: '@tanyafox' },
  { id: 6, name: 'Hellen Schmidt', username: '@hellenschmidt' },
  { id: 7, name: 'Caroline Schultz', username: '@carolineschultz' },
  { id: 8, name: 'Mason Heaney', username: '@masonheaney' },
  { id: 9, name: 'Claudie Smitham', username: '@claudiesmitham' },
  { id: 10, name: 'Emil Schaefer', username: '@emilschaefer' },
]

export default function Example() {
  const [selected, setSelected] = useState(people[3])

  return (
    <Listbox value={selected} onChange={setSelected}>
      <Label className="block text-sm/6 font-medium text-gray-900">
        Assigned to
      </Label>
      <div className="relative mt-2">
        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-600 sm:text-sm/6">
          <span className="col-start-1 row-start-1 flex w-full gap-2 pr-6">
            <span className="truncate">{selected.name}</span>
            <span className="truncate text-gray-500">{selected.username}</span>
          </span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
          />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {people.map((person) => (
            <ListboxOption
              key={person.username}
              value={person}
              className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-sky-600 data-focus:text-white data-focus:outline-hidden"
            >
              <div className="flex">
                <span className="truncate font-normal group-data-selected:font-semibold">
                  {person.name}
                </span>
                <span className="ml-2 truncate text-gray-500 group-data-focus:text-sky-200">
                  {person.username}
                </span>
              </div>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sky-600 group-not-data-selected:hidden group-data-focus:text-white">
                <CheckIcon aria-hidden="true" className="size-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
