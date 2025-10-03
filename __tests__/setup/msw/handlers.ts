import { rest } from 'msw'

/**
 * Default MSW handlers shared across tests. Extend or override in individual
 * test suites by calling mswServer.use(...).
 */
export const handlers = [
  rest.get('https://api.prestr.test/health', (req, res, ctx) =>
    res(ctx.json({ status: 'ok' })),
  ),
]
