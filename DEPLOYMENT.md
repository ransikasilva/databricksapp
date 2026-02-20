# Deploy to Databricks Apps

Your app is **ready to deploy**! The production build is complete.

## Option 1: Deploy via Databricks UI (Recommended - Easiest)

1. **Go to your Databricks workspace:**
   - Navigate to your Databricks workspace URL

2. **Create a new App:**
   - Click on **"Compute"** in the left sidebar
   - Click on **"Apps"** tab
   - Click **"Create App"**

3. **Upload your app files:**
   - App name: `my-databricks-app` (or any name you prefer)
   - Source code: Upload the entire project folder OR connect to a Git repository

4. **Set Environment Variables** in the App settings:
   ```
   DATABRICKS_HOST=<your-databricks-workspace-url>
   DATABRICKS_HTTP_PATH=<your-sql-warehouse-http-path>
   DATABRICKS_TOKEN=<your-databricks-token>
   ```

   *Note: Use the values from your `.env` file*

5. **The app will automatically:**
   - Install Python dependencies from `requirements.txt`
   - Run the command specified in `app.yaml`
   - Serve your React app on the Databricks platform

6. **Access your app:**
   - Once deployed, you'll get a URL like: `https://<your-workspace>/apps/my-databricks-app`

---

## Option 2: Deploy via Databricks CLI

### Step 1: Install the new Databricks CLI

**On macOS:**
```bash
# Update Command Line Tools first (if needed)
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install

# Then install Databricks CLI
brew tap databricks/tap
brew install databricks
```

**On Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sudo sh
```

### Step 2: Configure Authentication

```bash
databricks configure --token
# Enter your workspace URL: <your-databricks-workspace-url>
# Enter your token: <your-databricks-token>
```

### Step 3: Create the App (First time only)

```bash
databricks apps create my-databricks-app --description "Databricks React App"
```

### Step 4: Deploy

```bash
# Make sure you're in the project directory
cd /Users/ransika/Documents/databricksapp

# Deploy the app
databricks apps deploy my-databricks-app --source-code-path .
```

### Step 5: Set Environment Variables

```bash
databricks apps update my-databricks-app \
  --set-env DATABRICKS_HOST=<your-workspace-url> \
  --set-env DATABRICKS_HTTP_PATH=<your-warehouse-path> \
  --set-env DATABRICKS_TOKEN=<your-token>
```

### Step 6: View Your App

```bash
# Get app details including URL
databricks apps get my-databricks-app

# View logs
databricks apps logs my-databricks-app
```

---

## Option 3: Deploy via Git Integration

1. **Push your code to a Git repository** (GitHub, GitLab, Azure DevOps)

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **In Databricks UI:**
   - Go to Apps → Create App
   - Choose "Git" as source
   - Connect your Git repository
   - Set the branch (e.g., `main`)
   - Configure environment variables in the UI

3. **Databricks will automatically:**
   - Pull code from Git
   - Build and deploy on every push

---

## What Gets Deployed

Your deployment includes:

✅ **Backend:** FastAPI server (`app.py`)
✅ **Frontend:** React production build (`build/` folder)
✅ **Dependencies:** Python packages from `requirements.txt`
✅ **Configuration:** `app.yaml` deployment settings
✅ **Environment:** Your Databricks credentials (via env vars)

---

## Verify Deployment

Once deployed, your app will be accessible at:
```
https://<your-databricks-workspace>/apps/my-databricks-app
```

The app will:
- Serve the React frontend at the root URL
- Provide API endpoints at `/api/*`
- Connect to your Databricks SQL Warehouse automatically

---

## Troubleshooting

**App shows blank page:**
- Ensure `npm run build` was run before deployment
- Check that the `build/` folder exists

**API connection errors:**
- Verify environment variables are set correctly in Databricks Apps settings
- Check SQL Warehouse is running

**View logs:**
```bash
databricks apps logs my-databricks-app --follow
```

---

## Current Status

✅ Production build created (`build/` folder)
✅ All files ready for deployment
✅ Environment configured
⏳ Ready to deploy via Databricks UI or CLI

**Next:** Choose Option 1 (UI) for the easiest deployment experience!
