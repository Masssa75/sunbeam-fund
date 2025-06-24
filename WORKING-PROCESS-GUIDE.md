# The Sunbeam Debugging Protocol

## A Systematic Approach to Fixing Production Issues

This guide documents the proven working process that has been highly effective for debugging and fixing issues in the Sunbeam Fund Management System. Every new Claude instance should follow this exact process.

---

## 🎯 Core Principles

1. **Always Reproduce First** - Use browser automation to see exactly what the user sees
2. **Diagnose Before Fixing** - Understand the root cause before writing any fix
3. **Document As You Go** - Update CLAUDE.md immediately after each fix
4. **Verify Everything** - Test on production with automation before claiming success
5. **Keep It Simple** - Prefer minimal fixes over complex rewrites

---

## 📋 The 5-Step Process

### Step 1: Diagnose with Browser Testing

**ALWAYS start by creating a browser test to reproduce the issue:**

```javascript
// Example: test-header-auth-display.js
const { chromium } = require('playwright');

async function testIssue() {
  console.log('🧪 Testing [Issue Name]');
  console.log('=======================\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Key actions:
  // 1. Login as test user
  // 2. Navigate to problem area
  // 3. Take screenshots
  // 4. Log what you observe
  // 5. Try to pinpoint exact failure
}
```

**What to capture:**
- Screenshots at each step
- Console errors
- Network requests
- Exact text/values shown
- Behavior differences (before/after refresh, etc.)

### Step 2: Investigate Root Cause

**Read the code and trace the issue:**

1. **Check the component** showing the issue
2. **Follow the data flow** - where does it get its data?
3. **Check API endpoints** if involved
4. **Test theories** with targeted scripts:

```javascript
// Example: test-coingecko-api.js
// Test API responses directly
// Check database values
// Verify calculations
```

**Common patterns to look for:**
- SSR/hydration issues (component works on client but not server)
- CORS problems (direct API calls from browser)
- Math errors (wrong calculations)
- State management issues (complex useEffect chains)

### Step 3: Implement Minimal Fix

**Fix ONLY what's broken:**

✅ **DO:**
- Create simplified components if needed
- Use API endpoints instead of direct client calls
- Fix the specific calculation/logic error
- Add proper error handling

❌ **DON'T:**
- Refactor unrelated code
- Add complex state management
- Create elaborate fallback systems
- Over-engineer the solution

**Example fixes from today:**
```typescript
// Bad: Direct Supabase client (fails on SSR)
const supabase = getSupabaseClient()
const user = await supabase.auth.getUser()

// Good: API endpoint approach
const response = await fetch('/api/auth/session/')
const data = await response.json()
```

### Step 4: Verify with Automation

**Create a specific test for your fix:**

```javascript
// Example: test-header-fix.js
async function testFix() {
  // 1. Login
  // 2. Navigate to fixed area
  // 3. Verify correct behavior
  // 4. CRITICAL: Test page refresh
  // 5. Take final screenshot
  
  console.log('✅ Fix confirmed working!');
}
```

**Deployment process:**
```bash
# Build and deploy
npm run build
git add -A && git commit -m "Fix [issue]: [brief description]"
git push origin main

# Wait for deployment
sleep 90

# Test on production
node scripts/test-[issue]-fix.js
```

### Step 5: Document Everything

**Update CLAUDE.md immediately with:**

```markdown
## ✅ [ISSUE NAME] FIXED (Date)

### The Problem:
- Exact symptoms
- What users experienced
- Technical root cause

### The Solution:
1. What was changed
2. Why this approach
3. Key code changes

### Key Files Changed:
- `/path/to/file.tsx` - What was modified

### Test Results:
- ✅ Specific verification
- ✅ Another verification
- ✅ Edge case tested

### Browser Test Script:
- `/scripts/test-issue-fix.js` - Verifies the fix
```

---

## 🔧 Essential Tools & Commands

