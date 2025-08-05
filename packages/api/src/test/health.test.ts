import { describe, it, expect } from 'vitest';

// Simple health check test to ensure the test runner works
describe('Health Check', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should validate environment setup', () => {
    // Test that basic TypeScript compilation works
    const testObject = {
      name: 'AgentProbe Community',
      version: '1.0.0',
    };
    
    expect(testObject.name).toBe('AgentProbe Community');
    expect(typeof testObject.version).toBe('string');
  });
});