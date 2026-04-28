import { useState, useRef } from 'react'
import Papa from 'papaparse'
import readXlsxFile from 'read-excel-file'
import UnifiedNav from '../components/UnifiedNav'
import SolvyFooter from '../components/SolvyFooter'
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

    const extension = file.name.split('.').pop()?.toLowerCase()

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const jsonData = results.data as Record<string, unknown>[]
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
            console.error('Error parsing CSV:', error)
            setUploadError('Error parsing file. Please ensure it is a valid .csv file.')
            setIsProcessing(false)
          }
        },
        error: () => {
          setUploadError('Error reading file. Please try again.')
          setIsProcessing(false)
        }
      })
    } else if (extension === 'xlsx') {
      readXlsxFile(file).then((rows) => {
        try {
          if (rows.length < 2) {
            setUploadError('No data found in the file. Please check the file format.')
            setIsProcessing(false)
            return
          }
          const headers = rows[0].map(h => String(h ?? '').toLowerCase())
          const jsonData: Record<string, unknown>[] = rows.slice(1).map(row => {
            const rowData: Record<string, unknown> = {}
            headers.forEach((header, i) => {
              rowData[header] = row[i]
            })
            return rowData
          })
          const data: InventoryItem[] = jsonData.map(row => parseRowData(row, headers))
          setUploadedData(data)
          setIsProcessing(false)
        } catch (error) {
          console.error('Error parsing XLSX:', error)
          setUploadError('Error parsing file. Please ensure it is a valid .xlsx file.')
          setIsProcessing(false)
        }
      }).catch(() => {
        setUploadError('Error reading file. Please try again.')
        setIsProcessing(false)
      })
    } else {
      setUploadError('Unsupported file format. Please upload a .csv or .xlsx file.')
      setIsProcessing(false)
    }
  }

  const needsReorder = uploadedData.filter(item => item.quantity <= item.reorderPoint)

  return (
    <div className="sps-app">
      <UnifiedNav currentPage="sps" />

      {/* Hero Section */}
      <section className="sps-hero">
        <div className="container">
          <h1>SPS Joint Venture</h1>
          <p className="sps-proposal-label">— PROPOSAL —</p>
          <p className="sps-tagline">SOLVY Card Pilot Partner #2</p>
          <div className="sps-badge">Purchase Tracking • Expense Reporting • SOLVY Card Integration</div>
        </div>
      </section>

      {/* Partnership Deck */}
      <section style={{ background: '#0f1e2c', padding: '28px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ color: '#ffb347', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Partnership Presentation</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>The SOLVY Data Flywheel — SPS Joint Venture</div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Strategic revenue model, data flywheel mechanics, and cooperative growth framework</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/presentations/SOLVY-Data-Flywheel-SPS-Partnership.pdf" target="_blank" rel="noopener noreferrer"
              style={{ background: '#ffb347', color: '#0f1e2c', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block' }}>
              View Presentation ↗
            </a>
            <a href="/presentations" style={{ background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block' }}>
              All Decks
            </a>
          </div>
        </div>
      </section>

      {/* About SPS Section */}
      <section className="sps-about">
        <div className="container">
          <h2>Scaling SOLVY Through Strategic Partnership</h2>
          <p>
            SPS Joint Venture is our proposed second pilot partner, demonstrating how SOLVY Card can 
            scale across multiple businesses. SPS is a major nail care supplier of Evergreen Beauty Lounge — 
            and the opportunity is clear: by providing SPS customers with SOLVY Cards, we create a seamless 
            ecosystem where customers can track every purchase, generate ready-to-file expense reports for tax 
            season, and build cooperative ownership stake with every transaction.
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
            Upload your purchase history or inventory file (.csv, .xlsx) to build a reverse inventory 
            tracking system. This helps anticipate when to replenish stock from your suppliers.
          </p>

          <div className="upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="file-input"
              id="inventory-file"
            />
            <label htmlFor="inventory-file" className="upload-label">
              <div className="upload-icon">📁</div>
              <span className="upload-text">
                {fileName ? fileName : 'Click to upload .csv or .xlsx file'}
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
          <p>Join the SOLVY Ecosystem™ and scale your business with SOLVY Card™ integration.</p>
          <a href="/#apply" className="btn-primary">Apply for SOLVY Card™</a>
        </div>
      </section>

      <SolvyFooter />
    </div>
  )
}

export default SPS
