import { AnalyzeRequest, AnalyzeResponse } from './types';

// Read API base URL from environment variable
// Defaults to /api for local development (proxied by Vite)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Call the analyze endpoint
 */
export async function analyzeApplication(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to analyze application');
  }

  return response.json();
}
