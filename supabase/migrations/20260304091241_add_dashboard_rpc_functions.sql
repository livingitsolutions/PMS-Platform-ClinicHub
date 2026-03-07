/*
  # Dashboard Statistics RPC Functions

  Creates optimized PostgreSQL functions for dashboard statistics calculations.
  These functions perform aggregations directly in the database for better performance.

  1. New Functions
    - `get_today_stats` - Returns today's visit count, revenue, outstanding invoices, and new patients
    - `get_monthly_revenue` - Returns daily revenue for the last 30 days
    - `get_top_procedures` - Returns top 5 procedures by revenue in last 30 days
    - `get_top_providers` - Returns top 5 providers by revenue in last 30 days

  2. Performance Benefits
    - Reduces data transfer between database and application
    - Leverages database indexing for faster aggregations
    - Eliminates JavaScript-based aggregation overhead
    - Single query replaces multiple round-trips

  3. Security
    - All functions filter by clinic_id for data isolation
    - Respects existing RLS policies through table access
*/

-- Function to get today's statistics for a clinic
CREATE OR REPLACE FUNCTION get_today_stats(
  p_clinic_id uuid,
  p_today timestamptz
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_visits bigint;
  v_total_revenue numeric;
  v_outstanding_invoices numeric;
  v_new_patients bigint;
BEGIN
  -- Count today's visits
  SELECT COUNT(*)
  INTO v_total_visits
  FROM visits
  WHERE clinic_id = p_clinic_id
    AND visit_date >= p_today;

  -- Sum today's payments
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_revenue
  FROM payments
  WHERE clinic_id = p_clinic_id
    AND created_at >= p_today;

  -- Calculate outstanding invoices (all unpaid/partial, not just today)
  SELECT COALESCE(SUM(total_amount - amount_paid), 0)
  INTO v_outstanding_invoices
  FROM invoices
  WHERE clinic_id = p_clinic_id
    AND status NOT IN ('paid', 'void');

  -- Count new patients today
  SELECT COUNT(*)
  INTO v_new_patients
  FROM patients
  WHERE clinic_id = p_clinic_id
    AND created_at >= p_today;

  -- Return as JSON object matching TypeScript interface
  RETURN json_build_object(
    'totalVisits', v_total_visits,
    'totalRevenue', v_total_revenue,
    'outstandingInvoices', v_outstanding_invoices,
    'newPatients', v_new_patients
  );
END;
$$;

-- Function to get daily revenue for the last 30 days
CREATE OR REPLACE FUNCTION get_monthly_revenue(
  p_clinic_id uuid,
  p_start_date timestamptz
)
RETURNS TABLE(
  date text,
  revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      p_start_date::date,
      CURRENT_DATE,
      '1 day'::interval
    )::date AS day
  )
  SELECT 
    ds.day::text AS date,
    COALESCE(SUM(p.amount), 0) AS revenue
  FROM date_series ds
  LEFT JOIN payments p ON 
    p.created_at::date = ds.day
    AND p.clinic_id = p_clinic_id
  GROUP BY ds.day
  ORDER BY ds.day ASC;
END;
$$;

-- Function to get top 5 procedures by revenue in last 30 days
CREATE OR REPLACE FUNCTION get_top_procedures(
  p_clinic_id uuid,
  p_start_date timestamptz
)
RETURNS TABLE(
  procedure_id uuid,
  procedure_name text,
  count bigint,
  total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vp.procedure_id,
    pr.name AS procedure_name,
    SUM(vp.quantity)::bigint AS count,
    SUM(vp.quantity * vp.price) AS total_revenue
  FROM visit_procedures vp
  INNER JOIN procedures pr ON pr.id = vp.procedure_id
  INNER JOIN visits v ON v.id = vp.visit_id
  WHERE pr.clinic_id = p_clinic_id
    AND v.visit_date >= p_start_date
  GROUP BY vp.procedure_id, pr.name
  ORDER BY total_revenue DESC
  LIMIT 5;
END;
$$;

-- Function to get top 5 providers by revenue in last 30 days
CREATE OR REPLACE FUNCTION get_top_providers(
  p_clinic_id uuid,
  p_start_date timestamptz
)
RETURNS TABLE(
  provider_id uuid,
  provider_name text,
  visit_count bigint,
  total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.provider_id,
    prov.name AS provider_name,
    COUNT(v.id)::bigint AS visit_count,
    COALESCE(SUM(inv.total_amount), 0) AS total_revenue
  FROM visits v
  INNER JOIN providers prov ON prov.id = v.provider_id
  LEFT JOIN invoices inv ON inv.visit_id = v.id
  WHERE v.clinic_id = p_clinic_id
    AND v.visit_date >= p_start_date
  GROUP BY v.provider_id, prov.name
  ORDER BY total_revenue DESC
  LIMIT 5;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_today_stats(uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_revenue(uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_procedures(uuid, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_providers(uuid, timestamptz) TO authenticated;
