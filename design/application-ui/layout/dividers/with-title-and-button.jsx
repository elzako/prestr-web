/**
 * @description A with title and button divider component for content separation and visual organization.
 * @tags layout, dividers, with, title, and, button, tailwind-ui, component
 * @source https://tailwindui.com/components/application-ui/layout/dividers
 */
import { PlusIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <div className="relative flex items-center justify-between">
      <span className="bg-white pr-3 text-base font-semibold text-gray-900">Projects</span>
      <div className="flex w-full items-center">
        <div aria-hidden="true" className="w-full border-t border-gray-300" />
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
        >
          <PlusIcon aria-hidden="true" className="-mr-0.5 -ml-1 size-5 text-gray-400" />
          <span>Button text</span>
        </button>
      </div>
    </div>
  )
}