# Database Reset Script
# Run this if you need to reset the database

Write-Host "🗑️  Resetting database..." -ForegroundColor Yellow

# Check if database exists
if (Test-Path "backend\plinko.db") {
    try {
        Remove-Item "backend\plinko.db" -Force -ErrorAction Stop
        Write-Host "✅ Database deleted successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Database is locked. Please stop the server first (Ctrl+C), then run this script again." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  No database file found" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the server: npm run dev" -ForegroundColor White
Write-Host "2. The database will be recreated with the new schema" -ForegroundColor White
