const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function runMigration() {
  console.log('Starting migration...');
  
  // Read schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    // Run schema SQL
    await pool.query(schemaSql);
    console.log('Tables created successfully.');

    // Seed default users if they don't exist
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

    // Seed some initial batches for demonstration if table is empty
    const batchesRes = await pool.query('SELECT * FROM batches');
    if (batchesRes.rows.length === 0) {
      // Create some mockup historical batches
      const initialBatches = [
        {
          batch_id: 'AYR202501001',
          herb_name: 'Tulsi (Ocimum sanctum)',
          weight: 15.2,
          unit: 'kg',
          harvest_date: '2025-01-20',
          visual_quality: 'Excellent',
          pest_disease: false,
          moisture_level: 8.5,
          latitude: 26.9124,
          longitude: 75.7873,
          address: 'Jaipur, Rajasthan',
          collector_notes: 'High yield harvest after winter rains',
          farmer_id: 'F2025001',
          status: 'Completed'
        },
        {
          batch_id: 'AYR202501002',
          herb_name: 'Ashwagandha (Withania somnifera)',
          weight: 22.5,
          unit: 'kg',
          harvest_date: '2025-01-15',
          visual_quality: 'Good',
          pest_disease: false,
          moisture_level: 9.0,
          latitude: 26.9124,
          longitude: 75.7873,
          address: 'Jaipur, Rajasthan',
          collector_notes: 'Standard root extraction',
          farmer_id: 'F2025001',
          status: 'Quality Check'
        },
        {
          batch_id: 'AYR202501003',
          herb_name: 'Brahmi (Bacopa monnieri)',
          weight: 8.7,
          unit: 'kg',
          harvest_date: '2025-01-10',
          visual_quality: 'Excellent',
          pest_disease: false,
          moisture_level: 7.8,
          latitude: 26.9124,
          longitude: 75.7873,
          address: 'Jaipur, Rajasthan',
          collector_notes: 'Grown near water body, high density leaf extraction',
          farmer_id: 'F2025001',
          status: 'In Processing'
        }
      ];

      for (const batch of initialBatches) {
        await pool.query(
          `INSERT INTO batches 
          (batch_id, herb_name, weight, unit, harvest_date, visual_quality, pest_disease, moisture_level, latitude, longitude, address, collector_notes, farmer_id, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            batch.batch_id, batch.herb_name, batch.weight, batch.unit, batch.harvest_date,
            batch.visual_quality, batch.pest_disease, batch.moisture_level, batch.latitude,
            batch.longitude, batch.address, batch.collector_notes, batch.farmer_id, batch.status
          ]
        );
        console.log(`Seeded batch: ${batch.batch_id}`);
      }

      // Add feedback
      await pool.query(
        `INSERT INTO feedback (batch_id, rating, comment, category) VALUES
        ('AYR202501001', 5, 'Excellent quality, very fresh!', 'Tulsi Capsules'),
        ('AYR202501002', 4, 'Good product, fast delivery', 'Ashwagandha Powder'),
        ('AYR202501003', 5, 'Amazing results, will buy again', 'Brahmi Extract')`
      );
      console.log('Seeded initial feedback records.');
    }

    console.log('Migration finished successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
