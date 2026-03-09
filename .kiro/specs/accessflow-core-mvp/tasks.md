# Implementation Plan: AccessFlow Core MVP

## Overview

This implementation plan breaks down the AccessFlow Core MVP into discrete coding tasks. The application is a serverless web app with a React frontend and Node.js Lambda backend, using AWS services (API Gateway, DynamoDB, S3, CloudFront, Bedrock). The implementation follows an incremental approach: infrastructure setup, backend core logic, frontend UI, integration, and testing.

## Tasks

- [ ] 1. Set up project structure and configuration
  - Create directory structure for frontend and backend code
  - Initialize package.json for both frontend and backend
  - Configure TypeScript for both projects
  - Set up environment variable templates (.env.example)
  - Create README with setup instructions
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [ ] 2. Implement backend core utilities and types
  - [ ] 2.1 Create shared TypeScript interfaces and types
    - Define UserInput, UserPreferences, ApplicationAnalysis, InterviewPrep interfaces
    - Define ApiError, ErrorResponse, ValidationResult types
    - Define SessionId type and constants
    - _Requirements: 1.2, 2.1, 4.4, 5.3, 6.4, 7.5, 8.2_
  
  - [ ] 2.2 Implement session ID generation
    - Write generateSessionId() function using crypto.randomBytes
    - Ensure 128 bits of entropy (32 hex characters)
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 2.3 Write property test for session ID generation
    - **Property 5: Session ID Generation Has Sufficient Entropy**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ] 2.4 Implement input validation logic
    - Write validateInput() function with field-level validation
    - Check for empty/whitespace-only required fields
    - Enforce character limits (job description: 10k, resume: 20k, preferences: 1k each)
    - Return ValidationResult with field-specific errors
    - _Requirements: 1.3, 12.4_
  
  - [ ]* 2.5 Write property test for input validation
    - **Property 1: Input Validation Rejects Empty Required Fields**
    - **Validates: Requirements 1.3, 12.4**

- [ ] 3. Implement AWS service clients and operations
  - [ ] 3.1 Set up AWS SDK clients
    - Configure BedrockRuntimeClient for us-east-1
    - Configure DynamoDBClient with encryption settings
    - Configure S3Client with encryption settings
    - Use environment variables for configuration
    - _Requirements: 3.4, 8.4, 12.1_
  
  - [ ] 3.2 Implement S3 storage operations
    - Write storeInputData() function to save job description and resume to S3
    - Use session-based object keys: inputs/{sessionId}/job-description.txt
    - Enable server-side encryption (SSE-S3)
    - _Requirements: 3.1, 3.3, 3.5_
  
  - [ ]* 3.3 Write property test for S3 storage
    - **Property 7: Input Data Is Stored in S3 with Session-Based Keys**
    - **Validates: Requirements 3.1, 3.3**
  
  - [ ] 3.4 Implement DynamoDB storage operations
    - Write storeApplicationAnalysis() function to save analysis to DynamoDB
    - Use sessionId as partition key
    - Exclude sensitive PII fields (email, explicit disability labels)
    - Include createdAt timestamp and s3InputKey reference
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 3.5 Write property test for DynamoDB storage
    - **Property 13: Application Analysis Stored in DynamoDB**
    - **Property 14: DynamoDB Records Exclude Sensitive PII**
    - **Validates: Requirements 8.1, 8.3**

