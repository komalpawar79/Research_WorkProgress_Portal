-- Seed Data for ResearchFlow User Portal (Matching reference image)

-- Demo user UUID
DO $$
DECLARE
    demo_user_id UUID := 'd7a85859-9942-4f6b-88a2-71cbe57297e1';
    demo_project_id UUID := 'b819231f-0e48-433b-a5d6-84391e4f4a32';
    ch1_id UUID := gen_random_uuid();
    ch2_id UUID := gen_random_uuid();
    ch3_id UUID := gen_random_uuid();
    ch4_id UUID := gen_random_uuid();
BEGIN
    -- 1. Profile
    INSERT INTO public.profiles (id, full_name, email, phone, university, department, avatar_url, role)
    VALUES (
        demo_user_id,
        'Rahul Sharma',
        'rahul@gmail.com',
        '+91 98765 43210',
        'XYZ University',
        'Computer Science',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        'student'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Research Project
    INSERT INTO public.research_projects (id, user_id, topic, research_type, status, overall_progress, started_at, expected_completion, description)
    VALUES (
        demo_project_id,
        demo_user_id,
        'AI-Based Healthcare System',
        'Thesis',
        'In Progress',
        78,
        '2026-09-02',
        '2026-09-28',
        'A comprehensive study investigating deep learning diagnostic pipelines in clinical workflows.'
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Chapters
    INSERT INTO public.chapters (id, project_id, chapter_number, title, status, progress_percent, document_released, updated_date)
    VALUES
        (ch1_id, demo_project_id, 1, 'Introduction', 'Completed', 100, TRUE, '2026-09-05'),
        (ch2_id, demo_project_id, 2, 'Literature Review', 'Completed', 100, TRUE, '2026-09-15'),
        (ch3_id, demo_project_id, 3, 'Methodology', 'In Progress', 60, FALSE, '2026-09-15'),
        (ch4_id, demo_project_id, 4, 'Results', 'Not Started', 0, FALSE, '2026-09-15')
    ON CONFLICT (project_id, chapter_number) DO NOTHING;

    -- 4. Protected Documents
    INSERT INTO public.chapter_documents (chapter_id, user_id, file_title, page_count, storage_path, watermark_text)
    VALUES
        (ch1_id, demo_user_id, 'Chapter 1 — Introduction.pdf', 8, 'documents/ch1_protected.pdf', 'CONFIDENTIAL\nRahul Sharma\nFOR REVIEW ONLY'),
        (ch2_id, demo_user_id, 'Chapter 2 — Literature Review.pdf', 12, 'documents/ch2_protected.pdf', 'CONFIDENTIAL\nRahul Sharma\nFOR REVIEW ONLY');

    -- 5. Payments
    INSERT INTO public.payments (user_id, amount, payment_method, status, payment_date, transaction_ref)
    VALUES
        (demo_user_id, 15000.00, 'UPI', 'Paid', '2026-09-05', 'UPI-9832104598'),
        (demo_user_id, 20000.00, 'Bank Transfer', 'Paid', '2026-09-12', 'NEFT-8839201948');

    -- 6. Notifications
    INSERT INTO public.notifications (user_id, title, message, type, read, related_chapter_id, created_at)
    VALUES
        (demo_user_id, 'Chapter 2 Completed', 'Your Literature Review chapter has been completed successfully.', 'chapter_completed', FALSE, ch2_id, '2026-09-15 10:30:00+00'),
        (demo_user_id, 'Chapter 1 Completed', 'Your Introduction chapter is now available.', 'chapter_completed', FALSE, ch1_id, '2026-09-05 14:15:00+00'),
        (demo_user_id, 'Payment Received', 'Your payment of ₹15,000 has been successfully received.', 'payment_received', FALSE, NULL, '2026-09-12 16:45:00+00'),
        (demo_user_id, 'New Update Available', 'Chapter 3 is now in progress (60%).', 'chapter_progress', TRUE, ch3_id, '2026-09-10 09:00:00+00');
END $$;

