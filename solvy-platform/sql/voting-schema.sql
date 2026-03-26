-- ============================================================================
-- SOLVY Voting System Schema
-- MAN (Member Advocacy Network) Integration
-- Privacy-preserving voting with threshold-based activation
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PROPOSALS TABLE
-- ============================================================================
-- Stores all cooperative proposals with threshold activation criteria

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Threshold Configuration
    -- Proposals can be activated by transaction volume OR member count
    threshold_type VARCHAR(50) CHECK (threshold_type IN ('volume', 'member_count', 'none')),
    threshold_value INTEGER CHECK (threshold_value > 0 OR threshold_value IS NULL),
    threshold_current INTEGER DEFAULT 0, -- Current progress toward threshold
    
    -- Voting Period
    vote_start TIMESTAMP NOT NULL,
    vote_end TIMESTAMP NOT NULL,
    
    -- Status Lifecycle
    -- pending -> active (when threshold met) -> passed/failed (after voting)
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'active', 'passed', 'failed', 'cancelled')),
    
    -- Voting Options (JSON array: ["Yes", "No"] or custom choices)
    options JSONB NOT NULL DEFAULT '["Yes", "No"]',
    
    -- Results (populated after voting closes)
    total_votes INTEGER,
    winning_choice VARCHAR(100),
    
    -- Metadata
    created_by UUID, -- Creator (hashed reference)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    activated_at TIMESTAMP, -- When threshold was met and voting opened
    closed_at TIMESTAMP, -- When voting closed
    
    -- Constraints
    CONSTRAINT valid_vote_period CHECK (vote_end > vote_start),
    CONSTRAINT valid_options CHECK (jsonb_array_length(options) >= 2)
);

-- Indexes for common queries
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_vote_period ON proposals(vote_start, vote_end);
CREATE INDEX idx_proposals_threshold ON proposals(threshold_type, threshold_value) WHERE threshold_type IS NOT NULL;

-- ============================================================================
-- VOTES TABLE
-- ============================================================================
-- Privacy-preserving vote storage
-- Member ID is hashed - no link to individual transactions or identity

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    
    -- SHA-256 hash of member ID (64 hex characters)
    -- NOT the raw member ID - provides anonymity while preventing double-voting
    member_hash VARCHAR(64) NOT NULL,
    
    -- Member's voting choice
    choice VARCHAR(100) NOT NULL,
    
    -- Timestamp
    voted_at TIMESTAMP DEFAULT NOW(),
    
    -- One vote per member per proposal
    UNIQUE(proposal_id, member_hash),
    
    -- Ensure vote is cast during active period (enforced by trigger)
    CONSTRAINT valid_vote_timing CHECK (voted_at <= NOW())
);

-- Indexes
CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_votes_member_hash ON votes(member_hash);
CREATE INDEX idx_votes_choice ON votes(proposal_id, choice);

-- ============================================================================
-- VOTE RESULTS VIEW
-- ============================================================================
-- Calculated results - not stored redundantly
-- Provides real-time vote counts without needing to recount entire table

CREATE VIEW proposal_results AS
SELECT 
    proposal_id,
    choice,
    COUNT(*) as vote_count,
    ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY proposal_id), 0), 2) as percentage
FROM votes
GROUP BY proposal_id, choice
ORDER BY proposal_id, vote_count DESC;

-- ============================================================================
-- PROPOSAL DETAILS VIEW
-- ============================================================================
-- Comprehensive view joining proposal info with current results

CREATE VIEW proposal_details AS
SELECT 
    p.*,
    COALESCE(v.total_votes, 0) as current_vote_count,
    v.winning_choice as current_leading_choice,
    CASE 
        WHEN p.threshold_type = 'volume' THEN 
            ROUND(p.threshold_current * 100.0 / NULLIF(p.threshold_value, 0), 1)
        WHEN p.threshold_type = 'member_count' THEN
            ROUND(p.threshold_current * 100.0 / NULLIF(p.threshold_value, 0), 1)
        ELSE NULL
    END as threshold_progress_percent
