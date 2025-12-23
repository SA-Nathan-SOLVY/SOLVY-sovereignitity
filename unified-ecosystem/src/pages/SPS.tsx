import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import EBLNav from '../components/EBLNav'
import './SPS.css'

interface InventoryItem {
  product: string
  sku: string
  quantity: number
  reorderPoint: number
  supplier: string
  lastPurchase: string
}

function SPS() {
  const [uploadedData, setUploadedData] = useState<InventoryItem[]>([])
  const [fileName, setFileName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseRowData = (row: Record<string, unknown>, headers: string[]): InventoryItem => {
    const getValue = (keys: string[], fallbackIndex: number): string => {
      for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) {
          return String(row[key])
        }
      }
      const headerKey = headers[fallbackIndex]
      if (headerKey && row[headerKey] !== undefined) {
        return String(row[headerKey])
      }
      return ''
    }

    return {
      product: getValue(['product', 'Product', 'PRODUCT', 'item', 'Item', 'name', 'Name'], 0),
      sku: getValue(['sku', 'SKU', 'Sku', 'code', 'Code', 'id', 'ID'], 1),
      quantity: parseInt(getValue(['quantity', 'Quantity', 'QUANTITY', 'qty', 'Qty', 'stock', 'Stock'], 2)) || 0,
      reorderPoint: parseInt(getValue(['reorderpoint', 'reorderPoint', 'ReorderPoint', 'reorder', 'Reorder', 'min', 'Min'], 3)) || 10,
      supplier: getValue(['supplier', 'Supplier', 'SUPPLIER', 'vendor', 'Vendor'], 4),
      lastPurchase: getValue(['lastpurchase', 'lastPurchase', 'LastPurchase', 'date', 'Date', 'last_purchase'], 5)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsProcessing(true)
    setUploadError('')

    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]
        
        if (jsonData.length === 0) {
          setUploadError('No data found in the file. Please check the file format.')
          setIsProcessing(false)
          return
        }
        
        const headers = Object.keys(jsonData[0] || {}).map(h => h.toLowerCase())
        const data: InventoryItem[] = jsonData.map(row => parseRowData(row, headers))
        
        setUploadedData(data)
        setIsProcessing(false)
      } catch (error) {
        console.error('Error parsing file:', error)
        setUploadError('Error parsing file. Please ensure it is a valid .csv, .xls, or .xlsx file.')
        setIsProcessing(false)
      }
    }
    
    reader.onerror = () => {
      setUploadError('Error reading file. Please try again.')
      setIsProcessing(false)
    }
    
    reader.readAsArrayBuffer(file)
  }

  const needsReorder = uploadedData.filter(item => item.quantity <= item.reorderPoint)

  return (
    <div className="sps-app">
      <EBLNav currentPage="sps" />

      {/* Hero Section */}
      <section className="sps-hero">
        <div className="container">
          <h1>SPS Joint Venture</h1>
          <p className="sps-tagline">SOLVY Card Pilot Partner #2</p>
          <div className="sps-badge">Reverse Inventory Tracking • Expense Reporting • SOLVY Card Integration</div>
        </div>
      </section>

      {/* About SPS Section */}
      <section className="sps-about">
        <div className="container">
          <h2>Scaling SOLVY Through Strategic Partnership</h2>
          <p>
            SPS Joint Venture is our second pilot partner, demonstrating how SOLVY Card can scale across 
            multiple businesses. By providing SPS customers with SOLVY Cards, we're creating a seamless 
            ecosystem for purchase tracking and expense reporting.
          </p>
          
          <div className="sps-benefits">
            <div className="benefit-card">
              <div className="benefit-icon">💳</div>
              <h3>SOLVY Cards for Customers</h3>
              <p>Duplicate and scale SPS ability to track purchases with cooperative ownership benefits</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📊</div>
              <h3>Purchase History Reports</h3>
              <p>Automatic expense reporting from SOLVY Card transactions</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔄</div>
              <h3>Reverse Inventory</h3>
              <p>Track what customers buy to anticipate supplier replenishment needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* File Upload Section */}
      <section className="sps-upload" id="inventory">
        <div className="container">
          <h2>Reverse Inventory Tracking</h2>
          <p className="upload-description">
            Upload your purchase history or inventory file (.csv, .xls) to build a reverse inventory 
            tracking system. This helps anticipate when to replenish stock from your suppliers.
          </p>

          <div className="upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileUpload}
              className="file-input"
              id="inventory-file"
            />
            <label htmlFor="inventory-file" className="upload-label">
              <div className="upload-icon">📁</div>
              <span className="upload-text">
                {fileName ? fileName : 'Click to upload .csv or .xls file'}
              </span>
              <span className="upload-hint">Drag and drop or click to browse</span>
            </label>
          </div>

          {isProcessing && (
            <div className="processing">
              <div className="spinner"></div>
              <p>Processing your file...</p>
            </div>
          )}

          {uploadError && (
            <div className="upload-error">
              <p>{uploadError}</p>
            </div>
          )}

          {uploadedData.length > 0 && (
            <div className="inventory-results">
              <h3>Inventory Analysis</h3>
              
              {needsReorder.length > 0 && (
                <div className="reorder-alert">
                  <h4>⚠️ Items Needing Reorder ({needsReorder.length})</h4>
                  <ul>
                    {needsReorder.map((item, index) => (
                      <li key={index}>
                        <strong>{item.product}</strong> - Only {item.quantity} left (reorder at {item.reorderPoint})
                        {item.supplier && <span className="supplier"> - Supplier: {item.supplier}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="inventory-table-wrapper">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Quantity</th>
                      <th>Reorder Point</th>
                      <th>Supplier</th>
                      <th>Last Purchase</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.map((item, index) => (
                      <tr key={index} className={item.quantity <= item.reorderPoint ? 'low-stock' : ''}>
                        <td>{item.product}</td>
                        <td>{item.sku}</td>
                        <td>{item.quantity}</td>
                        <td>{item.reorderPoint}</td>
                        <td>{item.supplier}</td>
                        <td>{item.lastPurchase}</td>
                        <td>
                          <span className={`status ${item.quantity <= item.reorderPoint ? 'reorder' : 'ok'}`}>
                            {item.quantity <= item.reorderPoint ? 'Reorder' : 'OK'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="export-actions">
                <button className="btn-export">Export Reorder List</button>
                <button className="btn-generate">Generate Supplier Report</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SOLVY Card Integration */}
      <section className="sps-solvy-integration">
        <div className="container">
          <h2>SOLVY Card Integration</h2>
          <p>
            Every SPS customer receives a SOLVY Card, enabling automatic purchase tracking and 
            expense reporting. As cooperative owners, their transactions build both their purchase 
            history and their ownership stake.
          </p>
          
          <div className="integration-flow">
            <div className="flow-step">
              <div className="step-number">1</div>
              <h4>Customer Gets SOLVY Card</h4>
              <p>SPS customers become SOLVY cooperative owners</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="step-number">2</div>
              <h4>Purchase with Card</h4>
              <p>Transactions automatically tracked</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="step-number">3</div>
              <h4>Expense Reports</h4>
              <p>Instant purchase history reports</p>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="step-number">4</div>
              <h4>Inventory Insights</h4>
              <p>Reverse inventory for replenishment</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="sps-cta">
        <div className="container">
          <h2>Partner with SPS Joint Venture</h2>
          <p>Join our cooperative ecosystem and scale your business with SOLVY Card integration</p>
          <a href="/#apply" className="btn-primary">Apply for SOLVY Card</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="sps-footer">
        <div className="container">
          <p><strong>SPS Joint Venture</strong></p>
          <p>SOLVY Card Pilot Partner #2</p>
          <p>© 2025 SOLVY Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default SPS
