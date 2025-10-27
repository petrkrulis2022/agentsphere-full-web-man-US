#!/bin/bash

# Quick File Organization Script
# Organizes the most frequently used files into the organized structure

echo "🚀 Quick Organization: Moving most important files..."

ORGANIZED_DIR="organized-files"

# Create essential directories
mkdir -p "$ORGANIZED_DIR/scripts/database-queries"
mkdir -p "$ORGANIZED_DIR/scripts/database-management" 
mkdir -p "$ORGANIZED_DIR/scripts/development-testing"
mkdir -p "$ORGANIZED_DIR/database/migrations"
mkdir -p "$ORGANIZED_DIR/database/constraints"
mkdir -p "$ORGANIZED_DIR/database/debugging"
mkdir -p "$ORGANIZED_DIR/documentation/integration-guides/revolut"
mkdir -p "$ORGANIZED_DIR/documentation/ar-viewer"

# Move most important database query scripts
echo "📊 Moving database query scripts..."
cp query-deployed-objects.js "$ORGANIZED_DIR/scripts/database-queries/" 2>/dev/null
cp test-supabase-connection.js "$ORGANIZED_DIR/scripts/database-queries/" 2>/dev/null
cp count-deployed-objects.js "$ORGANIZED_DIR/scripts/database-queries/" 2>/dev/null
cp list-all-simple.js "$ORGANIZED_DIR/scripts/database-queries/" 2>/dev/null

# Move database management scripts
echo "⚙️ Moving database management scripts..."
cp apply_migration.js "$ORGANIZED_DIR/scripts/database-management/" 2>/dev/null
cp apply_wallet_migration*.js "$ORGANIZED_DIR/scripts/database-management/" 2>/dev/null
cp check_*.js "$ORGANIZED_DIR/scripts/database-management/" 2>/dev/null

# Move development testing scripts
echo "🧪 Moving development testing scripts..."
cp ar-viewer-diagnostics.js "$ORGANIZED_DIR/scripts/development-testing/" 2>/dev/null
cp verify_wallet_integration.js "$ORGANIZED_DIR/scripts/development-testing/" 2>/dev/null
cp server.js "$ORGANIZED_DIR/scripts/development-testing/" 2>/dev/null

# Move important SQL files
echo "🗄️ Moving important SQL files..."
cp database_setup.sql "$ORGANIZED_DIR/database/migrations/" 2>/dev/null
cp manual_migration.sql "$ORGANIZED_DIR/database/migrations/" 2>/dev/null
cp final_clean_solution.sql "$ORGANIZED_DIR/database/migrations/" 2>/dev/null

# Move constraint files
cp fix_network_constraint_final.sql "$ORGANIZED_DIR/database/constraints/" 2>/dev/null
cp fix_all_network_constraints.sql "$ORGANIZED_DIR/database/constraints/" 2>/dev/null
cp fix_agent_types_constraint.sql "$ORGANIZED_DIR/database/constraints/" 2>/dev/null

# Move debugging files
cp debug_agent_fees.sql "$ORGANIZED_DIR/database/debugging/" 2>/dev/null
cp test_supabase_*.sql "$ORGANIZED_DIR/database/debugging/" 2>/dev/null
cp check_*.sql "$ORGANIZED_DIR/database/debugging/" 2>/dev/null

# Move key Revolut documentation
echo "📝 Moving Revolut documentation..."
cp REVOLUT_INTEGRATION_COMPLETE_GUIDE.md "$ORGANIZED_DIR/documentation/integration-guides/revolut/" 2>/dev/null
cp REVOLUT_API_DOCUMENTATION.md "$ORGANIZED_DIR/documentation/integration-guides/revolut/" 2>/dev/null
cp REVOLUT_SANDBOX_TESTING_GUIDE.md "$ORGANIZED_DIR/documentation/integration-guides/revolut/" 2>/dev/null
cp REVOLUT_QUICK_REFERENCE.md "$ORGANIZED_DIR/documentation/integration-guides/revolut/" 2>/dev/null

# Move AR Viewer documentation
echo "👓 Moving AR Viewer documentation..."
cp AR_VIEWER_*.md "$ORGANIZED_DIR/documentation/ar-viewer/" 2>/dev/null

# Create quick access index
cat > "$ORGANIZED_DIR/QUICK_ACCESS_INDEX.md" << 'EOF'
# Quick Access Index

## 🔥 Most Frequently Used Files

### Database Query Scripts
- `scripts/database-queries/query-deployed-objects.js` - **Main database querying script**
- `scripts/database-queries/test-supabase-connection.js` - **Connection testing**
- `scripts/database-queries/count-deployed-objects.js` - Count objects
- `scripts/database-queries/list-all-simple.js` - Simple listing

### Database Management
- `scripts/database-management/apply_migration.js` - **Primary migration script**
- `scripts/database-management/check_db_structure.js` - Database structure check
- `scripts/database-management/apply_wallet_migration_v2.js` - Latest wallet migration

### Development Tools
- `scripts/development-testing/ar-viewer-diagnostics.js` - **AR Viewer diagnostics**
- `scripts/development-testing/verify_wallet_integration.js` - Wallet verification
- `scripts/development-testing/server.js` - Development server

### Key Documentation
- `documentation/integration-guides/revolut/REVOLUT_INTEGRATION_COMPLETE_GUIDE.md` - **Complete Revolut guide**
- `documentation/ar-viewer/AR_VIEWER_TROUBLESHOOTING_PROMPT.md` - **AR troubleshooting**
- `documentation/integration-guides/revolut/REVOLUT_SANDBOX_TESTING_GUIDE.md` - Revolut testing

### Database Files
- `database/migrations/database_setup.sql` - **Initial database setup**
- `database/migrations/final_clean_solution.sql` - **Final migration solution**
- `database/constraints/fix_network_constraint_final.sql` - **Network constraint fix**
- `database/debugging/debug_agent_fees.sql` - **Agent fee debugging**

## 🎯 Quick Commands

### Run Database Query
```bash
node organized-files/scripts/database-queries/query-deployed-objects.js
```

### Test Database Connection
```bash
node organized-files/scripts/database-queries/test-supabase-connection.js
```

### Run AR Viewer Diagnostics
```bash
node organized-files/scripts/development-testing/ar-viewer-diagnostics.js
```

### Apply Database Migration
```bash
node organized-files/scripts/database-management/apply_migration.js
```

---
*Quick access to the most important AgentSphere files*
EOF

echo "✅ Quick organization completed!"
echo "📂 Most important files organized in: $ORGANIZED_DIR/"
echo "🔥 Check QUICK_ACCESS_INDEX.md for easy access to key files"
echo ""
echo "📊 File counts:"
echo "  Scripts: $(find $ORGANIZED_DIR/scripts -name "*.js" 2>/dev/null | wc -l) files"
echo "  Database: $(find $ORGANIZED_DIR/database -name "*.sql" 2>/dev/null | wc -l) files"
echo "  Documentation: $(find $ORGANIZED_DIR/documentation -name "*.md" 2>/dev/null | wc -l) files"