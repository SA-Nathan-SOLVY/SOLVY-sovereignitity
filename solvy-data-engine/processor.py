import pandas as pd
from datetime import datetime
import hashlib

class SolvyDataProcessor:
    """Processes SOLVY Card transactions for Reverse Inventory & Member Reports (Beauty Industry Context)"""
    
    def __init__(self, member_id, member_consent=True):
        # Data is processed under member's sovereign control
        self.member_id = member_id
        self.consent_given = member_consent 
        self.transactions = []
        
    def import_sps_transaction(self, raw_data):
        """Imports a single transaction from SPS/EBL point-of-sale"""
        # Key: Capture SKU-level detail, not just totals
        # Generate a deterministic ID based on timestamp if not provided
        tx_id = raw_data.get('transaction_id')
        if not tx_id:
            tx_id = hashlib.sha256(str(raw_data['timestamp']).encode()).hexdigest()[:10]

        transaction = {
            'transaction_id': tx_id,
            'member_id': self.member_id,
            'date': raw_data['date'],
            'sku': raw_data['product_sku'],  # Critical for inventory
            'product_name': raw_data['product_name'],
            'quantity': raw_data['quantity'],
            'amount': raw_data['amount'],
            'tax_category': self._categorize_for_taxes(raw_data['product_name'])
        }
        if self.consent_given:
            self.transactions.append(transaction)
        return transaction
    
    def _categorize_for_taxes(self, product_name):
        """Categorizes product for tax reporting (Beauty Industry Specific)"""
        product_lower = product_name.lower()
        
        # 1. Cost of Goods Sold (COGS) / Supplies
        # Consumables used directly on clients
        supplies_keywords = [
            'polish', 'gel', 'acrylic', 'powder', 'monomer', 'acetone', 
            'file', 'buffer', 'cotton', 'liner', 'tip', 'glue', 'scrub', 
            'lotion', 'oil', 'mask', 'wax', 'strip', 'alcohol', 'sanitizer'
        ]
        
        # 2. Equipment / Assets
        # Durable goods that last longer than a year
        equipment_keywords = [
            'chair', 'lamp', 'drill', 'table', 'desk', 'sterilizer', 
            'towel warmer', 'basin', 'light', 'machine'
        ]
        
        # 3. Tools (Small Wares)
        # Reusable but small items
        tools_keywords = [
            'nipper', 'pusher', 'clipper', 'brush', 'bit', 'implement'
        ]

        for keyword in supplies_keywords:
            if keyword in product_lower:
                return 'Supplies & Materials'
                
        for keyword in equipment_keywords:
            if keyword in product_lower:
                return 'Equipment & Furniture'
                
        for keyword in tools_keywords:
            if keyword in product_lower:
                return 'Small Tools'

        return 'Other Business Expense'
    
    def generate_member_tax_report(self, year):
        """Generates annual summary for member tax preparation"""
        yearly_data = [t for t in self.transactions if t['date'].year == year]
        if not yearly_data:
            return {
                'member_id': self.member_id,
                'tax_year': year,
                'total_spent': 0.0,
                'category_breakdown': [],
                'transaction_count': 0,
                'message': 'No transactions found for this tax year.'
            }

        df = pd.DataFrame(yearly_data)
        summary = df.groupby('tax_category')['amount'].sum().reset_index()
        return {
            'member_id': self.member_id,
            'tax_year': year,
            'total_spent': float(df['amount'].sum()),
            'category_breakdown': summary.to_dict('records'),
            'transaction_count': len(yearly_data)
        }
    
    def generate_sps_inventory_feed(self):
        """Anonymous, aggregated product demand data for Distributor replenishment"""
        if not self.transactions:
            return pd.DataFrame()

        df = pd.DataFrame(self.transactions)
        # Aggregate by product SKU for inventory insights
        inventory_demand = df.groupby(['sku', 'product_name']).agg({
            'quantity': 'sum',
            'transaction_id': 'count'
        }).reset_index()
        inventory_demand.rename(columns={'transaction_id': 'purchase_events'}, inplace=True)
        return inventory_demand
