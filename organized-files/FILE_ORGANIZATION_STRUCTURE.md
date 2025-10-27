# AgentSphere File Organization Structure

## 📁 **Organized File Structure**

This document provides a comprehensive organization of all files across all branches in the AgentSphere project.

## 🏗️ **Current Branches**

- `main` - Main development branch
- `revolut-pay-sim` - Current working branch with Revolut integration
- `revolut-pay` - Revolut payment integration branch
- `cross-platform-payments` - Cross-platform payment solutions
- `feature/hedera-wallet-integration` - Hedera wallet integration
- `feature/solana-wallet-integration` - Solana wallet integration

## 📂 **File Categories**

### 1. 📝 **Documentation (.md files)**

#### **Project Overview & Planning**

- `AgentSphere_Project_Summary.md` - Main project overview
- `AgentSphere_Technical_Summary.md` - Technical architecture summary
- `README.md` - Project readme
- `UPDATED_PROJECT_PLAN.md` - Updated project planning

#### **API Documentation**

- `API_DOCUMENTATION_POLYGON_AMOY_SOLANA_DEVNET.md` - Polygon/Solana API docs
- `UPDATED_API_DOCUMENTATION.md` - Updated API documentation
- `docs/API_Documentation.md` - Core API documentation
- `docs/ar-viewer/API_Documentation.md` - AR Viewer specific API docs

#### **Integration Guides**

- `REVOLUT_INTEGRATION_COMPLETE_GUIDE.md` - Complete Revolut integration
- `REVOLUT_INTEGRATION_DOCUMENTATION_INDEX.md` - Integration documentation index
- `REVOLUT_API_DOCUMENTATION.md` - Revolut API specific docs
- `REVOLUT_SANDBOX_TESTING_GUIDE.md` - Sandbox testing procedures
- `REVOLUT_QUICK_REFERENCE.md` - Quick reference guide
- `HEDERA_AR_VIEWER_INTEGRATION_PROMPT.md` - Hedera integration guide
- `POLYGON_AMOY_SOLANA_DEVNET_INTEGRATION_SUMMARY.md` - Multi-chain integration

#### **AR Viewer Documentation**

- `AR_VIEWER_3D_MODELS_UPDATE_PROMPT.md` - 3D models update guide
- `AR_VIEWER_DYNAMIC_DEPLOYMENT_UPDATE.md` - Dynamic deployment updates
- `AR_VIEWER_DYNAMIC_PAYMENT_INTEGRATION.md` - Payment integration
- `AR_VIEWER_REAL_TRANSACTIONS_INTEGRATION_PROMPT.md` - Real transactions
- `AR_VIEWER_REVOLUT_INTEGRATION_PROMPT_UPDATED.md` - Updated Revolut integration
- `AR_VIEWER_TROUBLESHOOTING_PROMPT.md` - Troubleshooting guide
- `AR_VIEWER_OBJECT_CHECK_GUIDE.md` - Object checking procedures
- `docs/ar-viewer/` - Complete AR Viewer documentation folder

#### **Implementation & Development**

- `IMPLEMENTATION_SUMMARY.md` - Implementation overview
- `BACKEND_API_SERVER_SETUP.md` - Backend setup guide
- `DYNAMIC_DEPLOYMENT_EXPLANATION.md` - Dynamic deployment system
- `DYNAMIC_PAYMENT_SYSTEM_DOCUMENTATION.md` - Payment system docs
- `PAYMENT_CUBE_SYSTEM_DOCUMENTATION.md` - Payment cube implementation
- `AGENT_TYPE_COMPATIBILITY_GUIDE.md` - Agent compatibility guide
- `DEPLOYMENT_FEE_STRUCTURE_EXPLAINED.md` - Fee structure documentation

#### **Mobile & Testing**

- `MOBILE_AR_DEPLOYMENT_GUIDE.md` - Mobile AR deployment
- `MOBILE_AR_TESTING_SETUP.md` - Mobile testing setup
- `NGROK_SETUP_COMPLETE.md` - Ngrok configuration
- `NGROK_WEBHOOK_SETUP.md` - Webhook setup with Ngrok

#### **Development Reports & Summaries**

- `CCIP_IMPLEMENTATION_LEADERSHIP_SUMMARY.md` - CCIP leadership summary
- `CCIP_QR_DEVELOPMENT_COMPREHENSIVE_SUMMARY.md` - QR development summary
- `COMPLETE_CCIP_DEVELOPMENT_OVERVIEW.md` - Complete CCIP overview
- `REVOLUT_INTEGRATION_ANALYSIS_REPORT.md` - Integration analysis
- `REVOLUT_INTEGRATION_COMPLETE_SUMMARY.md` - Complete integration summary
- `REVOLUT_INTEGRATION_FINAL_STATUS.md` - Final integration status
- `WALLET_INTEGRATION_FIXES_SUMMARY.md` - Wallet integration fixes
- `INTERACTION_FEE_FIX_SUMMARY.md` - Fee fixing summary
- `AGENT_NORMALIZATION_SUMMARY.md` - Agent normalization
- `3D_MODELS_INTEGRATION_SUMMARY.md` - 3D models integration

#### **Troubleshooting & Fixes**

