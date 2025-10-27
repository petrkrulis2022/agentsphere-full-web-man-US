# AgentSphere Branch-Specific File Analysis

## 🌳 **Branch Structure Analysis**

### Current Working Branch: `revolut-pay-sim`

#### Branch Purpose

- Revolut payment simulation and integration testing
- Cross-platform payment development
- AR Viewer integration with payment systems

## 📂 **File Organization by Category**

### 📝 **Documentation Files (162 total)**

#### **1. Project Foundation (7 files)**

- `README.md` - Main project documentation
- `AgentSphere_Project_Summary.md` - Project overview
- `AgentSphere_Technical_Summary.md` - Technical architecture
- `UPDATED_PROJECT_PLAN.md` - Current project roadmap
- `IMPLEMENTATION_SUMMARY.md` - Implementation status
- `docs/Project_Plan.md` - Original project plan
- `docs/PRD_UNIFIED_AGENTSPHERE.md` - Product requirements

#### **2. API Documentation (8 files)**

- `API_DOCUMENTATION_POLYGON_AMOY_SOLANA_DEVNET.md` - Multi-chain API
- `UPDATED_API_DOCUMENTATION.md` - Current API docs
- `docs/API_Documentation.md` - Core API reference
- `docs/ar-viewer/API_Documentation.md` - AR Viewer API
- `UPDATED_SCHEMA_DOCUMENTATION.md` - Database schema docs
- `docs/Schemas.md` - Schema definitions
- `docs/ar-viewer/Schemas.md` - AR Viewer schemas
- `docs/Backend.md` - Backend documentation

#### **3. Integration Guides (25 files)**

- **Revolut Integration (12 files)**:

  - `REVOLUT_INTEGRATION_COMPLETE_GUIDE.md`
  - `REVOLUT_INTEGRATION_DOCUMENTATION_INDEX.md`
  - `REVOLUT_API_DOCUMENTATION.md`
  - `REVOLUT_SANDBOX_TESTING_GUIDE.md`
  - `REVOLUT_QUICK_REFERENCE.md`
  - `REVOLUT_INTEGRATION_ANALYSIS_REPORT.md`
  - `REVOLUT_INTEGRATION_COMPLETE_SUMMARY.md`
  - `REVOLUT_INTEGRATION_FINAL_STATUS.md`
  - `REVOLUT_INTEGRATION_COMPLETE_REPORT.md`
  - `REVOLUT_INTEGRATION_QUICK_START.md`
  - `REVOLUT_CORS_FIX_SUMMARY.md`
  - `MULTI_TENANT_REVOLUT_PAYMENT_ROUTING.md`

- **Blockchain Integration (8 files)**:

  - `HEDERA_AR_VIEWER_INTEGRATION_PROMPT.md`
  - `POLYGON_AMOY_SOLANA_DEVNET_INTEGRATION_SUMMARY.md`
  - `WALLET_INTEGRATION_FIXES_SUMMARY.md`
  - `AGENTSPHERE_BACKEND_CONNECTION_GUIDE.md`
  - `CCIP_IMPLEMENTATION_LEADERSHIP_SUMMARY.md`
  - `CCIP_QR_DEVELOPMENT_COMPREHENSIVE_SUMMARY.md`
  - `COMPLETE_CCIP_DEVELOPMENT_OVERVIEW.md`
  - `docs/ar-viewer/BLOCKCHAIN_QR_INTEGRATION_GUIDE.md`

- **Cross-Platform Integration (5 files)**:
  - `NEW_WORKSPACE_DOCUMENTATION_PACKAGE/AGENTSPHERE_SOLANA_WALLET_INTEGRATION_PROMPT.md`
  - `AGENT_TYPE_COMPATIBILITY_GUIDE.md`
  - `3D_MODELS_INTEGRATION_SUMMARY.md`
  - `DYNAMIC_DEPLOYMENT_EXPLANATION.md`
  - `DYNAMIC_PAYMENT_SYSTEM_DOCUMENTATION.md`

#### **4. AR Viewer Documentation (18 files)**

