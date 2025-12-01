# GitHub Secrets Setup Guide

This guide explains how to configure the required GitHub secrets for the Claude Code GitHub Action with Supabase and JAM MCP servers.

## Required Secrets

Navigate to your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

### 1. `ANTHROPIC_API_KEY`
**Description**: API key for Claude AI
**How to get it**:
1. Go to https://console.anthropic.com/
2. Navigate to API Keys section
3. Create a new API key
4. Copy and paste into GitHub secret

---

### 2. `VITE_SUPABASE_URL`
**Description**: Your Supabase project URL
**Current value**: `https://auwryajmnerplgpjlbxf.supabase.co`
**How to get it**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL"

---

### 3. `VITE_SUPABASE_PUBLISHABLE_KEY`
**Description**: Supabase anonymous/public key (safe to expose in frontend)
**Current value**: Found in your `.env` file
**How to get it**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the "anon" / "public" key under "Project API keys"

---

### 4. `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **IMPORTANT**
**Description**: Supabase service role key with admin privileges (NEVER expose in frontend)
**Security**: This key bypasses Row Level Security (RLS) - keep it secret!
**How to get it**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the "service_role" key under "Project API keys"
5. ⚠️ **NEVER commit this to your repository or `.env` file**

---

### 5. `JAM_API_KEY`
**Description**: JAM API key for accessing Jam captures programmatically
**How to get it**:
1. Go to https://jam.dev
2. Navigate to Settings → API Keys (or Team Settings)
3. Create a new API key
4. Copy and paste into GitHub secret

**Note**: JAM authentication in GitHub Actions uses the API key directly, so no interactive login is needed!

---

## How to Add Secrets to GitHub

For each secret above:

1. Go to your repository on GitHub
2. Click **Settings** (repository settings, not profile)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Enter the secret name (exactly as shown above)
6. Paste the secret value
7. Click **Add secret**

## Verification

After adding all secrets, your GitHub Actions workflow will have access to:
- **Supabase MCP**: Full database access via service role key
- **JAM MCP**: Access to bug reports and session replays
- **Claude AI**: AI-powered code assistance

## Security Best Practices

✅ **DO**:
- Store all sensitive keys as GitHub secrets
- Use service role key only in backend/CI environments
- Regularly rotate API keys

❌ **DON'T**:
- Never commit `SUPABASE_SERVICE_ROLE_KEY` to version control
- Never expose service role key in frontend code
- Never share API keys in public channels

## Testing

To test if secrets are configured correctly:
1. Create a test issue or comment with `@claude`
2. Check the GitHub Actions logs
3. Verify MCP servers initialize successfully

## Troubleshooting

**Error: "SUPABASE_SERVICE_ROLE_KEY not found"**
- Make sure you copied the service_role key, not the anon key
- Verify the secret name matches exactly (case-sensitive)

**Error: "JAM_API_KEY not found"**
- Ensure you created the API key in JAM settings
- Check that the secret is named exactly `JAM_API_KEY`

**MCP servers not connecting**
- Check GitHub Actions logs for detailed error messages
- Verify all secrets are set correctly
- Ensure the MCP server package names are correct