- [ ] 4. Implement Bedrock AI integration
  - [ ] 4.1 Create Bedrock Converse API wrapper
    - Write callBedrockWithRetry() function with exponential backoff
    - Handle ThrottlingException with up to 3 retries
    - Handle ServiceUnavailableException with clear error messages
    - Use Claude 3 Haiku model ID
    - _Requirements: 4.1, 4.2, 4.5, 10.1_
  
  - [ ] 4.2 Implement job summary generation
    - Write generateJobSummary() function using Bedrock Converse API
    - Craft prompt for empathetic, plain English summary
    - Set appropriate maxTokens (1000) and temperature (0.7)
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [ ] 4.3 Implement positioning summary generation
    - Write generatePositioningSummary() function
    - Craft prompt focusing on capabilities and strengths
    - Pass both job description and resume text
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 4.4 Implement cover letter generation
    - Write generateCoverLetter() function
    - Craft prompt that respects Disclosure_Flag preference
    - Include logic to avoid disability mentions when disclosureFlag is false
    - Tailor content to specific job description
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 4.5 Write property test for disclosure flag
    - **Property 12: Disclosure Flag Controls Disability Mentions**
    - **Validates: Requirements 6.2**
  
  - [ ] 4.6 Implement interview prep generation
    - Write generateInterviewPrep() function
    - Generate interview questions based on job description
    - Generate suggested answers matching question count
    - Generate accommodation script when accommodations are specified
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 4.7 Write property tests for interview prep
    - **Property 9: Interview Prep Included When Requested**
    - **Property 10: Interview Answers Match Questions Count**
    - **Property 11: Accommodation Script Generated When Accommodations Specified**
    - **Validates: Requirements 7.1, 7.3, 7.4, 7.5**

- [ ] 5. Checkpoint - Ensure backend unit tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement main Lambda handler
  - [ ] 6.1 Create analyzeApplication Lambda handler
    - Implement request validation using validateInput()
    - Generate session ID
    - Store input data to S3
    - Call all Bedrock generation functions (job summary, positioning, cover letter)
    - Conditionally call generateInterviewPrep() based on user preference
    - Aggregate results into ApplicationAnalysis object
    - Store analysis in DynamoDB
    - Return session ID and analysis in response
    - _Requirements: 1.4, 2.3, 2.4, 4.4, 5.3, 6.4, 7.5, 8.1_
  
  - [ ] 6.2 Implement error handling in Lambda handler
    - Catch and format validation errors (400 response)
    - Catch and format service errors (503 response)
    - Catch and format timeout errors (504 response)
    - Ensure sensitive data is not logged
    - Return consistent ErrorResponse format
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 12.5_
  
  - [ ]* 6.3 Write property test for Lambda response structure
    - **Property 6: Session ID Appears in Response and Storage**
    - **Property 8: Application Analysis Contains All Required Fields**
    - **Validates: Requirements 2.3, 2.4, 4.4, 5.3, 6.4, 8.2**
  
  - [ ]* 6.4 Write property test for logging security
    - **Property 15: Sensitive Data Not Logged**
    - **Validates: Requirements 12.5**

- [ ] 7. Set up infrastructure as code (optional IaC approach)
  - [ ] 7.1 Create Lambda function configuration
    - Define Lambda function with Node.js 22.x runtime
    - Set timeout to 30 seconds
    - Configure environment variables for AWS service endpoints
    - Set appropriate memory allocation (1024 MB recommended)
    - _Requirements: 11.1, 15.5_
  
  - [ ] 7.2 Create IAM role for Lambda execution
    - Define IAM role with least privilege permissions
    - Grant bedrock:InvokeModel permission for Claude models
    - Grant dynamodb:PutItem and dynamodb:GetItem permissions
    - Grant s3:PutObject and s3:GetObject permissions for data bucket
    - _Requirements: 3.4, 8.4, 12.1_
  
  - [ ] 7.3 Create API Gateway HTTP API configuration
    - Define POST /api/analyze route
    - Define GET /api/health route
    - Configure CORS for frontend domain
    - Set request throttling (100 req/sec burst, 50 steady)
    - Set request timeout to 29 seconds
    - Enable HTTPS only
    - _Requirements: 11.5, 12.3_
  
  - [ ] 7.4 Create DynamoDB table configuration
    - Define table with sessionId as partition key (String)
    - Enable on-demand billing mode
    - Enable encryption at rest with AWS managed keys
    - Optional: Configure TTL on createdAt field (30 days)
    - _Requirements: 8.2, 8.5, 11.4_
  
  - [ ] 7.5 Create S3 bucket configurations
    - Define data bucket with private access only
    - Enable server-side encryption (SSE-S3)
    - Configure lifecycle policy (delete after 30 days)
    - Define static website bucket for frontend
    - Configure static bucket for CloudFront OAI access
    - _Requirements: 3.2, 3.5, 11.3, 12.2_
  
  - [ ] 7.6 Create CloudFront distribution configuration
    - Define distribution with S3 static bucket as origin
    - Enable caching for static assets
    - Configure HTTPS only
    - Set appropriate cache behaviors
    - _Requirements: 11.3, 15.4_

