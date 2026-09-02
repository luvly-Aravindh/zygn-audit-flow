@echo off
REM Simple test script for form submission API
REM Usage: test-form-api.bat [endpoint_url]

setlocal enabledelayedexpansion

if "%1"=="" (
    set "ENDPOINT=http://localhost:4173/api/submit-lead"
) else (
    set "ENDPOINT=%1"
)

for /F "tokens=* delims=/" %%A in ("%ENDPOINT%") do set "BASE_URL=%%A/%%B"
set "HEALTH_ENDPOINT=%BASE_URL%/api/health"

echo.
echo ==========================================
echo Form Submission API Test
echo ==========================================
echo.

REM Check if health endpoint is working
echo 1. Checking API health...
echo    URL: %HEALTH_ENDPOINT%
echo.

for /F %%A in ('powershell -NoProfile -Command "(irm '%HEALTH_ENDPOINT%' -ErrorAction SilentlyContinue | ConvertTo-Json | Select-String 'ok' -AllMatches | ForEach-Object {$_.Matches[0].Value}) -replace 'ok', '' -replace ':', '' -replace '"' , '' -replace ' ', ''" 2^>nul') do set "OK_STATUS=%%A"

if "!OK_STATUS!"=="true" (
    echo    Response: API is healthy
    echo.
    echo ✓ API health check passed
) else (
    echo    Response: API health check failed
    echo.
    echo ✗ API health check failed. Desk API key may not be configured correctly.
    echo.
    echo Fix: Set DESK_API_KEY environment variable with a valid key
    goto end
)

echo.

REM Test form submission
echo 2. Testing form submission...
echo    URL: %ENDPOINT%
echo.

echo    Sending test data...

powershell -NoProfile -Command "
\$data = @{
    form_type = 'flow'
    full_name = 'Test User'
    email = 'test@example.com'
    mobile = '9876543210'
    country_code = '+91'
    studio_name = 'Test Studio'
    studio_city = 'Bangalore'
    role = 'owner'
    team = 's5'
    projects = 'architecture'
    business_type = 'architecture'
    modules = @('planning', 'budgeting')
    tools = 'software'
    timeline = 'immediate'
    budget = 'yes'
} | ConvertTo-Json

\$response = irm '%ENDPOINT%' -Method Post -ContentType 'application/json' -Body \$data -ErrorAction SilentlyContinue

Write-Host '    Response: ' + (\$response | ConvertTo-Json -Compress)

\$status = \$response.status
\$message = \$response.message
\$leadId = \$response.leadId

if (\$status -eq 'success') {
    Write-Host ''
    Write-Host '✓ Form submission successful!'
    if (\$leadId) {
        Write-Host '    Lead ID: ' + \$leadId
    }
} else {
    Write-Host ''
    Write-Host '✗ Form submission failed'
    Write-Host '    Status: ' + \$status
    Write-Host '    Message: ' + \$message
    Write-Host ''
    Write-Host 'Possible causes:'
    Write-Host '  - Email validation failed (must be valid format)'
    Write-Host '  - Phone number validation failed (must be 10+ digits)'
    Write-Host '  - Name validation failed (must be 2+ characters)'
    Write-Host '  - Desk API key is invalid or expired'
    exit 1
}
"

echo.
echo ==========================================
echo Test completed successfully!
echo ==========================================

:end
endlocal
