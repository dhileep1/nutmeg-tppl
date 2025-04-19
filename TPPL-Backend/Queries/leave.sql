CREATE TABLE leave_table (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(10),
    leave_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    days INT,
    reason TEXT,
    status VARCHAR(15)
    ADD fk_user_leave FOREIGN KEY (user_id) REFERENCES user_table (user_id)
);

CREATE TABLE leave_balance (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(10),
    bal_json JSONB DEFAULT {'annual' : 20, 'sick' : 20, 'casual' : 20, 'compensatory' : 20}
    ADD fk_user_bal FOREIGN KEY (user_id) REFERENCES user_table (user_id)
)

create table payroll_table(
	basic INTEGER,
	hra INTEGER,
	allowance INTEGER,
	pf_cont INTEGER,
	tax FLOAT,
	gross FLOAT,
    user_id VARCHAR(10),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES user_table(user_id)
);

create table user_table (
    user_id varchar(10) PRIMARY KEY,
    user_name varchar(30), 
    pan_card varchar(25),
    designation varchar(30), 
    join_date date
);