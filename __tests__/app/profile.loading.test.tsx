import { render, screen } from '../setup/render'
import Loading from '../../src/app/profile/loading'

jest.mock('@/components/HeaderWrapper', () => {
  const React = require('react')
  return {
    HeaderWrapper: () =>
      React.createElement('div', { 'data-testid': 'header-wrapper' }),
  }
})

jest.mock('@/components/Container', () => {
  const React = require('react')
  return {
    Container: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'container' }, children),
  }
})

describe('Profile loading state', () => {
  it('renders skeleton placeholders while profile data loads', () => {
    const { container } = render(<Loading />)

    const skeletonSection = container.querySelector('.animate-pulse')
    expect(skeletonSection).not.toBeNull()

    const placeholderBlocks = container.querySelectorAll('.bg-gray-200, .bg-gray-300')
    expect(placeholderBlocks.length).toBeGreaterThan(0)

    expect(screen.getByTestId('header-wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('container')).toBeInTheDocument()
  })
})