- [ ] 8. Implement frontend React application structure
  - [ ] 8.1 Set up React project with TypeScript
    - Initialize React app with TypeScript template
    - Configure React Router for navigation
    - Set up Context API for global state management
    - Install axios for API calls
    - Install accessibility testing library (axe-core)
    - _Requirements: 14.2_
  
  - [ ] 8.2 Create shared types and API client
    - Define TypeScript interfaces matching backend types
    - Create API client module with axios
    - Implement POST /api/analyze function
    - Implement error response handling
    - _Requirements: 1.4_
  
  - [ ] 8.3 Create accessibility provider and utilities
    - Implement AccessibilityProvider context
    - Create focus management utilities
    - Create ARIA announcement utilities
    - Set up keyboard navigation helpers
    - _Requirements: 13.2, 13.4_

- [ ] 9. Implement frontend input form
  - [ ] 9.1 Create InputForm component
    - Build form with job description textarea
    - Build form with resume text textarea
    - Build form with work style input
    - Build form with accommodations input
    - Build form with disclosure flag checkbox
    - Build form with interview prep checkbox
    - Add visible labels for all form controls
    - Implement keyboard navigation support
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 13.1, 13.2_
  
  - [ ] 9.2 Implement client-side validation
    - Validate job description is non-empty
    - Validate resume text is non-empty
    - Display inline error messages for invalid fields
    - Use ARIA live regions for error announcements
    - Prevent form submission when validation fails
    - _Requirements: 1.3, 10.5, 13.4_
  
  - [ ]* 9.3 Write property tests for form validation
    - **Property 1: Input Validation Rejects Empty Required Fields**
    - **Property 2: Valid Inputs Trigger API Calls**
    - **Validates: Requirements 1.3, 1.4**
  
  - [ ] 9.3 Implement form submission and loading state
    - Handle form submit event
    - Call API client with form data
    - Display loading indicator during API call
    - Handle successful response (navigate to results)
    - Handle error response (display error message)
    - _Requirements: 1.4, 10.2, 15.3_
  
  - [ ]* 9.4 Write property test for loading indicators
    - **Property 23: Loading Indicators Shown During Processing**
    - **Validates: Requirements 15.3**

- [ ] 10. Implement frontend results display
  - [ ] 10.1 Create ResultsDisplay component
    - Display job summary section
    - Display positioning summary section
    - Display cover letter section
    - Conditionally display interview prep section
    - Use semantic HTML (header, main, section, article)
    - Implement proper heading hierarchy (h1-h6)
    - _Requirements: 9.1, 9.2, 9.3, 13.5_
  
  - [ ]* 10.2 Write property tests for results display
    - **Property 17: Results Page Displays Core Analysis Fields**
    - **Property 18: Interview Prep Conditionally Displayed**
    - **Validates: Requirements 9.2, 9.3**
  
  - [ ] 10.3 Implement accessibility features for results
    - Add ARIA labels for dynamic content
    - Ensure keyboard navigation works
    - Implement high contrast color scheme
    - Verify text contrast ratios meet WCAG AA
    - _Requirements: 9.4, 9.5, 13.3, 13.4_
  
  - [ ]* 10.4 Write property tests for accessibility
    - **Property 3: All Form Controls Have Visible Labels**
    - **Property 4: All Interactive Elements Are Keyboard Accessible**
    - **Property 19: Text Contrast Meets WCAG Standards**
    - **Property 20: Dynamic Content Has ARIA Labels**
    - **Property 21: Screen Reader Navigation Supported**
    - **Validates: Requirements 1.6, 1.5, 9.4, 13.1, 13.2, 13.3, 13.4, 13.5**

