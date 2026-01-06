import { v4 as uuidv4 } from 'uuid';

// Types
export interface Transaction {
  id: string;
  date: Date;
  sku: string;
  productName: string;
  quantity: number;
  amount: number;
  taxCategory: string;
}

export interface TaxReport {
  memberId: string;
  taxYear: number;
  totalSpent: number;
  categoryBreakdown: { category: string; amount: number }[];
  transactionCount: number;
}

export interface InventoryItem {
  sku: string;
  productName: string;
  totalQuantity: number;
  purchaseEvents: number;
}

// Logic
export class SolvyDataProcessor {
  private transactions: Transaction[] = [];
  private memberId: string;

  constructor(memberId: string) {
    this.memberId = memberId;
  }

  // Categorization Logic (Beauty Industry)
  private categorizeForTaxes(productName: string): string {
    const lowerName = productName.toLowerCase();
    
    const supplies = ['polish', 'gel', 'acrylic', 'powder', 'monomer', 'acetone', 'file', 'buffer', 'cotton', 'liner', 'tip', 'glue', 'scrub', 'lotion', 'oil', 'mask', 'wax', 'strip', 'alcohol', 'sanitizer'];
    const equipment = ['chair', 'lamp', 'drill', 'table', 'desk', 'sterilizer', 'towel warmer', 'basin', 'light', 'machine'];
    const tools = ['nipper', 'pusher', 'clipper', 'brush', 'bit', 'implement'];

    if (supplies.some(k => lowerName.includes(k))) return 'Supplies & Materials';
    if (equipment.some(k => lowerName.includes(k))) return 'Equipment & Furniture';
    if (tools.some(k => lowerName.includes(k))) return 'Small Tools';
    
    return 'Other Business Expense';
  }

  // Import Transaction
  public importTransaction(data: { date: Date; sku: string; productName: string; quantity: number; amount: number }): Transaction {
    const tx: Transaction = {
      id: uuidv4(),
      date: data.date,
      sku: data.sku,
      productName: data.productName,
      quantity: data.quantity,
      amount: data.amount,
      taxCategory: this.categorizeForTaxes(data.productName)
    };
    this.transactions.push(tx);
    return tx;
  }

  // Generate Tax Report
  public generateTaxReport(year: number): TaxReport {
    const yearlyTx = this.transactions.filter(t => t.date.getFullYear() === year);
    
    const breakdownMap = new Map<string, number>();
    let total = 0;

    yearlyTx.forEach(t => {
      total += t.amount;
      const current = breakdownMap.get(t.taxCategory) || 0;
      breakdownMap.set(t.taxCategory, current + t.amount);
    });

    return {
      memberId: this.memberId,
      taxYear: year,
      totalSpent: total,
      categoryBreakdown: Array.from(breakdownMap.entries()).map(([category, amount]) => ({ category, amount })),
      transactionCount: yearlyTx.length
    };
  }

  // Generate Inventory Feed
  public generateInventoryFeed(): InventoryItem[] {
    const inventoryMap = new Map<string, InventoryItem>();

    this.transactions.forEach(t => {
      const existing = inventoryMap.get(t.sku);
      if (existing) {
        existing.totalQuantity += t.quantity;
        existing.purchaseEvents += 1;
      } else {
        inventoryMap.set(t.sku, {
          sku: t.sku,
          productName: t.productName,
          totalQuantity: t.quantity,
          purchaseEvents: 1
        });
      }
    });

    return Array.from(inventoryMap.values());
  }
  
  // Get Raw Transactions
  public getTransactions(): Transaction[] {
    return this.transactions;
  }
}
