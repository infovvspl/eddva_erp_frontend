// Shape of GET /dashboard/summary — one block per module, each identical to
// that module's own /<module>/dashboard/summary response.
//
// Accounts, Canteen, Library, Sports and Transport each already have a
// same-named summary type in their own feature folder, but those are stale
// (don't match what their backend service actually returns) — rather than
// risk breaking their own module dashboard pages by correcting those shared
// types, the accurate shapes are defined locally here, scoped to this
// aggregate endpoint only.
import type { AdmissionDashboardSummary } from '../../admission/types/admission.types';
import type { AlumniDashboardSummary } from '../../alumni/types/alumni.types';
import type { FrontOfficeDashboardSummary } from '../../front-office/types/dashboardRecord.types';
import type { HostelDashboardSummary } from '../../hostel/types/hostel.types';
import type { InventoryDashboardSummary } from '../../inventory/types/dashboard.types';
import type { DashboardSummary as SalesPurchaseDashboardSummary } from '../../sales-purchase/types/sales-purchase.types';

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface AccountsDashboardSummary {
  range: DateRange;
  overview: {
    active_ledger_accounts: number;
    active_cost_centers: number;
    open_financial_year: { id: number; fyLabel: string; startDate: string; endDate: string } | null;
  };
  vouchers: {
    draft_pending: number;
    by_status: { status: string; count: number }[];
    by_type: { voucher_type: string; count: number; total_debit: number }[];
  };
  cash_and_bank: {
    cash: { accounts: unknown; balance: number };
    bank: { accounts: unknown; balance: number };
  } | null;
}

export interface CanteenDashboardSummary {
  range: DateRange;
  members: {
    total_members: number;
    active_wallets: number;
    total_active_wallet_balance: number;
  };
  today: {
    order_count: number;
    revenue: number;
    unpaid_orders: number;
  };
  orders: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    grossSales: number;
    discount: number;
    tax: number;
    netSales: number;
    cashSales: number;
    cardSales: number;
    upiSales: number;
    walletSales: number;
  };
  top_items: unknown[];
  category_sales: unknown[];
  payment_summary: unknown;
  pos: {
    active_shifts: number;
    totalShifts: number;
    closedShiftsCount: number;
    openShiftsCount: number;
    totalOpeningCash: number;
    totalExpectedCash: number;
    totalClosingCash: number;
    totalVariance: number;
  };
}

export interface LibraryDashboardSummary {
  range: DateRange;
  catalog: {
    total_books: number;
    total_copies: number;
    available_copies: number;
  };
  members: {
    total_members: number;
    active_members: number;
  };
  issues: {
    currently_issued: number;
    overdue: number;
    lost: number;
    issued_in_range: number;
    returned_in_range: number;
    by_status: { status: string; count: number }[];
  };
  reservations: {
    pending: number;
    ready_for_pickup: number;
    by_status: { status: string; count: number }[];
  };
  fines: {
    pending_total: number;
    by_status_in_range: { status: string; count: number; amount: number }[];
  };
}

export interface SportsDashboardSummary {
  range: DateRange;
  participants: { total: number };
  tournaments: {
    ongoing: number;
    upcoming: number;
    completed: number;
    started_in_range: number;
    by_status: { status: string; count: number }[];
  };
  houses: {
    total: number;
    academic_year: number | null;
    standings: { house: string; color: string | null; total_points: number; rank: number }[];
  };
  fixtures: {
    by_status: { status: string; count: number }[];
  };
  records_and_awards: {
    total_records: number;
    total_awards: number;
    recent_records: unknown[];
  };
}

export interface TransportDashboardSummary {
  range: DateRange;
  totals: {
    vehicles: number;
    active_vehicles: number;
    routes: number;
    drivers: number;
    active_drivers: number;
    licenses_expiring_soon: number;
    passengers: number;
    active_passengers: number;
    open_alerts: number;
    maintenance_due: number;
  };
  drivers: {
    active: number;
    on_leave: number;
    inactive: number;
    by_status: { status: string; count: number }[];
  };
  passengers: {
    active: number;
    by_type: { type: string; count: number }[];
  };
  fees: {
    active_subscriptions: number;
    expired_subscriptions: number;
    collection_in_range: number;
    payments_in_range: number;
  };
  alerts: {
    unresolved: number;
    by_type: { type: string; count: number }[];
  };
  recent_alerts: {
    alert_id: number;
    vehicle_id: number;
    registration_number: string;
    alert_type: string;
    triggered_at: string;
  }[];
}

// Modules the caller can't see (or that fail server-side) may be missing.
export interface DashboardData {
  accounts?: AccountsDashboardSummary;
  sales_purchase?: SalesPurchaseDashboardSummary;
  canteen?: CanteenDashboardSummary;
  library?: LibraryDashboardSummary;
  sports?: SportsDashboardSummary;
  transport?: TransportDashboardSummary;
  front_office?: FrontOfficeDashboardSummary;
  inventory?: InventoryDashboardSummary;
  admission?: AdmissionDashboardSummary;
  hostel?: HostelDashboardSummary;
  alumni?: AlumniDashboardSummary;
}
