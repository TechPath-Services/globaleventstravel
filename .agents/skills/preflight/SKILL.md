---
name: preflight
description: Run the full preflight quality gate (lint + test + build) across all sub-projects before declaring work complete.
---

# Preflight Quality Gate

Run this skill after making any code changes to ensure nothing is broken.

## Steps

### 1. Run the preflight script

```bash
make preflight
```

This executes `scripts/preflight.sh` which checks all three sub-projects.

### 2. Interpret results

The script outputs a pass/fail status for each check:
- `✓` — Check passed
- `✗` — Check failed (must fix)
- `⊘` — Check skipped (e.g., no test files found)

### 3. Fix failures

| Failure | How to fix |
|---------|-----------|
| `black (format)` | Run `make format` |
| `isort (imports)` | Run `make format` |
| `flake8 (lint)` | Fix the reported lint errors manually |
| `pytest` | Fix failing tests |
| `astro check` | Fix TypeScript errors in `frontend/` |
| `next lint` | Fix ESLint errors in `admin/` |
| `next build` | Fix type/import errors in `admin/` |

### 4. Re-run preflight

After fixing, run `make preflight` again. Repeat until all checks pass.

### 5. Declare work complete

Only report your work as done when preflight exits with code 0 and shows "All preflight checks passed!"

## Individual Checks

If you only changed one sub-project, you can run individual checks:

```bash
# Backend only
make lint-backend
make test-backend

# Frontend only
make lint-frontend

# Admin only
make lint-admin
make build-admin
```

## Common Scenarios

### "I only changed backend Python code"
Run: `make format && make lint-backend && make test-backend`

### "I only changed frontend Astro/React code"
Run: `make lint-frontend`

### "I only changed admin Next.js code"
Run: `make lint-admin && make build-admin`

### "I changed code across multiple sub-projects"
Run: `make preflight` (full check)
