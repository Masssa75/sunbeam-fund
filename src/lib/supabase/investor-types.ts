export interface Investor {
  id: string;
  email: string;
  name: string;
  account_number: string;
  share_percentage: number;
  initial_investment: number | null;
  join_date: string;
  status: 'active' | 'inactive' | 'suspended';
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestorAccessLog {
  id: string;
  investor_id: string;
  accessed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export interface InvestorReport {
  id: string;
  investor_id: string;
  report_id: string;
  sent_at: string | null;
  viewed_at: string | null;
}

export interface InvestorWithAuth extends Investor {
  auth_email?: string;
  last_sign_in?: string;
}