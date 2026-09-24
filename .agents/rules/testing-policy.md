# Testing Policy

## Mandatory Checks

Every code change MUST pass `make preflight` before being declared complete. The preflight script runs:

### Backend (Python)
| Check | Command | What it catches |
|-------|---------|-----------------|
| Format | `black --check app/` | Inconsistent formatting |
| Imports | `isort --check-only app/` | Misordered imports |
| Lint | `flake8 app/` | Style violations, unused imports, errors |
| Tests | `pytest` | Regressions, broken logic |

### Frontend (Astro)
| Check | Command | What it catches |
|-------|---------|-----------------|
| TypeScript | `npm run check` (astro check) | Type errors, missing props |

### Admin (Next.js)
| Check | Command | What it catches |
|-------|---------|-----------------|
| Lint | `npm run lint` (next lint) | ESLint violations |
| Build | `npm run build` | Type errors, import issues, build failures |

## When to Write Tests

### Backend
- **New endpoints**: Add integration tests in `backend/tests/` using `httpx` + `TestClient`
- **New CRUD operations**: Add unit tests for non-trivial query logic
- **Bug fixes**: Add a regression test that reproduces the bug before fixing it
- **Services**: Test external service integrations with mocked dependencies

### Frontend / Admin
- TypeScript strict mode serves as the primary safety net
- `astro check` and `next build` catch most type-level issues
- Complex React components with business logic should have unit tests if a test framework is set up

## Test File Conventions

- Backend test files: `backend/tests/test_<module>.py` or `backend/tests/<module>_test.py`
- Use `pytest` fixtures for database sessions, test clients, and authenticated users
- Test function names: `test_<what_it_does>` (e.g., `test_create_trek_returns_201`)

## Running Checks

```bash
# Full preflight (all sub-projects)
make preflight

# Individual checks
make lint-backend
make lint-frontend
make lint-admin
make test-backend
make format        # Auto-fix formatting
```
