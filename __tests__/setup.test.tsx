import '@testing-library/jest-dom'
/**
 * Simple verification test to ensure Jest is set up correctly
 */

describe('Jest Setup', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true)
  })

  it('should have access to jest-dom matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello, World!'
    document.body.appendChild(element)
    expect(element).toBeInTheDocument()
    document.body.removeChild(element)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve('success')
    expect(result).toBe('success')
  })
})
