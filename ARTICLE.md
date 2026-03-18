# AIdeas: AccessFlow

> Empowering disabled and neurodivergent job seekers with AI-driven application assistance

![AccessFlow Cover Image - Placeholder for professional cover image showing the application interface]

## App Category

**Social Impact**

## My Vision

AccessFlow addresses a critical barrier in employment: the overwhelming complexity of job applications for disabled and neurodivergent individuals. Traditional job postings are filled with jargon, unclear expectations, and implicit requirements that can be difficult to decode. The application process itself—crafting tailored cover letters, identifying relevant skills, preparing for interviews—creates significant friction that prevents talented individuals from accessing opportunities.

I built AccessFlow to transform this experience. The application accepts a job description and resume, then uses Amazon Bedrock's Claude AI models to generate:

- **Plain English job summaries** that explain what the role actually involves day-to-day
- **Capability-focused positioning** that highlights relevant strengths without dwelling on limitations
- **Tailored cover letters** that respect the user's choice about disability disclosure
- **Interview preparation materials** including likely questions, structured answers, and accommodation request scripts

The core innovation is empathy-driven AI. Every prompt is engineered to be neurodivergent-friendly, concrete, and strength-focused. Users control their narrative through a disclosure flag—they choose whether generated content mentions disability or accommodations. Privacy is paramount: the system uses session-based storage with no authentication required, and implements strict logging policies that never capture personally identifiable information.

## Why This Matters

Employment is fundamental to independence, financial security, and social inclusion. Yet disabled and neurodivergent individuals face unemployment rates 2-3 times higher than the general population. The barriers aren't just physical—they're cognitive, communicative, and systemic.

Job applications demand skills that may not reflect actual job performance: decoding ambiguous language, self-promotion, navigating unwritten social rules, and managing sensory overload during interviews. These barriers filter out qualified candidates before they ever get a chance to demonstrate their capabilities.

AccessFlow matters because it:

1. **Reduces cognitive load**: Transforms overwhelming job postings into clear, actionable information
2. **Builds confidence**: Provides structured frameworks for self-presentation and interview responses
3. **Respects autonomy**: Users control their disclosure choices and maintain privacy
4. **Levels the playing field**: Makes professional application materials accessible to everyone
5. **Promotes inclusion**: Helps employers discover talent they might otherwise miss

This isn't just about individual job seekers—it's about creating a more inclusive economy. When we remove artificial barriers from the hiring process, we unlock human potential and drive innovation through diversity.

## How I Built This

### Architecture Overview

AccessFlow uses a serverless architecture optimized for AWS Free Tier, ensuring the solution remains accessible and cost-effective:

**Frontend**: React 18 single-page application with TypeScript, served via Amazon S3 and CloudFront CDN. The UI follows WCAG AA accessibility standards with keyboard navigation, screen reader support, high contrast design, and ARIA labels throughout.

**Backend**: Node.js 22.x Lambda functions handling application analysis requests. The serverless approach minimizes costs while providing automatic scaling.

**AI Engine**: Amazon Bedrock with Claude Haiku 4.5 model via the Converse API. I chose Claude Haiku 4.5 for its near-frontier performance at a cost-effective price point (~$0.01 per application analysis).

**Storage** (planned): DynamoDB for session-based application data and S3 for secure input storage, both with encryption at rest.

**API Layer**: API Gateway HTTP API providing HTTPS endpoints with CORS support and request throttling.

### AWS Services Used

1. **Amazon Bedrock**: Core AI generation using Claude Haiku 4.5
   - Generates empathetic job summaries in plain English
   - Creates capability-focused positioning analysis
   - Produces tailored cover letters respecting disclosure preferences
   - Develops interview preparation materials with accommodation scripts

2. **AWS Lambda**: Serverless compute for backend processing
   - Two functions: `analyzeApplication` and `interviewPrep`
   - Node.js 22.x runtime with optimized esbuild bundling
   - ~50-100 KB minified bundles for fast cold starts

3. **Amazon API Gateway**: HTTP API for frontend-backend communication
   - HTTPS-only endpoints for security
   - Request throttling to prevent Free Tier overages
   - CORS configuration for cross-origin requests

