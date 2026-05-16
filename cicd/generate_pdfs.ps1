<#
Generate PDFs from deliverables using Pandoc (requires pandoc and wkhtmltopdf or LaTeX)

Usage:
  ./cicd/generate_pdfs.ps1

Set-StrictMode -Version Latest

if (-not (Get-Command pandoc -ErrorAction SilentlyContinue)) {
  Write-Host "Pandoc not found. Install pandoc to generate PDFs." -ForegroundColor Yellow
  exit 1
}

$reportMd = "$(Resolve-Path ..\deliverables\REPORT.md)"
$presentationMd = "$(Resolve-Path ..\deliverables\PRESENTATION.md)"

pandoc $reportMd -o ..\deliverables\REPORT.pdf
pandoc $presentationMd -o ..\deliverables\PRESENTATION.pdf

Write-Host "Generated REPORT.pdf and PRESENTATION.pdf in deliverables/" -ForegroundColor Green
#>
