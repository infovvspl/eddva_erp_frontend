export interface TransportDashboardSummary {
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
  fees: {
    collected_this_month: number;
    active_subscriptions: number;
  };
  recent_alerts: Array<{
    alert_id: number;
    vehicle_id: number;
    registration_number: string;
    alert_type: string;
    triggered_at: string;
  }>;
}
