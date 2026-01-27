# Agent Type Labels Database Migration - Instructions

## Overview

This migration updates the `deployed_objects` table constraint to include the new agent type labels and all Hedera AI agent types.

## Changes

### Updated Labels:

1. **"Content Creator"** → **"My Payment Terminal"**
2. **"Payment Terminal"** → **"Payment Terminal - POS"**
3. **"Home Security"** → **"Virtual ATM"**

### Added Types:

- All Hedera AI Travel Agents (with emojis):
  - 🚌 Bus Agent (Hedera AI)
  - 🚆 Train Agent (Hedera AI)
  - 🏨 Hotel Agent (Hedera AI)
  - ✈️ Flight Agent (Hedera AI)
  - 🍽️ Restaurant Agent (Hedera AI)
  - 🌍 Travel Coordinator (Hedera AI)

## Migration Options

### Option 1: Using Node.js Script (Recommended)

```bash
# Install dependencies if needed
npm install

# Run the migration
node apply_agent_type_labels_migration.js
```

### Option 2: Using Shell Script

```bash
# Make sure .env file exists with Supabase credentials
./apply_agent_type_labels.sh
```

### Option 3: Supabase Dashboard (Manual)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `update_agent_types_labels.sql`
4. Copy and paste the SQL content
5. Click **Run** to execute

### Option 4: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply specific migration
psql $DATABASE_URL -f update_agent_types_labels.sql
```

## Files Included

1. **update_agent_types_labels.sql** - Raw SQL migration file
2. **apply_agent_type_labels_migration.js** - Node.js script to apply migration
3. **apply_agent_type_labels.sh** - Bash script to apply migration
4. **AGENT_TYPE_MIGRATION_GUIDE.md** - This file

## Environment Variables Required

Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Verification

After running the migration, verify it worked by:

1. Checking that no errors occurred during execution
2. Trying to deploy a new agent with one of the updated types
3. Querying existing agents to ensure they still work

```bash
# Test query (if you have psql)
psql $DATABASE_URL -c "SELECT DISTINCT agent_type FROM deployed_objects LIMIT 10;"
```

## Rollback

If you need to rollback, you can drop the constraint and re-add the old one:

```sql
ALTER TABLE deployed_objects
DROP CONSTRAINT IF EXISTS valid_agent_type;

-- Add back the old constraint without new labels
-- (See previous migration file for old constraint)
```

## Important Notes

- **Database Values Don't Change**: The migration only updates the constraint, not existing data
- **Value vs Label**:
  - `content_creator` (value) → displays as "My Payment Terminal" (label)
  - `payment_terminal` (value) → displays as "Payment Terminal - POS" (label)
  - `home_security` (value) → displays as "Virtual ATM" (label)
- **Backward Compatible**: Existing agents will continue to work
- **No Data Loss**: This migration only updates constraints, not data

## Troubleshooting

### Error: "Permission denied"

- Make sure you're using the service role key or have admin permissions
- Try running via Supabase Dashboard SQL Editor instead

### Error: "Constraint already exists"

- The migration includes `DROP CONSTRAINT IF EXISTS`, so this shouldn't happen
- If it does, manually drop the constraint first in SQL Editor

### Error: "Cannot connect to Supabase"

- Verify your `.env` file has correct credentials
- Check your internet connection
- Verify the Supabase project is active

## Support

For issues or questions:

1. Check the Supabase dashboard for error logs
2. Review the `AR_VIEWER_AGENT_TYPE_UPDATES_PROMPT.md` for integration details
3. Verify environment variables are set correctly

## Next Steps

After migration:

1. ✅ Test the Deploy AR Agent page with new agent types
2. ✅ Update AR Viewer to display new labels (see AR_VIEWER_AGENT_TYPE_UPDATES_PROMPT.md)
3. ✅ Test deploying agents with updated types
4. ✅ Verify existing deployed agents still work
