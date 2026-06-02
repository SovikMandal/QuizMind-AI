#!/bin/bash

# 🚀 QuizMind AI - Pre-Deployment Checklist
# Run this before deploying to production

echo ""
echo "🚀 QuizMind AI - Pre-Deployment Checklist"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
echo "📦 Checking Node.js version..."
if command_exists node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        echo -e "${GREEN}✓ Node.js $NODE_VERSION installed${NC}"
    else
        echo -e "${RED}✗ Node.js 20+ required (found v$NODE_VERSION)${NC}"
        ERRORS=$((ERRORS+1))
    fi
else
    echo -e "${RED}✗ Node.js not installed${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check npm
echo "📦 Checking npm..."
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ npm $NPM_VERSION installed${NC}"
else
    echo -e "${RED}✗ npm not installed${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check if dependencies are installed
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Root dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Run: npm install${NC}"
fi

if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Run: cd backend && npm install${NC}"
fi

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Run: cd frontend && npm install${NC}"
fi

# Check environment files
echo ""
echo "🔐 Checking environment files..."
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ backend/.env exists${NC}"
else
    echo -e "${YELLOW}⚠ backend/.env not found (create from .env.example)${NC}"
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓ frontend/.env exists${NC}"
else
    echo -e "${YELLOW}⚠ frontend/.env not found${NC}"
fi

# Check if Git is initialized
echo ""
echo "📝 Checking Git..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✓ Git repository initialized${NC}"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠ You have uncommitted changes${NC}"
    else
        echo -e "${GREEN}✓ No uncommitted changes${NC}"
    fi
    
    # Check current branch
    BRANCH=$(git branch --show-current)
    echo -e "  Current branch: ${YELLOW}$BRANCH${NC}"
else
    echo -e "${RED}✗ Not a Git repository${NC}"
    echo "  Run: git init && git add . && git commit -m 'Initial commit'"
    ERRORS=$((ERRORS+1))
fi

# Check TypeScript compilation
echo ""
echo "🔨 Checking TypeScript compilation..."
echo "  Backend..."
cd backend
if npm run typecheck 2>&1 | grep -q "error TS"; then
    echo -e "${RED}✗ Backend TypeScript errors found${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✓ Backend TypeScript OK${NC}"
fi
cd ..

echo "  Frontend..."
cd frontend
if npm run typecheck 2>&1 | grep -q "error TS"; then
    echo -e "${RED}✗ Frontend TypeScript errors found${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✓ Frontend TypeScript OK${NC}"
fi
cd ..

# Check if builds work
echo ""
echo "🏗️  Testing builds..."
echo "  Backend..."
cd backend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend builds successfully${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    ERRORS=$((ERRORS+1))
fi
cd ..

echo "  Frontend..."
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend builds successfully${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    ERRORS=$((ERRORS+1))
fi
cd ..

# Check documentation
echo ""
echo "📚 Checking documentation..."
DOCS=("README.md" "DEPLOYMENT.md" "DEPLOYMENT_CHECKLIST.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓ $doc exists${NC}"
    else
        echo -e "${YELLOW}⚠ $doc not found${NC}"
    fi
done

# Summary
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Review DEPLOYMENT.md"
    echo "  2. Set up all services (Neon, Upstash, etc.)"
    echo "  3. Push to GitHub"
    echo "  4. Deploy backend to Render"
    echo "  5. Deploy frontend to Vercel"
    echo ""
    echo "🚀 Ready to deploy!"
else
    echo -e "${RED}❌ Found $ERRORS error(s)${NC}"
    echo ""
    echo "Please fix the errors above before deploying."
fi
echo "=========================================="
echo ""
