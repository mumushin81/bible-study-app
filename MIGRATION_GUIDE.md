# 🔐 Security & Compatibility Migration Guide

**Date:** 2025-10-29  
**Priority:** 🚨 HIGH - Security vulnerability fix

## 📋 Summary

This migration fixes critical security and compatibility issues:

1. **Security:** Adds missing RLS policies to 5 tables
2. **Compatibility:** Fixes UUID functions for deployment to new Supabase environments

---

## 🚨 Issues Fixed

### Issue #1: Missing RLS Policies (Security Vulnerability)
The following tables were created without RLS policies, allowing any authenticated user to read/modify everyone's data:
- ❌ `user_book_progress` - User learning progress
- ❌ `user_word_progress_v2` - User SRS data
- ❌ `hebrew_roots` - Public educational content
- ❌ `word_derivations` - Public educational content
- ❌ `word_metadata` - Public educational content

### Issue #2: UUID Function Compatibility
7 tables use `uuid_generate_v4()` which doesn't exist in default Supabase installations.

---

## ✅ Pre-Migration Verification

Open Supabase Dashboard → SQL Editor and run:
```sql
-- Copy from: scripts/verify/verify_rls_status.sql
```

---

## 🚀 Applying Migrations

### Supabase Dashboard (Recommended)

1. **Backup your database first!**
2. **Apply in order:**
   - `supabase/migrations/20251029_fix_uuid_defaults.sql`
   - `supabase/migrations/20251029_add_missing_rls_policies.sql`

---

## ✅ Post-Migration Verification

Run verification query again to confirm all tables show `✅ ENABLED`.

---

## 📞 Need Help?

Check `scripts/verify/verify_rls_status.sql` for detailed verification queries.