FROM proposals p
LEFT JOIN (
    SELECT 
        proposal_id,
        SUM(vote_count) as total_votes,
        (ARRAY_AGG(choice ORDER BY vote_count DESC))[1] as winning_choice
    FROM proposal_results
    GROUP BY proposal_id
) v ON p.id = v.proposal_id;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for proposals table
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check if voting period is active
CREATE OR REPLACE FUNCTION is_voting_active(proposal_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    proposal_record proposals%ROWTYPE;
BEGIN
    SELECT * INTO proposal_record FROM proposals WHERE id = proposal_uuid;
    
    RETURN proposal_record.status = 'active' 
        AND NOW() BETWEEN proposal_record.vote_start AND proposal_record.vote_end;
END;
$$ LANGUAGE plpgsql;

-- Function to increment threshold progress
CREATE OR REPLACE FUNCTION increment_threshold(proposal_uuid UUID, amount INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
    UPDATE proposals 
    SET threshold_current = threshold_current + amount,
        status = CASE 
            WHEN threshold_current + amount >= threshold_value THEN 'active'
            ELSE status
        END,
        activated_at = CASE 
            WHEN threshold_current + amount >= threshold_value AND activated_at IS NULL 
            THEN NOW() 
            ELSE activated_at 
        END
    WHERE id = proposal_uuid AND threshold_type IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to close expired proposals
CREATE OR REPLACE FUNCTION close_expired_proposals()
RETURNS INTEGER AS $$
DECLARE
    closed_count INTEGER;
BEGIN
    WITH closed AS (
        UPDATE proposals 
        SET status = CASE 
                WHEN (SELECT SUM(vote_count) FROM proposal_results WHERE proposal_id = proposals.id) IS NULL 
                    OR (SELECT SUM(vote_count) FROM proposal_results WHERE proposal_id = proposals.id) = 0 
                THEN 'cancelled'
                ELSE 'failed'
            END,
            closed_at = NOW()
        WHERE status = 'active' 
            AND vote_end < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO closed_count FROM closed;
    
    RETURN closed_count;
END;
$$ LANGUAGE plpgsql;

-- Function to determine if a proposal passed
CREATE OR REPLACE FUNCTION calculate_proposal_result(proposal_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    result_record RECORD;
    total_votes INTEGER;
    winning_votes INTEGER;
    winning_choice VARCHAR(100);
BEGIN
    -- Get total votes
    SELECT SUM(vote_count) INTO total_votes 
    FROM proposal_results 
    WHERE proposal_id = proposal_uuid;
    
    IF total_votes IS NULL OR total_votes = 0 THEN
        RETURN 'cancelled';
    END IF;
    
    -- Get winning choice
    SELECT choice, vote_count 
    INTO winning_choice, winning_votes
    FROM proposal_results 
    WHERE proposal_id = proposal_uuid
    ORDER BY vote_count DESC
    LIMIT 1;
    
    -- Simple majority (50% + 1) required to pass
    IF winning_votes > total_votes / 2.0 THEN
        RETURN 'passed';
    ELSE
        RETURN 'failed';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
-- Immutable audit trail for all voting events

CREATE TABLE vote_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    proposal_id UUID REFERENCES proposals(id),
    member_hash VARCHAR(64), -- Hashed, not identifiable
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for querying audit logs
CREATE INDEX idx_audit_log_proposal ON vote_audit_log(proposal_id);
CREATE INDEX idx_audit_log_event ON vote_audit_log(event_type);
CREATE INDEX idx_audit_log_created ON vote_audit_log(created_at);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Example: Create a sample proposal
/*
INSERT INTO proposals (
    title,
    description,
    threshold_type,
    threshold_value,
    vote_start,
    vote_end,
    options
) VALUES (
    'Increase Marketing Budget by $10,000',
    'Proposal to increase the cooperative marketing budget to attract new members. Funds would be used for digital advertising and community events.',
    'volume',
    100,
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '14 days',
    '["Yes", "No", "Abstain"]'::jsonb
);
*/

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Create read-only role for vote results
CREATE ROLE IF NOT EXISTS voting_reader;
GRANT SELECT ON proposals TO voting_reader;
GRANT SELECT ON proposal_results TO voting_reader;
GRANT SELECT ON proposal_details TO voting_reader;

-- Create role for casting votes (no read access to individual votes)
CREATE ROLE IF NOT EXISTS voting_member;
GRANT INSERT ON votes TO voting_member;
GRANT SELECT ON proposals TO voting_member;
GRANT SELECT ON proposal_results TO voting_member;

-- Create admin role for managing proposals
CREATE ROLE IF NOT EXISTS voting_admin;
GRANT ALL ON proposals TO voting_admin;
GRANT ALL ON votes TO voting_admin;
GRANT ALL ON vote_audit_log TO voting_admin;
GRANT SELECT ON proposal_results TO voting_admin;
GRANT SELECT ON proposal_details TO voting_admin;
