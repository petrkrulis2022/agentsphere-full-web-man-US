**Agent Card Display Fix - Manual Migration Application**

I've identified the issues with the agent card display and created fixes. The main problems were:

## Issues Found:

1. **Token/Fee Display**: Card shows "1 USDFC" instead of "3 USDT"
2. **Wallet Display**: Shows "No wallet address configured"
3. **Location Type**: Shows "Not specified" instead of "Street"
4. **Capabilities**: Not displaying interaction methods correctly

## Root Cause:

The deployment saves data to `deployed_objects` table but uses different field names than what the agent card expects.

## Fixes Applied to Code:

1. Updated `DeployObject.tsx` to save data in multiple compatible formats
2. Added standard field mappings (`interaction_fee`, `token`, `agent_type`, etc.)
3. Enhanced feature mapping for capabilities display

## Database Migration Required:

**STEP 1: Apply this SQL in Supabase Dashboard:**

```sql
-- Add missing standard fields for agent card compatibility
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS interaction_fee DECIMAL(10,6);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS token VARCHAR(10);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS agent_type VARCHAR(50);
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS text_chat BOOLEAN DEFAULT false;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS voice_chat BOOLEAN DEFAULT false;
ALTER TABLE deployed_objects ADD COLUMN IF NOT EXISTS video_chat BOOLEAN DEFAULT false;
```

**STEP 2: Update existing data:**

```sql
UPDATE deployed_objects
SET
  interaction_fee = interaction_fee_usdfc,
  token = token_symbol,
  agent_type = object_type,
  text_chat = COALESCE(chat_enabled, true),
  voice_chat = COALESCE(voice_enabled, false),
  video_chat = COALESCE(defi_enabled, false)
WHERE interaction_fee IS NULL OR token IS NULL OR agent_type IS NULL;
```

**STEP 3: Verify the fix:**

```sql
SELECT
  name,
  agent_type,
  interaction_fee,
  token,
  network,
  location_type,
  deployer_wallet_address,
  text_chat,
  voice_chat
FROM deployed_objects
WHERE name = 'TRAM STOP 1'
ORDER BY created_at DESC
LIMIT 1;
```

## After Migration:

1. **New deployments** will save data in the correct format automatically
2. **Existing agents** will display properly with the updated field mapping
3. **Agent cards** will show correct fees, tokens, wallet addresses, and capabilities

## Expected Results:

- ✅ Fee displays as "3 USDT" instead of "1 USDFC"
- ✅ Token shows "USDT" instead of "USDFC"
- ✅ Network shows "Morph Holesky Testnet"
- ✅ Location Type shows "Street"
- ✅ Wallet addresses display properly
- ✅ Capabilities show correct interaction methods

Please apply the migration in Supabase Dashboard, then test deploying a new agent!
