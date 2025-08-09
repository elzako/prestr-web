/**
 * @description Circular button components with plus icons in different sizes for floating action buttons and compact interfaces.
 * @tags buttons, circular, floating-action-button, plus-icon, compact, ui-elements
 * @source https://tailwindui.com/components/application-ui/elements/buttons
 */
import { PlusIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <>
      <button
        type="button"
        className="rounded-full bg-sky-600 p-1 text-white shadow-xs hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <PlusIcon aria-hidden="true" className="size-5" />
      </button>
      <button
        type="button"
        className="rounded-full bg-sky-600 p-1.5 text-white shadow-xs hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <PlusIcon aria-hidden="true" className="size-5" />
      </button>
      <button
        type="button"
        className="rounded-full bg-sky-600 p-2 text-white shadow-xs hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <PlusIcon aria-hidden="true" className="size-5" />
      </button>
    </>
  )
}
