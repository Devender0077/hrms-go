# 🗑️ Files That Can Be Removed

## ✅ Safe to Remove

### Development/Test Scripts (Root Level):
- ❌ `add-translation-to-components.js` - Helper script, not needed in production
- ❌ `setup-attendance-tables.js` - Old script, replaced by setup-database.js
- ❌ `create-admin-user.cjs` - Old script (if exists)
- ❌ `create-test-user.js` - Old script (if exists)
- ❌ `clear-browser-storage.js` - Old script (if exists)
- ❌ `reset-frontend-auth.js` - Old script (if exists)
- ❌ `test-login.js` - Old script (if exists)

### Backend Old Files:
- ❌ `src/backend/server.cjs` - Duplicate of server.js
- ❌ `src/backend/server.log` - Log file (regenerates)
- ❌ `src/backend/create-missing-table-migrations.js` - Old script
- ❌ `src/backend/migration-analysis-report.js` - Old script
- ❌ `src/backend/reset-database.js` - Old script

### Database Old Files:
- ❌ `src/database/` - Entire folder (replaced by backend/migrations)
  - `src/database/load-schemas.js`
  - `src/database/schema.sql`
  - `src/database/schemas/*.sql`
  - `src/database/migrations/*.sql`

### Duplicate/Old Components:
- ❌ `src/components/PermissionDebugger.tsx` - Debug component
- ❌ `src/components/PermissionBasedSidebar.tsx` - Old sidebar (if not used)

### Old Page Files:
- ❌ `src/pages/color-test.tsx` - Test page
- ❌ `src/pages/theme-test.tsx` - Test page  
- ❌ `src/pages/settings-test.tsx` - Test page
- ❌ `src/pages/settings-comprehensive-test.tsx` - Test page

### Duplicate Assets:
- ❌ `src/src/` - Duplicate src folder (if exists)

### Environment Files (Keep .example, remove actual):
- ⚠️ `.env` files should NOT be in git (add to .gitignore)
- ✅ Keep: `.env.example`, `src/backend/.env.example`

## ⚠️ Keep These (Important)

### Documentation (Keep All):
- ✅ `README.md` - Main documentation
- ✅ `DEPLOYMENT.md` - Deployment guide
- ✅ `TRANSLATION_GUIDE.md` - Translation guide
- ✅ `SEARCH_GUIDE.md` - Search guide
- ✅ `FIXES_SUMMARY.md` - Fixes reference
- ✅ `LICENSE` - License file

### Deployment Scripts (Keep All):
- ✅ `setup-project.sh` - Setup script
- ✅ `start-servers.sh` - Start script
- ✅ `stop-servers.sh` - Stop script
- ✅ `deploy.sh` - Deployment script

### Docker (Keep All):
- ✅ `Dockerfile` - Docker image
- ✅ `docker-compose.yml` - Docker compose
- ✅ `ecosystem.config.js` - PM2 config
- ✅ `.env.example` - Environment template

### Backend (Keep All):
- ✅ `src/backend/server.js` - Main server
- ✅ `src/backend/setup-database.js` - Database setup
- ✅ All routes, models, middleware, migrations

## 📊 Summary

**Can Remove**: ~20 files
**Should Keep**: All documentation, deployment scripts, core application files

**Estimated Space Saved**: ~50-100 KB (mostly old scripts and test files)

## 🔧 Cleanup Command

```bash
# Remove unnecessary files
rm -f add-translation-to-components.js
rm -f setup-attendance-tables.js
rm -f src/backend/server.cjs
rm -f src/backend/server.log
rm -rf src/database
rm -f src/pages/color-test.tsx
rm -f src/pages/theme-test.tsx
rm -f src/pages/settings-test.tsx
rm -f src/pages/settings-comprehensive-test.tsx
rm -f src/components/PermissionDebugger.tsx

# Optional: Remove duplicate src folder if it exists
rm -rf src/src
```

## ⚠️ Before Removing

1. **Backup first**: `git commit -am "Backup before cleanup"`
2. **Test application**: Ensure everything works
3. **Remove files**: Run cleanup command
4. **Test again**: Verify nothing broke
5. **Commit**: `git commit -am "Cleanup unnecessary files"`

## 📝 Recommendation

**Remove now**: Test files and old scripts
**Keep**: All documentation (helpful for team)
**Review later**: Components marked as "old" or "deprecated"
