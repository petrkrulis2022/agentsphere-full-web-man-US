# ENS Payment Integration - Quick Start Guide

## 🚀 Quick Implementation Checklist

### 1. Apply Database Migration (5 minutes)

```bash
cd /home/petrunix/agentsphere-full-web-man-US/agent-sphere-1-duplication-AR-QR-USECASE

# Review the migration file first
cat migrations/add_ens_payment_fields.sql

# Apply to Supabase (replace with your connection string)
psql postgresql://user:pass@host:port/database -f migrations/add_ens_payment_fields.sql
```

**Expected Output:**

```
ALTER TABLE
COMMENT
COMMENT
...
NOTICE:  Migration Verification:
NOTICE:    Columns added: 7/7
NOTICE:    Indexes created: 3/3
NOTICE:    Triggers created: 1/1
NOTICE:    ✅ Migration completed successfully!
```

---

### 2. Verify Dependencies (Already Installed)

```bash
# Check if packages are installed
npm list ethers @ensdomains/ensjs

# Should show:
# ├── ethers@6.10.0
# └── @ensdomains/ensjs@3.6.0
```

---

### 3. Test ENS Service (2 minutes)

```bash
# Run unit tests
npm test src/tests/ensService.test.ts

# Or test manually in browser console:
# 1. Start dev server
npm run dev

# 2. Open http://localhost:5175
# 3. Open browser console and test:
```

```javascript
// Import service (if not using modules, access via window)
import { ensService } from "./services/ensService";

// Test domain validation
console.log(ensService.isValidENSDomain("vitalik.eth")); // true
console.log(ensService.isValidENSDomain("invalid")); // false

// Test resolution (requires network)
const address = await ensService.resolveENS("vitalik.eth", "mainnet");
console.log("Resolved:", address);

// Test avatar fetching
const avatar = await ensService.getAvatar("nick.eth", "mainnet");
console.log("Avatar:", avatar);

// Check cache stats
console.log(ensService.getCacheStats());
```

---

### 4. Deploy Test Agent (5 minutes)

1. **Navigate to Deployment Form**
   - Go to http://localhost:5175
   - Click "Deploy New Agent"

2. **Configure Agent**
   - Enter agent name, type, description
   - Set location (or use current location)
   - Connect wallet (if deploying crypto methods)

3. **Enable ENS Payment**
   - Scroll to "Payment Methods Configuration"
   - Check the "ENS Payment" checkbox
   - Wait for ENS configuration panel to appear

4. **Configure ENS**
   - Select Network: Choose "Mainnet" or "Sepolia (Testnet)"
   - Enter ENS Domain: e.g., `vitalik.eth`
   - Wait for resolution (800ms debounce)
   - Verify green checkmark appears
   - See resolved address: `0x...`
   - Avatar should display if available

5. **Complete Deployment**
   - Review all settings
   - Click "Deploy Agent"
   - Wait for success message

---

### 5. Verify Database (2 minutes)

