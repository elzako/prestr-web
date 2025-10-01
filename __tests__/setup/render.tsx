import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

/**
 * Custom render function for testing components with providers
 *
 * This wrapper adds any global providers that your app uses (like theme providers,
 * router context, etc.). Extend this as needed when you add more providers.
 */

interface AllTheProvidersProps {
  children: ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return <>{children}</>
  // Add providers here as needed, for example:
  // <ThemeProvider>
  //   <RouterProvider>
  //     {children}
  //   </RouterProvider>
  // </ThemeProvider>
}

/**
 * Custom render function that wraps components with necessary providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override render method
export { customRender as render }
