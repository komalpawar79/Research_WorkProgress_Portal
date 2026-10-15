import { UserProfile, ProjectStatus, ResearchType, PaymentMethod } from './database.types';

export interface CustomerRecord extends UserProfile {
  research_topic: string;
  project_type: ResearchType;
  progress_percent: number;
  payment_status: 'Paid' | 'Partial' | 'Pending';
  project_status: 'Active' | 'Completed' | 'On Hold';
  total_amount: number;
  amount_paid: number;
  remaining_amount: number;
  start_date: string;
  expected_completion: string;
}

export interface AdminProject {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_avatar?: string;
  topic: string;
  research_type: ResearchType;
  status: ProjectStatus;
  overall_progress: number;
  started_at: string;
  expected_completion: string;
  chapter_count: number;
  description?: string;
}

export interface AdminChapterProgress {
  id: string;
  project_id: string;
  customer_id: string;
  customer_name: string;
  chapter_number: number;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Released';
  progress_percent: number;
  document_released: boolean;
  document_version?: string;
  updated_date: string;
  update_message?: string;
}

export interface DocumentRecord {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_avatar?: string;
  project_title: string;
  chapter_id: string;
  chapter_title: string;
  version: string;
  file_name: string;
  file_size?: string;
  status: 'Released' | 'Under Review' | 'Archived';
  watermark_status: 'Processed' | 'Pending' | 'None';
  uploaded_at: string;
  uploaded_by: string;
  storage_path: string;
}

export interface AdminPaymentRecord {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  project_title: string;
  total_amount: number;
  amount_paid: number;
  remaining: number;
  status: 'Paid' | 'Partial' | 'Pending';
  last_payment_date: string;
  payment_method?: PaymentMethod;
}

export interface AdminNotification {
  id: string;
  type: 'chapter_completed' | 'payment_received' | 'payment_overdue' | 'document_uploaded' | 'project_update';
  title: string;
  message: string;
  customer_name?: string;
  customer_avatar?: string;
  relative_time: string;
  created_at: string;
  read: boolean;
  action_url?: string;
}

export interface EmailLog {
  id: string;
  recipient_name: string;
  recipient_email: string;
  subject: string;
  email_type: 'Chapter Completion' | 'Payment Received' | 'Payment Reminder' | 'Project Update';
  status: 'Sent' | 'Pending' | 'Failed';
  sent_at: string;
  related_chapter?: string;
  related_project?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  user_name: string;
  user_role: string;
  target_name: string;
  target_type: 'Chapter' | 'Customer' | 'Payment' | 'Document' | 'Project';
  timestamp: string;
  details?: string;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  changePercent: string;
  changeType: 'increase' | 'decrease';
  icon: string;
}

export interface AttentionItem {
  id: string;
  title: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
  link: string;
}
