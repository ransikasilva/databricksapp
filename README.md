# Databricks React App

Full-stack application deployed on Databricks Apps with React frontend and FastAPI backend.

## Quick Start

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
uvicorn app:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm start
```

The app will open at `http://localhost:3000`

## Environment Variables

Your environment is already configured in `.env`:
- **Databricks Host:** `https://dbc-c23120d2-efa8.cloud.databricks.com`
- **HTTP Path:** `/sql/1.0/warehouses/fcf42eaf967ad434`
- **Token:** Already set (never commit this!)

## Project Structure

```
├── app.py                  # FastAPI backend
├── app.yaml                # Databricks Apps config
├── requirements.txt        # Python dependencies
├── package.json            # Node dependencies
├── src/
│   ├── App.js             # React root
│   ├── api/client.js      # API wrapper
│   ├── pages/             # Page components
│   └── components/        # Reusable components
└── CLAUDE.md              # Full development guide
```

## Building for Production

```bash
npm run build
```

## Deployment to Databricks

```bash
# First time only
databricks apps create my-databricks-app

# Deploy
npm run build
databricks apps deploy my-databricks-app --source-code-path .
```

## Next Steps

1. Update the SQL query in `app.py` to query your actual Databricks tables
2. Add more API endpoints in `app.py`
3. Create new pages in `src/pages/`
4. Customize the dashboard in `src/pages/Dashboard.js`

## Documentation

See [CLAUDE.md](CLAUDE.md) for complete development guide.
