import React, { useState, useEffect } from 'react';
import { SolvyDataProcessor } from '../lib/solvyDataEngine';
import type { Transaction, TaxReport, InventoryItem } from '../lib/solvyDataEngine';
import UnifiedNav from '../UnifiedNav';
import Footer from '../components/Footer';

const DataDashboard: React.FC = () => {
  const [processor] = useState(() => new SolvyDataProcessor('SOLVY-DEMO-USER'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [taxReport, setTaxReport] = useState<TaxReport | null>(null);
  const [inventoryFeed, setInventoryFeed] = useState<InventoryItem[]>([]);

  // Simulate initial data load
  useEffect(() => {
    // Add some dummy data
    processor.importTransaction({ date: new Date(), sku: 'EBL-GEL-RED', productName: 'OPI Gel Color - Big Apple Red', quantity: 5, amount: 85.00 });
    processor.importTransaction({ date: new Date(), sku: 'EBL-ACETONE-GAL', productName: 'Pure Acetone (1 Gallon)', quantity: 2, amount: 45.00 });
    processor.importTransaction({ date: new Date(), sku: 'EBL-CHAIR-PED-LUX', productName: 'Luxury Pedicure Spa Chair', quantity: 1, amount: 2500.00 });
    
    refreshData();
  }, [processor]);

  const refreshData = () => {
    setTransactions([...processor.getTransactions()]);
    setTaxReport(processor.generateTaxReport(new Date().getFullYear()));
    setInventoryFeed(processor.generateInventoryFeed());
  };

  const handleSimulateSwipe = () => {
    // Simulate a new random transaction
    const items = [
      { sku: 'EBL-LINER-DISP', name: 'Disposable Pedicure Liners', price: 25.00 },
      { sku: 'EBL-DRILL-BIT', name: 'Ceramic Drill Bit (Fine)', price: 15.00 },
      { sku: 'EBL-TABLE-MANI', name: 'Manicure Table with Vent', price: 450.00 }
    ];
    const item = items[Math.floor(Math.random() * items.length)];
    
    processor.importTransaction({
      date: new Date(),
      sku: item.sku,
      productName: item.name,
      quantity: 1,
      amount: item.price
    });
    refreshData();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <UnifiedNav />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SOLVY Data Intelligence Engine</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the "Data Flywheel" in action. See how a simple card swipe transforms into tax savings for members and inventory insights for distributors.
          </p>
        </div>

        {/* Simulation Control */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Simulate a Transaction</h2>
          <p className="text-gray-600 mb-6">Click the button below to simulate a member buying supplies at EBL using their SOLVY Card.</p>
          <button 
            onClick={handleSimulateSwipe}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            💳 Swipe SOLVY Card
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Member Value (Tax Report) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center">
                <span className="text-2xl mr-2">👤</span> Member Value: Tax Report
              </h3>
              <p className="text-blue-100 text-sm mt-1">Automatic categorization for tax deductions.</p>
            </div>
            <div className="p-6">
              {taxReport && (
                <>
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">Total Deductible Expenses</p>
                      <p className="text-4xl font-bold text-gray-900">${taxReport.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Tax Year</p>
                      <p className="text-xl font-bold text-gray-900">{taxReport.taxYear}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {taxReport.categoryBreakdown.map((cat, idx) => (
                      <div key={idx} className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                              {cat.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-600">
                              ${cat.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                          <div style={{ width: `${(cat.amount / taxReport.totalSpent) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Distributor Value (Inventory Feed) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-600 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center">
                <span className="text-2xl mr-2">🏭</span> Distributor Value: Inventory Feed
              </h3>
              <p className="text-green-100 text-sm mt-1">Real-time demand data for restocking.</p>
            </div>
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Sold</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryFeed.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">{item.totalQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Raw Data Log */}
        <div className="mt-12 bg-gray-900 rounded-xl shadow-lg p-6 text-gray-300 font-mono text-sm overflow-hidden">
          <h3 className="text-gray-100 font-bold mb-4 border-b border-gray-700 pb-2">📡 Live Transaction Log (Raw Data)</h3>
          <div className="h-48 overflow-y-auto space-y-2">
            {transactions.slice().reverse().map((tx, idx) => (
              <div key={idx} className="flex space-x-4">
                <span className="text-gray-500">[{tx.date.toLocaleTimeString()}]</span>
                <span className="text-purple-400">{tx.sku}</span>
                <span className="text-white">{tx.productName}</span>
                <span className="text-green-400 ml-auto">${tx.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default DataDashboard;
