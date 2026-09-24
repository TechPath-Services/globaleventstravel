# Coding Standards

## Python (backend/)

### Formatting
- **Formatter**: black (line length: 100)
- **Import sorting**: isort (profile: black, line length: 100)
- **Linter**: flake8 (max line length: 100)
- Run `make format` to auto-fix formatting issues.

### Naming Conventions
- `snake_case` for files, functions, variables, and module names
- `PascalCase` for classes (SQLAlchemy models, Pydantic schemas)
- Prefix private methods/attributes with `_`

### Type Annotations
- Full type annotations are required on all functions
- Use `mypy` strict mode (configured in `pyproject.toml`)
- Pydantic schemas in `app/models/`, SQLAlchemy models in `app/db/models/`

### Structure
- All models must have `created_at` and `updated_at` timestamps
- CRUD operations go in `app/crud/`, extending `CRUDBase`
- Business logic goes in `app/services/`, not in endpoints
- Endpoint handlers stay thin — delegate to CRUD/services

### Imports
```python
# Standard library
import os
from datetime import datetime

# Third-party
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Local
from app.core.config import settings
from app.db.session import get_db
```

## TypeScript (frontend/ & admin/)

### Naming Conventions
- `PascalCase` for components and component files
- `camelCase` for utilities, hooks, and variables
- Typed props interfaces for all components

### Frontend (Astro)
- Astro components use `Astro.props` with typed interfaces
- React islands use `client:load` directive
- File-based routing under `src/pages/`

### Admin (Next.js)
- App Router with route groups: `(auth)/` and `(dashboard)/`
- Forms use React Hook Form + Zod validation
- State management via Zustand stores
- API calls go through `src/services/api-client.ts`

### Styling
- Tailwind CSS for both frontend and admin
- Use design tokens from `tailwind.config` — avoid arbitrary values
- Keep component styles co-located

## General

- Preserve all existing comments and docstrings unrelated to your changes
- Keep commits focused — one logical change per commit
- Never hardcode API URLs — always use environment variables
