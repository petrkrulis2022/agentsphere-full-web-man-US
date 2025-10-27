#!/bin/bash

# AgentSphere File Organization Script
# This script organizes files across all branches into logical categories

echo "🗂️  Starting AgentSphere File Organization..."

# Create base organization structure
ORGANIZED_DIR="organized-files"
BASE_DIR="/home/petrunix/agentsphere-full-web-man-US/agent-sphere-1-duplication-AR-QR-USECASE"

# Documentation organization
echo "📝 Organizing Documentation Files..."

# Project Overview Documentation
echo "  📋 Project Overview..."
mkdir -p "$ORGANIZED_DIR/documentation/project-overview"
cp -n *.md "$ORGANIZED_DIR/documentation/project-overview/" 2>/dev/null || true

# API Documentation  
echo "  🌐 API Documentation..."
mkdir -p "$ORGANIZED_DIR/documentation/api-docs"
find . -name "*API*" -name "*.md" -exec cp {} "$ORGANIZED_DIR/documentation/api-docs/" \; 2>/dev/null || true

# Integration Guides
echo "  🔗 Integration Guides..."
mkdir -p "$ORGANIZED_DIR/documentation/integration-guides"
find . -name "*INTEGRATION*" -name "*.md" -exec cp {} "$ORGANIZED_DIR/documentation/integration-guides/" \; 2>/dev/null || true
find . -name "*REVOLUT*" -name "*.md" -exec cp {} "$ORGANIZED_DIR/documentation/integration-guides/" \; 2>/dev/null || true

# AR Viewer Documentation
echo "  👓 AR Viewer Documentation..."
mkdir -p "$ORGANIZED_DIR/documentation/ar-viewer"
find . -name "*AR_VIEWER*" -name "*.md" -exec cp {} "$ORGANIZED_DIR/documentation/ar-viewer/" \; 2>/dev/null || true

# Troubleshooting Documentation
echo "  🔧 Troubleshooting Documentation..."
mkdir -p "$ORGANIZED_DIR/documentation/troubleshooting"
find . -name "*FIX*" -name "*.md" -exec cp {} "$ORGANIZED_DIR/documentation/troubleshooting/" \; 2>/dev/null || true
find . -name "*TROUBLESHOOTING*" -name "*.md" -exec cp {} "$ORGANIZED_DIR/documentation/troubleshooting/" \; 2>/dev/null || true

# Script organization
echo "🔧 Organizing Script Files..."

# Database Query Scripts
echo "  🗄️ Database Query Scripts..."
mkdir -p "$ORGANIZED_DIR/scripts/database-queries"
cp query-*.js "$ORGANIZED_DIR/scripts/database-queries/" 2>/dev/null || true
cp list-*.js "$ORGANIZED_DIR/scripts/database-queries/" 2>/dev/null || true
cp count-*.js "$ORGANIZED_DIR/scripts/database-queries/" 2>/dev/null || true
cp test-supabase-*.js "$ORGANIZED_DIR/scripts/database-queries/" 2>/dev/null || true

# Database Management Scripts
echo "  ⚙️ Database Management Scripts..."
mkdir -p "$ORGANIZED_DIR/scripts/database-management"
cp apply_*.js "$ORGANIZED_DIR/scripts/database-management/" 2>/dev/null || true
cp check_*.js "$ORGANIZED_DIR/scripts/database-management/" 2>/dev/null || true

# Development & Testing Scripts
echo "  🧪 Development & Testing Scripts..."
mkdir -p "$ORGANIZED_DIR/scripts/development-testing"
cp ar-viewer-*.js "$ORGANIZED_DIR/scripts/development-testing/" 2>/dev/null || true
cp verify_*.js "$ORGANIZED_DIR/scripts/development-testing/" 2>/dev/null || true
cp server.js "$ORGANIZED_DIR/scripts/development-testing/" 2>/dev/null || true
cp create-*.js "$ORGANIZED_DIR/scripts/development-testing/" 2>/dev/null || true

# Configuration Scripts
echo "  ⚙️ Configuration Scripts..."
mkdir -p "$ORGANIZED_DIR/scripts/configuration"
cp *.config.js "$ORGANIZED_DIR/scripts/configuration/" 2>/dev/null || true