4. **Amazon S3**: Static website hosting and data storage
   - Frontend assets served via CloudFront
   - Encrypted storage for job descriptions and resumes
   - Lifecycle policies for automatic data deletion

5. **Amazon DynamoDB**: Session-based application storage
   - On-demand billing mode for cost optimization
   - Encryption at rest with AWS managed keys
   - TTL for automatic privacy-compliant data expiration

6. **Amazon CloudFront**: Global CDN for frontend delivery
   - Edge caching reduces latency worldwide
   - HTTPS enforcement for security
   - Origin Access Identity for S3 bucket protection

### Key Development Milestones

**Phase 1: Foundation (Week 1)**
- Set up monorepo structure with frontend and backend workspaces
- Configured TypeScript, React, and Node.js build systems
- Implemented basic form UI with accessibility features
- Created Lambda function scaffolding

**Phase 2: AI Integration (Week 2)**
- Integrated Amazon Bedrock Converse API
- Engineered empathy-focused prompts for each generation type
- Implemented retry logic for throttling and error handling
- Added disclosure flag logic to control content generation

**Phase 3: Privacy & Security (Week 3)**
- Designed privacy-by-default logging system
- Implemented secure hashing for session IDs and metadata
- Created validation utilities to prevent injection attacks
- Documented security guidelines and compliance considerations

**Phase 4: Testing & Optimization (Week 4)**
- Built comprehensive unit test suite with Jest (34 tests passing)
- Created mock backend for development without AWS quotas
- Optimized Lambda bundles with esbuild for minimal size
- Upgraded to Node.js 22.x for extended AWS support
- Implemented automated test generation hook for Lambda handlers

**Phase 5: Polish & Documentation (Week 5)**
- Enhanced UI with copy-to-clipboard functionality
- Added comprehensive help text for every form field
- Created deployment guides and troubleshooting documentation
- Implemented responsive design for mobile accessibility

### Technical Challenges & Solutions

**Challenge 1: Bedrock Quota Limitations**
During development, I encountered AWS Bedrock quota restrictions (0 tokens/minute for new accounts). Solution: Created a mock backend that returns realistic sample data, allowing frontend development and testing to continue while quota requests were processed.

**Challenge 2: Privacy-Compliant Logging**
Balancing debugging needs with strict privacy requirements. Solution: Designed a hashing-based logging system that captures only SHA-256 hashes of session IDs and input lengths, never logging actual user content.

**Challenge 3: Accessibility at Scale**
Ensuring WCAG AA compliance across dynamic content. Solution: Implemented comprehensive ARIA labels, keyboard navigation patterns, focus management, and screen reader announcements using React best practices.

**Challenge 4: Cost Optimization**
Staying within AWS Free Tier limits. Solution: Selected Claude Haiku 4.5 model, implemented request throttling, used on-demand DynamoDB billing, and optimized Lambda bundle sizes to reduce execution time.

**Challenge 5: Development Velocity**
Maintaining test coverage while rapidly iterating on Lambda handlers. Solution: Created an automated test generation hook using Kiro IDE that triggers whenever Lambda handler files are saved, automatically generating or updating Jest test files with happy path and error handling scenarios.

## Demo

### Application Flow

1. **Input Form**
   - User enters job description and resume text
   - Selects work preferences from checkboxes (remote work, flexible hours, quiet workspace, written communication, structured tasks)
   - Specifies accommodation needs (optional)
   - Controls disability disclosure with highlighted checkbox (unchecked by default)
   - Chooses whether to include interview preparation

2. **Processing**
   - Backend validates inputs and generates session ID
   - Calls Amazon Bedrock Converse API for each generation task
   - Aggregates results into comprehensive application analysis
   - Returns structured response to frontend

3. **Results Display**
   - **Job in Plain Language**: Clear, jargon-free summary of role expectations
   - **Key Skills & Strengths**: Capability-focused positioning highlighting relevant experience
   - **Cover Letter Draft**: Professional, tailored letter respecting disclosure preference
   - **Interview Preparation** (if requested): Likely questions, structured answers, accommodation script
   - Copy-to-clipboard buttons for easy use of generated content

### Screenshots

[Placeholder for screenshot 1: Input form showing all fields with help text]

[Placeholder for screenshot 2: Results page showing generated job summary and positioning]

