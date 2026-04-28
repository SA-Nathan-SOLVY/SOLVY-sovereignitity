"""
MOLI Program - Membership Owned Life Insurance
Part of the SOLVY Ecosystem

MOLI operationalizes the Sheila Mandate by converting member premiums into
perpetual generational protection through cooperative-owned whole life insurance.

Architecture:
- Cooperative (SA Nathan LLC) owns the policy
- Member is the insured
- Cash value growth flows back as patronage dividends (70/20/10)
- Tax-free policy loans collateralized by cooperative-owned cash value
"""

from dataclasses import dataclass
from typing import Dict, Optional
from decimal import Decimal, ROUND_HALF_UP


@dataclass
class MOLIPolicy:
    """Represents a single MOLI policy within the cooperative pool."""
    policy_id: str
    member_id: str
    carrier: str
    face_amount: Decimal
    annual_premium: Decimal
    cash_value: Decimal = Decimal("0.00")
    pua_rider_active: bool = True
    
    # Sheila Mandate ratios
    PATRONAGE_RATIO = Decimal("0.70")
    COMMUNITY_RATIO = Decimal("0.20")
    OPERATIONS_RATIO = Decimal("0.10")


class MOLIProgram:
    """
    Membership Owned Life Insurance Program.
    
    The cooperative owns policies on members' lives. Premiums create
    cash value that becomes a perpetual protection vehicle—eventually
    housing Sheila's VCF award as generational infrastructure.
    """
    
    APPROVED_CARRIERS = [
        "OneAmerica",  # Founder's existing IBC policy carrier
        "MassMutual",
        "Guardian Life",
        "New York Life",
        "Mutual Life Insurance Company"
    ]
    
    def __init__(self, carrier: str = "Mutual Life Insurance Company"):
        if carrier not in self.APPROVED_CARRIERS:
            raise ValueError(f"Carrier {carrier} not in approved mutual list")
        
        self.carrier = carrier
        self.policy_type = "Whole Life with PUA Rider"
        self.ownership_model = "Trust-Owned or Cooperative-Owned"
        self.policies: Dict[str, MOLIPolicy] = {}
        self.community_pool = Decimal("0.00")
        self.operations_reserve = Decimal("0.00")
    
    def premium_flow(self, member_id: str, member_premium: Decimal) -> Dict[str, Decimal]:
        """
        Route member premium through the Sheila Mandate split.
        
        70% -> Member patronage / cash value allocation
        20% -> Community death benefit reserves
        10% -> MOLI administration & operations
        """
        if member_premium <= 0:
            raise ValueError("Premium must be positive")
        
        patronage = (member_premium * MOLIPolicy.PATRONAGE_RATIO).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        community = (member_premium * MOLIPolicy.COMMUNITY_RATIO).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        operations = (member_premium * MOLIPolicy.OPERATIONS_RATIO).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        
        # Adjust for rounding remainder
        remainder = member_premium - (patronage + community + operations)
        patronage += remainder
        
        # Update cooperative reserves
        self.community_pool += community
        self.operations_reserve += operations
        
        # Allocate to member's policy cash value if exists
        if member_id in self.policies:
            self.policies[member_id].cash_value += patronage
        
        return {
            "cash_value_growth": patronage,
            "community_pool": community,
            "operations": operations,
            "total_premium": member_premium
        }
    
    def issue_policy(self, policy_id: str, member_id: str, face_amount: Decimal, annual_premium: Decimal) -> MOLIPolicy:
        """Issue a new cooperative-owned whole life policy."""
        policy = MOLIPolicy(
            policy_id=policy_id,
            member_id=member_id,
            carrier=self.carrier,
            face_amount=face_amount,
            annual_premium=annual_premium
        )
        self.policies[member_id] = policy
        return policy
    
    def loan_mechanism(self, member_id: str, loan_amount: Decimal) -> Dict[str, str]:
        """
        Issue a tax-free policy loan collateralized by the member's
        cooperative-owned cash value.
        
        The member borrows against the policy the cooperative owns on their life.
        This is the iron fist in financial form—access to capital without
        triggering taxable events or predatory lender relationships.
        """
        if member_id not in self.policies:
            raise ValueError(f"No MOLI policy found for member {member_id}")
        
        policy = self.policies[member_id]
        if loan_amount > policy.cash_value:
            raise ValueError("Loan amount exceeds available cash value")
        
        return {
            "loan_type": "Tax-free policy loan",
            "collateral": "Cooperative-owned whole life cash value",
            "member_id": member_id,
            "policy_id": policy.policy_id,
            "loan_amount": str(loan_amount),
            "remaining_cash_value": str(policy.cash_value - loan_amount),
            "tax_status": "Non-taxable distribution (loan against CV)",
            "mandate_alignment": "Sheila Mandate fulfilled—descendants access capital without selling equity"
        }
    
    def get_program_summary(self) -> Dict[str, str]:
        """Return high-level MOLI program status."""
        total_cv = sum(p.cash_value for p in self.policies.values())
        return {
            "carrier": self.carrier,
            "policy_type": self.policy_type,
            "ownership_model": self.ownership_model,
            "active_policies": str(len(self.policies)),
            "total_cash_value": str(total_cv),
            "community_pool": str(self.community_pool),
            "operations_reserve": str(self.operations_reserve),
            "mandate": "70% patronage / 20% community blanket / 10% fist maintenance"
        }