- `AGENT_CARD_FIX_INSTRUCTIONS.md` - Agent card fixes
- `REVOLUT_CORS_FIX_SUMMARY.md` - CORS issues resolution
- `SANDBOX_URL_FIX_SUMMARY.md` - Sandbox URL fixes
- `MULTI_ROOT_WORKSPACE_BEST_PRACTICES.md` - Workspace best practices

### 2. 🔧 **Scripts (.js and .mjs files)**

#### **Database Query Scripts**

- `query-deployed-objects.js` - Query all deployed objects
- `query-all-agents.js` - Query agents table
- `list-all-objects.js` - List all objects
- `list-all-simple.js` - Simple object listing
- `count-deployed-objects.js` - Count deployed objects
- `test-supabase-connection.js` - Test database connection

#### **Database Management Scripts**

- `apply_migration.js` - Apply database migrations
- `apply_wallet_migration.js` - Wallet migration
- `apply_wallet_migration_v2.js` - Updated wallet migration
- `check_db_structure.js` - Check database structure
- `check_table_structure.js` - Check table structure
- `check_agent.js` - Check agent data
- `check-tables.js` - Table verification

#### **Development & Testing Scripts**

- `ar-viewer-diagnostics.js` - AR Viewer diagnostics
- `verify_wallet_integration.js` - Wallet integration verification
- `server.js` - Development server
- `create-webhook.js` - Webhook creation

#### **Configuration Scripts**

- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS configuration
- `tailwind.config.js` - Tailwind CSS configuration

### 3. 🗄️ **Database Files (.sql)**

#### **Schema Creation & Setup**

- `database_setup.sql` - Initial database setup
- `create_table.sql` - Table creation scripts
- `payment_cube_schema_update.sql` - Payment cube schema
- `add_dynamic_deployment_fields.sql` - Dynamic deployment fields

#### **Migration Scripts**

- `manual_migration.sql` - Manual database migration
- `apply_agent_card_migration.sql` - Agent card migration
- `simplified_migration.sql` - Simplified migration
- `verify_migration_applied.sql` - Migration verification

#### **Constraint Management**

- `fix_agent_types_constraint.sql` - Agent types constraints
- `fix_network_constraint.sql` - Network constraints
- `fix_network_constraint_final.sql` - Final network constraint fix
- `fix_network_constraint_step_by_step.sql` - Step-by-step constraint fix
- `fix_all_network_constraints.sql` - All network constraints
- `fix_hbar_currency_constraint.sql` - HBAR currency constraint
- `fix_polygon_amoy_constraint.sql` - Polygon Amoy constraint
- `add_clean_constraint.sql` - Clean constraint addition
- `check_constraint.sql` - Constraint checking
- `check_current_constraints.sql` - Current constraints check

#### **Data Management**

- `fix_data_then_constraint.sql` - Data fixing before constraints
- `clean_slate_solution.sql` - Clean slate database solution
- `clear_database_fresh_start.sql` - Fresh database start
- `update_data_solution.sql` - Data update solution
- `final_clean_solution.sql` - Final clean solution

#### **Debugging & Testing**

- `debug_agent_fees.sql` - Debug agent fees
- `test_supabase_permissions.sql` - Test permissions
- `test_supabase_columns.sql` - Test column structure
- `check_networks.sql` - Check network data
- `check_existing_data.sql` - Check existing data

#### **Quick Fixes**

- `quick_constraint_fix.sql` - Quick constraint fixes
- `quick_payment_fix.sql` - Quick payment fixes
- `quick_fee_check.sql` - Quick fee checking
- `fix_constraint_simple.sql` - Simple constraint fix
- `fix_mcp_services_column.sql` - MCP services column fix
- `remove_constraint_temp.sql` - Temporary constraint removal

### 4. 🌐 **Environment & Configuration**

- `.env` - Environment variables (git-ignored, shared across branches)
- `.env.example` - Environment template
- `AR_VIEWER_ENV_CONFIG.env` - AR Viewer specific environment
- `netlify.toml` - Netlify deployment configuration

### 5. 📋 **Shell Scripts**

- `create-revolut-webhook.sh` - Revolut webhook setup script
- `check_revolut_agents.mjs` - Revolut agents checking script

## 🔄 **Branch-Specific Considerations**

Since `.env` files are git-ignored, the same environment configuration applies to all branches. However, different branches may have:

1. **Feature-specific documentation** in their respective directories
2. **Branch-specific implementation files** in `src/` directories
3. **Different versions of scripts** adapted for specific features

## 📊 **Usage Statistics**

- **Total .md files**: ~162 files
- **Total .js/.mjs files**: ~56 files
- **Total .sql files**: ~112 files
- **Total branches**: 6 active branches

## 🎯 **Next Steps for Organization**

1. **Move documentation** to `organized-files/documentation/` with subcategories
2. **Move scripts** to `organized-files/scripts/` with purpose-based folders
3. **Move SQL files** to `organized-files/database/` with operation-based folders
4. **Create branch-specific documentation** where needed
5. **Establish naming conventions** for future files

## 🔗 **Cross-References**

- Main documentation hub: `docs/` folder
- AR Viewer specific: `docs/ar-viewer/` folder
- New workspace package: `NEW_WORKSPACE_DOCUMENTATION_PACKAGE/` folder
- Configuration files: Root directory
- Source code: `src/` directory structure

---

_This organization structure helps maintain clarity across all branches and file types in the AgentSphere project._
