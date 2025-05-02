create table user_table (
    user_id varchar(10) PRIMARY KEY,
    email varchar(60) UNIQUE,
    user_name varchar(30),
    dept varchar(30),
    pan_card varchar(25),
    designation varchar(30),
    join_date date
);

CREATE TABLE role_table (
    user_id varchar(10) PRIMARY KEY,
    role_type varchar(10) DEFAULT 'user',
    CONSTRAINT fk_user_role FOREIGN KEY (user_id) REFERENCES user_table(user_id)
);

CREATE TABLE leave_table (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(10),
    leave_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    days INT,
    reason TEXT,
    status VARCHAR(15) DEFAULT 'Pending',
    CONSTRAINT fk_user_leave FOREIGN KEY (user_id) REFERENCES user_table (user_id)
);

CREATE TABLE leave_balance (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(10) UNIQUE,
    bal_json JSONB DEFAULT {'annual' : 20, 'sick' : 20, 'casual' : 20, 'compensatory' : 20}
    CONSTRAINT fk_user_bal FOREIGN KEY (user_id) REFERENCES user_table (user_id)
);

create table payroll_table(
    id SERIAL PRIMARY KEY,
	basic INTEGER,
	hra INTEGER,
	allowance INTEGER,
	pf_cont INTEGER,
	tax FLOAT,
	gross FLOAT,
    user_id VARCHAR(10),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user_table(user_id)
);

CREATE TABLE timesheets (
  id SERIAL PRIMARY KEY,
  user_id varchar(10),
  business_unit_code varchar(30),
  global_business_unit_code varchar(30),
  project_code varchar(30),
  activity_code varchar(30),
  shift_code varchar(30),
  hours NUMERIC,
  date DATE,
  leave NUMERIC,
  comp_off NUMERIC,
  status varchar(20) DEFAULT 'Pending',
  CONSTRAINT fk_user_time FOREIGN KEY (user_id) REFERENCES user_table(user_id)
);