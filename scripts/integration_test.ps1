<#
PowerShell integration test for CYBERWAIT (Windows)

What it does:
- Starts a Postgres Docker container (name: cyberwait-test-db) on port 5433
- Copies and applies `backend/database.sql` and runs migrations with `npm run migrate --prefix backend`
- Starts the backend server (npm start in backend) in background
- POSTs a test order to the API (Visa, masked last4 expected)
- Queries the DB to verify the inserted order
- Cleans up the Docker container and stops the backend server

Prereqs:
- Docker Desktop installed and running
- Node.js & npm installed
- From project root

Usage: Open PowerShell as Administrator and run:
.
#>

param(
    [string]$PostgresPassword = 'postgres',
    [int]$HostPort = 5433,
    [int]$ApiPort = 5000
)

$ErrorActionPreference = 'Stop'
$containerName = 'cyberwait-test-db'

function Ensure-Docker {
    try {
        docker version > $null 2>&1
        return $true
    } catch {
        Write-Error "Docker doesn't appear to be installed or running. Please install Docker Desktop and start it."
        exit 1
    }
}

Ensure-Docker

# Stop/remove existing container if present
try { docker rm -f $containerName -v > $null 2>&1 } catch {}

Write-Host "Starting Postgres container..."
docker run --name $containerName -e POSTGRES_PASSWORD=$PostgresPassword -e POSTGRES_DB=cyberwait -p $HostPort:5432 -d postgres:15 | Out-Null

Write-Host "Waiting for Postgres to accept connections..."
$tries = 0
while ($tries -lt 30) {
    try {
        docker exec -i $containerName pg_isready -U postgres -d cyberwait | Out-Null
        Write-Host "Postgres is ready."
        break
    } catch {
        Start-Sleep -Seconds 2
        $tries++
    }
}
if ($tries -ge 30) { Write-Error "Postgres did not become ready in time."; docker logs $containerName; exit 1 }

Write-Host "Copying database schema into container and applying..."
docker cp backend/database.sql $containerName:/tmp/database.sql
docker exec -i $containerName psql -U postgres -d cyberwait -f /tmp/database.sql

# Run backend migrations via npm runner (requires DATABASE_URL)
$env:DATABASE_URL = "postgresql://postgres:$PostgresPassword@localhost:$HostPort/cyberwait"
Write-Host "Running backend migrations via npm..."
npm run migrate --prefix backend

# Start backend server in background
Write-Host "Starting backend server (in background)..."
$backendStartInfo = New-Object System.Diagnostics.ProcessStartInfo
$backendStartInfo.FileName = 'cmd.exe'
$backendStartInfo.Arguments = "/c cd backend && npm start"
$backendStartInfo.WorkingDirectory = (Resolve-Path .).Path
$backendStartInfo.RedirectStandardOutput = $true
$backendStartInfo.RedirectStandardError = $true
$backendStartInfo.UseShellExecute = $false
$backendStartInfo.CreateNoWindow = $true
$backendProc = New-Object System.Diagnostics.Process
$backendProc.StartInfo = $backendStartInfo
$backendProc.Start() | Out-Null
Start-Sleep -Seconds 4

# Check backend is up
$tries = 0
while ($tries -lt 20) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:$ApiPort/api/menu" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "Backend responded."
        break
    } catch {
        Start-Sleep -Seconds 1
        $tries++
    }
}
if ($tries -ge 20) { Write-Error "Backend did not start in time. Check backend logs."; $backendProc.Kill(); docker logs $containerName; exit 1 }

# POST a test order
$payload = @{
    cart = @( @{ item = @{ id = 1; price = 1.00 }; quantity = 1 } )
    paymentMethod = 'visa'
    total = 1.00
    cardLast4 = '9999'
    cardExpiry = '01/30'
} | ConvertTo-Json -Depth 6

Write-Host "Posting test order to API..."
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:$ApiPort/api/orders" -Method POST -ContentType 'application/json' -Body $payload -ErrorAction Stop
    Write-Host "API response: " -NoNewline; $resp | ConvertTo-Json
} catch {
    Write-Error "Failed to POST to API: $_"; $backendProc.Kill(); docker logs $containerName; exit 1
}

# Query DB for inserted order
Write-Host "Querying DB for the most recent order..."
$psqlCmd = "SELECT id, order_number, total, payment_method, card_last4, card_expiry, created_at FROM orders ORDER BY created_at DESC LIMIT 1;"
try {
    $out = docker exec -i $containerName psql -U postgres -d cyberwait -t -c "$psqlCmd"
    Write-Host "DB query result:`n$out"
} catch {
    Write-Error "Failed to query DB: $_"
}

# Cleanup
Write-Host "Stopping backend and removing container..."
try { $backendProc.Kill() } catch {}
docker rm -f $containerName -v | Out-Null
Write-Host "Integration test completed. If the DB row above shows your order (card_last4 and total), the persistence worked."