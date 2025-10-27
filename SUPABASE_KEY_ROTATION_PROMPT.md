# 🔐 URGENT: Supabase Key Rotation Required - Security Remediation

## Context

GitHub Security Alert detected exposed Supabase Service Role Keys in the repository. Immediate key rotation and file updates are required to resolve this security vulnerability.

## Compromised Keys (REPLACE THESE)

**OLD COMPROMISED KEYS (issued January 2025 - `iat: 1750680159`):**

- ANON KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI`
- SERVICE ROLE KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MDE1OSwiZXhwIjoyMDY2MjU2MTU5fQ.OimR1FKKf2kcQ1c0WO7MvuuB85wRMV6vhbH5DnC8G8E`

## New Secure Keys (USE THESE)

**NEW ROTATED KEYS (issued October 2025 - `iat: 1761473300`):**

- ANON KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110`
- SERVICE ROLE KEY: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3MzMwMCwiZXhwIjoyMDc3MDQ5MzAwfQ.5LiZQFdXgyMnM_HDVW5ZLTGuhF_9xOAbXEJ6yeJ_yTk`

## Project Information

- **Supabase Project**: `ncjbwzibnqrbrvicdmec.supabase.co`
- **Repository**: `agentsphere-full-web-man-US`
- **Owner**: `petrkrulis2022`
- **Branch**: `main`

## Required Actions

### 1. Update .env File

Replace the Supabase keys in `.env` with the new secure keys:

```env
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzMzMDAsImV4cCI6MjA3NzA0OTMwMH0.OBxPLTZYpm6J59HFcn6VvXHlDt3r_HXMQEFCYKNR110
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3MzMwMCwiZXhwIjoyMDc3MDQ5MzAwfQ.5LiZQFdXgyMnM_HDVW5ZLTGuhF_9xOAbXEJ6yeJ_yTk
```

### 2. Search and Replace Hardcoded Keys

**Critical**: Search the entire repository for any hardcoded instances of the OLD compromised keys and replace them.

**Search patterns to look for:**

- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI`
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MDE1OSwiZXhwIjoyMDY2MjU2MTU5fQ.OimR1FKKf2kcQ1c0WO7MvuuB85wRMV6vhbH5DnC8G8E`
- Timestamp patterns: `1750680159` (old key timestamp)

### 3. Convert Hardcoded Keys to Environment Variables

For any JavaScript/TypeScript files with hardcoded keys, convert them to use environment variables:

**Pattern to replace:**

```javascript
const supabaseServiceKey = "hardcoded_key_here";
```

**Replace with:**

```javascript
import dotenv from "dotenv";
dotenv.config();

const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  console.error(
    "❌ VITE_SUPABASE_SERVICE_ROLE_KEY environment variable is required"
  );
  process.exit(1);
}
```

### 4. Files Already Updated (Reference)

These files have been properly updated and use environment variables:

- ✅ `apply_migration.js` - uses `process.env.VITE_SUPABASE_SERVICE_ROLE_KEY`
- ✅ `check_revolut_agents.mjs` - uses `process.env.VITE_SUPABASE_ANON_KEY`
- ✅ `unified-agentsphere-prompt.md` - updated to use placeholder values

### 5. Files to Check for Hardcoded Keys

Search these file types for any remaining hardcoded keys:

- `*.js`, `*.mjs`, `*.ts`, `*.tsx`
- `*.md` (documentation files)
- `*.json` (config files)
- `*.yml`, `*.yaml` (CI/CD configs)
- Any migration or database scripts

### 6. Verification Commands

After updates, verify no old keys remain:

```bash
# Search for old compromised keys
grep -r "1750680159" .
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0" .
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MDE1OSwiZXhwIjoyMDY2MjU2MTU5fQ" .

# Verify new keys are in place
grep -r "1761473300" .
```

## Security Best Practices

1. **Never commit .env files** - ensure `.gitignore` includes `.env`
2. **Use environment variables** - replace all hardcoded keys with `process.env` references
3. **Validate environment variables** - add error handling for missing env vars
4. **Documentation placeholders** - use placeholder values in documentation, not real keys

## Important Notes

- ⚠️ The old keys have been exposed in public repository and must be treated as compromised
- 🔄 New keys were generated October 26, 2025 with fresh expiration dates
- 🎯 Focus only on keys for project `ncjbwzibnqrbrvicdmec` (this project)
- 📋 Other Supabase projects in the codebase (e.g., `hlrvcjjmwxzqixzwgktd`, `jqajtdtrlujksoxftyvb`) are different projects
- 🔐 After updates, disable the old keys in Supabase dashboard to permanently revoke access

## Success Criteria

- [ ] All hardcoded instances of OLD keys replaced with NEW keys or environment variables
- [ ] `.env` file updated with new secure keys
- [ ] All JavaScript files use `process.env` instead of hardcoded keys
- [ ] Documentation files use placeholder values
- [ ] Verification commands return no matches for old key patterns
- [ ] GitHub security alert resolved

## Emergency Contact

If you encounter issues during this security remediation, prioritize:

1. **Complete the key replacement** - security cannot wait
2. **Test application functionality** - ensure new keys work
3. **Verify old keys are fully removed** - use grep commands above

This is a **CRITICAL SECURITY ISSUE** that requires immediate attention. Do not delay implementation.