[Placeholder for screenshot 3: Cover letter and interview prep sections with copy buttons]

### Video Demo

[Placeholder for embedded YouTube video - under 5 minutes showing complete user flow]

## What I Learned

### Technical Insights

**1. Prompt Engineering is Critical**
The quality of AI-generated content depends entirely on prompt design. I learned to be explicit about tone (empathetic, concrete), structure (plain English, no jargon), and constraints (respect disclosure flag). Each prompt went through multiple iterations based on output quality.

**2. Serverless Architecture Requires Different Thinking**
Coming from traditional server-based development, I had to rethink error handling, cold starts, and statelessness. Lambda's 30-second timeout forced me to optimize Bedrock calls and implement proper retry logic. The result is a more resilient system.

**3. Accessibility Cannot Be an Afterthought**
Building WCAG AA compliance from the start was easier than retrofitting. Using semantic HTML, proper heading hierarchy, and ARIA labels from day one created a better experience for all users, not just those using assistive technologies.

**4. Privacy by Design is Achievable**
Implementing strict logging policies early prevented bad habits. The hashing-based approach proved that you can have debugging capabilities without compromising user privacy. This should be the default for all applications handling sensitive data.

### Development Journey Insights

**1. AWS Free Tier is Genuinely Viable**
With careful service selection and optimization, it's possible to build production-ready applications within Free Tier limits. Key strategies: serverless compute, on-demand billing, CDN caching, and cost-effective AI models.

**2. Documentation Matters**
Creating comprehensive setup guides, troubleshooting docs, and security guidelines saved countless hours. When I encountered the Bedrock quota issue, having clear documentation helped me quickly pivot to the mock backend solution.

**3. Testing Builds Confidence**
Implementing unit tests early (34 tests with 70%+ coverage) caught bugs before they reached production. Property-based testing concepts from the design phase will ensure correctness across edge cases.

**4. Developer Experience Matters**
Using Kiro IDE's hook system to automate repetitive tasks (like test generation) freed up mental energy for solving harder problems. The Lambda Test Generator hook automatically creates or updates Jest tests whenever handler files are saved, ensuring test coverage keeps pace with development. Good developer tooling isn't a luxury—it's a productivity multiplier.

**5. User Control is Empowering**
The disclosure flag feature taught me that giving users control over their narrative is more important than any AI optimization. Technology should amplify user agency, not replace it.

### Social Impact Learnings

**1. Empathy Requires Intentionality**
Building for neurodivergent users meant questioning every assumption: Is this language clear? Is this interaction predictable? Does this respect cognitive load? These questions improved the experience for everyone.

**2. Inclusion is a Technical Challenge**
Accessibility isn't just about compliance—it's about thoughtful engineering. Keyboard navigation, focus management, and screen reader support require the same rigor as any other technical requirement.

**3. Privacy Builds Trust**
Session-based design with no authentication removes a significant barrier. Users can access help without creating accounts, sharing emails, or worrying about data retention. This privacy-first approach is essential for vulnerable populations.

### Next Steps

**Immediate Priorities**:
- Deploy to production AWS environment with real Bedrock quotas
- Implement DynamoDB storage for session persistence
- Add S3 storage for secure input data retention
- Set up CloudWatch monitoring and billing alarms

**Future Enhancements**:
- Multi-language support for global accessibility
- Resume parsing to auto-extract relevant experience
- Job board integration for streamlined applications
- Accommodation database with templates and examples
- Mobile app for on-the-go application preparation

**Long-term Vision**:
- Partner with employers to create neurodivergent-friendly job postings
- Build community features for peer support and feedback
- Develop analytics to identify common barriers in job descriptions
- Create employer-side tools for inclusive hiring practices

---

## Tags

#aideas-2025 #social-impact #[REGION_TAG]

*Note: Replace [REGION_TAG] with your region: #EMEA, #NAMER, #APJC, #LATAM, #GCR, or #ANZ*

---

## About the Project

**Repository**: [GitHub link to be added]
**Live Demo**: [Demo URL to be added]
**Contact**: [Contact information to be added]

AccessFlow is open-source and welcomes contributions from developers passionate about accessibility and social impact.

---

*Built with ❤️ using Amazon Bedrock, AWS Lambda, and a commitment to inclusive technology*