```sql
-- Connect to Supabase
-- Check the deployed agent has ENS data

SELECT
  id,
  agent_name,
  ens_payment_enabled,
  ens_domain,
  ens_resolved_address,
  ens_resolver_network,
  ens_verified,
  ens_avatar_url,
  ens_last_resolved
FROM deployed_objects
WHERE ens_payment_enabled = true
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**

```
id              | agent_name    | ens_payment_enabled | ens_domain    | ens_resolved_address          | ...
----------------|---------------|---------------------|---------------|-------------------------------|
uuid-here       | Test Agent    | true                | vitalik.eth   | 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 | ...
```

---

## 🧪 Testing Scenarios

### Scenario 1: Valid Mainnet ENS Domain

```
1. Enable ENS Payment
2. Select "Mainnet"
3. Enter "vitalik.eth"
4. Wait for resolution
✅ Expected: Green checkmark, resolved address shown
```

### Scenario 2: Invalid Domain Format

```
1. Enable ENS Payment
2. Select "Mainnet"
3. Enter "INVALID"
❌ Expected: Red error "Invalid ENS domain format"
```

### Scenario 3: Unregistered Domain

```
1. Enable ENS Payment
2. Select "Mainnet"
3. Enter "this-definitely-does-not-exist-12345.eth"
❌ Expected: Red error "ENS domain not found on mainnet"
```

### Scenario 4: Network Switch

```
1. Enable ENS Payment
2. Enter "test.eth" on Mainnet
❌ Fails (not on mainnet)
3. Switch to "Sepolia"
✅ Resolves successfully (if exists on sepolia)
```

### Scenario 5: Avatar Display

```
1. Enable ENS Payment
2. Select "Mainnet"
3. Enter "nick.eth"
✅ Expected: Resolved address + avatar image
```

---

## 🐛 Troubleshooting

### Issue: "ENS domain not found"

**Possible Causes:**

- Domain doesn't exist on selected network
- Wrong network selected (mainnet vs sepolia)
- RPC endpoint unreachable

**Solutions:**

1. Verify domain exists: https://app.ens.domains/
2. Check network selection
3. Try again (might be temporary RPC issue)
4. Test with known domain like `vitalik.eth`

---

### Issue: Resolution takes too long

**Possible Causes:**

- Slow RPC endpoint
- Network congestion
- First resolution (no cache)

**Solutions:**

1. Wait up to 5 seconds (timeout)
2. Subsequent resolutions use cache (instant)
3. Consider upgrading to Infura/Alchemy API keys

---

### Issue: Avatar not showing

**Possible Causes:**

- Domain has no avatar set
- Avatar URL broken
- Image loading failed

**Solutions:**

1. Check if domain has avatar: https://app.ens.domains/
2. This is optional - resolution still works
3. Avatar is not required for payments

---

### Issue: Migration fails

**Possible Causes:**

- Table doesn't exist
- Insufficient permissions
- Columns already exist

**Solutions:**

1. Verify table name: `deployed_objects`
2. Check database permissions
3. Review migration error message
4. Try manual column addition

---

### Issue: TypeScript errors

**Possible Causes:**

- Missing type definitions
- Import paths incorrect

**Solutions:**

1. Restart TypeScript server in VS Code
2. Run `npm install` to ensure all deps installed
3. Check import paths match file locations

---

## 📊 Performance Metrics

### Expected Performance:

- **First Resolution:** 1-3 seconds
- **Cached Resolution:** < 10ms (instant)
- **Cache Duration:** 1 hour
- **Cache Hit Rate:** 85%+ (with typical usage)

### RPC Call Reduction:

- **Without Cache:** 3 RPC calls per resolution (forward + reverse + avatar)
- **With Cache:** 0 RPC calls (instant return)
- **Estimated Savings:** 95% fewer RPC calls

---

## 🎯 Success Criteria

✅ **Implementation Complete When:**

1. Database migration applied successfully
2. ENS service resolves domains correctly
3. UI shows real-time validation
4. Deployed agents have ENS data in database
5. No TypeScript errors in new code
6. Unit tests pass (90%+ coverage)

✅ **Ready for AR Viewer Integration When:**

1. AgentSphere deploys agents with ENS config
2. Database contains valid ENS data
3. Test agents available for AR Viewer team
4. Shared test domains work consistently

---

## 📞 Support

**Issues with AgentSphere Implementation:**

- Check implementation summary: `ENS_AGENTSPHERE_IMPLEMENTATION_SUMMARY.md`
- Review code changes in Git
- Test with known-good ENS domains

**Issues with AR Viewer Integration:**

- Coordinate with AR Viewer team
- Use shared test domains
- Follow implementation plan alignment notes

**ENS Domain Issues:**

- Check ENS documentation: https://docs.ens.domains/
- Verify domain ownership: https://app.ens.domains/
- Test on Sepolia testnet first

---

## 🎉 You're Ready!

If all checks pass:

1. ✅ Migration applied
2. ✅ Service works
3. ✅ UI functional
4. ✅ Database updated
5. ✅ Tests passing

**Then you're ready to:**

- Deploy production agents with ENS
- Coordinate with AR Viewer team
- Share test agents for integration testing
- Monitor production metrics

**Next milestone:** AR Viewer cube integration complete! 🚀
