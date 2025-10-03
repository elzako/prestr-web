/**
 * Tests for Button component
 */

import { render, screen } from '../setup/render'
import { Button } from '@/components/Button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render as a button by default', () => {
      render(<Button>Click me</Button>)

      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('should render as a link when href is provided', () => {
      render(<Button href="/test">Go to page</Button>)

      const link = screen.getByRole('link', { name: /go to page/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('should render children correctly', () => {
      render(<Button>Test Content</Button>)

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should apply solid variant by default', () => {
      render(<Button>Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('inline-flex')
      expect(button.className).toContain('rounded-full')
    })

    it('should apply outline variant when specified', () => {
      render(<Button variant="outline">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('ring-1')
    })
  })

  describe('Colors', () => {
    it('should apply slate color by default', () => {
      render(<Button>Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-slate-900')
    })

    it('should apply blue color when specified', () => {
      render(<Button color="blue">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-blue-600')
    })

    it('should apply white color when specified', () => {
      render(<Button color="white">Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-white')
    })
  })

  describe('Custom className', () => {
    it('should merge custom className with base styles', () => {
      render(<Button className="custom-class">Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button.className).toContain('inline-flex') // Base class
    })
  })

  describe('Button props', () => {
    it('should handle onClick events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByRole('button')
      button.click()

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Button</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should have correct type attribute', () => {
      render(<Button type="submit">Submit</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })
  })

  describe('Accessibility', () => {
    it('should have accessible focus styles', () => {
      render(<Button>Button</Button>)

      const button = screen.getByRole('button')
      expect(button.className).toContain('focus-visible:outline')
    })

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>)

      const button = screen.getByRole('button', { name: /close dialog/i })
      expect(button).toBeInTheDocument()
    })

    it('should be keyboard accessible', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Button</Button>)

      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('Link variant', () => {
    it('should render Next.js Link with href', () => {
      render(<Button href="/dashboard">Go to Dashboard</Button>)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/dashboard')
    })

    it('should apply same styling to links', () => {
      render(<Button href="/test">Link</Button>)

      const link = screen.getByRole('link')
      expect(link.className).toContain('inline-flex')
      expect(link.className).toContain('rounded-full')
    })
  })
})
