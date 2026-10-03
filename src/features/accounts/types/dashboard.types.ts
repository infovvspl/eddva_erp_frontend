export interface AccountsDashboardSummary {
  open_financial_year: string | null;
  totals: {
    draft_vouchers: number;
    posted_this_month: number;
    cancelled_this_month: number;
    cash_balance: number;
    bank_balance: number;
  };
  recent_vouchers: Array<{
    voucher_id: string;
    voucher_number: string;
    voucher_date: string;
    narration: string | null;
    total_amount: number;
    status: string;
  }>;
}
