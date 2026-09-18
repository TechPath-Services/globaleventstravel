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
