/**
 * Tests for ActionDropdown component
 */

import { render, screen, waitFor } from '../setup/render'
import userEvent from '@testing-library/user-event'
import ActionDropdown from '@/components/ActionDropdown'
import type { ActionItem } from '@/components/ActionDropdown'
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'

describe('ActionDropdown Component', () => {
  const mockActionItems: ActionItem[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: <PencilIcon />,
      onClick: jest.fn(),
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <DocumentDuplicateIcon />,
      onClick: jest.fn(),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <TrashIcon />,
      onClick: jest.fn(),
      variant: 'danger',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render kebab menu by default', () => {
      render(<ActionDropdown items={mockActionItems} />)

      expect(screen.getByText('Open options')).toBeInTheDocument()
    })

    it('should render button trigger when specified', () => {
      render(<ActionDropdown items={mockActionItems} trigger="button" />)

      expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument()
    })

    it('should render custom button label', () => {
      render(
        <ActionDropdown
          items={mockActionItems}
          trigger="button"
          buttonLabel="More Options"
        />,
      )

      expect(
        screen.getByRole('button', { name: /more options/i }),
      ).toBeInTheDocument()
    })

    it('should not render when items array is empty', () => {
      const { container } = render(<ActionDropdown items={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <ActionDropdown items={mockActionItems} className="custom-class" />,
      )

      const menu = container.querySelector('.custom-class')
      expect(menu).toBeInTheDocument()
    })
  })

  describe('Menu Interactions', () => {
    it('should open menu when clicking trigger button', async () => {
      const user = userEvent.setup()
      render(<ActionDropdown items={mockActionItems} />)

      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)

      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Duplicate')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should close menu when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <ActionDropdown items={mockActionItems} />
          <button>Outside button</button>
        </div>,
      )

      const triggerButton = screen.getAllByRole('button')[0]
      await user.click(triggerButton)

      expect(screen.getByText('Edit')).toBeInTheDocument()

      const outsideButton = screen.getByText('Outside button')
      await user.click(outsideButton)

      // Menu items should be removed from DOM - wait for HeadlessUI transition
      await waitFor(() => {
        expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      })
    })

    it('should close menu after clicking an action', async () => {
      const user = userEvent.setup()
      render(<ActionDropdown items={mockActionItems} />)

      const triggerButton = screen.getByRole('button')
      await user.click(triggerButton)

      const editButton = screen.getByText('Edit')
      await user.click(editButton)

      // Menu should close - wait for HeadlessUI transition
      await waitFor(() => {
        expect(screen.queryByText('Duplicate')).not.toBeInTheDocument()
      })
    })
  })

  describe('Action Items', () => {
    it('should display all action items', async () => {
      const user = userEvent.setup()
      render(<ActionDropdown items={mockActionItems} />)

      await user.click(screen.getByRole('button'))

      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Duplicate')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should call onClick when action item is clicked', async () => {
      const user = userEvent.setup()
      render(<ActionDropdown items={mockActionItems} />)

      await user.click(screen.getByRole('button'))

      const editButton = screen.getByText('Edit')
      await user.click(editButton)

      expect(mockActionItems[0].onClick).toHaveBeenCalledTimes(1)
    })

    it('should render icons for action items', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ActionDropdown items={mockActionItems} />,
      )

      await user.click(screen.getByRole('button'))

      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should handle disabled action items', async () => {
      const user = userEvent.setup()
      const itemsWithDisabled: ActionItem[] = [
        ...mockActionItems,
        {
          id: 'disabled',
          label: 'Disabled Action',
          icon: <PencilIcon />,
          onClick: jest.fn(),
          disabled: true,
        },
      ]

      render(<ActionDropdown items={itemsWithDisabled} />)

      await user.click(screen.getByRole('button'))

      const disabledButton = screen.getByText('Disabled Action')
      expect(disabledButton).toHaveClass('cursor-not-allowed')
      expect(disabledButton).toHaveClass('text-gray-400')
    })

    it('should not call onClick for disabled items', async () => {
      const user = userEvent.setup()
      const disabledAction = jest.fn()
      const itemsWithDisabled: ActionItem[] = [
        {
          id: 'disabled',
          label: 'Disabled',
          icon: <PencilIcon />,
          onClick: disabledAction,
          disabled: true,
        },
      ]

      render(<ActionDropdown items={itemsWithDisabled} />)

      await user.click(screen.getByRole('button'))

      const disabledButton = screen.getByText('Disabled')
      await user.click(disabledButton)

      expect(disabledAction).not.toHaveBeenCalled()
    })
  })

  describe('Danger Variant', () => {
    it('should apply danger styling to danger variant items', async () => {
      const user = userEvent.setup()
      render(<ActionDropdown items={mockActionItems} />)

      await user.click(screen.getByRole('button'))

      const deleteButton = screen.getByText('Delete')
      expect(deleteButton).toHaveClass('text-red-700')
    })

    it('should apply normal styling to non-danger items', async () => {
      const user = userEvent.setup()
      render(<ActionDropdown items={mockActionItems} />)

      await user.click(screen.getByRole('button'))

      const editButton = screen.getByText('Edit')
      expect(editButton).toHaveClass('text-gray-700')
    })
  })

  describe('Item Grouping', () => {
    it('should group items every 3 items', async () => {
      const user = userEvent.setup()
      const manyItems: ActionItem[] = Array.from({ length: 7 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i + 1}`,
        icon: <PencilIcon />,
        onClick: jest.fn(),
      }))

      const { container } = render(<ActionDropdown items={manyItems} />)

      await user.click(screen.getByRole('button'))

      // Should have 3 groups (3, 3, 1 items)
      const groups = container.querySelectorAll('.py-1')
      expect(groups.length).toBe(3)
    })

    it('should render dividers between groups', async () => {
      const user = userEvent.setup()
      const manyItems: ActionItem[] = Array.from({ length: 4 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i + 1}`,
        icon: <PencilIcon />,
        onClick: jest.fn(),
      }))

      const { container } = render(<ActionDropdown items={manyItems} />)

      await user.click(screen.getByRole('button'))

      const menuItems = container.querySelector('.divide-y')
      expect(menuItems).toBeInTheDocument()
    })
  })

  describe('Trigger Variants', () => {
    it('should render kebab icon for kebab trigger', () => {
      render(<ActionDropdown items={mockActionItems} trigger="kebab" />)

      const triggerButton = screen.getByRole('button')
      expect(triggerButton).toHaveClass('rounded-full')
      expect(screen.getByText('Open options')).toBeInTheDocument()
    })

    it('should render button with label and chevron for button trigger', () => {
      const { container } = render(
        <ActionDropdown items={mockActionItems} trigger="button" />,
      )

      const triggerButton = screen.getByRole('button', { name: /actions/i })
      expect(triggerButton).toHaveClass('rounded-md')

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should have different styling for kebab vs button trigger', () => {
      const { rerender } = render(
        <ActionDropdown items={mockActionItems} trigger="kebab" />,
      )

      const kebabButton = screen.getByRole('button')
      expect(kebabButton).toHaveClass('rounded-full')

      rerender(<ActionDropdown items={mockActionItems} trigger="button" />)

      const buttonTrigger = screen.getByRole('button')
      expect(buttonTrigger).toHaveClass('rounded-md')
      expect(buttonTrigger).toHaveClass('shadow-sm')
    })
  })

  describe('Accessibility', () => {
    it('should have screen reader text for kebab menu', () => {
      render(<ActionDropdown items={mockActionItems} trigger="kebab" />)

      const srText = screen.getByText('Open options')
      expect(srText).toHaveClass('sr-only')
    })

    it('should have accessible button role', () => {
      render(<ActionDropdown items={mockActionItems} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should have menu items with menuitem role', async () => {
      const user = userEvent.setup()
      render(<ActionDropdown items={mockActionItems} />)

      await user.click(screen.getByRole('button'))

      // Wait for menu to open
      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem')
        expect(menuItems.length).toBeGreaterThan(0)
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ActionDropdown items={mockActionItems} />)

      const triggerButton = screen.getByRole('button')

      // Focus and open with Enter
      triggerButton.focus()
      await user.keyboard('{Enter}')

      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle single action item', async () => {
      const user = userEvent.setup()
      const singleItem: ActionItem[] = [
        {
          id: 'single',
          label: 'Single Action',
          icon: <PencilIcon />,
          onClick: jest.fn(),
        },
      ]

      render(<ActionDropdown items={singleItem} />)

      await user.click(screen.getByRole('button'))

      expect(screen.getByText('Single Action')).toBeInTheDocument()
    })

    it('should handle items without icons', async () => {
      const user = userEvent.setup()
      const itemsWithoutIcons: ActionItem[] = [
        {
          id: 'no-icon',
          label: 'No Icon',
          onClick: jest.fn(),
        },
      ]

      render(<ActionDropdown items={itemsWithoutIcons} />)

      await user.click(screen.getByRole('button'))

      expect(screen.getByText('No Icon')).toBeInTheDocument()
    })

    it('should handle multiple disabled items', async () => {
      const user = userEvent.setup()
      const allDisabled: ActionItem[] = mockActionItems.map((item) => ({
        ...item,
        disabled: true,
      }))

      render(<ActionDropdown items={allDisabled} />)

      await user.click(screen.getByRole('button'))

      const disabledButtons = screen.getAllByRole('button')
      // All menu items should be disabled (excluding trigger)
      disabledButtons.slice(1).forEach((button) => {
        expect(button).toHaveClass('cursor-not-allowed')
      })
    })
  })

  describe('Menu Positioning', () => {
    it('should position menu on the right', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ActionDropdown items={mockActionItems} />,
      )

      await user.click(screen.getByRole('button'))

      const menu = container.querySelector('.absolute.right-0')
      expect(menu).toBeInTheDocument()
    })

    it('should have origin-top-right for animations', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ActionDropdown items={mockActionItems} />,
      )

      await user.click(screen.getByRole('button'))

      const menu = container.querySelector('.origin-top-right')
      expect(menu).toBeInTheDocument()
    })
  })

  describe('Multiple Instances', () => {
    it('should handle multiple dropdowns independently', async () => {
      const user = userEvent.setup()
      const items1: ActionItem[] = [
        {
          id: 'action1',
          label: 'Action 1',
          icon: <PencilIcon />,
          onClick: jest.fn(),
        },
      ]

      const items2: ActionItem[] = [
        {
          id: 'action2',
          label: 'Action 2',
          icon: <TrashIcon />,
          onClick: jest.fn(),
        },
      ]

      render(
        <div>
          <ActionDropdown items={items1} />
          <ActionDropdown items={items2} />
        </div>,
      )

      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])

      expect(screen.getByText('Action 1')).toBeInTheDocument()
      expect(screen.queryByText('Action 2')).not.toBeInTheDocument()
    })
  })
})
