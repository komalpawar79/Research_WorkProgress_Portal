import { fetchApi } from './apiClient';
import { mockCustomers } from './adminMockData';
import { CustomerRecord } from '../types/admin.types';

let localCustomers = [...mockCustomers];

export interface CustomerFilterParams {
  search?: string;
  project?: string;
  paymentStatus?: string;
  projectStatus?: string;
  researchType?: string;
}

export interface CreateCustomerPayload {
  fullName: string;
  email: string;
  phone?: string;
  university?: string;
  username: string;
  password: string;
  title: string;
  topic: string;
  researchType?: string;
  supervisor?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  description?: string;
  totalAmount?: number;
  paidAmount?: number;
  status?: string;
}

export const customerService = {
  async createCustomer(payload: CreateCustomerPayload): Promise<{ success: boolean; customer?: any; message?: string }> {
    try {
      const res = await fetchApi<{ success: boolean; customer: any; message: string }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res;
    } catch (err: any) {
      console.error('Error creating customer:', err);
      throw err;
    }
  },

  async getCustomers(filters: CustomerFilterParams = {}): Promise<CustomerRecord[]> {
    try {
      const data = await fetchApi<any[]>('/api/admin/users');
      if (Array.isArray(data) && data.length > 0) {
        let list: CustomerRecord[] = data.map((u) => {
          const total = Number(u.total_fee || 50000);
          const paid = Number(u.paid_amount || 0);
          const remaining = Math.max(0, total - paid);
          const payStatus = remaining === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';

          return {
            id: u.id,
            full_name: u.full_name || 'Scholar',
            username: u.username || '',
            email: u.email || '',
            phone: u.phone || '',
            university: u.university || 'IIT Delhi',
            department: 'Computer Science & AI',
            role: 'student',
            status: u.account_status || 'Active',
            research_topic: u.research_topic || u.project_title || 'Thesis Project',
            project_type: (u.research_type as any) || 'Thesis',
            project_status: (u.project_status as any) || 'Active',
            progress_percent: Number(u.overall_progress || 0),
            total_amount: total,
            amount_paid: paid,
            remaining_amount: remaining,
            payment_status: payStatus,
            start_date: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-08-01',
            expected_completion: u.expected_completion_date || '2026-12-15',
            created_at: u.created_at || new Date().toISOString(),
            updated_at: u.last_updated || new Date().toISOString(),
          };
        });

        if (filters.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(
            (c) =>
              c.full_name.toLowerCase().includes(q) ||
              c.email.toLowerCase().includes(q) ||
              c.research_topic.toLowerCase().includes(q) ||
              ((c as any).username && (c as any).username.toLowerCase().includes(q))
          );
        }

        return list;
      }
    } catch (e) {
      console.warn('Failed to load customers from backend, using local fallback:', e);
    }

    let result = [...localCustomers];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.research_topic.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getCustomerById(id: string): Promise<CustomerRecord | null> {
    const list = await this.getCustomers();
    const found = list.find((c) => c.id === id);
    return found || list[0] || null;
  },

  async addPayment(_customerId: string, _amount: number, _method: string): Promise<boolean> {
    return true;
  },
};
