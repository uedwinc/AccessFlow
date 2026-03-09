import { generateSessionId } from '../session.js';

describe('Session ID Generation', () => {
  describe('generateSessionId', () => {
    it('should generate a 32-character hexadecimal string', () => {
      const sessionId = generateSessionId();
      
      expect(sessionId).toHaveLength(32);
      expect(sessionId).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should generate unique session IDs', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      const id3 = generateSessionId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should have sufficient entropy (128 bits)', () => {
      // Generate multiple IDs and check they're all different
      const ids = new Set();
      const count = 1000;
      
      for (let i = 0; i < count; i++) {
        ids.add(generateSessionId());
      }
      
      // All IDs should be unique
      expect(ids.size).toBe(count);
    });

    it('should only contain lowercase hexadecimal characters', () => {
      const sessionId = generateSessionId();
      
      // Should not contain uppercase letters
      expect(sessionId).toBe(sessionId.toLowerCase());
      
      // Should only contain 0-9 and a-f
      for (const char of sessionId) {
        expect('0123456789abcdef').toContain(char);
      }
    });
  });
});
