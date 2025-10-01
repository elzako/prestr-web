# Testing Documentation

This directory contains the test setup and utilities for the Prestr application.

## Running Tests

### Unit and Integration Tests (Jest)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Directory Structure

```
__tests__/
├── setup/                    # Test utilities and configuration
│   ├── render.tsx           # Custom render function with providers
│   ├── mocks/               # Mock implementations
│   │   ├── supabase.ts      # Supabase client mocks
│   │   └── next-navigation.ts # Next.js navigation mocks
│   └── factories/           # Test data factories
│       └── index.ts         # Entity factories (Organization, Project, etc.)
├── setup.test.tsx           # Jest setup verification test
└── README.md               # This file

e2e/
└── example.spec.ts          # Example E2E test
```

## Test Utilities

### Custom Render Function

Use the custom render function from `__tests__/setup/render.tsx` to render components with all necessary providers:

```typescript
import { render, screen } from '@/__tests__/setup/render'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### Supabase Mocks

Mock Supabase client for testing authentication and database operations:

```typescript
import {
  createMockSupabaseClient,
  mockAuthenticatedSupabase,
  mockUnauthenticatedSupabase,
  mockUser,
} from '@/__tests__/setup/mocks/supabase'

// Mock authenticated state
const supabase = mockAuthenticatedSupabase()

// Mock unauthenticated state
const supabase = mockUnauthenticatedSupabase()

// Custom mock
const supabase = createMockSupabaseClient({
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockResolvedValue({
      data: [{ id: '1', name: 'Test' }],
      error: null,
    }),
  }),
})
```

### Test Data Factories

Create mock entities for testing:

```typescript
import {
  createMockOrganization,
  createMockProject,
  createMockFolder,
  createMockPresentation,
  createMockSlide,
  resetFactoryCounters,
} from '@/__tests__/setup/factories'

// Create mock data
const org = createMockOrganization({ organization_name: 'Acme Corp' })
const project = createMockProject({ organization_id: org.id })
const folder = createMockFolder({ parent_id: project.id })

// Reset counters between tests
beforeEach(() => {
  resetFactoryCounters()
})
```

### Next.js Navigation Mocks

Mock Next.js navigation hooks:

```typescript
import {
  mockRouter,
  mockPush,
  resetNavigationMocks,
} from '@/__tests__/setup/mocks/next-navigation'

// In your test
test('navigates on click', () => {
  render(<MyComponent />)
  fireEvent.click(screen.getByRole('button'))
  expect(mockPush).toHaveBeenCalledWith('/dashboard')
})

// Reset mocks between tests
beforeEach(() => {
  resetNavigationMocks()
})
```

## Writing Tests

### Component Tests

```typescript
import { render, screen, fireEvent } from '@/__tests__/setup/render'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)

    await fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')

  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
})
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText`, `getByText` over `getByTestId`
3. **Mock External Dependencies**: Always mock API calls, database queries, and third-party services
4. **Clean Up**: Reset mocks and counters between tests using `beforeEach` or `afterEach`
5. **Descriptive Test Names**: Use clear, descriptive names that explain what is being tested
6. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification steps

## Coverage Goals

- **Minimum Coverage**: 70% for branches, functions, lines, and statements
- **Priority Areas**: Authentication flows, critical user paths, data mutations
- **Coverage Report**: Run `npm run test:coverage` to generate a detailed report

## Debugging Tests

### Jest Tests

```bash
# Run a specific test file
npm test -- path/to/test.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="should render"

# Run with verbose output
npm test -- --verbose
```

### Playwright Tests

```bash
# Run in debug mode
npx playwright test --debug

# Run specific test file
npx playwright test e2e/login.spec.ts

# Generate test report
npx playwright show-report
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Next.js Testing Documentation](https://nextjs.org/docs/app/building-your-application/testing)
