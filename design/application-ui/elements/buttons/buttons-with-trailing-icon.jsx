/**
 * @description Button components with trailing icons for directional actions and supplementary visual cues.
 * @tags buttons, trailing-icon, directional-actions, visual-cues, ui-elements
 * @source https://tailwindui.com/components/application-ui/elements/buttons
 */
import { CheckCircleIcon } from '@heroicons/react/20/solid'

export default function Example() {
  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-x-1.5 rounded-md bg-sky-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        Button text
        <CheckCircleIcon aria-hidden="true" className="-mr-0.5 size-5" />
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-x-1.5 rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        Button text
        <CheckCircleIcon aria-hidden="true" className="-mr-0.5 size-5" />
      </button>
      <button
        type="button"
        className="inline-flex items-center gap-x-2 rounded-md bg-sky-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        Button text
        <CheckCircleIcon aria-hidden="true" className="-mr-0.5 size-5" />
      </button>
    </>
  )
}
