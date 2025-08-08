import { CheckCircleIcon } from '@heroicons/react/20/solid'

const mailingLists = [
  { id: 'newsletter', title: 'Newsletter', description: 'Last message sent an hour ago', users: '621 users' },
  {
    id: 'existing-customers',
    title: 'Existing customers',
    description: 'Last message sent 2 weeks ago',
    users: '1200 users',
  },
  { id: 'trial-users', title: 'Trial users', description: 'Last message sent 4 days ago', users: '2740 users' },
]

export default function Example() {
  return (
    <fieldset>
      <legend className="text-sm/6 font-semibold text-gray-900">Select a mailing list</legend>
      <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
        {mailingLists.map((mailingList) => (
          <label
            key={mailingList.id}
            aria-label={mailingList.title}
            aria-description={`${mailingList.description} to ${mailingList.users}`}
            className="group relative flex rounded-lg border border-gray-300 bg-white p-4 has-checked:outline-2 has-checked:-outline-offset-2 has-checked:outline-indigo-600 has-focus-visible:outline-3 has-focus-visible:-outline-offset-1 has-disabled:border-gray-400 has-disabled:bg-gray-200 has-disabled:opacity-25"
          >
            <input
              defaultValue={mailingList.id}
              defaultChecked={mailingList === mailingLists[0]}
              name="mailing-list"
              type="radio"
              className="absolute inset-0 appearance-none focus:outline-none"
            />
            <div className="flex-1">
              <span className="block text-sm font-medium text-gray-900">{mailingList.title}</span>
              <span className="mt-1 block text-sm text-gray-500">{mailingList.description}</span>
              <span className="mt-6 block text-sm font-medium text-gray-900">{mailingList.users}</span>
            </div>
            <CheckCircleIcon
              aria-hidden="true"
              className="invisible size-5 text-indigo-600 group-has-checked:visible"
            />
          </label>
        ))}
      </div>
    </fieldset>
  )
}