- **AR Viewer Core (12 files)**:

  - `AR_VIEWER_3D_MODELS_UPDATE_PROMPT.md`
  - `AR_VIEWER_DYNAMIC_DEPLOYMENT_UPDATE.md`
  - `AR_VIEWER_DYNAMIC_PAYMENT_INTEGRATION.md`
  - `AR_VIEWER_REAL_TRANSACTIONS_INTEGRATION_PROMPT.md`
  - `AR_VIEWER_REVOLUT_INTEGRATION_PROMPT_UPDATED.md`
  - `AR_VIEWER_TROUBLESHOOTING_PROMPT.md`
  - `AR_VIEWER_OBJECT_CHECK_GUIDE.md`
  - `docs/ar-viewer/UNIFIED_AR_VIEWER_DOCUMENTATION.md`
  - `docs/ar-viewer/AR_QR_SYSTEM_README.md`
  - `docs/ar-viewer/CURRENT_STATUS_AUGUST_2025.md`
  - `docs/ar-viewer/DEVELOPMENT_NOTES.md`
  - `SINGLE_CARD_MODEL_AR_VIEWER_REPORT.md`

- **AR Mobile & Testing (6 files)**:
  - `MOBILE_AR_DEPLOYMENT_GUIDE.md`
  - `MOBILE_AR_TESTING_SETUP.md`
  - `docs/ar-viewer/Memory.md`
  - `docs/ar-viewer/Backend.md`
  - `docs/ar-viewer/Changelog.md`
  - `UPDATED_QR_AR_DOCUMENTATION.md`

#### **5. Payment Systems (8 files)**

- `PAYMENT_CUBE_SYSTEM_DOCUMENTATION.md`
- `PAYMENT_CUBE_IMPLEMENTATION_COMPLETE.md`
- `DEPLOYMENT_FEE_STRUCTURE_EXPLAINED.md`
- `INTERACTION_FEE_FIX_SUMMARY.md`
- `AGENT_NORMALIZATION_SUMMARY.md`
- `3D_MODELS_BUS_STOP_REVERSION_SESSION.md`
- `SANDBOX_URL_FIX_SUMMARY.md`
- `docs/Marketing_Plan.md`

#### **6. Development & Setup (12 files)**

- `BACKEND_API_SERVER_SETUP.md`
- `NGROK_SETUP_COMPLETE.md`
- `NGROK_WEBHOOK_SETUP.md`
- `MULTI_ROOT_WORKSPACE_BEST_PRACTICES.md`
- `docs/Memory.md`
- `docs/Changelog.md`
- `docs/Enhancements.md`
- `NEW_WORKSPACE_DOCUMENTATION_PACKAGE/README.md`
- `NEW_WORKSPACE_DOCUMENTATION_PACKAGE/Backend.md`
- `NEW_WORKSPACE_DOCUMENTATION_PACKAGE/API_Documentation.md`
- `NEW_WORKSPACE_DOCUMENTATION_PACKAGE/DELIVERY_CHECKLIST.md`
- `unified-agentsphere-prompt.md`

#### **7. Troubleshooting & Fixes (8 files)**

- `AGENT_CARD_FIX_INSTRUCTIONS.md`
- `AR_VIEWER_TROUBLESHOOTING_PROMPT.md`
- `REVOLUT_CORS_FIX_SUMMARY.md`
- `SANDBOX_URL_FIX_SUMMARY.md`
- `WALLET_INTEGRATION_FIXES_SUMMARY.md`
- `INTERACTION_FEE_FIX_SUMMARY.md`
- `AGENT_NORMALIZATION_SUMMARY.md`
- `3D_MODELS_BUS_STOP_REVERSION_SESSION.md`

### 🔧 **Script Files (56 total)**

#### **Database Query Scripts (8 files)**

- `query-deployed-objects.js` - Main object querying (most comprehensive)
- `query-all-agents.js` - Agent-specific queries
- `list-all-objects.js` - Object listing
- `list-all-simple.js` - Simplified listing
- `count-deployed-objects.js` - Object counting
- `test-supabase-connection.js` - Connection testing
- `ar-viewer-diagnostics.js` - AR Viewer diagnostics
- `check-tables.js` - Table structure checking

#### **Database Management Scripts (12 files)**

- `apply_migration.js` - Primary migration script
- `apply_wallet_migration.js` - Wallet migration v1
- `apply_wallet_migration_v2.js` - Wallet migration v2
- `check_db_structure.js` - Database structure verification
- `check_table_structure.js` - Table structure checking
- `check_agent.js` - Agent data verification
- `verify_wallet_integration.js` - Wallet integration testing
- `check_revolut_agents.mjs` - Revolut agent checking (ES modules)

#### **Development & Testing Scripts (8 files)**

- `server.js` - Development server
- `create-webhook.js` - Webhook creation
- `verify_wallet_integration.js` - Integration verification
- `ar-viewer-diagnostics.js` - AR Viewer diagnostics
- `test-supabase-connection.js` - Database connection testing
- Plus configuration files in `src/` directory

#### **Configuration Scripts (4 files)**

- `eslint.config.js` - Code linting configuration
- `postcss.config.js` - CSS processing configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `vite.config.js` - Vite build configuration (if exists)