# Database organization
echo "🗄️ Organizing Database Files..."

# Schema Setup
echo "  🏗️ Schema Setup..."
mkdir -p "$ORGANIZED_DIR/database/schema-setup"
cp database_setup.sql "$ORGANIZED_DIR/database/schema-setup/" 2>/dev/null || true
cp create_table.sql "$ORGANIZED_DIR/database/schema-setup/" 2>/dev/null || true
cp *schema*.sql "$ORGANIZED_DIR/database/schema-setup/" 2>/dev/null || true

# Migrations
echo "  🔄 Migrations..."
mkdir -p "$ORGANIZED_DIR/database/migrations"
cp *migration*.sql "$ORGANIZED_DIR/database/migrations/" 2>/dev/null || true
cp apply_*.sql "$ORGANIZED_DIR/database/migrations/" 2>/dev/null || true

# Constraints
echo "  🔒 Constraints..."
mkdir -p "$ORGANIZED_DIR/database/constraints"
cp fix_*constraint*.sql "$ORGANIZED_DIR/database/constraints/" 2>/dev/null || true
cp *constraint*.sql "$ORGANIZED_DIR/database/constraints/" 2>/dev/null || true

# Debugging & Testing
echo "  🔍 Debugging & Testing..."
mkdir -p "$ORGANIZED_DIR/database/debugging"
cp debug_*.sql "$ORGANIZED_DIR/database/debugging/" 2>/dev/null || true
cp test_*.sql "$ORGANIZED_DIR/database/debugging/" 2>/dev/null || true
cp check_*.sql "$ORGANIZED_DIR/database/debugging/" 2>/dev/null || true

# Quick Fixes
echo "  ⚡ Quick Fixes..."
mkdir -p "$ORGANIZED_DIR/database/quick-fixes"
cp quick_*.sql "$ORGANIZED_DIR/database/quick-fixes/" 2>/dev/null || true

# Create file inventory
echo "📊 Creating File Inventory..."

cat > "$ORGANIZED_DIR/FILE_INVENTORY.md" << 'EOF'
# AgentSphere File Inventory

## 📊 File Count Summary

### Documentation Files
- **Project Overview**: $(find organized-files/documentation/project-overview -name "*.md" | wc -l) files
- **API Documentation**: $(find organized-files/documentation/api-docs -name "*.md" | wc -l) files  
- **Integration Guides**: $(find organized-files/documentation/integration-guides -name "*.md" | wc -l) files
- **AR Viewer Docs**: $(find organized-files/documentation/ar-viewer -name "*.md" | wc -l) files
- **Troubleshooting**: $(find organized-files/documentation/troubleshooting -name "*.md" | wc -l) files

### Script Files  
- **Database Queries**: $(find organized-files/scripts/database-queries -name "*.js" | wc -l) files
- **Database Management**: $(find organized-files/scripts/database-management -name "*.js" | wc -l) files
- **Development & Testing**: $(find organized-files/scripts/development-testing -name "*.js" | wc -l) files
- **Configuration**: $(find organized-files/scripts/configuration -name "*.js" | wc -l) files

### Database Files
- **Schema Setup**: $(find organized-files/database/schema-setup -name "*.sql" | wc -l) files
- **Migrations**: $(find organized-files/database/migrations -name "*.sql" | wc -l) files
- **Constraints**: $(find organized-files/database/constraints -name "*.sql" | wc -l) files
- **Debugging**: $(find organized-files/database/debugging -name "*.sql" | wc -l) files
- **Quick Fixes**: $(find organized-files/database/quick-fixes -name "*.sql" | wc -l) files

## 🎯 Organization Status

✅ **Completed**: File organization structure created
✅ **Completed**: Files copied to organized structure  
✅ **Completed**: Inventory documentation created
📝 **Next**: Review and validate organization
🔄 **Future**: Establish naming conventions for new files

---
*Generated on: $(date)*
EOF

echo "✅ File organization completed!"
echo "📁 Organized files are available in: $ORGANIZED_DIR/"
echo "📊 Check FILE_INVENTORY.md for detailed file counts"
echo "📖 See FILE_ORGANIZATION_STRUCTURE.md for complete documentation"