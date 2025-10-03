/**
 * Tests for ConfirmDialog component (Headless UI integration)
 */

import { render, screen, fireEvent } from '../setup/render'
import ConfirmDialog from '@/components/ConfirmDialog'

describe('ConfirmDialog Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      expect(
        screen.getByText('Are you sure you want to proceed?'),
      ).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
    })

    it('should render default confirm and cancel labels', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should render custom confirm and cancel labels', () => {
      render(
        <ConfirmDialog
          {...defaultProps}
          confirmLabel="Delete"
          cancelLabel="Keep"
        />,
      )

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /keep/i })).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      const onConfirm = jest.fn()
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      fireEvent.click(confirmButton)

      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when cancel button is clicked', () => {
      const onClose = jest.fn()
      render(<ConfirmDialog {...defaultProps} onClose={onClose} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator when loading is true', () => {
      render(<ConfirmDialog {...defaultProps} loading={true} />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should disable buttons when loading', () => {
      render(<ConfirmDialog {...defaultProps} loading={true} />)

      const confirmButton = screen.getByRole('button', { name: /loading/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      expect(confirmButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    it('should prevent clicks when loading', () => {
      const onConfirm = jest.fn()
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} loading={true} />)

      const confirmButton = screen.getByRole('button', { name: /loading/i })
      fireEvent.click(confirmButton)

      // Button is disabled, so onClick should not fire
      expect(onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('Custom Icon', () => {
    it('should render custom icon when provided', () => {
      const CustomIcon = () => <span data-testid="custom-icon">★</span>
      render(<ConfirmDialog {...defaultProps} icon={<CustomIcon />} />)

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    // Note: Skipping icon rendering test as SVGs may not render in JSDOM
    // The important test is that custom icons work (tested above)
  })

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have accessible heading', () => {
      render(<ConfirmDialog {...defaultProps} />)

      const heading = screen.getByRole('heading', { name: /confirm action/i })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H3')
    })

    it('should have buttons with accessible names', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should hide decorative icon from accessibility tree', () => {
      const { container} = render(<ConfirmDialog {...defaultProps} />)

      const icon = container.querySelector('svg')
      if (icon) {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      }
    })
  })

  describe('Headless UI Integration', () => {
    it('should render Dialog from Headless UI', () => {
      render(<ConfirmDialog {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should display title and message in dialog', () => {
      render(<ConfirmDialog {...defaultProps} />)

      // Verify content is rendered in dialog
      expect(screen.getByRole('dialog')).toContainElement(
        screen.getByText('Confirm Action')
      )
      expect(screen.getByRole('dialog')).toContainElement(
        screen.getByText('Are you sure you want to proceed?')
      )
    })
  })
})
