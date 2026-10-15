export type UserRole = 'student' | 'supervisor' | 'admin';

export interface UserProfile {
  id: string;
  username?: string;
  full_name: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'Not Started' | 'In Progress' | 'Under Review' | 'Completed';
export type ResearchType = 'Thesis' | 'Dissertation' | 'Research Paper' | 'Proposal';

export interface ResearchProject {
  id: string;
  user_id: string;
  topic: string;
  research_type: ResearchType;
  status: ProjectStatus;
  overall_progress: number;
  started_at: string;
  expected_completion: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type ChapterStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Chapter {
  id: string;
  project_id: string;
  chapter_number: number;
  title: string;
  status: ChapterStatus;
  progress_percent: number;
  document_released: boolean;
  updated_date: string;
  created_at: string;
  updated_at: string;
}

export interface ChapterDocument {
  id: string;
  chapter_id: string;
  user_id: string;
  file_title: string;
  page_count: number;
  storage_path: string;
  watermark_text: string;
  is_active: boolean;
  created_at: string;
  signed_cloudinary_url?: string;
  pages?: DocumentPage[];
}

export interface DocumentPage {
  page_number: number;
  title: string;
  section_title?: string;
  paragraphs: string[];
  tables?: {
    caption: string;
    headers: string[];
    rows: string[][];
  }[];
  notes?: string;
}

export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Debit Card' | 'Other';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';

export interface PaymentRecord {
  id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  payment_date: string;
  transaction_ref: string;
  created_at: string;
}

export interface PaymentSummary {
  total_amount: number;
  amount_paid: number;
  remaining: number;
  status: 'Full' | 'Partial' | 'Pending';
}

export type NotificationType = 'chapter_completed' | 'chapter_progress' | 'payment_received' | 'general_update';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  related_chapter_id?: string;
  action_url?: string;
  created_at: string;
}

export interface TimelineStep {
  step_number: number;
  title: string;
  status: 'completed' | 'in_progress' | 'not_started';
  date?: string;
  description?: string;
}

