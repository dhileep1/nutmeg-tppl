CREATE TABLE timesheets (
  id SERIAL PRIMARY KEY,
  member_name TEXT,
  department TEXT,
  business_unit_code TEXT,
  global_business_unit_code TEXT,
  project_code TEXT,
  activity_code TEXT,
  shift_code TEXT,
  hours NUMERIC,
  date TEXT,
  leave NUMERIC,
  comp_off NUMERIC,
  status TEXT DEFAULT 'Pending'
);
