# Quality Standards for 864zeros

## Overview
These mandatory quality gates must pass before any code is considered complete. No exceptions.

## Quality Gates

### 1. Linting
All code must pass linting without errors.

| Language | Tool | Command |
|----------|------|---------|
| JavaScript/TypeScript | ESLint | `npx eslint .` |
| Python | flake8 | `flake8 --max-line-length=120` |

**Configuration files:**
- `.eslintrc.js` for JS/TS projects
- `.flake8` or `setup.cfg` for Python projects

### 2. Build Verification
Code must compile/build without errors.

| Project Type | Command |
|--------------|---------|
| React Native | `npx react-native bundle --entry-file index.js --bundle-output /dev/null` |
| Python | `python -m py_compile <file>` |
| TypeScript | `npx tsc --noEmit` |

### 3. Unit Tests
Core functions must have unit tests that pass.

| Language | Tool | Command |
|----------|------|---------|
| JavaScript/TypeScript | Jest | `npm test` |
| Python | pytest | `pytest` |

**Minimum requirements:**
- All API endpoints have tests
- All utility functions have tests
- Test coverage > 60% for new code

### 4. No Hardcoded Secrets
Code must never contain:
- API keys
- Passwords
- Tokens
- Private keys
- Connection strings with credentials

**Use instead:**
- Environment variables
- GitHub Secrets for CI/CD
- `.env` files (gitignored)

**Verification:**
```bash
# Check for common secret patterns
grep -rE "(api_key|password|secret|token).*=.*['\"][^'\"]+['\"]" --include="*.py" --include="*.js" --include="*.ts" .
```

### 5. Documentation
Every project must have:
- `README.md` with:
  - Project description
  - Setup instructions
  - Environment variables required
  - How to run locally
  - How to run tests

## Pre-Commit Checklist

Before marking any task complete:

- [ ] `flake8` passes (Python)
- [ ] `eslint` passes (JS/TS)
- [ ] Build succeeds without errors
- [ ] Tests pass
- [ ] No secrets in code
- [ ] README is updated

## CI/CD Integration

The GitHub Actions workflow runs these checks automatically:
1. Install dependencies
2. Run linter
3. Run build
4. Run tests
5. Only then execute agent tasks

## Failure Handling

If any quality gate fails:
1. Do NOT mark the task as complete
2. Fix the issue first
3. Re-run checks
4. Only proceed when all gates pass

## Adding New Quality Gates

To add a new quality gate:
1. Document it in this file
2. Add the check to `.github/workflows/agent.yml`
3. Update CLAUDE.md if it affects the boot sequence
