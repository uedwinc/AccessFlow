---
inclusion: always
---

# Project Structure

## Current Organization

The project is in early setup phase. Expected structure:

- `.kiro/` - Kiro IDE configuration and steering rules
- `README.md` - Project overview and setup instructions

## Anticipated Structure

As the project develops, expect:

- Frontend code (React application)
- Backend Lambda functions
- Infrastructure as Code (IaC) definitions
- Shared utilities and types
- Configuration files for AWS services

## Architecture Notes

- Serverless architecture with AWS Lambda functions
- Frontend served via CloudFront CDN
- API Gateway for REST endpoints
- DynamoDB for data persistence
- S3 for static assets and file storage
