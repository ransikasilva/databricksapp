# Databricks Secrets Setup Guide

This guide shows you how to securely store your Databricks credentials and use them in your app.

## Step 1: Create a Secret Scope

Run this command in your terminal to create a secret scope named `databricks-app-secrets`:

```bash
databricks secrets create-scope databricks-app-secrets
```

## Step 2: Add Your Secrets

Add each of your environment variables as secrets. Run these commands one by one:

```bash
# Add Databricks Host
databricks secrets put-secret databricks-app-secrets databricks_host --string-value "YOUR_DATABRICKS_HOST"

# Add HTTP Path
databricks secrets put-secret databricks-app-secrets databricks_http_path --string-value "YOUR_HTTP_PATH"

# Add Token
databricks secrets put-secret databricks-app-secrets databricks_token --string-value "YOUR_DATABRICKS_TOKEN"
```

## Step 3: Verify Your Secrets

Check that your secrets were created successfully:

```bash
databricks secrets list-secrets databricks-app-secrets
```

You should see three secrets listed:
- `databricks_host`
- `databricks_http_path`
- `databricks_token`

## Step 4: Deploy Your App

Now that the secrets are set up and your `app.yaml` references them, you can deploy your app:

```bash
# Build React first
npm run build

# Deploy the app
databricks apps deploy my-databricks-app --source-code-path .
```

## How It Works

Your `app.yaml` file now references the secrets instead of containing the actual values:

```yaml
env:
  - name: DATABRICKS_HOST
    valueFrom:
      secretKeyRef:
        scope: databricks-app-secrets
        key: databricks_host
```

This means:
- ✅ Your secrets are stored securely in Databricks
- ✅ Your `app.yaml` can be safely pushed to GitHub
- ✅ Your app will have access to the environment variables at runtime
- ✅ You can update secrets without changing your code

## Alternative: Using Databricks UI

If you prefer using the UI instead of CLI:

1. Go to your Databricks workspace
2. Click on your username in the top right
3. Select **Settings** > **Developer** > **Access tokens**
4. Click **Manage** next to **Secrets**
5. Create a new scope named `databricks-app-secrets`
6. Add the three secrets with their respective keys and values

## Troubleshooting

**If deployment fails:**
```bash
# Check app logs
databricks apps logs my-databricks-app

# Check if secrets exist
databricks secrets list-secrets databricks-app-secrets
```

**If secrets are wrong:**
```bash
# Update a secret
databricks secrets put-secret databricks-app-secrets databricks_token --string-value "YOUR_NEW_TOKEN"
```

**If you need to start over:**
```bash
# Delete the scope (this deletes all secrets in it)
databricks secrets delete-scope databricks-app-secrets

# Then create it again and re-add secrets
databricks secrets create-scope databricks-app-secrets
```

## Security Notes

- Never commit actual secret values to Git
- The `app.yaml` with `valueFrom` is safe to commit
- Only people with access to your Databricks workspace can read the secrets
- Rotate your tokens regularly for better security
