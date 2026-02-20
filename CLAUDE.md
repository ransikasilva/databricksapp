# Databricks React App — Claude Code Guide

## Project Overview

This is a full-stack single-page application (SPA) deployed on **Databricks Apps**.
- **Frontend:** React (Create React App)
- **Backend:** Python FastAPI
- **Data Layer:** Databricks SQL Warehouse via `databricks-sql-connector`
- **Deployment:** Databricks Apps (via Databricks CLI)

---

## Project Structure

```
my-databricks-app/
├── CLAUDE.md               ← this file
├── app.py                  ← FastAPI backend entry point
├── app.yaml                ← Databricks Apps deployment config
├── requirements.txt        ← Python dependencies
├── .env.example            ← Example env vars (never commit .env)
├── .gitignore
├── build/                  ← React production build (generated, do not edit)
├── public/
│   └── index.html
└── src/
    ├── index.js
    ├── App.js
    ├── api/
    │   └── client.js       ← Axios/fetch wrapper for API calls
    ├── components/         ← Reusable UI components
    ├── pages/              ← Page-level components
    └── hooks/              ← Custom React hooks
```

---

## Environment Variables

These are **never hardcoded**. Set them in the Databricks Apps UI under app Settings → Environment Variables, or in a local `.env` file for development.

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABRICKS_HOST` | Workspace URL | `https://adb-xxxx.azuredatabricks.net` |
| `DATABRICKS_HTTP_PATH` | SQL Warehouse HTTP path | `/sql/1.0/warehouses/abc123` |
| `DATABRICKS_TOKEN` | Personal Access Token or Service Principal token | `dapixxxxxxxx` |
| `REACT_APP_API_BASE_URL` | Backend API base URL (for local dev) | `http://localhost:8000` |

### Local `.env` file (never commit this)
```
DATABRICKS_HOST=https://adb-xxxx.azuredatabricks.net
DATABRICKS_HTTP_PATH=/sql/1.0/warehouses/abc123
DATABRICKS_TOKEN=dapixxxxxxxxxxxxxxxx
REACT_APP_API_BASE_URL=http://localhost:8000
```

---

## Backend (FastAPI — `app.py`)

### Key Rules
- All Databricks connections go through `databricks-sql-connector`
- Always use environment variables for credentials — never hardcode
- All API routes are prefixed with `/api/`
- The React `build/` folder is mounted at `/` as static files
- Always close SQL connections using context managers (`with` blocks)

### Example Route Pattern
```python
@app.get("/api/your-endpoint")
def your_endpoint():
    with sql.connect(
        server_hostname=os.getenv("DATABRICKS_HOST"),
        http_path=os.getenv("DATABRICKS_HTTP_PATH"),
        access_token=os.getenv("DATABRICKS_TOKEN")
    ) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM catalog.schema.table LIMIT 100")
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            return [dict(zip(columns, row)) for row in rows]
```

### Adding a New API Endpoint
1. Add the route in `app.py`
2. Use `os.getenv()` for any secrets
3. Return JSON-serializable data (dicts/lists)
4. Test locally with `uvicorn app:app --reload`

---

## Frontend (React)

### Key Rules
- All API calls go through `src/api/client.js` — never call fetch/axios directly in components
- Use environment variable `REACT_APP_API_BASE_URL` for the API base URL
- Use React hooks for state management (useState, useEffect, useContext)
- Components go in `src/components/`, pages go in `src/pages/`

### API Client Pattern (`src/api/client.js`)
```javascript
const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function fetchData(endpoint) {
  const response = await fetch(`${BASE_URL}/api/${endpoint}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
```

### Adding a New Page
1. Create `src/pages/YourPage.js`
2. Import and use `fetchData` from `src/api/client.js`
3. Register the route in `src/App.js`
4. Run `npm run build` before deploying

---

## Running Locally (Development)

### Terminal 1 — Start the Python backend
```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Terminal 2 — Start the React dev server
```bash
npm install
npm start
```

React runs on `http://localhost:3000`, backend on `http://localhost:8000`.

Add this to `package.json` to proxy API calls during local dev:
```json
"proxy": "http://localhost:8000"
```

---

## Building for Production

Always build React before deploying:

```bash
npm run build
```

This outputs to `build/` which FastAPI serves as static files.

---

## Deployment to Databricks Apps

### First-time setup
```bash
# Install Databricks CLI
pip install databricks-cli

# Authenticate
databricks configure --token
# Enter: workspace URL + personal access token

# Create the app (first time only)
databricks apps create my-databricks-app
```

### Deploy
```bash
# Build React first
npm run build

# Deploy
databricks apps deploy my-databricks-app --source-code-path .
```

### View the app
Go to **Databricks UI → Compute → Apps** and click the app URL.

---

## `app.yaml` (Databricks Apps config)

```yaml
command:
  - uvicorn
  - app:app
  - --host
  - 0.0.0.0
  - --port
  - "8000"
```

---

## `requirements.txt`

```
fastapi
uvicorn
databricks-sql-connector
python-dotenv
```

---

## Common Tasks for Claude Code

When asking Claude Code to help, here are example prompts to use:

- **"Add a new API endpoint that queries `catalog.schema.table` and returns the results"**
- **"Create a new React page that displays data from `/api/your-endpoint` in a table"**
- **"Add a loading spinner and error handling to the data fetch in `YourPage.js`"**
- **"Build and deploy the app to Databricks"**
- **"Add a search/filter input to the data table on the dashboard page"**

---

## Security Rules (Always Follow)

- Never hardcode `DATABRICKS_TOKEN` or any secret in source code
- Never commit `.env` to git — it's in `.gitignore`
- For production, replace Personal Access Token with a **Service Principal** token
- Validate and sanitize any user input before passing it to SQL queries
- Use parameterized queries to prevent SQL injection:
  ```python
  cursor.execute("SELECT * FROM table WHERE id = %s", (user_id,))
  ```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| App shows blank page after deploy | Make sure you ran `npm run build` before deploying |
| API calls fail locally | Check that backend is running on port 8000 and `proxy` is set in `package.json` |
| `DATABRICKS_TOKEN` not found | Set env vars in Databricks Apps UI under Settings |
| SQL connection timeout | Check SQL Warehouse is running and HTTP path is correct |
| Deploy fails | Run `databricks apps logs my-databricks-app` to see error details |

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `app.py` | FastAPI backend — add all API routes here |
| `app.yaml` | Databricks Apps deployment config — usually don't need to change |
| `requirements.txt` | Python dependencies — add new packages here |
| `src/App.js` | React root — add new routes/pages here |
| `src/api/client.js` | API call wrapper — all fetch logic lives here |
| `package.json` | Node dependencies and proxy config |