# Form Submission Testing Guide

## Step 1: Verify Environment Setup

Before testing the form, ensure the environment is properly configured:

```bash
# Check if .env file exists and has DESK_API_KEY
cat .env | grep DESK_API_KEY
```

Should output:
```
DESK_API_KEY=lh_HjY-Yfabz8TZOuCKwki7kPuvWIucgyTiAInzvDGKDNA
```

## Step 2: Check API Health

Open in browser or curl:

```bash
curl http://localhost:4173/api/health
```

Should return:
```json
{
  "ok": true,
  "service": "zygn-audit-flow",
  "config": {
    "desk": {
      "keyConfigured": true,
      "keyMasked": "lh_HjY...KGKDNA (24 chars)"
    }
  }
}
```

If `"ok": false`, the Desk API key is not valid.

## Step 3: Test Form Submission via API

### Using curl:

```bash
curl -X POST http://localhost:4173/api/submit-lead \
  -H "Content-Type: application/json" \
  -d '{
    "form_type": "flow",
    "full_name": "Test User",
    "email": "test@example.com",
    "mobile": "9876543210",
    "country_code": "+91",
    "studio_name": "Test Studio",
    "studio_city": "Bangalore",
    "role": "owner",
    "team": "s5",
    "projects": "architecture",
    "business_type": "architecture",
    "modules": ["planning"],
    "tools": "software",
    "timeline": "immediate",
    "budget": "yes"
  }'
```

### Expected Success Response:
```json
{
  "status": "success",
  "message": "Submitted",
  "leadId": "...",
  "duplicate": false
}
```

### Common Error Responses:

**Error 1: Missing Desk API Key**
```json
{
  "status": "error",
  "code": "DESK_KEY_MISSING",
  "message": "We could not save your details right now. Please try again in a moment.",
  "detail": "DESK_API_KEY is empty on this host. Set it in the host environment and redeploy."
}
```
**Solution:** Set DESK_API_KEY environment variable

**Error 2: Invalid Desk API Key**
```json
{
  "status": "error",
  "code": "DESK_KEY_REJECTED",
  "message": "We could not save your details right now. Please try again in a moment.",
  "detail": "Desk rejected the API key lh_HjY...KGKDNA (24 chars): 401"
}
```
**Solution:** Check your Desk API key is correct and not expired

**Error 3: Validation Error**
```json
{
  "status": "error",
  "message": "Invalid email"
}
```
**Solution:** Check form field values meet validation requirements:
- Full name: minimum 2 characters
- Email: valid email format
- Mobile: minimum 10 digits

## Step 4: Debug with Browser Console

### Open the form at http://localhost:5173

### Fill in all fields:
- Name: "Test User"
- Email: "test@example.com"
- Phone: "9876543210"
- Studio: "Test Studio"
- City: "Bangalore"
- Role: Select any option
- Team Size: Select any option
- Projects: Select any option
- Business Type: Select any option
- Modules: Select at least one
- Tools: Select any option
- Timeline: Select any option
- Budget: Select "Yes" or "No"

### Submit the form

### Check browser DevTools Console (F12)

Look for logs in this order:

**1. Frontend sending request:**
```
[form] Submitting: {...}
[api] ========== REQUEST START ==========
[api] Sending to /api/submit-lead
[api] Payload: {...}
```

**2. API Response:**
```
[api] Response status: 200
[api] Response data: { status: "success", leadId: "...", ... }
[api] ========== REQUEST END (SUCCESS) ==========
[form] Response: { status: "success", ... }
[form] Submission successful
```

**3. Page Navigation:**
- You should see "You're all set" success screen

## Step 5: Check Server Logs

If using `npm run preview`, check the server terminal:

```
[lead] ========== SUBMISSION START ==========
[lead] Submission started
[parse] Received body: {...}
[parse] Parsed: name=Test User, email=test@example.com, mobile=9876543210
[lead] Submitting to Desk with fields: [...]
[desk] Submitting lead to Desk...
[desk] URL: https://deskbackend.getnos.io/v1/lead
[desk] Key: lh_HjY...KGKDNA (24 chars)
[desk] Response status: 200
[desk] Response data: {...}
[desk] Success! LeadID: ...
[lead] Success: leadId=..., duplicate=false
[lead] ========== SUBMISSION END (SUCCESS) ==========
```

## Troubleshooting Checklist

- [ ] DESK_API_KEY is set in .env file
- [ ] .env file is in project root directory
- [ ] Server is running (npm run preview or npm run dev)
- [ ] All form fields are filled with valid values
- [ ] Email contains @ and a domain
- [ ] Phone number has at least 10 digits
- [ ] /api/health returns ok: true
- [ ] Browser console shows [form], [api] logs
- [ ] Server logs show [lead], [desk] logs
- [ ] No CORS errors in browser console
- [ ] Network tab shows POST to /api/submit-lead returning 200

## Common Issues

### Issue: "Network error. Please try again."
**Possible causes:**
1. Server not running
2. Wrong API endpoint URL
3. CORS issue (unlikely with same-origin)
4. Fetch request timeout (>30 seconds)
5. Server crashed

**Solution:**
- Check server is running on correct port
- Check browser Network tab for actual error
- Check server logs for crash/error messages
- Restart server

### Issue: Form doesn't submit, no error shown
**Possible causes:**
1. Browser console has errors
2. Submission already in progress (duplicate click)
3. Validation failed silently
4. API returned unexpected response format

**Solution:**
- Open DevTools Console (F12)
- Check for any red error messages
- Look for [form], [api], [parse] logs
- Wait a few seconds before clicking submit again
- Check Network tab for /api/submit-lead request

### Issue: Data submitted but not appearing in Desk
**Possible causes:**
1. Duplicate detection (same email submitted twice)
2. Lead submitted to wrong Desk project
3. Desk webhook not configured
4. API key doesn't have write permissions

**Solution:**
- Check /api/health response for duplicate message
- Verify Desk project ID matches in DESK_API_KEY
- Check Desk account for the lead
- Verify API key permissions in Desk admin panel

## Next Steps

After successful form submission:
1. Check Desk CRM for the new lead
2. Verify all form fields are correctly saved
3. Test form with different data to ensure it works consistently
4. Check duplicate detection works
5. Deploy to production with same environment variables
