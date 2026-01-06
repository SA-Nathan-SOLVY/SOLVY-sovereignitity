# 💳 How to Connect EBL Sales to the SOLVY Data Engine

**For EBL Owners & Managers**

This guide explains how to ensure every sale at EBL automatically helps your members save on taxes and helps you track inventory. You do **not** need to be a programmer to do this.

---

## ✅ Option 1: Using Stripe Payment Links (No Code)

If you use Stripe Payment Links to sell items (like sending a link to a customer for a "Pedicure Chair"), follow these steps:

1.  **Create a Payment Link** in your Stripe Dashboard.
2.  **Add Product Details:**
    *   When adding a product, click **"Additional Options"** or **"Metadata"**.
    *   Add a new metadata field:
        *   **Key:** `product_sku`
        *   **Value:** `EBL-CHAIR-PED-LUX` (or your internal code)
    *   Add another field:
        *   **Key:** `product_name`
        *   **Value:** `Luxury Pedicure Spa Chair`
3.  **Save & Send:** Send the link to your customer. When they pay, SOLVY will automatically see the SKU and categorize it as "Equipment" for their tax report.

---

## 💻 Option 2: Using a Custom Website/Checkout (For Developers)

If you have a developer or use a custom checkout page, give them this snippet. They just need to add `metadata` to the checkout session.

### **Copy-Paste Code Snippet (Node.js)**

```javascript
const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Luxury Pedicure Spa Chair',
          // ⬇️ THIS IS THE MAGIC PART ⬇️
          metadata: {
            product_sku: 'EBL-CHAIR-PED-LUX',
            product_category: 'Equipment'
          },
        },
        unit_amount: 250000, // $2,500.00
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://ebl.beauty/success',
  cancel_url: 'https://ebl.beauty/cancel',
});
```

---

## ❓ Why are we doing this?

By adding these simple "tags" (metadata) to your sales:

1.  **For Your Members:** SOLVY instantly knows that a "Pedicure Chair" is a **tax-deductible business expense**. The member gets a ready-to-file tax report at the end of the year.
2.  **For EBL:** You get a **Reverse Inventory Feed** showing exactly what products are moving, helping you restock faster and negotiate better deals with suppliers like SPS.

---

**Need Help?**
Contact the SOLVY Technical Team at `tech@solvy.org` for assistance with setting up your Stripe account.
