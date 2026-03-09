# Requirements Document

## Introduction

AccessFlow Core MVP is a web application that helps disabled and neurodivergent job seekers create tailored job applications with minimal friction. The system accepts job descriptions and resume text, gathers user preferences about work style and accommodations, and generates empathetic job summaries, positioning guidance, cover letters, and optional interview preparation materials. The application prioritizes accessibility, privacy, and operates within AWS Free Tier constraints.

## Glossary

- **Frontend**: The React-based web user interface that runs in the user's browser
- **Backend**: The Node.js Lambda functions that process requests via API Gateway
- **Application_Analysis**: A generated set of outputs including job summary, positioning summary, cover letter, and optional interview prep
- **Session_ID**: A randomly generated identifier used to key stored data without requiring user authentication
- **Job_Description**: The text of a job posting provided by the user
- **Resume_Text**: The user's resume content provided as text input
- **User_Preferences**: Answers to questions about work style, accommodations, and disclosure preferences
- **Bedrock_Service**: Amazon Bedrock AI service accessed via the Converse API
- **DynamoDB_Store**: The DynamoDB table storing Application_Analysis records
- **S3_Bucket**: AWS S3 storage for text inputs and uploads
- **Static_Website_Bucket**: The public S3 bucket serving the Frontend via CloudFront
- **API_Gateway**: AWS API Gateway HTTP API routing requests to Backend functions
- **Disclosure_Flag**: User preference indicating whether to include disability information in generated content

## Requirements

### Requirement 1: Accept Job Application Inputs

**User Story:** As a job seeker, I want to provide my job description and resume, so that the system can analyze them for my application.

#### Acceptance Criteria

1. THE Frontend SHALL display input fields for Job_Description and Resume_Text
2. THE Frontend SHALL provide input fields for User_Preferences including work style, accommodations, and Disclosure_Flag
3. WHEN the user submits the form, THE Frontend SHALL validate that Job_Description and Resume_Text are non-empty
4. WHEN validation passes, THE Frontend SHALL send the inputs to the Backend via API_Gateway
5. THE Frontend SHALL support keyboard navigation for all input fields
6. THE Frontend SHALL provide visible labels for all form fields

### Requirement 2: Generate Session Identifier

**User Story:** As a user, I want my application data stored without requiring an account, so that I can use the service with minimal friction.

#### Acceptance Criteria

1. WHEN a new application request is received, THE Backend SHALL generate a random Session_ID
2. THE Session_ID SHALL be cryptographically random with at least 128 bits of entropy
3. THE Backend SHALL return the Session_ID to the Frontend in the response
4. THE Backend SHALL use the Session_ID as the primary key for storing data in DynamoDB_Store

### Requirement 3: Store Input Data Securely

**User Story:** As a user, I want my resume and job description stored securely, so that my personal information is protected.

#### Acceptance Criteria

1. WHEN the Backend receives Job_Description and Resume_Text, THE Backend SHALL store them in S3_Bucket
2. THE S3_Bucket SHALL be configured as private with no public access
3. THE Backend SHALL use the Session_ID as part of the S3 object key
4. THE Backend SHALL use IAM roles with least privilege to access S3_Bucket
5. THE Backend SHALL encrypt data at rest using S3 server-side encryption

### Requirement 4: Generate Empathetic Job Summary

**User Story:** As a neurodivergent job seeker, I want a plain English summary of the job, so that I can understand what the role really involves.

#### Acceptance Criteria

1. WHEN the Backend processes a Job_Description, THE Backend SHALL send it to Bedrock_Service for summarization
2. THE Backend SHALL use the Converse API with a Claude model in us-east-1 region
3. THE Bedrock_Service SHALL generate a human, empathetic summary in plain English
4. THE Backend SHALL include the job summary in the Application_Analysis
5. WHEN Bedrock_Service is unavailable, THE Backend SHALL return a clear error message to the Frontend

### Requirement 5: Generate Capability-Focused Positioning

**User Story:** As a job seeker, I want to know which of my strengths to highlight, so that I can position myself effectively for the role.

#### Acceptance Criteria

1. WHEN the Backend processes Job_Description and Resume_Text, THE Backend SHALL send them to Bedrock_Service for positioning analysis
2. THE Bedrock_Service SHALL generate a capability-focused positioning summary identifying relevant strengths
3. THE Backend SHALL include the positioning summary in the Application_Analysis
4. THE positioning summary SHALL focus on capabilities and strengths rather than limitations

### Requirement 6: Generate Tailored Cover Letter

**User Story:** As a job seeker, I want a cover letter tailored to the job, so that I can submit a strong application.

#### Acceptance Criteria

1. WHEN the Backend processes Job_Description, Resume_Text, and User_Preferences, THE Backend SHALL send them to Bedrock_Service for cover letter generation
2. WHERE Disclosure_Flag is false, THE Bedrock_Service SHALL generate a cover letter that does not mention disability
3. WHERE Disclosure_Flag is true, THE Bedrock_Service SHALL generate a cover letter that may include relevant accommodation information
4. THE Backend SHALL include the cover letter in the Application_Analysis
5. THE cover letter SHALL be tailored to the specific Job_Description

