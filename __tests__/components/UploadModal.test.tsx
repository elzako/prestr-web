/**
 * Tests for UploadModal component
 */

import { render, screen, waitFor, act } from '../setup/render'
import userEvent from '@testing-library/user-event'
import UploadModal from '@/components/UploadModal'

// Mock PowerPointUpload component
jest.mock('@/components/PowerPointUpload', () => {
  return function MockPowerPointUpload({
    organizationId,
    folderId,
    onUploadStart,
    onUploadSuccess,
    onUploadError,
  }: any) {
    return (
      <div
        data-testid="powerpoint-upload"
        data-organization-id={organizationId}
        data-folder-id={folderId}
      >
        <button onClick={() => onUploadStart?.()}>Start Upload</button>
        <button onClick={() => onUploadSuccess?.()}>Success</button>
        <button onClick={() => onUploadError?.('Test error')}>Error</button>
      </div>
    )
  }
})

// Mock Headless UI components
jest.mock('@headlessui/react', () => {
  const React = require('react')

  const Dialog = ({ children, onClose, ...rest }: any) => {
    const { open, ...restProps } = rest
    if (!open) {
      return null
    }

    return (
      <div
        role="dialog"
        aria-modal="true"
        data-testid="dialog"
        {...restProps}
        onClick={(event: any) => {
          if (event.target === event.currentTarget) {
            onClose?.()
          }
        }}
      >
        {children}
      </div>
    )
  }

  const DialogBackdrop = ({ children, transition: _transition, ...restProps }: any) => (
    <div data-testid="dialog-backdrop" {...restProps}>
      {children}
    </div>
  )

  const DialogPanel = ({ children, transition: _transition, ...restProps }: any) => (
    <div data-testid="dialog-panel" {...restProps}>
      {children}
    </div>
  )

  const DialogTitle = ({ children, as = 'h2', ...restProps }: any) =>
    React.createElement(as, restProps, children)

  const TransitionComponent = ({ children }: any) => <>{children}</>
  TransitionComponent.Root = TransitionComponent
  TransitionComponent.Child = ({ children }: any) => <>{children}</>

  return {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    Transition: TransitionComponent,
  }
})
describe('UploadModal Component', () => {
  let consoleErrorSpy: jest.SpyInstance
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    organizationId: 'org-123',
    folderId: 'folder-123',
  }

  const advanceTimers = (ms: number = 0) => {
    act(() => {
      jest.advanceTimersByTime(ms)
    })
  }

  const runAllTimers = () => {
    act(() => {
      jest.runAllTimers()
    })
  }

  const createUser = () =>
    userEvent.setup({
      delay: null,
      advanceTimers,
    })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    consoleErrorSpy.mockRestore()
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<UploadModal {...defaultProps} />)

      expect(screen.getByText('Upload PowerPoint')).toBeInTheDocument()
      expect(
        screen.getByText(/upload a .pptx file to this folder/i),
      ).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<UploadModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Upload PowerPoint')).not.toBeInTheDocument()
    })

    it('should render PowerPointUpload component', () => {
      render(<UploadModal {...defaultProps} />)

      expect(screen.getByTestId('powerpoint-upload')).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<UploadModal {...defaultProps} />)

      const closeButtons = screen.getAllByText('Close')
      expect(closeButtons.length).toBeGreaterThan(0)
    })

    it('should render cancel button', () => {
      render(<UploadModal {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument()
    })
  })

  describe('Modal Interactions', () => {
    it('should call onClose when cancel button is clicked', async () => {
      const user = createUser()
      render(<UploadModal {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should call onClose when X button is clicked', async () => {
      const user = createUser()
      render(<UploadModal {...defaultProps} />)

      const closeButtons = screen.getAllByText('Close')
      await user.click(closeButtons[0])

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should prevent closing during upload', async () => {
      const user = createUser()
      render(<UploadModal {...defaultProps} />)

      // Start upload
      const startButton = screen.getByText('Start Upload')
      await user.click(startButton)

      // Try to close - should be prevented
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeDisabled()

      // X button should be hidden
      expect(screen.queryByText('Close')).not.toBeInTheDocument()
    })
  })

  describe('Upload State Management', () => {
    it('should disable cancel button during upload', async () => {
      const user = createUser()
      render(<UploadModal {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).not.toBeDisabled()

      // Start upload
      const startButton = screen.getByText('Start Upload')
      await user.click(startButton)

      expect(cancelButton).toBeDisabled()
    })

    it('should hide close (X) button during upload', async () => {
      const user = createUser()
      render(<UploadModal {...defaultProps} />)

      expect(screen.getByText('Close')).toBeInTheDocument()

      // Start upload
      const startButton = screen.getByText('Start Upload')
      await user.click(startButton)

      expect(screen.queryByText('Close')).not.toBeInTheDocument()
    })

    it('should enable cancel button after upload error', async () => {
      const user = createUser()
      render(<UploadModal {...defaultProps} />)

      // Start upload
      await user.click(screen.getByText('Start Upload'))
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()

      // Trigger error
      await user.click(screen.getByText('Error'))

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).not.toBeDisabled()
    })
  })

  describe('Upload Success Flow', () => {
    it('should call onUploadSuccess callback', async () => {
      const onUploadSuccess = jest.fn()
      const user = createUser()

      render(
        <UploadModal {...defaultProps} onUploadSuccess={onUploadSuccess} />,
      )

      // Trigger success
      const successButton = screen.getByText('Success')
      await user.click(successButton)

      expect(onUploadSuccess).toHaveBeenCalled()
    })

    it('should close modal after successful upload with delay', async () => {
      const user = createUser()
      render(<UploadModal {...defaultProps} />)

      // Trigger success
      const successButton = screen.getByText('Success')
      await user.click(successButton)

      // Modal should not close immediately
      expect(defaultProps.onClose).not.toHaveBeenCalled()

      advanceTimers(2000)

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it('should not close immediately on success', async () => {
      const user = createUser()
      render(<UploadModal {...defaultProps} />)

      await user.click(screen.getByText('Success'))

      // Should not close immediately
      expect(defaultProps.onClose).not.toHaveBeenCalled()

      // Advance by 1 second - still not closed
      advanceTimers(1000)
      expect(defaultProps.onClose).not.toHaveBeenCalled()

      advanceTimers(1000)

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })
  })

  describe('Upload Error Handling', () => {
    it('should log error to console', async () => {
      const user = createUser()

      render(<UploadModal {...defaultProps} />)

      await user.click(screen.getByText('Error'))

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Upload error:',
        'Test error',
      )
    })

    it('should not close modal on error', async () => {
      const user = createUser()
      render(<UploadModal {...defaultProps} />)

      await user.click(screen.getByText('Error'))

      // Fast-forward all timers
      runAllTimers()

      // Modal should not close on error
      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    it('should re-enable controls after error', async () => {
      const user = createUser()
      render(<UploadModal {...defaultProps} />)

      // Start upload
      await user.click(screen.getByText('Start Upload'))
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()

      // Trigger error
      await user.click(screen.getByText('Error'))

      // Controls should be enabled again
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).not.toBeDisabled()
    })
  })

  describe('Props Passing', () => {
    it('should pass organizationId to PowerPointUpload', () => {
      render(<UploadModal {...defaultProps} />)

      const uploadComponent = screen.getByTestId('powerpoint-upload')
      expect(uploadComponent).toBeInTheDocument()
      expect(uploadComponent).toHaveAttribute(
        'data-organization-id',
        'org-123',
      )
    })

    it('should pass folderId to PowerPointUpload', () => {
      render(<UploadModal {...defaultProps} />)

      const uploadComponent = screen.getByTestId('powerpoint-upload')
      expect(uploadComponent).toBeInTheDocument()
      expect(uploadComponent).toHaveAttribute('data-folder-id', 'folder-123')
    })
  })

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(<UploadModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have dialog title', () => {
      render(<UploadModal {...defaultProps} />)

      expect(
        screen.getByRole('heading', { name: /upload powerpoint/i }),
      ).toBeInTheDocument()
    })

    it('should have screen reader text for close button', () => {
      render(<UploadModal {...defaultProps} />)

      const srText = screen.getByText('Close')
      expect(srText).toHaveClass('sr-only')
    })

    it('should have accessible cancel button', () => {
      render(<UploadModal {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeInTheDocument()
    })
  })

  describe('UI States', () => {
    it('should show upload icon', () => {
      const { container } = render(<UploadModal {...defaultProps} />)

      // The upload icon is rendered in the dialog header
      expect(screen.getByText('Upload PowerPoint')).toBeInTheDocument()
      // Check for SVG with aria-hidden attribute (HeroIcons always have this)
      const icon = container.querySelector('svg[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('should display folder context in description', () => {
      render(<UploadModal {...defaultProps} />)

      expect(
        screen.getByText(/upload a .pptx file to this folder/i),
      ).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    it('should handle rapid open/close', async () => {
      const user = createUser()
      const { rerender } = render(<UploadModal {...defaultProps} />)

      // Close
      rerender(<UploadModal {...defaultProps} isOpen={false} />)

      // Re-open
      rerender(<UploadModal {...defaultProps} isOpen={true} />)

      expect(screen.getByText('Upload PowerPoint')).toBeInTheDocument()
    })

    it('should clear upload state when reopened', async () => {
      const user = createUser()
      const { rerender } = render(<UploadModal {...defaultProps} />)

      // Start upload
      await user.click(screen.getByText('Start Upload'))

      // Close modal
      rerender(<UploadModal {...defaultProps} isOpen={false} />)

      // Re-open modal
      rerender(<UploadModal {...defaultProps} isOpen={true} />)

      // Cancel button should not be disabled
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).not.toBeDisabled()
    })
  })
})












































