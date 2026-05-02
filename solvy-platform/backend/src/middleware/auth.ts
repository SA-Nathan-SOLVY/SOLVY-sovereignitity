import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

/**
 * SOLVY Backend Auth Middleware
 * Extracted from Replit workspace / unified-ecosystem
 * Team: XJ4ANN5365
 */

// Staff access code — set in environment, never commit the real value
const STAFF_CODE = process.env.STAFF_ACCESS_CODE || 'SOLVY-STAFF-2025'
const JWT_SECRET = process.env.JWT_SECRET || 'solvy-dev-secret-change-in-production'

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role?: string
    [key: string]: any
  }
}

/**
 * Verify JWT token from Authorization header
 * Adds decoded user to req.user
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' })
  }
}

/**
 * Verify staff token from x-staff-token header
 * Used for internal/admin endpoints (underwriting, prelaunch, etc.)
 */
export function requireStaffToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-staff-token']

  if (!token || token !== STAFF_CODE) {
    return res.status(403).json({
      error: 'Staff access required. This endpoint is for internal use only.'
    })
  }

  next()
}

/**
 * Combined middleware: require auth AND verify user has staff role
 * Assumes requireAuth has already populated req.user
 */
export function requireStaff(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Staff privileges required.' })
  }

  next()
}

/**
 * Allowlist member update middleware
 * Ensures members can only update their own profile,
 * while staff can update any member.
 */
export function allowlistMemberUpdate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  const targetMemberId = req.params.id || req.body.memberId
  const isStaff = req.user.role === 'staff' || req.user.role === 'admin'
  const isOwner = req.user.id === targetMemberId

  if (!isStaff && !isOwner) {
    return res.status(403).json({
      error: 'You can only update your own profile. Contact support for assistance.'
    })
  }

  next()
}

/**
 * Optional auth middleware — attaches user if token present,
 * but doesn't reject requests without one.
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      req.user = decoded
    } catch {
      // Invalid token, continue without user
    }
  }

  next()
}