### Requirement 7: Generate Optional Interview Preparation

**User Story:** As a job seeker, I want interview preparation materials, so that I can feel confident in interviews.

#### Acceptance Criteria

1. WHERE the user requests interview prep, THE Backend SHALL send Job_Description and User_Preferences to Bedrock_Service
2. THE Bedrock_Service SHALL generate likely interview questions based on the Job_Description
3. THE Bedrock_Service SHALL generate suggested answers to the interview questions
4. WHERE the user has accommodation needs, THE Bedrock_Service SHALL generate a short accommodation script
5. THE Backend SHALL include interview prep materials in the Application_Analysis

### Requirement 8: Store Application Analysis

**User Story:** As a user, I want my generated application materials saved, so that I can retrieve them later.

#### Acceptance Criteria

1. WHEN the Backend completes generating an Application_Analysis, THE Backend SHALL store it in DynamoDB_Store
2. THE DynamoDB_Store record SHALL be keyed by Session_ID
3. THE DynamoDB_Store record SHALL NOT include email addresses or explicit disability labels
4. THE Backend SHALL use IAM roles with least privilege to access DynamoDB_Store
5. THE DynamoDB_Store SHALL use encryption at rest

### Requirement 9: Display Application Analysis Results

**User Story:** As a user, I want to see my generated application materials, so that I can use them for my job application.

#### Acceptance Criteria

1. WHEN the Backend returns an Application_Analysis, THE Frontend SHALL navigate to a results page
2. THE Frontend SHALL display the job summary, positioning summary, and cover letter
3. WHERE interview prep was requested, THE Frontend SHALL display interview questions, answers, and accommodation script
4. THE Frontend SHALL provide high contrast display for readability
5. THE Frontend SHALL support keyboard navigation on the results page

### Requirement 10: Handle Service Errors Gracefully

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened.

#### Acceptance Criteria

1. WHEN Bedrock_Service is unavailable, THE Backend SHALL return an error response with a clear message
2. WHEN API_Gateway times out, THE Frontend SHALL display a user-friendly error message
3. WHEN DynamoDB_Store operations fail, THE Backend SHALL return an error response with a clear message
4. WHEN S3_Bucket operations fail, THE Backend SHALL return an error response with a clear message
5. THE Frontend SHALL display all error messages in accessible format with appropriate ARIA labels

### Requirement 11: Optimize for AWS Free Tier

**User Story:** As a cost-conscious user, I want the application to run within AWS Free Tier limits, so that it remains affordable.

#### Acceptance Criteria

1. THE Backend SHALL use Lambda functions to minimize compute costs
2. THE Backend SHALL use a cost-effective Claude model (Sonnet or Haiku) for Bedrock_Service calls
3. THE Frontend SHALL be served from Static_Website_Bucket via CloudFront to minimize bandwidth costs
4. THE DynamoDB_Store SHALL use on-demand billing mode
5. THE Backend SHALL implement request throttling to prevent exceeding Free Tier limits

### Requirement 12: Implement Least Privilege Security

**User Story:** As a security-conscious user, I want the system to follow security best practices, so that my data is protected.

#### Acceptance Criteria

1. THE Backend Lambda functions SHALL use IAM roles with minimum required permissions
2. THE S3_Bucket SHALL deny all public access except Static_Website_Bucket
3. THE API_Gateway SHALL use HTTPS for all requests
4. THE Backend SHALL validate all inputs before processing
5. THE Backend SHALL not log sensitive user data

### Requirement 13: Provide Accessible User Interface

**User Story:** As a disabled user, I want an accessible interface, so that I can use the application effectively.

#### Acceptance Criteria

1. THE Frontend SHALL provide visible labels for all form controls
2. THE Frontend SHALL support full keyboard navigation without mouse
3. THE Frontend SHALL use sufficient color contrast ratios for text
4. THE Frontend SHALL provide ARIA labels for dynamic content
5. THE Frontend SHALL support screen reader navigation

### Requirement 14: Enable Simple Local Development

**User Story:** As a developer, I want simple local setup, so that I can start development quickly.

#### Acceptance Criteria

1. THE project SHALL provide a single environment configuration file for local setup
2. THE project SHALL use Node.js for both Frontend and Backend development
3. THE project SHALL document all required environment variables
4. THE project SHALL provide setup instructions in the README
5. WHEN environment variables are configured, THE developer SHALL be able to run the application locally

### Requirement 15: Optimize for Low Latency

**User Story:** As a user, I want fast response times, so that I can complete my application quickly.

#### Acceptance Criteria

1. THE Backend SHALL process single-user requests with minimal latency
2. THE Backend SHALL use streaming responses from Bedrock_Service where supported
3. THE Frontend SHALL display loading indicators during Backend processing
4. THE CloudFront distribution SHALL cache static Frontend assets
5. THE Backend SHALL use appropriate Lambda memory allocation for optimal performance
