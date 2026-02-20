import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS for local development and Databricks deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Databricks Apps deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Example API endpoint
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

def execute_databricks_sql(query):
    """Execute SQL query using Databricks SQL Statements API"""
    try:
        # Get host and ensure it doesn't have protocol prefix
        databricks_host = os.getenv('DATABRICKS_HOST', '').replace('https://', '').replace('http://', '')

        url = f"https://{databricks_host}/api/2.0/sql/statements"
        headers = {
            "Authorization": f"Bearer {os.getenv('DATABRICKS_TOKEN')}",
            "Content-Type": "application/json"
        }
        payload = {
            "warehouse_id": os.getenv('DATABRICKS_HTTP_PATH').split('/')[-1],
            "statement": query,
            "wait_timeout": "30s"
        }

        print(f"DEBUG: Making request to {url}")
        print(f"DEBUG: Warehouse ID: {payload['warehouse_id']}")
        print(f"DEBUG: Query: {query}")

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()

        print(f"DEBUG: Response status: {result['status']['state']}")

        if result["status"]["state"] == "SUCCEEDED":
            # Extract column names
            columns = [col["name"] for col in result["manifest"]["schema"]["columns"]]
            # Extract rows
            rows = result.get("result", {}).get("data_array", [])

            print(f"DEBUG: Retrieved {len(rows)} rows")

            # Convert to list of dictionaries
            return [dict(zip(columns, row)) for row in rows]
        else:
            print(f"Query failed with state: {result['status']['state']}")
            return []

    except Exception as e:
        print(f"Error executing Databricks SQL: {e}")
        import traceback
        traceback.print_exc()
        return []

def get_sales_data_from_databricks():
    """Get real sales data from Databricks table"""
    try:
        sales_data = execute_databricks_sql("SELECT * FROM workspace.default.sales_data")

        # Convert data types
        for row in sales_data:
            if 'date' in row and row['date']:
                row['date'] = str(row['date'])
            if 'id' in row:
                row['id'] = int(row['id'])
            if 'quantity' in row:
                row['quantity'] = int(row['quantity'])
            if 'unit_price' in row:
                row['unit_price'] = float(row['unit_price'])
            if 'revenue' in row:
                row['revenue'] = float(row['revenue'])

        return sales_data
    except Exception as e:
        print(f"Error fetching data from Databricks: {e}")
        return []

@app.get("/api/sales/overview")
def get_sales_overview():
    """Get high-level sales KPIs from Databricks"""
    sales_data = get_sales_data_from_databricks()

    total_revenue = sum(item["revenue"] for item in sales_data)
    total_orders = len(sales_data)
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    total_quantity = sum(item["quantity"] for item in sales_data)

    return {
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "avg_order_value": round(avg_order_value, 2),
        "total_items_sold": total_quantity,
        "unique_customers": len(set(item["customer_id"] for item in sales_data))
    }

@app.get("/api/sales/trends")
def get_sales_trends():
    """Get sales trends over time from Databricks"""
    sales_data = get_sales_data_from_databricks()

    # Group by month
    monthly_data = {}
    for item in sales_data:
        month = item["date"][:7]  # YYYY-MM
        if month not in monthly_data:
            monthly_data[month] = {"revenue": 0, "orders": 0, "quantity": 0}
        monthly_data[month]["revenue"] += item["revenue"]
        monthly_data[month]["orders"] += 1
        monthly_data[month]["quantity"] += item["quantity"]

    trends = [
        {
            "month": month,
            "revenue": round(data["revenue"], 2),
            "orders": data["orders"],
            "quantity": data["quantity"]
        }
        for month, data in sorted(monthly_data.items())
    ]

    return trends

@app.get("/api/sales/by-product")
def get_sales_by_product():
    """Get sales breakdown by product from Databricks"""
    sales_data = get_sales_data_from_databricks()

    product_data = {}
    for item in sales_data:
        product = item["product"]
        if product not in product_data:
            product_data[product] = {"revenue": 0, "quantity": 0, "orders": 0}
        product_data[product]["revenue"] += item["revenue"]
        product_data[product]["quantity"] += item["quantity"]
        product_data[product]["orders"] += 1

    products = [
        {
            "product": product,
            "revenue": round(data["revenue"], 2),
            "quantity": data["quantity"],
            "orders": data["orders"]
        }
        for product, data in sorted(
            product_data.items(),
            key=lambda x: x[1]["revenue"],
            reverse=True
        )
    ]

    return products

@app.get("/api/sales/by-region")
def get_sales_by_region():
    """Get sales breakdown by region from Databricks"""
    sales_data = get_sales_data_from_databricks()

    region_data = {}
    for item in sales_data:
        region = item["region"]
        if region not in region_data:
            region_data[region] = {"revenue": 0, "orders": 0}
        region_data[region]["revenue"] += item["revenue"]
        region_data[region]["orders"] += 1

    regions = [
        {
            "region": region,
            "revenue": round(data["revenue"], 2),
            "orders": data["orders"]
        }
        for region, data in sorted(
            region_data.items(),
            key=lambda x: x[1]["revenue"],
            reverse=True
        )
    ]

    return regions

@app.get("/api/sales/by-category")
def get_sales_by_category():
    """Get sales breakdown by category from Databricks"""
    sales_data = get_sales_data_from_databricks()

    category_data = {}
    for item in sales_data:
        category = item["category"]
        if category not in category_data:
            category_data[category] = {"revenue": 0, "quantity": 0}
        category_data[category]["revenue"] += item["revenue"]
        category_data[category]["quantity"] += item["quantity"]

    categories = [
        {
            "category": category,
            "revenue": round(data["revenue"], 2),
            "quantity": data["quantity"]
        }
        for category, data in sorted(
            category_data.items(),
            key=lambda x: x[1]["revenue"],
            reverse=True
        )
    ]

    return categories

@app.get("/api/sales/recent")
def get_recent_sales():
    """Get recent sales transactions from Databricks"""
    sales_data = get_sales_data_from_databricks()

    # Sort by date descending and take top 20
    recent = sorted(sales_data, key=lambda x: x["date"], reverse=True)[:20]

    return recent

@app.get("/api/sample-data")
def get_sample_data():
    """Get sample data from Databricks table"""
    return get_sales_data_from_databricks()

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
