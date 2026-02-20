# How to Upload CSV to Databricks and Use in Your App

## Step 1: Upload CSV to Databricks

### Option A: Upload via Databricks UI (Easiest)

1. **Go to your Databricks workspace**
   - Navigate to: https://dbc-c23120d2-efa8.cloud.databricks.com

2. **Create a new catalog/schema (if needed)**
   - Click on **"Data"** in the left sidebar
   - Click **"Create"** → **"Catalog"** (or use existing one like `main`)
   - Create a schema: **"Create"** → **"Schema"** (e.g., `sales_analytics`)

3. **Upload the CSV file**
   - Go to **"Data"** → Click your catalog (e.g., `main`)
   - Click your schema (e.g., `sales_analytics`)
   - Click **"Create Table"**
   - Select **"Upload File"**
   - Choose: `sample_sales_data.csv` from your Downloads folder
   - Table name: `sales_data`
   - Click **"Create Table"**

4. **Your table path will be:**
   ```
   main.sales_analytics.sales_data
   ```

### Option B: Upload via Notebook

1. **Create a new notebook** in Databricks
2. **Upload the CSV file to DBFS:**

```python
# Cell 1: Upload file (you can drag and drop the CSV into the notebook)
# Or use dbutils to upload

# Cell 2: Create Delta Table from CSV
from pyspark.sql import SparkSession

# Read CSV
df = spark.read.csv(
    "dbfs:/FileStore/sample_sales_data.csv",  # Path where you uploaded
    header=True,
    inferSchema=True
)

# Show the data
display(df)

# Save as Delta table
df.write.format("delta").mode("overwrite").saveAsTable("main.sales_analytics.sales_data")

print("✅ Table created: main.sales_analytics.sales_data")
```

## Step 2: Verify the Table

Run this query in a Databricks SQL Editor or Notebook:

```sql
SELECT * FROM main.sales_analytics.sales_data LIMIT 10;
```

## Step 3: Update Your App to Use Real Data

Once the table is created, you'll need to update the app code to query this table instead of using hardcoded data.

### Update the Backend (app.py)

Replace the `generate_sample_sales_data()` function with a real Databricks query:

```python
def get_sales_data_from_databricks():
    """Get sales data from Databricks table"""
    try:
        with sql.connect(
            server_hostname=os.getenv("DATABRICKS_HOST"),
            http_path=os.getenv("DATABRICKS_HTTP_PATH"),
            access_token=os.getenv("DATABRICKS_TOKEN")
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM main.sales_analytics.sales_data")
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                return [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []
```

Then update each endpoint to use this function instead of `generate_sample_sales_data()`.

## Step 4: Test the Connection

After uploading the CSV and creating the table, you can test the connection by:

1. Making sure your SQL Warehouse is running
2. Running a simple query in Databricks SQL Editor
3. Testing the API endpoint locally

## Quick Commands

### Check if table exists:
```sql
SHOW TABLES IN main.sales_analytics;
```

### View table schema:
```sql
DESCRIBE main.sales_analytics.sales_data;
```

### Count rows:
```sql
SELECT COUNT(*) FROM main.sales_analytics.sales_data;
```

### Query by date:
```sql
SELECT * FROM main.sales_analytics.sales_data
WHERE date >= '2024-06-01'
ORDER BY date DESC;
```

---

## File Location

The CSV file has been created at:
```
/Users/ransika/Documents/databricksapp/sample_sales_data.csv
```

You can find this file in your project folder and upload it to Databricks!

## Next Steps

1. Upload the CSV to Databricks using either Option A or Option B above
2. Note down your table path (e.g., `main.sales_analytics.sales_data`)
3. Let me know when you're done, and I'll update the app code to use the real data!
