param(
  [string]$ServiceUrl = "http://localhost:4004",
  [ValidateSet("error","latency","none")]
  [string]$Mode = "error",
  [int]$DurationSeconds = 60
)

$body = @{
  mode = $Mode
  durationSeconds = $DurationSeconds
} | ConvertTo-Json

Write-Host "Simulating incident on $ServiceUrl for $DurationSeconds s (mode=$Mode)..."

Invoke-RestMethod -Method Post -Uri "$ServiceUrl/admin/simulate-failure" -ContentType "application/json" -Body $body

