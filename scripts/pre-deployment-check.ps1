# 🚀 QuizMind AI - Pre-Deployment Checklist (Windows)
# Run with: .\scripts\pre-deployment-check.ps1

Write-Host ""
Write-Host "🚀 QuizMind AI - Pre-Deployment Checklist" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$ERRORS = 0

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -ge 20) {
        Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Node.js 20+ required (found $nodeVersion)" -ForegroundColor Red
        $ERRORS++
    }
} catch {
    Write-Host "✗ Node.js not installed" -ForegroundColor Red
    $ERRORS++
}

# Check npm
Write-Host "📦 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "✓ npm $npmVersion installed" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not installed" -ForegroundColor Red
    $ERRORS++
}

# Check dependencies
Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Root dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Run: npm install" -ForegroundColor DarkYellow
}

if (Test-Path "backend/node_modules") {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Run: cd backend && npm install" -ForegroundColor DarkYellow
}

if (Test-Path "frontend/node_modules") {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Run: cd frontend && npm install" -ForegroundColor DarkYellow
}

# Check environment files
Write-Host ""
Write-Host "🔐 Checking environment files..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    Write-Host "✓ backend/.env exists" -ForegroundColor Green
} else {
    Write-Host "⚠ backend/.env not found (create from .env.example)" -ForegroundColor DarkYellow
}

if (Test-Path "frontend/.env") {
    Write-Host "✓ frontend/.env exists" -ForegroundColor Green
} else {
    Write-Host "⚠ frontend/.env not found" -ForegroundColor DarkYellow
}

# Check Git
Write-Host ""
Write-Host "📝 Checking Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
    
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "⚠ You have uncommitted changes" -ForegroundColor DarkYellow
    } else {
        Write-Host "✓ No uncommitted changes" -ForegroundColor Green
    }
    
    $branch = git branch --show-current
    Write-Host "  Current branch: $branch" -ForegroundColor DarkYellow
} else {
    Write-Host "✗ Not a Git repository" -ForegroundColor Red
    Write-Host "  Run: git init && git add . && git commit -m 'Initial commit'"
    $ERRORS++
}

# Check TypeScript
Write-Host ""
Write-Host "🔨 Checking TypeScript compilation..." -ForegroundColor Yellow
Write-Host "  Backend..."
Push-Location backend
$backendCheck = npm run typecheck 2>&1 | Out-String
if ($backendCheck -match "error TS") {
    Write-Host "✗ Backend TypeScript errors found" -ForegroundColor Red
    $ERRORS++
} else {
    Write-Host "✓ Backend TypeScript OK" -ForegroundColor Green
}
Pop-Location

Write-Host "  Frontend..."
Push-Location frontend
$frontendCheck = npm run typecheck 2>&1 | Out-String
if ($frontendCheck -match "error TS") {
    Write-Host "✗ Frontend TypeScript errors found" -ForegroundColor Red
    $ERRORS++
} else {
    Write-Host "✓ Frontend TypeScript OK" -ForegroundColor Green
}
Pop-Location

# Check builds
Write-Host ""
Write-Host "🏗️  Testing builds..." -ForegroundColor Yellow
Write-Host "  Backend..."
Push-Location backend
try {
    npm run build > $null 2>&1
    Write-Host "✓ Backend builds successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend build failed" -ForegroundColor Red
    $ERRORS++
}
Pop-Location

Write-Host "  Frontend..."
Push-Location frontend
try {
    npm run build > $null 2>&1
    Write-Host "✓ Frontend builds successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend build failed" -ForegroundColor Red
    $ERRORS++
}
Pop-Location

# Check documentation
Write-Host ""
Write-Host "📚 Checking documentation..." -ForegroundColor Yellow
$docs = @("README.md", "DEPLOYMENT.md", "DEPLOYMENT_CHECKLIST.md")
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "✓ $doc exists" -ForegroundColor Green
    } else {
        Write-Host "⚠ $doc not found" -ForegroundColor DarkYellow
    }
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
if ($ERRORS -eq 0) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:"
    Write-Host "  1. Review DEPLOYMENT.md"
    Write-Host "  2. Set up all services (Neon, Upstash, etc.)"
    Write-Host "  3. Push to GitHub"
    Write-Host "  4. Deploy backend to Render"
    Write-Host "  5. Deploy frontend to Vercel"
    Write-Host ""
    Write-Host "🚀 Ready to deploy!" -ForegroundColor Green
} else {
    Write-Host "❌ Found $ERRORS error(s)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above before deploying."
}
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
