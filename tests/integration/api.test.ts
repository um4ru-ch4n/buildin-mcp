import { describe, it, expect } from 'vitest';

// Integration tests require a real BUILDIN_BOT_TOKEN.
// Run with: BUILDIN_BOT_TOKEN=your_token npx vitest run tests/integration
describe.skipIf(!process.env['BUILDIN_BOT_TOKEN'])('Integration: Buildin API', () => {
  it('get_me returns user info', async () => {
    const { BuildinClient } = await import('../../src/client/buildin-client.js');
    const client = new BuildinClient();
    const user = await client.get('/v1/users/me', {
      correlationId: 'integration-test',
      toolName: 'get_me',
      callChain: ['integration-test'],
    });
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('object', 'user');
  });
});
