from processor import SolvyDataProcessor
from datetime import datetime
import json
import pandas as pd

# 1. Initialize the Processor for a Member
member_id = "SOLVY-MEMBER-001"
processor = SolvyDataProcessor(member_id)

print(f"🚀 Initialized SolvyDataProcessor for {member_id}\n")

# 2. Simulate SPS Transactions (Raw Data from Point of Sale)
# In a real system, this would come from an API or CSV upload
transactions = [
    {
        'timestamp': '2024-01-15T10:30:00',
        'date': datetime(2024, 1, 15),
        'product_sku': 'SPS-NAIL-3IN-GALV',
        'product_name': '3-inch Galvanized Nails (Box)',
        'quantity': 5,
        'amount': 45.50
    },
    {
        'timestamp': '2024-01-15T10:35:00',
        'date': datetime(2024, 1, 15),
        'product_sku': 'SPS-LUMBER-2X4-8',
        'product_name': '2x4x8 Treated Lumber',
        'quantity': 20,
        'amount': 180.00
    },
    {
        'timestamp': '2024-02-10T14:20:00',
        'date': datetime(2024, 2, 10),
        'product_sku': 'SPS-TOOL-DRILL-DEWALT',
        'product_name': 'DeWalt Cordless Drill Kit',
        'quantity': 1,
        'amount': 199.99
    },
    {
        'timestamp': '2024-03-05T09:15:00',
        'date': datetime(2024, 3, 5),
        'product_sku': 'SPS-SAFETY-GLOVES-L',
        'product_name': 'Heavy Duty Safety Gloves (L)',
        'quantity': 3,
        'amount': 45.00
    },
    {
        'timestamp': '2024-03-05T09:15:00',
        'date': datetime(2024, 3, 5),
        'product_sku': 'SPS-NAIL-3IN-GALV',
        'product_name': '3-inch Galvanized Nails (Box)',
        'quantity': 2,
        'amount': 18.20
    }
]

print("📥 Importing Transactions...")
for tx in transactions:
    processed = processor.import_sps_transaction(tx)
    print(f"   - Processed: {processed['product_name']} -> {processed['tax_category']}")

print("\n" + "="*50 + "\n")

# 3. Generate Member Tax Report (Value for Member)
print("📊 Generating Member Tax Report (2024)...")
tax_report = processor.generate_member_tax_report(2024)
print(json.dumps(tax_report, indent=2, default=str))

print("\n" + "="*50 + "\n")

# 4. Generate SPS Inventory Feed (Value for Distributor)
print("🏭 Generating SPS Reverse Inventory Feed...")
inventory_feed = processor.generate_sps_inventory_feed()

# Display as a clean table
print(inventory_feed.to_string(index=False))

# Export to CSV (simulating the file sent to SPS)
csv_filename = "sps_inventory_feed.csv"
inventory_feed.to_csv(csv_filename, index=False)
print(f"\n✅ Inventory feed exported to {csv_filename}")
