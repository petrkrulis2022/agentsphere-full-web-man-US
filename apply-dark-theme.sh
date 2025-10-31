#!/bin/bash

# Dark Theme Update Script for AgentSphere
# Applies dark theme colors across all branches except ar-hub

set -e

REPO_DIR="/home/petrunix/agentsphere-full-web-man-US/agent-sphere-1-duplication-AR-QR-USECASE"
cd "$REPO_DIR"

# Branches to update (excluding ar-hub)
BRANCHES=("revolut-pay-sim" "main" "revolut-pay" "cross-platform-payments" "feature/hedera-wallet-integration" "feature/solana-wallet-integration")

echo "🎨 Starting Dark Theme Update for AgentSphere..."
echo "================================================"

# Function to apply color replacements
apply_dark_theme() {
    echo "📝 Applying dark theme to src/components/**/*.tsx files..."
    
    # Find all .tsx files in src/components
    find src/components -name "*.tsx" -type f | while read -r file; do
        echo "  Processing: $file"
        
        # Background replacements
        sed -i 's/bg-white\b/bg-slate-800\/90 backdrop-blur-sm/g' "$file"
        sed -i 's/bg-gray-50\b/bg-slate-700\/50 backdrop-blur-sm/g' "$file"
        sed -i 's/bg-gray-100\b/bg-slate-700\/30/g' "$file"
        sed -i 's/bg-green-50\b/bg-green-500\/10/g' "$file"
        sed -i 's/bg-blue-50\b/bg-blue-500\/10/g' "$file"
        sed -i 's/bg-red-50\b/bg-red-500\/10/g' "$file"
        sed -i 's/bg-yellow-50\b/bg-yellow-500\/10/g' "$file"
        
        # Text color replacements
        sed -i 's/text-gray-900\b/text-white/g' "$file"
        sed -i 's/text-gray-800\b/text-slate-200/g' "$file"
        sed -i 's/text-gray-700\b/text-slate-300/g' "$file"
        sed -i 's/text-gray-600\b/text-slate-300/g' "$file"
        sed -i 's/text-gray-500\b/text-slate-400/g' "$file"
        sed -i 's/text-gray-400\b/text-slate-400/g' "$file"
        
        # Success text colors
        sed -i 's/text-green-800\b/text-green-300/g' "$file"
        sed -i 's/text-green-700\b/text-green-300/g' "$file"
        sed -i 's/text-green-600\b/text-green-400/g' "$file"
        
        # Info/Blue text colors
        sed -i 's/text-blue-800\b/text-blue-300/g' "$file"
        sed -i 's/text-blue-700\b/text-blue-300/g' "$file"
        sed -i 's/text-blue-600\b/text-blue-400/g' "$file"
        
        # Error text colors
        sed -i 's/text-red-800\b/text-red-300/g' "$file"
        sed -i 's/text-red-700\b/text-red-300/g' "$file"
        sed -i 's/text-red-600\b/text-red-400/g' "$file"
        
        # Border replacements
        sed -i 's/border-gray-200\b/border-slate-600/g' "$file"
        sed -i 's/border-gray-300\b/border-slate-600/g' "$file"
        sed -i 's/border-blue-200\b/border-blue-500\/30/g' "$file"
        sed -i 's/border-green-200\b/border-green-500\/30/g' "$file"
        sed -i 's/border-red-200\b/border-red-500\/30/g' "$file"
        sed -i 's/border-yellow-200\b/border-yellow-500\/30/g' "$file"
        
        # Focus ring replacements
        sed -i 's/focus:ring-green-500/focus:ring-blue-500/g' "$file"
        sed -i 's/focus:border-green-500/focus:border-blue-500/g' "$file"
        
        # Input/Form backgrounds
        sed -i 's/\bbg-white border border-gray-300/bg-slate-700\/50 border border-slate-600/g' "$file"
        
        # Placeholder text
        sed -i 's/placeholder-gray-400/placeholder-slate-400/g' "$file"
        sed -i 's/placeholder-gray-500/placeholder-slate-400/g' "$file"
    done
    
    echo "✅ Component files updated"
    
    # Update page files if they exist
    if [ -d "src/pages" ]; then
        echo "📝 Applying dark theme to src/pages/**/*.tsx files..."
        find src/pages -name "*.tsx" -type f | while read -r file; do
            echo "  Processing: $file"
            
            # Apply same replacements to pages
            sed -i 's/bg-white\b/bg-slate-800\/90 backdrop-blur-sm/g' "$file"
            sed -i 's/bg-gray-50\b/bg-slate-700\/50 backdrop-blur-sm/g' "$file"
            sed -i 's/bg-gray-100\b/bg-slate-700\/30/g' "$file"
            sed -i 's/text-gray-900\b/text-white/g' "$file"
            sed -i 's/text-gray-800\b/text-slate-200/g' "$file"
            sed -i 's/text-gray-700\b/text-slate-300/g' "$file"
            sed -i 's/text-gray-600\b/text-slate-300/g' "$file"
            sed -i 's/border-gray-200\b/border-slate-600/g' "$file"
            sed -i 's/border-gray-300\b/border-slate-600/g' "$file"
        done
        echo "✅ Page files updated"
    fi
    
    # Update main App.tsx if it exists
    if [ -f "src/App.tsx" ]; then
        echo "📝 Updating src/App.tsx..."
        sed -i 's/bg-gray-50\b/bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900/g' "src/App.tsx"
        sed -i 's/bg-white\b/bg-slate-800\/90/g' "src/App.tsx"
        echo "✅ App.tsx updated"
    fi
}

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)

# Process each branch
for branch in "${BRANCHES[@]}"; do
    echo ""
    echo "🔄 Switching to branch: $branch"
    echo "================================================"
    
    # Switch to branch
    git checkout "$branch" 2>/dev/null || {
        echo "⚠️  Branch $branch does not exist locally, skipping..."
        continue
    }
    
    # Apply dark theme
    apply_dark_theme
    
    # Check if there are changes
    if [[ -n $(git status -s) ]]; then
        echo "💾 Committing changes to $branch..."
        git add src/
        git commit -m "style: Apply dark theme color scheme

- Update backgrounds to slate-800/900 with backdrop blur
- Update text colors to white/slate variants
- Update borders to slate-600/700
- Update form inputs to dark theme
- Update button focus states to blue
- Maintain green for success states
- Consistent with AR Hub dark theme" || echo "⚠️  Commit failed or no changes to commit"
        
        echo "✅ Changes committed to $branch"
    else
        echo "ℹ️  No changes detected in $branch"
    fi
done

# Return to original branch
echo ""
echo "🔄 Returning to original branch: $CURRENT_BRANCH"
git checkout "$CURRENT_BRANCH"

echo ""
echo "================================================"
echo "✨ Dark theme update complete!"
echo "================================================"
echo ""
echo "Updated branches:"
for branch in "${BRANCHES[@]}"; do
    echo "  ✅ $branch"
done
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff HEAD~1"
echo "  2. Test the application on each branch"
echo "  3. Push changes: git push origin <branch-name>"
echo ""
