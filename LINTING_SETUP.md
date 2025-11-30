# Linting Setup Guide

This document explains how to set up automatic linting checks before pushing code to prevent linting errors in CI/CD.

## Quick Setup

After cloning the repository or pulling the latest changes with the updated `package.json`, run:

```bash
npm install
npm run prepare
```

This will:
1. Install husky as a dev dependency
2. Initialize the git hooks

## Manual Pre-Push Hook Setup

If the automatic setup doesn't work, you can manually create the pre-push hook:

1. Create the `.husky` directory:
   ```bash
   mkdir -p .husky
   ```

2. Create the pre-push hook file:
   ```bash
   cat > .husky/pre-push << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "Running linter before push..."
npm run lint

if [ $? -ne 0 ]; then
  echo "❌ Linting failed! Please fix the errors before pushing."
  exit 1
fi

echo "✅ Linting passed!"
EOF
   ```

3. Make the hook executable:
   ```bash
   chmod +x .husky/pre-push
   ```

## How It Works

The pre-push hook runs automatically whenever you try to push code to the remote repository. It:

1. Runs `npm run lint` (ESLint)
2. If linting passes, the push proceeds
3. If linting fails, the push is blocked and you'll see the errors

## Running the Linter Manually

You can run the linter at any time without pushing:

```bash
npm run lint
```

## Common ESLint Issues

### Console Statements
ESLint disallows `console.log()`, `console.error()`, etc. in production code. Use proper error handling and user-facing notifications instead.

**❌ Bad:**
```typescript
console.error("Error:", error);
toast({ title: "Error", description: error.message });
```

**✅ Good:**
```typescript
toast({ title: "Error", description: error.message });
```

### Unused Variables
Remove or prefix unused variables with an underscore:

**❌ Bad:**
```typescript
const handleClick = (event) => { /* event not used */ }
```

**✅ Good:**
```typescript
const handleClick = (_event) => { /* explicitly unused */ }
// or
const handleClick = () => { /* removed unused parameter */ }
```

## Bypassing the Hook (Not Recommended)

If you absolutely need to bypass the pre-push hook (e.g., emergency hotfix), use:

```bash
git push --no-verify
```

**Warning:** This should be avoided as it defeats the purpose of the linting check and may cause CI/CD failures.

## Troubleshooting

### Hook Not Running
If the pre-push hook isn't running:

1. Ensure you've run `npm install` after the `package.json` update
2. Check that `.husky/pre-push` exists and is executable:
   ```bash
   ls -la .husky/pre-push
   ```
3. Manually run the prepare script:
   ```bash
   npm run prepare
   ```

### CI Still Failing
If CI is still failing after the hook passes locally:

1. Ensure your local `node_modules` is up to date: `npm install`
2. Check that you're using the same Node.js version as CI (v20)
3. Clear ESLint cache: `rm -rf node_modules/.cache`
