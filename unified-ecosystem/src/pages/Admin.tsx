import { useState } from 'react'
import UnifiedNav from '../components/UnifiedNav'
import './Admin.css'

function Admin() {
  const [isLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return (
      <div className="admin-page">
        <UnifiedNav currentPage="admin" />
        
        <section className="admin-login">
          <div className="login-container">
            <div className="login-card">
              <img src="/SolvyLogo-1024.png" alt="SOLVY" className="login-logo" />
              <h1>Member Dashboard</h1>
              <p>Access your SOLVY Card account, manage settings, and view transaction history.</p>
              
              <form className="login-form">
                <div className="form-group">
                  <label>Email or Member ID</label>
                  <input type="text" placeholder="Enter your email or member ID" />
                </div>
                
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" placeholder="Enter your password" />
                </div>
                
                <button type="submit" className="btn-login">Sign In</button>
              </form>
              
              <div className="login-links">
                <a href="#forgot">Forgot password?</a>
                <span>•</span>
                <a href="https://nitty.ebl.beauty#card">Get Your Card</a>
              </div>
              
              <div className="login-info">
                <p><strong>Coming Soon:</strong> Full member dashboard with card management, transaction history, and data sovereignty controls.</p>
              </div>
            </div>
          </div>
        </section>
        
        <footer className="footer">
          <div className="container">
            <p>&copy; 2025 SOLVY Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    )
  }

  // Logged in dashboard (placeholder for future development)
  return (
    <div className="admin-page">
      <UnifiedNav currentPage="admin" />
      
      <section className="dashboard">
        <div className="container">
          <h1>Welcome Back, Member</h1>
          
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Account Overview</h3>
              <p>View your membership status and account details</p>
            </div>
            
            <div className="dashboard-card">
              <h3>Card Management</h3>
              <p>Manage your SOLVY Cards, set limits, and control settings</p>
            </div>
            
            <div className="dashboard-card">
              <h3>Transaction History</h3>
              <p>View all your transactions and download statements</p>
            </div>
            
            <div className="dashboard-card">
              <h3>Data Sovereignty</h3>
              <p>Control your data, view privacy settings, and manage permissions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Admin
