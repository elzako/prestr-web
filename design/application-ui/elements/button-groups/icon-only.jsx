/**
 * @description A icon only button group component for related action clustering.
 * @tags elements, button groups, icon, only, tailwind-ui, component
 * @source https://tailwindui.com/components/application-ui/elements/button-groups
 */
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <span className="isolate inline-flex rounded-md shadow-xs">
      <button
        type="button"
        className="relative inline-flex items-center rounded-l-md bg-white px-2 py-2 text-gray-400 inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 focus:z-10"
      >
        <span className="sr-only">Previous</span>
        <ChevronLeftIcon aria-hidden="true" className="size-5" />
      </button>
      <button
        type="button"
        className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400 inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 focus:z-10"
      >
        <span className="sr-only">Next</span>
        <ChevronRightIcon aria-hidden="true" className="size-5" />
      </button>
    </span>
  )
}