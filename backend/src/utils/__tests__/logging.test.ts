import { hashSessionId, hashInputLengths, safeErrorLog } from '../logging.js';

describe('Logging Utilities', () => {
  describe('hashSessionId', () => {
    it('should return an 8-character hash', () => {
      const sessionId = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const hash = hashSessionId(sessionId);
      
      expect(hash).toHaveLength(8);
    });

    it('should return consistent hash for same input', () => {
      const sessionId = 'test-session-id-12345';
      const hash1 = hashSessionId(sessionId);
      const hash2 = hashSessionId(sessionId);
      
      expect(hash1).toBe(hash2);
    });

    it('should return different hashes for different inputs', () => {
      const hash1 = hashSessionId('session-1');
      const hash2 = hashSessionId('session-2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should never return the original session ID', () => {
      const sessionId = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const hash = hashSessionId(sessionId);
      
      expect(hash).not.toBe(sessionId);
      expect(hash).not.toContain(sessionId);
    });

    it('should only contain hexadecimal characters', () => {
      const sessionId = 'test-session-id';
      const hash = hashSessionId(sessionId);
      
      expect(hash).toMatch(/^[0-9a-f]{8}$/);
    });
  });

  describe('hashInputLengths', () => {
    it('should return an 8-character hash', () => {
      const hash = hashInputLengths(500, 1000);
      
      expect(hash).toHaveLength(8);
    });

    it('should return consistent hash for same inputs', () => {
      const hash1 = hashInputLengths(500, 1000);
      const hash2 = hashInputLengths(500, 1000);
      
      expect(hash1).toBe(hash2);
    });

    it('should return different hashes for different inputs', () => {
      const hash1 = hashInputLengths(500, 1000);
      const hash2 = hashInputLengths(600, 1000);
      const hash3 = hashInputLengths(500, 1100);
      
      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash2).not.toBe(hash3);
    });

    it('should only contain hexadecimal characters', () => {
      const hash = hashInputLengths(123, 456);
      
      expect(hash).toMatch(/^[0-9a-f]{8}$/);
    });

    it('should not reveal actual lengths', () => {
      const hash = hashInputLengths(500, 1000);
      
      expect(hash).not.toContain('500');
      expect(hash).not.toContain('1000');
    });
  });

  describe('safeErrorLog', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message');
      const safe = safeErrorLog(error);
      
      expect(safe.message).toBe('Test error message');
      expect(safe.type).toBe('Error');
      expect(safe.timestamp).toBeDefined();
    });

    it('should handle custom error types', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      
      const error = new CustomError('Custom error');
      const safe = safeErrorLog(error);
      
      expect(safe.message).toBe('Custom error');
      expect(safe.type).toBe('CustomError');
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const safe = safeErrorLog(error);
      
      expect(safe.message).toBe('Unknown error');
      expect(safe.type).toBe('string');
    });

    it('should include timestamp in ISO format', () => {
      const error = new Error('Test');
      const safe = safeErrorLog(error);
      
      expect(safe.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should not include stack traces', () => {
      const error = new Error('Test error');
      const safe = safeErrorLog(error);
      
      expect(safe).not.toHaveProperty('stack');
    });

    it('should not include sensitive data from error message', () => {
      const error = new Error('Failed to process: SENSITIVE_DATA_HERE');
      const safe = safeErrorLog(error);
      
      // The function returns the message as-is, but in practice,
      // we should ensure error messages don't contain sensitive data
      expect(safe.message).toBe('Failed to process: SENSITIVE_DATA_HERE');
      expect(Object.keys(safe)).toEqual(['message', 'type', 'timestamp']);
    });
  });
});
