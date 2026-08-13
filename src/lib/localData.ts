// Local-first data layer (EPIC-001).
// Member transactions live ONLY in the browser via IndexedDB. They are never
// sent to the server in raw form. Only PII-free aggregates computed here are
// ever transmitted (see buildAggregate / the /api/data-pools/contribute call).

const DB_NAME = 'solvy-local-data'
const DB_VERSION = 1
const STORE = 'transactions'
const CONTRIBUTOR_KEY = 'solvy-contributor-id'

export interface LocalTransaction {
  id?: number
  date: string // YYYY-MM-DD
  amount: number
  category: string
  // merchant + note stay on-device only and are NEVER aggregated or sent.
  merchant?: string
  note?: string
  createdAt: string
}

// PII-free aggregate shape — the only thing that may leave the device.
export interface PoolAggregate {
  transactionCount: number
  totalSpend: number
  periodMonths: number
  categories: Record<string, { count: number; total: number }>
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function addTransaction(
  tx: Omit<LocalTransaction, 'id' | 'createdAt'>
): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction(STORE, 'readwrite')
    t.objectStore(STORE).add({ ...tx, createdAt: new Date().toISOString() })
    t.oncomplete = () => resolve()
    t.onerror = () => reject(t.error)
  })
  db.close()
}

export async function listTransactions(): Promise<LocalTransaction[]> {
  const db = await openDB()
  const rows = await new Promise<LocalTransaction[]>((resolve, reject) => {
    const t = db.transaction(STORE, 'readonly')
    const req = t.objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result as LocalTransaction[])
    req.onerror = () => reject(req.error)
  })
  db.close()
  return rows.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction(STORE, 'readwrite')
    t.objectStore(STORE).delete(id)
    t.oncomplete = () => resolve()
    t.onerror = () => reject(t.error)
  })
  db.close()
}

export async function clearAllTransactions(): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const t = db.transaction(STORE, 'readwrite')
    t.objectStore(STORE).clear()
    t.oncomplete = () => resolve()
    t.onerror = () => reject(t.error)
  })
  db.close()
}

// A stable, random, non-PII token so re-contributing replaces a prior aggregate
// for the same device rather than duplicating it. It is not tied to any identity.
export function getContributorId(): string {
  let id = localStorage.getItem(CONTRIBUTOR_KEY)
  if (!id) {
    id =
      (crypto.randomUUID && crypto.randomUUID()) ||
      'c-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(CONTRIBUTOR_KEY, id)
  }
  return id
}

const round2 = (n: number) => Math.round(n * 100) / 100

// Build a PII-free aggregate from local transactions. Strips merchant, note,
// dates, and per-row data — only category counts/totals and span survive.
export function buildAggregate(txs: LocalTransaction[]): PoolAggregate {
  const categories: Record<string, { count: number; total: number }> = {}
  let totalSpend = 0
  let minDate = ''
  let maxDate = ''
  for (const tx of txs) {
    const cat = (tx.category || 'Uncategorized').trim()
    if (!categories[cat]) categories[cat] = { count: 0, total: 0 }
    categories[cat].count += 1
    categories[cat].total = round2(categories[cat].total + tx.amount)
    totalSpend = round2(totalSpend + tx.amount)
    if (!minDate || tx.date < minDate) minDate = tx.date
    if (!maxDate || tx.date > maxDate) maxDate = tx.date
  }
  let periodMonths = 0
  if (minDate && maxDate) {
    const a = new Date(minDate)
    const b = new Date(maxDate)
    periodMonths =
      Math.max(
        1,
        (b.getFullYear() - a.getFullYear()) * 12 +
          (b.getMonth() - a.getMonth()) +
          1
      )
  }
  return { transactionCount: txs.length, totalSpend, periodMonths, categories }
}
