#!/bin/bash

# Email checking script for CoachLink
echo "=== CoachLink Email Status Checker ==="
echo ""

# List of test emails to check
emails=(
    "john.doe@example.com"
    "test@newuser.com"
    "nonexistent@example.com"
    "coach1@example.com"
    "coach2@example.com"
    "existing@test.com"
    "new@user.com"
)

echo "Checking emails in CoachLink system:"
echo "=================================="

for email in "${emails[@]}"; do
    echo -n "Checking $email: "
    response=$(curl -s "http://localhost:8080/api/stripe/check-email?email=$email")
    
    # Parse the JSON response (simple grep approach)
    if echo "$response" | grep -q '"registered":true'; then
        if echo "$response" | grep -q '"status":"complete"'; then
            echo "✅ EXISTS (Complete)"
        elif echo "$response" | grep -q '"status":"incomplete"'; then
            echo "⚠️  EXISTS (Incomplete)"
        else
            echo "❓ EXISTS (Status unknown)"
        fi
    else
        echo "❌ NOT REGISTERED"
    fi
done

echo ""
echo "=== Stripe CLI Account Check ==="
echo "Using Stripe CLI to list connected accounts:"
stripe accounts list --limit=10
