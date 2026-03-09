# AccessFlow UI Features - Quick Reference

## 🎯 Main Page Features

### Header
- **Title:** "AccessFlow"
- **Tagline:** "Empowering disabled and neurodivergent job seekers..."
- **Skip Link:** Keyboard users can skip to main content

### Input Form

#### Required Fields
1. **Job Description**
   - Large textarea (8 rows)
   - Help text: "Paste the full job posting here..."
   - Marked with red asterisk

2. **Resume/Experience Summary**
   - Large textarea (8 rows)
   - Help text: "Share your work history, skills..."
   - Marked with red asterisk

#### Optional Fields

3. **Work Preferences** (Checkboxes)
   - ☐ I prefer written communication over verbal
   - ☐ I may need flexible scheduling
   - ☐ I work best in a quiet environment
   - ☐ I appreciate clear, written instructions
   - ☐ I may need regular breaks
   - Grouped in fieldset with clear help text

4. **Specific Accommodations** (Textarea)
   - 3 rows
   - Placeholder examples provided
   - Help text explains professional framing

5. **Disclosure Checkbox**
   - ☐ It's okay to reference disability or accommodations in my cover letter
   - Highlighted in yellow warning box
   - Unchecked by default (privacy-first)
   - Detailed explanation of implications

#### Submit Button
- Text: "Generate Strategy & Cover Letter"
- Large, prominent, full-width
- Shows "Generating..." when loading
- Disabled during processing

#### Loading State
- Animated spinner
- Message: "Analyzing your application..."
- Time estimate: "usually takes 5-15 seconds"

## 📄 Results Page Features

### Header
- Title: "Your Application Materials"
- Subtitle: "Review and customize these materials..."
- "Start New Application" button (top right)

### Section 1: Job in Plain Language
- Heading matches spec exactly
- Copy button for easy clipboard access
- Plain English summary of the role
- Light gray background

### Section 2: Key Skills & Strengths
- Heading matches spec exactly
- Copy button
- Capability-focused analysis
- Highlights what to emphasize

### Section 3: Cover Letter Draft
- Heading matches spec exactly
- Copy button
- Professional serif font (Georgia)
- Cream background for distinction
- Pre-formatted text preserved

### Section 4: Interview Preparation (if requested)
- Green color scheme (distinct from main sections)
- **Likely Interview Questions**
  - Numbered list
  - 5 questions with approach guidance
  - STAR method references
- **Accommodation Request Script** (if accommodations specified)
  - Yellow highlighted box
  - Professional, confident framing
  - Separate copy button

### Footer Note
- Encouraging message
- Reminds users to personalize
- "These are starting points"

## ♿ Accessibility Features

### Keyboard Navigation
- ✅ Tab through all interactive elements
- ✅ Skip to main content link
- ✅ Visible focus indicators (3px blue outline)
- ✅ Logical tab order

### Screen Reader Support
- ✅ Semantic HTML (header, main, footer, nav)
- ✅ ARIA labels on all inputs
- ✅ ARIA live regions for dynamic content
- ✅ Required fields announced
- ✅ Error messages associated with fields
- ✅ Help text linked to inputs

### Visual Accessibility
- ✅ High contrast (WCAG AA compliant)
- ✅ Large, readable fonts (16px base)
- ✅ Clear visual hierarchy
- ✅ Color not sole indicator of meaning
- ✅ Sufficient spacing between elements

### Motion Sensitivity
- ✅ Respects prefers-reduced-motion
- ✅ Animations can be disabled

## 🎨 Visual Design

### Color Palette
- **Primary Blue:** #0066cc (buttons, headings, links)
- **Success Green:** #28a745 (interview prep)
- **Warning Yellow:** #ffc107 (disclosure, accommodations)
- **Error Red:** #c00 (validation errors)
- **Background:** Purple gradient (667eea → 764ba2)

### Typography
- **Body:** System font stack (San Francisco, Segoe UI, etc.)
- **Cover Letter:** Georgia serif
- **Base Size:** 16px
- **Line Height:** 1.6-1.8

### Spacing
- Generous padding (1.5-2.5rem)
- Clear section separation
- Breathing room around interactive elements

## 📱 Responsive Design

### Desktop (1200px+)
- Max width: 900px (form), 1000px (results)
- Side-by-side layouts
- Full-size buttons

### Tablet (768px-1199px)
- Flexible layouts
- Adjusted spacing

### Mobile (<768px)
- Stacked layouts
- Full-width buttons
- Reduced padding
- Smaller fonts

## 🔄 User Flow

1. **Land on page** → See clear title and description
2. **Fill required fields** → Job description and resume
3. **Optionally select preferences** → Checkboxes for work style
4. **Optionally add accommodations** → Specific needs
5. **Choose disclosure** → Default: no disability mentions
6. **Click submit** → See loading spinner with time estimate
7. **View results** → Three main sections + optional interview prep
8. **Copy sections** → Easy clipboard access
9. **Start new** → Reset form for another application

## 💡 Key UX Decisions

### Privacy-First
- Disclosure checkbox unchecked by default
- Clear explanation of what happens
- No data stored (mentioned in footer)

### Empathy-Driven
- Reassuring language throughout
- No judgment about formatting
- Focus on capabilities, not limitations
- Encouraging messages

### Simplicity
- Single-page flow
- Clear next steps
- Minimal cognitive load
- Progressive disclosure

### Confidence-Building
- Professional design
- Clear value proposition
- Emphasis on strengths
- Reminder to personalize

## 🧪 Quick Test Checklist

- [ ] Tab through entire form (keyboard only)
- [ ] Submit with empty fields (see errors)
- [ ] Submit with valid data (see results)
- [ ] Copy each section to clipboard
- [ ] Click "Start New Application"
- [ ] Test on mobile device
- [ ] Test with screen reader
- [ ] Check color contrast
- [ ] Verify all labels present
- [ ] Test reduced motion preference

## 📊 Metrics to Track

### Usability
- Time to complete form
- Error rate on submission
- Use of optional fields
- Copy button usage

### Accessibility
- Keyboard navigation success rate
- Screen reader compatibility
- Error message clarity
- Help text effectiveness

### Engagement
- Disclosure checkbox selection rate
- Interview prep request rate
- Work preference selection patterns
- Return user rate

---

**Ready for user testing and feedback!** 🚀
