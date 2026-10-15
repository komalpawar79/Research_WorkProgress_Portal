-- ==============================================================================
-- ResearchFlow PostgreSQL Schema
-- Complete relational structure for Projects, Chapters, Documents & Payments
-- ==============================================================================

-- 1. Users Table (Customer, Admin, Writers)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('customer', 'admin', 'writer')),
    phone VARCHAR(32),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(500) NOT NULL,
    thesis_topic VARCHAR(500) NOT NULL,
    domain VARCHAR(255) DEFAULT 'Computer Science / AI',
    status VARCHAR(64) DEFAULT 'In Progress' CHECK (status IN ('Planning', 'In Progress', 'In Review', 'Completed', 'On Hold')),
    progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
    target_completion_date DATE,
    writer_name VARCHAR(255),
    total_fee NUMERIC(10, 2) DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Chapters Table (Strict workflow 1..5)
CREATE TABLE IF NOT EXISTS chapters (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(64) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Drafting', 'In Review', 'Completed')),
    word_count INTEGER DEFAULT 0,
    document_released BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 1,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, chapter_number)
);

-- 4. Document Versions Table (Cloudinary PDF Metadata)
CREATE TABLE IF NOT EXISTS document_versions (
    id VARCHAR(64) PRIMARY KEY,
    chapter_id VARCHAR(64) NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    version_tag VARCHAR(32) NOT NULL, -- e.g. 'v1.0', 'v2.1'
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT,
    cloudinary_public_id VARCHAR(255),
    page_count INTEGER DEFAULT 1,
    uploaded_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Payments & Milestones Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(32) DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Failed', 'Refunded')),
    invoice_number VARCHAR(64) UNIQUE,
    payment_date DATE,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'document', 'payment')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    actor_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Security Events (Screen capture attempt monitoring & audit log)
CREATE TABLE IF NOT EXISTS security_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    chapter_id VARCHAR(64) REFERENCES chapters(id) ON DELETE SET NULL,
    document_id VARCHAR(64),
    event_type VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'WARNING',
    session_id VARCHAR(128),
    browser VARCHAR(128),
    operating_system VARCHAR(128),
    ip_address VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_chapters_project_id ON chapters(project_id);
CREATE INDEX IF NOT EXISTS idx_doc_versions_chapter_id ON document_versions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_project_id ON security_events(project_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- ==============================================================================
-- Initial Starter / Seed Data (For Testing)
-- ==============================================================================
INSERT INTO users (id, email, full_name, role, phone)
VALUES 
    ('usr-rahul-01', 'rahul@gmail.com', 'Rahul Sharma', 'customer', '+91 98765 43210'),
    ('usr-admin-01', 'admin@researchflow.com', 'Dr. Arvind Mehra (Lead Guide)', 'admin', '+91 98111 22233')
ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, customer_id, title, thesis_topic, domain, status, progress_pct, target_completion_date, writer_name, total_fee, paid_amount)
VALUES (
    'proj-deep-learning-nlp',
    'usr-rahul-01',
    'Deep Learning for Low-Resource NLP in Indic Languages',
    'Neural Machine Translation and Sentiment Analysis for Indic Languages',
    'Computer Science & Artificial Intelligence',
    'In Progress',
    65,
    '2026-11-15',
    'Dr. Arvind Mehra',
    45000.00,
    30000.00
) ON CONFLICT (id) DO NOTHING;

INSERT INTO chapters (id, project_id, chapter_number, title, status, word_count, document_released, sort_order)
VALUES 
    ('ch-01-intro', 'proj-deep-learning-nlp', 1, 'Introduction & Problem Formulation', 'Completed', 4200, TRUE, 1),
    ('ch-02-lit-review', 'proj-deep-learning-nlp', 2, 'Comprehensive Literature Review', 'Completed', 8500, TRUE, 2),
    ('ch-03-methodology', 'proj-deep-learning-nlp', 3, 'Methodology & Model Architecture', 'In Review', 6100, FALSE, 3),
    ('ch-04-experiments', 'proj-deep-learning-nlp', 4, 'Experimental Results & Benchmarks', 'Drafting', 3200, FALSE, 4),
    ('ch-05-conclusion', 'proj-deep-learning-nlp', 5, 'Conclusion, Limitations & Future Scope', 'Pending', 0, FALSE, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, project_id, milestone_name, amount, currency, status, invoice_number, payment_date)
VALUES 
    ('pay-01', 'proj-deep-learning-nlp', 'Phase 1 - Proposal & Chapter 1', 15000.00, 'INR', 'Paid', 'INV-2026-001', '2026-08-10'),
    ('pay-02', 'proj-deep-learning-nlp', 'Phase 2 - Literature Review & Dataset Prep', 15000.00, 'INR', 'Paid', 'INV-2026-042', '2026-09-05'),
    ('pay-03', 'proj-deep-learning-nlp', 'Phase 3 - Methodology & Experiments', 15000.00, 'INR', 'Pending', 'INV-2026-089', NULL)
ON CONFLICT (id) DO NOTHING;
