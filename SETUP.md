# Setup Guide

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Getnos Desk API credentials

## Local Development Setup

### 1. Install Dependencies
```bash
npm ci
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and set your Desk API credentials:
```env
DESK_URL=https://deskbackend.getnos.io/v1/lead
DESK_API_KEY=your_desk_project_api_key
PORT=4173
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` with API endpoints at `http://localhost:5173/api/submit-lead`

### 4. Test Form Submission

1. Open the form at `http://localhost:5173`
2. Fill in all required fields
3. Submit the form
4. Check browser console for logs starting with `[form]`, `[api]`
5. Check server console for logs starting with `[lead]`, `[parse]`

## Production Deployment

### Docker

Build the image:
```bash
docker build -t zygn-audit-flow .
```

Run with environment variables:
```bash
docker run -p 4173:4173 \
  -e DESK_API_KEY="your_desk_project_api_key" \
  -e DESK_URL="https://deskbackend.getnos.io/v1/lead" \
  zygn-audit-flow
```

### Verify Configuration

After deployment, verify the API key is working:

```bash
curl https://your-domain/api/health
```

Expected response when key is valid:
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

## API Endpoints

### POST /api/submit-lead
Submit a lead form with the following JSON body:

```json
{
  "form_type": "flow",
  "full_name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "country_code": "+91",
  "studio_name": "My Studio",
  "studio_city": "Bangalore",
  "role": "owner",
  "team": "s5",
  "projects": "architecture",
  "business_type": "architecture",
  "modules": ["planning", "budgeting"],
  "tools": "software",
  "timeline": "immediate",
  "budget": "yes"
}
```

### GET /api/health
Check service health and Desk API key configuration.

Query parameters:
- `?check=1` - Force a fresh Desk key validation (rate limited to 1 per 15 seconds)

## Troubleshooting

### "Desk API key check: FAILED"
- Verify the `DESK_API_KEY` value is correct
- Check there are no trailing spaces or special characters in the key
- Ensure the key has not expired

### Form submission shows "Network error"
- Check browser DevTools Network tab for the request to `/api/submit-lead`
- Verify the server is running and accessible
- Check server logs for detailed error messages

### Lead not appearing in Desk
- Verify the Desk key is valid by checking `/api/health`
- Check server logs for any errors during submission
- Ensure all required fields are filled in the form

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DESK_API_KEY` | Yes | - | Getnos Desk API key for lead submission |
| `DESK_URL` | No | `https://deskbackend.getnos.io/v1/lead` | Desk API endpoint URL |
| `PORT` | No | `4173` | Server port |
| `NODE_ENV` | No | `development` | Node environment |
