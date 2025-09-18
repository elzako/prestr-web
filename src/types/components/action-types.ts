import type { ReactNode } from 'react'

/**
 * Action-related component types
 *
 * These types define the structures used for action menus, dropdowns,
 * and interactive elements throughout the application.
 */

// Action item interface (moved from ActionDropdown component)
export interface ActionItem {
  id: string
  label: string
  icon: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

// Action dropdown component props
export interface ActionDropdownProps {
  items: ActionItem[]
  trigger?: 'kebab' | 'button'
  buttonLabel?: string
  className?: string
}

// Confirm dialog props
export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: ReactNode
  loading?: boolean
}

// Action states for components with multiple actions
export interface ActionStates {
  deleteConfirm: {
    open: boolean
    item: {
      id: string
      name: string
      type: 'folder' | 'presentation' | 'slide'
    } | null
  }
  uploadModal: {
    open: boolean
    folderId: string | null
  }
  createFolderModal: {
    open: boolean
    parentFolderId: string | null
  }
  editFolderModal: {
    open: boolean
    folderId: string | null
  }
  search: {
    isSearchMode: boolean
    query: string
  }
}

// Bulk action types
export interface BulkActionItem {
  id: string
  type: 'folder' | 'presentation' | 'slide'
  selected: boolean
}

export interface BulkActions {
  delete: {
    enabled: boolean
    count: number
  }
  move: {
    enabled: boolean
    count: number
  }
  visibility: {
    enabled: boolean
    count: number
  }
}