#### **Utility Scripts (24 files in src/)**

- `src/services/revolutApiClient.js` - Revolut API integration
- `src/config/evmNetworks.js` - EVM network configurations
- `src/utils/keccakPolyfill.js` - Keccak hashing polyfill
- `src/utils/hashPolyfill.js` - Hash utilities
- `src/utils/sha3Wrapper.js` - SHA3 wrapper
- `src/pages/api/revolut/` - Revolut API endpoints (3 files)

### 🗄️ **Database Files (112 total)**

#### **Schema Setup (4 files)**

- `database_setup.sql` - Initial database structure
- `create_table.sql` - Table creation scripts
- `payment_cube_schema_update.sql` - Payment cube schema
- `add_dynamic_deployment_fields.sql` - Dynamic deployment fields

#### **Migration Scripts (6 files)**

- `manual_migration.sql` - Manual database migration
- `apply_agent_card_migration.sql` - Agent card migration
- `simplified_migration.sql` - Simplified migration approach
- `verify_migration_applied.sql` - Migration verification
- `update_data_solution.sql` - Data update solution
- `final_clean_solution.sql` - Final clean migration

#### **Constraint Management (22 files)**

- **Network Constraints (8 files)**:

  - `fix_network_constraint.sql`
  - `fix_network_constraint_final.sql`
  - `fix_network_constraint_step_by_step.sql`
  - `fix_all_network_constraints.sql`
  - `network_constraint_fix.sql`
  - `fix_polygon_amoy_constraint.sql`
  - `check_networks.sql`
  - `check_constraint.sql`

- **Agent & Type Constraints (6 files)**:

  - `fix_agent_types_constraint.sql`
  - `add_clean_constraint.sql`
  - `check_current_constraints.sql`
  - `fix_hbar_currency_constraint.sql`
  - `fix_mcp_services_column.sql`
  - `fix_constraint_simple.sql`

- **Data & Constraint Combination (8 files)**:
  - `fix_data_then_constraint.sql`
  - `clean_slate_solution.sql`
  - `clear_database_fresh_start.sql`
  - Various quick fixes and temporary solutions

#### **Debugging & Testing (15 files)**

- `debug_agent_fees.sql` - Agent fee debugging
- `test_supabase_permissions.sql` - Permission testing
- `test_supabase_columns.sql` - Column structure testing
- `check_existing_data.sql` - Data validation
- Various quick checks and verification scripts

#### **Quick Fixes (65 files)**

- `quick_constraint_fix.sql` - Quick constraint fixes
- `quick_payment_fix.sql` - Payment-related quick fixes
- `quick_fee_check.sql` - Fee verification
- `remove_constraint_temp.sql` - Temporary constraint removal
- Multiple variations of constraint and data fixes

## 🎯 **Priority Organization Suggestions**

### **High Priority (Immediate)**

1. **Move frequently used scripts** to organized structure:

   - `query-deployed-objects.js` → `organized-files/scripts/database-queries/`
   - `test-supabase-connection.js` → `organized-files/scripts/database-queries/`
   - Database migration scripts → `organized-files/scripts/database-management/`

2. **Consolidate documentation**:
   - Revolut integration docs → `organized-files/documentation/integration-guides/revolut/`
   - AR Viewer docs → `organized-files/documentation/ar-viewer/`

### **Medium Priority (This Week)**

1. **Clean up SQL files**:

   - Move working solutions to `organized-files/database/migrations/`
   - Archive old/superseded fixes to `organized-files/database/archive/`

2. **Create branch-specific documentation**:
   - Document which files are branch-specific
   - Create branch comparison documentation

### **Low Priority (Future)**

1. **Establish naming conventions** for new files
2. **Create automated organization** scripts
3. **Document file dependencies** and relationships

## 📊 **File Usage Frequency**

### **Most Used Files**

1. `query-deployed-objects.js` - Primary database querying
2. `test-supabase-connection.js` - Connection verification
3. `.env` - Environment configuration (shared across branches)
4. `REVOLUT_INTEGRATION_COMPLETE_GUIDE.md` - Integration reference
5. `AR_VIEWER_TROUBLESHOOTING_PROMPT.md` - AR troubleshooting

### **Branch-Specific Files**

- **revolut-pay-sim**: Revolut integration scripts and docs
- **feature/hedera-wallet-integration**: Hedera-specific files
- **feature/solana-wallet-integration**: Solana-specific files
- **cross-platform-payments**: Cross-chain payment files

---

_This analysis provides a comprehensive view of file organization across all branches in the AgentSphere project._
