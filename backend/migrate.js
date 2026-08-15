const fs = require('fs');
const path = require('path');
const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function runMigration() {
  console.log('Starting migration...');
  
  // Read schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    // Run schema SQL
    await pool.query(schemaSql);
    console.log('Tables created successfully.');

    // Seed default users if they don't exist (Only in non-production)
    if (process.env.NODE_ENV !== 'production') {
      const seedUsers = [
        {
          id: 'F2025001',
          name: 'Ravi Cooperative',
          email: 'farmer@example.com',
          password: 'password123',
          role: 'farmer'
        },
        {
          id: 'LAB001',
          name: 'Certified Ayur Lab',
          email: 'lab@example.com',
          password: 'password123',
          role: 'lab'
        },
        {
          id: 'MGR001',
          name: 'Corporate Manager',
          email: 'manager@example.com',
          password: 'password123',
          role: 'stakeholder'
        }
      ];

      for (const user of seedUsers) {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
        if (res.rows.length === 0) {
          const passwordHash = await bcrypt.hash(user.password, 10);
          await pool.query(
            'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
            [user.id, user.name, user.email, passwordHash, user.role]
          );
          console.log(`Seeded user: ${user.name} (${user.id})`);
        } else {
          console.log(`User already exists: ${user.name} (${user.id})`);
        }
      }
    }

    console.log('Migration finished successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