- [ ] 11. Implement error handling and error boundary
  - [ ] 11.1 Create ErrorBoundary component
    - Catch React errors and display accessible error message
    - Log errors to console for debugging
    - Provide recovery option (reload or return to form)
    - _Requirements: 10.5_
  
  - [ ] 11.2 Create error display components
    - Build inline error message component for form fields
    - Build error banner component for API errors
    - Use role="alert" for immediate screen reader announcement
    - Ensure sufficient color contrast for error text
    - _Requirements: 10.2, 10.5, 13.3_
  
  - [ ] 11.3 Implement timeout and network error handling
    - Detect API timeout and display appropriate message
    - Detect network errors and display appropriate message
    - Provide retry functionality
    - Maintain form state during errors
    - _Requirements: 10.2_

- [ ] 12. Checkpoint - Ensure frontend unit tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Integration and end-to-end wiring
  - [ ] 13.1 Wire frontend to API Gateway endpoint
    - Configure API base URL from environment variable
    - Test API calls with real backend (or mocked)
    - Verify CORS configuration works
    - _Requirements: 1.4, 14.3_
  
  - [ ] 13.2 Test complete user flow
    - Test form submission with valid data
    - Verify loading indicator appears
    - Verify navigation to results page
    - Verify all generated content displays
    - Test with interview prep enabled and disabled
    - _Requirements: 9.1, 15.3_
  
  - [ ] 13.3 Test error scenarios
    - Test empty form submission
    - Test API error handling
    - Test timeout handling
    - Verify error messages are user-friendly
    - _Requirements: 10.1, 10.2, 10.5_
  
  - [ ]* 13.4 Write integration tests for complete flows
    - Test happy path (form to results)
    - Test interview prep flow
    - Test error scenarios
    - Test accessibility flow (keyboard-only navigation)

- [ ] 14. Implement request throttling and Free Tier optimization
  - [ ] 14.1 Configure API Gateway throttling
    - Set burst limit to 100 requests/second
    - Set steady-state limit to 50 requests/second
    - Verify 429 responses for excess requests
    - _Requirements: 11.5_
  
  - [ ]* 14.2 Write property test for throttling
    - **Property 22: Request Throttling Enforced**
    - **Validates: Requirements 11.5**
  
  - [ ] 14.3 Verify cost-effective Bedrock model usage
    - Confirm Claude 3 Haiku model ID is used
    - Verify appropriate token limits are set
    - _Requirements: 11.2_
  
  - [ ] 14.4 Configure CloudFront caching
    - Verify static assets are cached
    - Test cache behavior for frontend files
    - _Requirements: 11.3, 15.4_

- [ ] 15. Final testing and documentation
  - [ ] 15.1 Run complete test suite
    - Run all unit tests with coverage report
    - Run all property-based tests (100 iterations each)
    - Verify minimum 80% code coverage for business logic
    - _Requirements: All_
  
  - [ ] 15.2 Update README with deployment instructions
    - Document environment variables required
    - Document AWS service setup steps
    - Document local development setup
    - Document testing commands
    - _Requirements: 14.3, 14.4_
  
  - [ ] 15.3 Create environment variable template
    - Create .env.example with all required variables
    - Document each variable's purpose
    - _Requirements: 14.1, 14.3_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation uses TypeScript with Node.js 22.x runtime for both frontend and backend
- Property-based tests use fast-check library with minimum 100 iterations
- All AWS services should be configured with Free Tier optimization in mind
- Accessibility is a first-class concern throughout implementation
- Infrastructure tasks (section 7) can be implemented using AWS CDK, Terraform, or manual console configuration
