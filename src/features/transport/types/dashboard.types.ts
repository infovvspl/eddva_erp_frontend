export interface TransportDashboardSummary {
  range: {
    from: string | null;
    to: string | null;
  };
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
    by_status: Array<{
      status: string;
      count: number;
    }>;
  };
  passengers: {
    active: number;
    by_type: Array<{
      type: string;
      count: number;
    }>;
  };
  fees: {
    active_subscriptions: number;
    expired_subscriptions: number;
    collection_in_range: number;
    payments_in_range: number;
  };
  alerts: {
    unresolved: number;
    by_type: Array<{
      type: string;
      count: number;
    }>;
  };
  recent_alerts: Array<{
    alert_id: number;
    vehicle_id: number;
    registration_number: string;
    alert_type: string;
    triggered_at: string;
  }>;
}
