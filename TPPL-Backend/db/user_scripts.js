
const db = require('../Database');

// Script to add an hourly_rate field to users table if it doesn't exist
const addHourlyRateField = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'hourly_rate'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN hourly_rate DECIMAL(10, 2) DEFAULT 0;
    END IF;
END $$;
`;

// Script to add an onboarded_by field to users table if it doesn't exist
const addOnboardedByField = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'onboarded_by'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN onboarded_by INTEGER REFERENCES users(id);
    END IF;
END $$;
`;

// Script to add an onboarded_at field to users table if it doesn't exist
const addOnboardedAtField = `
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'onboarded_at'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN onboarded_at TIMESTAMP;
    END IF;
END $$;
`;

// Execute all user-related table updates
const updateUserTable = async () => {
  try {
    await db.executeScript(addHourlyRateField);
    await db.executeScript(addOnboardedByField);
    await db.executeScript(addOnboardedAtField);
    console.log('User table updates completed successfully');
    return true;
  } catch (error) {
    console.error('Error updating user table:', error);
    return false;
  }
};

module.exports = {
  updateUserTable,
  scripts: {
    addHourlyRateField,
    addOnboardedByField,
    addOnboardedAtField
  }
};
