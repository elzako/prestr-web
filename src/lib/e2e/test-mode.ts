export function isE2ETestMode(): boolean {
  const flag = process.env.E2E_TEST_MODE ?? process.env.NEXT_PUBLIC_E2E_TEST_MODE

  if (!flag) {
    return false
  }

  return flag === 'true' || flag === '1' || flag === 'yes'
}
