import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from databricks import sql
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random

# Load environment variables
load_dotenv()

app = FastAPI()

# Example API endpoint
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

def generate_sample_sales_data():
    """Generate realistic sample sales data for demo"""
    products = [
        "Laptop", "Smartphone", "Tablet", "Headphones", "Smartwatch",
        "Monitor", "Keyboard", "Mouse", "Webcam", "Speaker"
    ]
    categories = ["Electronics", "Accessories", "Computers", "Audio", "Wearables"]
    regions = ["North America", "Europe", "Asia", "South America", "Africa"]

    sales_data = []
    base_date = datetime.now() - timedelta(days=365)

    for i in range(500):
        sale_date = base_date + timedelta(days=random.randint(0, 365))
        product = random.choice(products)

        sales_data.append({
            "id": i + 1,
            "date": sale_date.strftime("%Y-%m-%d"),
            "product": product,
            "category": random.choice(categories),
            "region": random.choice(regions),
            "quantity": random.randint(1, 20),
            "unit_price": round(random.uniform(50, 2000), 2),
            "revenue": 0,  # will calculate below
            "customer_id": f"CUST{random.randint(1000, 9999)}"
        })

        sales_data[-1]["revenue"] = round(
            sales_data[-1]["quantity"] * sales_data[-1]["unit_price"], 2
        )

    return sales_data

@app.get("/api/sales/overview")
def get_sales_overview():
    """Get high-level sales KPIs"""
    sales_data = generate_sample_sales_data()

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
    """Get sales trends over time"""
    sales_data = generate_sample_sales_data()

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
    """Get sales breakdown by product"""
    sales_data = generate_sample_sales_data()

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
    """Get sales breakdown by region"""
    sales_data = generate_sample_sales_data()

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
    """Get sales breakdown by category"""
    sales_data = generate_sample_sales_data()

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
    """Get recent sales transactions"""
    sales_data = generate_sample_sales_data()

    # Sort by date descending and take top 20
    recent = sorted(sales_data, key=lambda x: x["date"], reverse=True)[:20]

    return recent

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
