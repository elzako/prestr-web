import { act, render, screen } from '../setup/render'

import { PrimaryFeatures } from '@/components/PrimaryFeatures'

// Simplify next/image for the test environment
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, unoptimized, ...props }: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} data-priority={priority} data-unoptimized={unoptimized} />
  },
}))

describe('PrimaryFeatures responsive behaviour', () => {
  const originalMatchMedia = window.matchMedia

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    jest.clearAllMocks()
  })

  it('renders tabs vertically on large screens', () => {
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: true,
      media: '(min-width: 1024px)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })) as any

    render(<PrimaryFeatures />)

    expect(screen.getByRole('tablist')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    )
  })

  it('switches orientation when the viewport breakpoint changes', () => {
    let listener: ((event: { matches: boolean }) => void) | undefined

    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: false,
      media: '(min-width: 1024px)',
      addEventListener: jest.fn((_event, handler) => {
        listener = handler
      }),
      removeEventListener: jest.fn(),
    })) as any

    render(<PrimaryFeatures />)

    const tablist = screen.getByRole('tablist')
    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal')

    act(() => {
      listener?.({ matches: true })
    })

    expect(tablist).toHaveAttribute('aria-orientation', 'vertical')
  })
})
