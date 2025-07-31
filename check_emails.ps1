# Email checking script for CoachLink
Write-Host "=== CoachLink Email Status Checker ===" -ForegroundColor Cyan
Write-Host ""

# List of test emails to check
$emails = @(
    "john.doe@example.com",
    "test@newuser.com", 
    "nonexistent@example.com",
    "coach1@example.com",
    "coach2@example.com",
    "existing@test.com",
    "new@user.com"
)

Write-Host "Checking emails in CoachLink system:" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow

foreach ($email in $emails) {
    Write-Host "Checking $email: " -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/stripe/check-email?email=$email" -Method GET
        
        if ($response.registered -eq $true) {
            switch ($response.status) {
                "complete" { 
                    Write-Host "✅ EXISTS (Complete)" -ForegroundColor Green
                    if ($response.name) {
                        Write-Host "   Name: $($response.name)" -ForegroundColor Gray
                    }
                }
                "incomplete" { 
                    Write-Host "⚠️  EXISTS (Incomplete)" -ForegroundColor Yellow 
                    if ($response.name) {
                        Write-Host "   Name: $($response.name)" -ForegroundColor Gray
                    }
                }
                default { 
                    Write-Host "❓ EXISTS (Status: $($response.status))" -ForegroundColor Magenta 
                }
            }
            if ($response.accountId) {
                Write-Host "   Account ID: $($response.accountId)" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ NOT REGISTERED" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Stripe CLI Account Check ===" -ForegroundColor Cyan
Write-Host "Using Stripe CLI to list connected accounts:" -ForegroundColor Yellow

# Run Stripe CLI command
try {
    & stripe accounts list --limit=10
}
catch {
    Write-Host "Error running Stripe CLI: $($_.Exception.Message)" -ForegroundColor Red
}
