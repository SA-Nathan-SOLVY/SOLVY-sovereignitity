from datetime import datetime
from processor import SolvyDataProcessor

class StripeAdapter:
    """
    Adapts Stripe Transaction Objects (PaymentIntents/Charges) 
    into the format required by SolvyDataProcessor.
    """
    
    def __init__(self, processor: SolvyDataProcessor):
        self.processor = processor
        
    def process_stripe_event(self, stripe_event):
        """
        Takes a raw Stripe Event (e.g., payment_intent.succeeded)
        and extracts SKU-level data from metadata.
        """
        # In a real scenario, this would handle the webhook payload structure
        # For this demo, we assume we are passing the 'data.object' (PaymentIntent)
        payment_intent = stripe_event.get('data', {}).get('object', {})
        
        # Metadata is key! EBL must pass product details here.
        # Format assumption: metadata={'sku_1': 'EBL-GEL-RED', 'qty_1': '5', ...}
        # OR a JSON string in a single field if the cart is complex.
        metadata = payment_intent.get('metadata', {})
        
        # Extract timestamp
        created_ts = payment_intent.get('created', datetime.now().timestamp())
        tx_date = datetime.fromtimestamp(created_ts)
        
        # We need to parse the metadata to find line items.
        # This is a simplified parser assuming a flat structure for the MVP.
        # In production, we'd look up the SKU in a product DB to get the name.
        
        # Let's assume metadata contains:
        # 'product_sku': 'EBL-GEL-RED'
        # 'product_name': 'OPI Gel Color'
        # 'quantity': '5'
        
        # If there are multiple items, Stripe metadata is limited (50 keys).
        # A robust solution often stores a 'cart_id' in metadata and fetches details from the EBL DB.
        # But for this adapter, we'll support a single-item checkout or a simplified list.
        
        if 'product_sku' in metadata:
            # Single item flow
            raw_data = {
                'transaction_id': payment_intent.get('id'),
                'date': tx_date,
                'product_sku': metadata.get('product_sku'),
                'product_name': metadata.get('product_name', 'Unknown Product'),
                'quantity': int(metadata.get('quantity', 1)),
                'amount': float(payment_intent.get('amount', 0)) / 100.0  # Stripe is in cents
            }
            return self.processor.import_sps_transaction(raw_data)
            
        else:
            # Fallback or Multi-item logic would go here
            print(f"⚠️ No product data found in Stripe metadata for {payment_intent.get('id')}")
            return None
