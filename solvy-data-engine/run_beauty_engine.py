from processor import SolvyDataProcessor
from datetime import datetime
import json
import pandas as pd

# 1. Initialize the Processor for a Beauty Professional (Member)
member_id = "SOLVY-TECH-001"
processor = SolvyDataProcessor(member_id)

print(f"💅 Initialized SolvyDataProcessor for {member_id} (Nail Tech)\n")

# 2. Simulate EBL Transactions (Raw Data from Point of Sale)
# Real-world examples of what a nail tech buys
transactions = [
    {
        'timestamp': '2024-01-15T10:30:00',
        'date': datetime(2024, 1, 15),
        'product_sku': 'EBL-GEL-OPI-RED',
        'product_name': 'OPI Gel Color - Big Apple Red',
        'quantity': 5,
        'amount': 85.00
    },
    {
        'timestamp': '2024-01-15T10:35:00',
        'date': datetime(2024, 1, 15),
        'product_sku': 'EBL-ACETONE-GAL',
        'product_name': 'Pure Acetone (1 Gallon)',
        'quantity': 2,
        'amount': 45.00
    },
    {
        'timestamp': '2024-02-10T14:20:00',
        'date': datetime(2024, 2, 10),
        'product_sku': 'EBL-DRILL-KUPA',
        'product_name': 'Kupa ManiPro Passport E-File Drill',
        'quantity': 1,
        'amount': 350.00
    },
    {
        'timestamp': '2024-03-05T09:15:00',
        'date': datetime(2024, 3, 5),
        'product_sku': 'EBL-LINER-DISP',
        'product_name': 'Disposable Pedicure Liners (100ct)',
        'quantity': 3,
        'amount': 75.00
    },
    {
        'timestamp': '2024-03-05T09:15:00',
        'date': datetime(2024, 3, 5),
        'product_sku': 'EBL-BUFFER-BLK',
        'product_name': 'Black Sanding Buffers (50ct)',
        'quantity': 2,
        'amount': 25.00
    },
    {
        'timestamp': '2024-04-12T11:00:00',
        'date': datetime(2024, 4, 12),
        'product_sku': 'EBL-CHAIR-PED-LUX',
        'product_name': 'Luxury Pedicure Spa Chair',
        'quantity': 1,
        'amount': 2500.00
    }
]

print("📥 Importing EBL Transactions...")
for tx in transactions:
    processed = processor.import_sps_transaction(tx)
    print(f"   - Processed: {processed['product_name']} -> {processed['tax_category']}")

print("\n" + "="*50 + "\n")

# 3. Generate Member Tax Report (Value for Nail Tech)
print("📊 Generating Member Tax Report (2024)...")
tax_report = processor.generate_member_tax_report(2024)
print(json.dumps(tax_report, indent=2, default=str))

print("\n" + "="*50 + "\n")

# 4. Generate EBL Inventory Feed (Value for Distributor)
print("🏭 Generating EBL Reverse Inventory Feed...")
inventory_feed = processor.generate_sps_inventory_feed()

# Display as a clean table
print(inventory_feed.to_string(index=False))

# Export to CSV (simulating the file sent to EBL)
csv_filename = "ebl_inventory_feed.csv"
inventory_feed.to_csv(csv_filename, index=False)
print(f"\n✅ Inventory feed exported to {csv_filename}")
