import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from databricks import sql
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Example API endpoint
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.get("/api/sample-data")
def get_sample_data():
    """
    Example endpoint that connects to Databricks SQL Warehouse
    Replace the SQL query with your actual catalog.schema.table
    """
    try:
        with sql.connect(
            server_hostname=os.getenv("DATABRICKS_HOST"),
            http_path=os.getenv("DATABRICKS_HTTP_PATH"),
            access_token=os.getenv("DATABRICKS_TOKEN")
        ) as connection:
            with connection.cursor() as cursor:
                # Example query - replace with your actual table
                cursor.execute("SELECT 'Sample' as name, 123 as value, current_timestamp() as timestamp")
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                return [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        return {"error": str(e)}

# Serve React static files (after build)
# Mount build folder only if it exists
if os.path.exists("build"):
    app.mount("/static", StaticFiles(directory="build/static"), name="static")

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        # Serve API routes first, then React app
        if full_path.startswith("api/"):
            return {"error": "API endpoint not found"}

        file_path = f"build/{full_path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse("build/index.html")
