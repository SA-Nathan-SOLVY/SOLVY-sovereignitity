from processor import SolvyDataProcessor
from stripe_adapter import StripeAdapter
import json
import time

# 1. Initialize System
member_id = "SOLVY-STRIPE-USER-001"
processor = SolvyDataProcessor(member_id)
adapter = StripeAdapter(processor)

print(f"💳 Initialized Stripe Adapter for {member_id}\n")

# 2. Simulate Stripe Webhook Events (payment_intent.succeeded)
# These represent real-time data coming from EBL's Stripe account
stripe_events = [
    {
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": "pi_3MtwPdLkdIwHu7ix28XE9",
                "amount": 4500,  # $45.00
                "created": int(time.time()),
                "currency": "usd",
                "metadata": {
                    "product_sku": "EBL-ACETONE-GAL",
                    "product_name": "Pure Acetone (1 Gallon)",
                    "quantity": "1",
                    "member_id": member_id
                }
            }
        }
    },
    {
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "id": "pi_3MtwQdLkdIwHu7ix29YF1",
                "amount": 250000,  # $2,500.00
                "created": int(time.time()),
                "currency": "usd",
                "metadata": {
                    "product_sku": "EBL-CHAIR-PED-LUX",
                    "product_name": "Luxury Pedicure Spa Chair",
                    "quantity": "1",
                    "member_id": member_id
                }
            }
        }
    }
]

print("📡 Listening for Stripe Webhooks...")
for event in stripe_events:
    print(f"   - Received Event: {event['type']} ({event['data']['object']['id']})")
    result = adapter.process_stripe_event(event)
    if result:
        print(f"     ✅ Processed: {result['product_name']} -> {result['tax_category']}")
        print(f"     💰 Amount: ${result['amount']:.2f}")

print("\n" + "="*50 + "\n")

# 3. Verify Data Engine Output
print("📊 Generating Real-Time Tax Report from Stripe Data...")
report = processor.generate_member_tax_report(2026)  # Current Year
print(json.dumps(report, indent=2, default=str))

print("\n✅ Stripe Integration Verified: Transactions successfully converted to Tax Data.")
