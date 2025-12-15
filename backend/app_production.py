import os
import sys
from pathlib import Path

# Add backend directory to path for imports
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import stripe 

# === OPENBAO SECRET LOADING ===
# Load Stripe API key from OpenBao Agent file or fallback to environment variable
try:
    with open('/vault/secrets/stripe_api_key', 'r') as f:
        stripe.api_key = f.read().strip()
        print("✅ Stripe API key loaded successfully from OpenBao")
except FileNotFoundError:
    # Fallback to environment variable for development without OpenBao
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY', '')
    if stripe.api_key:
        print("⚠️  Stripe API key loaded from environment variable (OpenBao not detected)")
    else:
        print("❌ WARNING: No Stripe API key found in OpenBao or environment variables")

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'solvy-mvp-secret-key-2025')

# Enable CORS for all origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize services
from tax_calculations import TaxAssistant
from solvy_connector import SOLVYDebitCardConnector, SOLVYDataIntegrator

tax_assistant = TaxAssistant()
solvy_connector = SOLVYDebitCardConnector()
solvy_integrator = SOLVYDataIntegrator()

# Register Kimi support routes (blueprint)
try:
    from kimi_support import kimi_bp
    app.register_blueprint(kimi_bp)
except Exception:
    # If the module isn't present yet, continue — support endpoint will be available after adding the module
    pass

# Register PMC signup endpoint (blueprint)
try:
    from api.contact_eva import contact_eva_bp
    app.register_blueprint(contact_eva_bp, url_prefix='/api')
except Exception as e:
    print(f"Warning: Could not load contact_eva blueprint: {e}")
    pass

# Register Stripe payment endpoints (if available)
try:
    from api.stripe_payments import stripe_bp
    app.register_blueprint(stripe_bp, url_prefix='/api/stripe')
except Exception as e:
    print(f"Warning: Could not load stripe_payments blueprint: {e}")
    pass

@app.route('/')
def index():
    """Main index route - now serves the dashboard"""
    return render_template('dashboard.html')

@app.route('/api')
def api_info():
    """API information endpoint"""
    return jsonify({
        "service": "SOVEREIGNITITY™ MVP API",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "DeepSeek AI Tax Assistant",
            "SOLVY Debit Card Integration",
            "Financial Dashboard"
        ]
    })

# ===== TAX ASSISTANT ENDPOINTS =====

@app.route('/api/tax/calculate', methods=['POST', 'OPTIONS'])
def calculate_tax():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        income = float(data.get('income', 0))
        filing_status = data.get('filing_status', 'single')
        
        result = tax_assistant.calculate_marginal_tax(income, filing_status)
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/tax/optimize-expenses', methods=['POST', 'OPTIONS'])
def optimize_expenses():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.json
        revenue = float(data.get('revenue', 0))
        expenses = data.get('expenses', {})
        
        # Convert expense values to float
        expenses = {k: float(v) for k, v in expenses.items()}
        
        result = tax_assistant.optimize_business_expenses(revenue, expenses)
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

# ===== SOLVY DEBIT CARD ENDPOINTS =====

@app.route('/api/solvy/connection-test', methods=['GET'])
def test_solvy_connection():
    try:
        report = solvy_connector.generate_connection_report()
        
        return jsonify({
            'success': True,
            'data': report
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/solvy/dashboard', methods=['GET'])
def get_solvy_dashboard():
    try:
        dashboard = solvy_integrator.create_complete_financial_dashboard()
        
        return jsonify({
            'success': True,
            'data': dashboard
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/solvy/card-data', methods=['GET'])
def get_card_data():
    try:
        use_backup = request.args.get('use_backup', 'false').lower() == 'true'
        card_data = solvy_connector.get_debit_card_data(use_backup)
        
        return jsonify({
            'success': True,
            'data': card_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ===== HEALTH CHECK =====

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "SOVEREIGNITITY™ MVP API",
        "timestamp": "2025-10-17"
    })

if __name__ == '__main__':
    print("🚀 SOVEREIGNITITY™ MVP API Starting...")
    print("📊 DeepSeek AI Tax Assistant: ENABLED")
    print("💳 SOLVY Debit Card Integration: ENABLED")
    print("🎨 Web Dashboard: ENABLED")
    print("🌐 Dashboard: http://localhost:5001")
    print("🔧 API: http://localhost:5001/api")
    print("⏹️  Press Ctrl+C to stop")
    
    app.run(host='0.0.0.0', port=5001, debug=False)
