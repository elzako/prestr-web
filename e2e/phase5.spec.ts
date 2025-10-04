import { test, expect } from '@playwright/test'

const defaultUser = {
  email: 'olivia.owner@prestr.test',
  password: 'Password123!',
}

async function resetTestData(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset')
  expect(response.ok()).toBeTruthy()
}

async function signIn(page: import('@playwright/test').Page, overrides?: Partial<typeof defaultUser>) {
  const credentials = { ...defaultUser, ...overrides }
  await page.goto('/login')
  await page.getByLabel('Email address').fill(credentials.email)
  await page.getByLabel('Password').fill(credentials.password)
  await Promise.all([
    page.waitForURL('http://localhost:3000/'),
    page.getByRole('button', { name: /sign in/i }).click(),
  ])
}

async function openUserMenu(page: import('@playwright/test').Page) {
  const viewport = page.viewportSize()
  const isMobile = viewport ? viewport.width < 768 : false

  if (isMobile) {
    await page.getByRole('button', { name: 'Toggle Navigation' }).click()
  } else {
    await page.getByRole('button', { name: /olivia/i }).click()
  }
}

test.beforeEach(async ({ request }) => {
  await resetTestData(request)
})

const expectLoggedIn = async (page: import('@playwright/test').Page) => {
  await expect(page.locator('header')).toContainText('Your Organization')
}

test.describe('Authentication Flows', () => {
  test('user can complete sign-up flow and sign in', async ({ page }) => {
    const email = 'new.user@prestr.test'
    const password = 'SignupPass123!'

    await page.goto('/register')
    await page.getByLabel('First name').fill('New')
    await page.getByLabel('Last name').fill('User')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: /sign up/i }).click()

    await expect(page.locator('text=Registration successful')).toBeVisible()

    await signIn(page, { email, password })
    await expectLoggedIn(page)
  })

  test('sign in persists across reload and sign out redirects to login', async ({ page }) => {
    await signIn(page)
    await expectLoggedIn(page)

    await page.reload()
    await expectLoggedIn(page)

    await openUserMenu(page)
    await page.getByRole('button', { name: /sign out/i }).click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('protected route redirects unauthenticated users', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('h2')).toHaveText(/Sign in to your account/i)
  })

  test('password reset flow records request', async ({ page, request }) => {
    await page.goto('/forgot-password')
    await page.getByLabel('Email address').fill(defaultUser.email)
    await page.getByRole('button', { name: /reset/i }).click()
    await expect(page.locator('text=Password reset email')).toBeVisible()

    const status = await request.get('/api/test/password-reset')
    const body = await status.json()
    expect(body.success).toBeTruthy()
    expect(body.reset.email).toBe(defaultUser.email)
  })
})

test.describe('Core User Journeys', () => {
  test('primary workflow: navigate organization, drill into slide, and verify content', async ({ page }) => {
    await signIn(page)
    await expectLoggedIn(page)

    await page.goto('/acme')
    await page.getByRole('link', { name: /View project/i }).first().click()

    await expect(page.locator('h2')).toContainText('BrandCampaigns')
    await page.getByRole('link', { name: /View slide/i }).first().click()

    await expect(page.locator('h1, h2, h3')).toContainText(/Vision|Roadmap|Customer/i)
    await expect(page.locator('img')).toBeVisible()
  })

  test('search surfaces relevant slides', async ({ page }) => {
    await signIn(page)
    await page.goto('/acme')
    await page.getByPlaceholder('Search slides by content').fill('roadmap')
    await page.keyboard.press('Enter')

    const resultCards = page.locator('a:has-text("Roadmap")')
    await expect(resultCards.first()).toBeVisible()

    await resultCards.first().click()
    await expect(page).toHaveURL(/roadmap\.slide$/)
  })

  test('PowerPoint upload adds new assets to folder', async ({ page }) => {
    await signIn(page)
    await page.goto('/acme/BrandCampaigns/ProductLaunch')

    await page.getByRole('button', { name: 'Upload' }).click()

    const file = {
      name: 'sample.pptx',
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      buffer: Buffer.from('Mock pptx content'),
    }

    await page.setInputFiles('input[type="file"]', file)
    await expect(page.locator('text=Upload successful!')).toBeVisible()

    await page.waitForTimeout(2500)
    await expect(page.locator('text=sample.pptx-Slide1')).toBeVisible()
  })

  test('profile form submission saves metadata', async ({ page }) => {
    await signIn(page)
    await page.goto('/profile')

    await page.getByRole('button', { name: /Edit Profile/i }).click()
    await page.getByLabel('First Name').fill('Olivia')
    await page.getByLabel('Last Name').fill('Tester')
    await page.getByLabel('Position').fill('Head of Enablement')
    await page.getByRole('button', { name: /Save/i }).click()

    await expect(page.locator('text=Profile updated successfully')).toBeVisible()
  })

  test('data listing displays folder contents and summary', async ({ page }) => {
    await signIn(page)
    await page.goto('/acme/BrandCampaigns')

    await expect(page.locator('text=This folder is empty.').first()).not.toBeVisible()
    await expect(page.locator('h2')).toContainText('BrandCampaigns')
    await expect(page.locator('a:has-text("View presentation")').first()).toBeVisible()
  })
})

test.describe('CRUD operations', () => {
  test('create, update, and delete a project', async ({ page }) => {
    await signIn(page)
    await page.goto('/acme')

    await page.getByRole('button', { name: /Create Project/i }).click()
    await page.getByLabel('Project Name').fill('e2e-project')
    await page.getByLabel('Description').fill('Automation created project')
    await page.getByRole('button', { name: /Create Project/i, exact: false }).click()

    await page.waitForLoadState('networkidle')
    await expect(page.locator('h3', { hasText: 'e2e-project' })).toBeVisible()

    await page.getByRole('button', { name: 'Manage project e2e-project' }).click()
    await page.getByRole('button', { name: /Edit Project/i }).click()
    await page.getByLabel('Project Name').fill('e2e-updated')
    await page.getByRole('button', { name: /Save Changes/i }).click()

    await page.waitForLoadState('networkidle')
    await expect(page.locator('h3', { hasText: 'e2e-updated' })).toBeVisible()

    await page.getByRole('button', { name: 'Manage project e2e-updated' }).click()
    await page.getByRole('button', { name: /Delete Project/i }).click()
    await page.getByRole('button', { name: 'Delete' }).click()

    await page.waitForLoadState('networkidle')
    await expect(page.locator('h3', { hasText: 'e2e-updated' })).toHaveCount(0)
  })
})
