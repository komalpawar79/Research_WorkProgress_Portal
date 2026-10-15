-- ==========================================================
-- ResearchFlow: PostgreSQL Database Schema & RLS Policies
-- Academic Research Work Management & Delivery Platform
-- User Portal & Admin Console Combined Schema
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    university TEXT,
    department TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'supervisor', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESEARCH PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.research_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    research_type TEXT NOT NULL DEFAULT 'Thesis' CHECK (research_type IN ('Thesis', 'Research Paper', 'Dissertation', 'Proposal')),
    status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('Not Started', 'In Progress', 'Under Review', 'Completed')),
    overall_progress INT NOT NULL DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
    started_at DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_completion DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Under Review', 'Completed')),
    progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    update_message TEXT,
    document_released BOOLEAN NOT NULL DEFAULT FALSE,
    updated_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_chapter_per_project UNIQUE (project_id, chapter_number)
);

-- 4. CHAPTER DOCUMENTS (Versioned & Watermarked)
CREATE TABLE IF NOT EXISTS public.chapter_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    version TEXT NOT NULL DEFAULT 'v1',
    file_title TEXT NOT NULL,
    page_count INT NOT NULL DEFAULT 1,
    storage_path TEXT NOT NULL,
    watermark_text TEXT NOT NULL,
    watermark_status TEXT DEFAULT 'Processed' CHECK (watermark_status IN ('Processed', 'Pending', 'None')),
    uploaded_by UUID REFERENCES public.profiles(id),
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cash', 'Other')),
    status TEXT NOT NULL DEFAULT 'Paid' CHECK (status IN ('Paid', 'Partial', 'Pending', 'Failed', 'Refunded')),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_ref TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('chapter_completed', 'chapter_progress', 'payment_received', 'payment_overdue', 'document_uploaded', 'general_update')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    related_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACTIVITY LOGS TABLE (Admin Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('Chapter', 'Customer', 'Payment', 'Document', 'Project')),
    target_id UUID,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EMAIL LOGS TABLE (Transactional delivery audits)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    email_type TEXT NOT NULL CHECK (email_type IN ('Chapter Completion', 'Payment Received', 'Payment Reminder', 'Project Update')),
    status TEXT NOT NULL DEFAULT 'Sent' CHECK (status IN ('Sent', 'Pending', 'Failed')),
    related_project_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    related_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Customers only see their own records.
-- Staff (admins) have full access to manage projects.
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Helper check function for admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('admin', 'supervisor')
    );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view own profile or admins view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Research Projects Policies
CREATE POLICY "Users view own or admins view all"
    ON public.research_projects FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert and update projects"
    ON public.research_projects FOR ALL
    USING (public.is_admin(auth.uid()));

-- Chapters Policies
CREATE POLICY "Users view chapters or admins manage"
    ON public.chapters FOR SELECT
    USING (
        public.is_admin(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.research_projects
            WHERE research_projects.id = chapters.project_id
            AND research_projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert and update chapters"
    ON public.chapters FOR ALL
    USING (public.is_admin(auth.uid()));

-- Chapter Documents Policies
CREATE POLICY "Users view released docs or admins view all"
    ON public.chapter_documents FOR SELECT
    USING (
        public.is_admin(auth.uid()) OR
        (auth.uid() = user_id AND is_current = true)
    );

CREATE POLICY "Admins manage chapter documents"
    ON public.chapter_documents FOR ALL
    USING (public.is_admin(auth.uid()));

-- Payments Policies
CREATE POLICY "Users view own payments or admins view all"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admins manage payments"
    ON public.payments FOR ALL
    USING (public.is_admin(auth.uid()));

-- Notifications Policies
CREATE POLICY "Users view and update own notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id);

-- Activity Logs & Email Logs Policies (Admin only)
CREATE POLICY "Admins view activity logs"
    ON public.activity_logs FOR ALL
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins view email logs"
    ON public.email_logs FOR ALL
    USING (public.is_admin(auth.uid()));