### Browser Testing
```bash
# Install Playwright if needed
npm install playwright

# Run any test
node scripts/test-name.js
```

### Common Test Patterns
```javascript
// Login flow
await page.goto('https://sunbeam.capital/login');
await page.fill('input[type="email"]', 'marc@minutevideos.com');
await page.fill('input[type="password"]', '123456');
await page.click('button[type="submit"]');

// Wait for navigation
await page.waitForURL('https://sunbeam.capital/');

// Check for specific content
const isVisible = await page.locator('text=Loading').isVisible();

// Take screenshot
await page.screenshot({ path: 'issue-test.png' });
```

### Deployment Verification
```bash
# Always wait after pushing
git push origin main
sleep 90
node scripts/check-deploy.js
```

---

## 📝 Real Examples from Today's Session

### Example 1: Header "Loading..." Issue

1. **Diagnosed**: Header stuck showing "Loading..." after page refresh
2. **Investigated**: `getSupabaseClient()` returns null during SSR
3. **Fixed**: Created `HeaderSimplified.tsx` using API endpoint
4. **Verified**: Test confirmed header shows user email after refresh
5. **Documented**: Added complete fix details to CLAUDE.md

### Example 2: Investor View Issue

1. **Diagnosed**: Same "Loading Portfolio..." issue
2. **Investigated**: Same root cause - direct Supabase client
3. **Fixed**: Applied same pattern with `InvestorDashboardSimplified.tsx`
4. **Verified**: Portfolio loads correctly
5. **Documented**: Pattern documented for future use

### Example 3: P&L Calculation

1. **Diagnosed**: Showing -$508M losses (obviously wrong)
2. **Investigated**: Found `cost_basis` was multiplied by amount
3. **Fixed**: Simple math fix - `cost_basis` is already total
4. **Verified**: P&L now shows realistic values
5. **Documented**: Clear explanation of the calculation error

---

## ❌ What NOT to Do

### Don't Make These Mistakes:

1. **Don't assume without testing**
   - ❌ "It's probably a cache issue"
   - ✅ Create a test to see exactly what happens

2. **Don't create complex solutions**
   - ❌ SessionManager with cross-tab sync
   - ✅ Simple API endpoint

3. **Don't claim it's fixed without verification**
   - ❌ "Should work now"
   - ✅ "Test confirms it's working - see screenshot"

4. **Don't fix multiple things at once**
   - ❌ "Also refactored the component while I was there"
   - ✅ Fix one issue, test it, document it

5. **Don't skip documentation**
   - ❌ "I'll document it later"
   - ✅ Update CLAUDE.md before moving to next issue

---

## 🚀 Quick Reference Checklist

For every issue:
- [ ] Create browser test to reproduce
- [ ] Take screenshots of the issue
- [ ] Read the actual code involved
- [ ] Test your theory about root cause
- [ ] Implement minimal fix
- [ ] Build and deploy
- [ ] Wait 90 seconds
- [ ] Run verification test
- [ ] Update CLAUDE.md
- [ ] Commit documentation

---

## 💡 Key Insights

1. **Most issues have simple causes** - Don't overthink
2. **Browser tests catch what unit tests miss** - Real user experience
3. **API endpoints are more reliable** - Avoid SSR issues
4. **Documentation helps the next instance** - Be thorough
5. **Systematic approach prevents frustration** - Follow the process

---

## 📚 Additional Resources

- **Test Scripts**: All in `/scripts/test-*.js`
- **Main Documentation**: `/CLAUDE.md`
- **Browser Testing Guide**: `/BROWSER-TESTING-GUIDE.md`
- **Login Credentials**: marc@minutevideos.com / 123456

---

## Remember

This process works because it's:
- **Systematic** - Same approach every time
- **Evidence-based** - See the issue before fixing
- **Minimal** - Fix only what's broken
- **Verified** - Prove it works before moving on
- **Documented** - Help future instances

Follow this process exactly, and you'll efficiently solve issues just like we did today!