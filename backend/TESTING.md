# Backend Testing Guide

## Running Tests

The backend includes comprehensive unit tests for utility functions.

### Quick Start

```bash
cd backend
npm test
```

### Test Commands

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (re-runs on file changes)
- `npm run test:coverage` - Run tests with coverage report

## Test Suites

### 1. Validation Tests (`validation.test.ts`)
Tests input validation for job descriptions, resumes, and preferences:
- Empty field detection
- Character limit enforcement (10K for jobs, 20K for resumes, 1K for preferences)
- Multiple validation error handling
- Whitespace-only input rejection

### 2. Session ID Tests (`session.test.ts`)
Tests secure session ID generation:
- 32-character hexadecimal format
- Uniqueness across multiple generations
- Sufficient entropy (128 bits)
- Lowercase-only output

### 3. Logging Tests (`logging.test.ts`)
Tests privacy-focused logging utilities:
- Session ID hashing (8-char hash output)
- Input length hashing
- Safe error logging (no PII exposure)
- Consistent hash generation

## Test Results

All 34 tests passing:
- 15 validation tests
- 4 session ID tests
- 15 logging tests

## Coverage Thresholds

Minimum coverage requirements (configured in `jest.config.js`):
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Test Configuration

Tests use:
- Jest with ts-jest for TypeScript support
- ESM module format
- Node.js test environment
- Automatic test discovery in `__tests__` folders

## Adding New Tests

1. Create test files in `src/**/__tests__/*.test.ts`
2. Import the functions you want to test
3. Use Jest's `describe` and `it` blocks
4. Run `npm test` to verify

Example:
```typescript
import { myFunction } from '../myModule.js';

describe('My Module', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expectedValue);
  });
});
```
