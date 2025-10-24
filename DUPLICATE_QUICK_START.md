# Duplicate Elimination - Quick Start Guide

**For**: Developers who need to quickly understand and use the duplicate elimination system
**Time**: 5 minutes to read, 10 minutes to execute

---

## TL;DR - Execute This Now

```bash
# 1. Check current status (2 min)
npm run duplicates:verify

# 2. If duplicates found, remove them (5-10 min)
npm run duplicates:remove

# 3. Add protection (10 min - includes manual SQL)
npm run duplicates:add-constraint

# 4. Fix scripts to prevent future duplicates (30 min)
npm run duplicates:fix-scripts --analyze-only

# 5. Setup monitoring (1 min)
npm run duplicates:monitor --watch
```

---

## Current Status

✅ **Database is CLEAN** (as of 2025-10-24)
- 1000 words, 0 duplicates
- 1000 verses, 0 duplicates
- No immediate action needed

**Recommended**: Implement prevention measures (Phases 4-6)

---

## Available Commands

### Verification
```bash
# Quick check
npm run duplicates:verify

# Detailed check with export
npm run duplicates:verify -- --detailed --export
```

### Removal (if needed)
```bash
# Dry run first (recommended)
npm run duplicates:remove -- --dry-run

# Actual removal
npm run duplicates:remove

# Custom batch size
npm run duplicates:remove -- --batch-size=50
```

### Add Constraints
```bash
# Generate migration files
npm run duplicates:add-constraint

# Rollback constraints
npm run duplicates:add-constraint -- --rollback
```

### Fix Scripts
```bash
# Analyze only
npm run duplicates:fix-scripts -- --analyze-only

# Auto-fix with backups
npm run duplicates:fix-scripts -- --auto-fix
```

### Monitoring
```bash
# Single check
npm run duplicates:monitor

# Continuous monitoring
npm run duplicates:monitor -- --watch --interval=60

# With alerts
npm run duplicates:monitor -- --watch --alert

# CI mode (exit with error if duplicates)
npm run duplicates:monitor -- --ci

# View history
npm run duplicates:monitor -- --history
```

---

## Emergency: Duplicates Detected!

```bash
# 1. Stop all data generation processes
# 2. Verify the issue
npm run duplicates:verify -- --detailed --export

# 3. Remove duplicates
npm run duplicates:remove

# 4. Verify clean
npm run duplicates:verify

# 5. Investigate root cause
npm run duplicates:fix-scripts -- --analyze-only

# 6. Resume operations
```

---

## Integration with Workflow

### Pre-commit Hook
```bash
# Add to .husky/pre-commit
npm run duplicates:verify
```

### CI/CD Pipeline
```yaml
# Add to .github/workflows/test.yml
- name: Check duplicates
  run: npm run duplicates:monitor -- --ci
```

### Daily Cron Job
```bash
# Add to crontab
0 9 * * * cd /path/to/app && npm run duplicates:verify -- --export
```

---

## What Each Script Does

| Script | Purpose | Time | Safe? |
|--------|---------|------|-------|
| verify | Check for duplicates | 2 min | ✅ Yes (read-only) |
| remove | Delete duplicates | 5-15 min | ⚠️ With --dry-run |
| add-constraint | Prevent future duplicates | 10 min | ✅ Yes (creates migrations) |
| fix-scripts | Update code to use UPSERT | 30 min | ✅ Yes (creates backups) |
| monitor | Continuous monitoring | Ongoing | ✅ Yes (read-only) |

---

## File Locations

```
/scripts/final/                      # All final scripts
  ├── finalDuplicateRemoval.ts       # Remove duplicates
  ├── verifyNoDuplicates.ts          # Verify database
  ├── addUniqueConstraint.ts         # Add constraints
  ├── monitorDuplicates.ts           # Monitor for duplicates
  └── fixDataGenerationProcess.ts    # Fix scripts

/logs/                               # Generated logs
  ├── duplicate-removal-*.log        # Removal logs
  ├── deleted-ids-*.json             # Backup of deleted IDs
  └── duplicate-monitoring-history.json  # Monitoring history

/reports/                            # Verification reports
  └── verification-*.json            # Detailed reports

/supabase/migrations/                # Generated migrations
  └── *_add_words_unique_constraint.sql
```

---

## Common Scenarios

### Scenario 1: First Time Setup
```bash
npm run duplicates:verify
npm run duplicates:add-constraint
# Execute SQL in Supabase Dashboard
npm run duplicates:fix-scripts -- --analyze-only
```

### Scenario 2: Found Duplicates
```bash
npm run duplicates:remove -- --dry-run
npm run duplicates:remove
npm run duplicates:verify
```

### Scenario 3: Continuous Monitoring
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run duplicates:monitor -- --watch --alert
```

### Scenario 4: Before Deployment
```bash
npm run duplicates:verify -- --detailed --export
# Review report
# Deploy if clean
```

---

## FAQ

**Q: Database is already clean, what should I do?**
A: Add constraints (Phase 4) and fix scripts (Phase 5) to prevent future duplicates.

**Q: Can I run scripts in production?**
A: Yes, but test in staging first. Use --dry-run for safety.

**Q: How do I rollback?**
A: See ULTIMATE_DUPLICATE_ELIMINATION_PLAN.md → Rollback Procedures

**Q: Scripts are failing, what do I do?**
A: Check .env.local has SUPABASE_SERVICE_ROLE_KEY set.

**Q: How often should I monitor?**
A: Daily in CI/CD, continuous during development.

---

## Need More Details?

📖 **Full Documentation**: [ULTIMATE_DUPLICATE_ELIMINATION_PLAN.md](./ULTIMATE_DUPLICATE_ELIMINATION_PLAN.md)

**Includes**:
- Complete execution plan
- Phase-by-phase breakdown
- Detailed script documentation
- Rollback procedures
- Long-term prevention strategy
- Emergency procedures

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  DUPLICATE ELIMINATION QUICK REFERENCE                  │
├─────────────────────────────────────────────────────────┤
│  STATUS CHECK:                                          │
│    npm run duplicates:verify                            │
│                                                          │
│  REMOVE:                                                │
│    npm run duplicates:remove -- --dry-run  (safe)      │
│    npm run duplicates:remove               (live)      │
│                                                          │
│  PROTECT:                                               │
│    npm run duplicates:add-constraint                    │
│    (then execute SQL in Supabase Dashboard)            │
│                                                          │
│  MONITOR:                                               │
│    npm run duplicates:monitor -- --watch --alert        │
│                                                          │
│  EMERGENCY:                                             │
│    1. npm run duplicates:verify -- --detailed           │
│    2. npm run duplicates:remove                         │
│    3. npm run duplicates:verify                         │
└─────────────────────────────────────────────────────────┘
```

---

**Last Updated**: 2025-10-24
**Version**: 1.0
