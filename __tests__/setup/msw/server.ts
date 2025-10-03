import { setupServer } from 'msw/node'

import { handlers } from './handlers'

export const mswServer = setupServer(...handlers)

export const useMswHandlers = (
  ...newHandlers: Parameters<typeof mswServer.use>
) => {
  mswServer.use(...newHandlers)
}
