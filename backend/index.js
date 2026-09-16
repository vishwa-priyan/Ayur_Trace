const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('./db');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ayurtrace_jwt_secret';

/**
 * Safely convert a Date object or date string to 'YYYY-MM-DD'.
 * PostgreSQL may return DATE columns as either JS Date objects or ISO strings
 * depending on the pg driver version and query context.
 */
function safeDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  // Already a string — strip the time component if present
  return String(val).split('T')[0];
}

// Middleware
const corsOrigin = process.env.CORS_ORIGIN 
  ? (process.env.CORS_ORIGIN.includes(',') ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : process.env.CORS_ORIGIN)
  : '*';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

// Setup Multer for local uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Serve uploads directory
app.use('/uploads', express.static(uploadDir));

// Token Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

// ----------------------------------------
// Auth Routes
// ----------------------------------------

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  const { id, name, email, password, userType } = req.body;

  if (!id || !name || !email || !password || !userType) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE id = $1 OR email = $2', [id, email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'User ID or Email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
      [id, name, email, passwordHash, userType]
    );

    res.status(201).json({ message: 'Registration successful. You can now log in.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { id, password, userType } = req.body;

  if (!id || !password || !userType) {
    return res.status(400).json({ message: 'Please provide ID/email, password and user type.' });
  }

  try {
    // Look up by ID or Email
    const userRes = await query(
      'SELECT * FROM users WHERE id = $1 OR email = $2',
      [id, id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = userRes.rows[0];

    // Check role
    if (user.role !== userType) {
      return res.status(403).json({ message: 'Access denied: Role mismatch.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// Current user endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// ----------------------------------------
// Upload Routes
// ----------------------------------------

app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ----------------------------------------
// Batch Routes (Collection Events)
// ----------------------------------------

// Create new batch (Farmer/Stakeholder)
app.post('/api/batches', authenticateToken, async (req, res) => {
  if (req.user.role !== 'farmer' && req.user.role !== 'stakeholder') {
    return res.status(403).json({ message: 'Only farmers or managers can log collection events.' });
  }

  const {
    batchId, herbName, weight, unit, harvestDate,
    visualQuality, pestDisease, moistureLevel,
    latitude, longitude, address, collectorNotes, photoUrl
  } = req.body;

  if (!batchId || !herbName || !weight || !harvestDate || !visualQuality) {
    return res.status(400).json({ message: 'Missing required collection event fields.' });
  }

  if (latitude && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
    return res.status(400).json({ message: 'Invalid latitude.' });
  }

  if (longitude && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
    return res.status(400).json({ message: 'Invalid longitude.' });
  }

  try {
    const existing = await query('SELECT batch_id FROM batches WHERE batch_id = $1', [batchId]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: `Batch ID ${batchId} already exists.` });
    }

    await query(
      `INSERT INTO batches (
        batch_id, herb_name, weight, unit, harvest_date,
        visual_quality, pest_disease, moisture_level,
        latitude, longitude, address, collector_notes, farmer_id, photo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        batchId, herbName, weight, unit || 'kg', harvestDate,
        visualQuality, pestDisease || false, moistureLevel || null,
        latitude || null, longitude || null, address || null,
        collectorNotes || null, req.user.id, photoUrl || null
      ]
    );

    const newBatch = await query('SELECT * FROM batches WHERE batch_id = $1', [batchId]);
    res.status(201).json(newBatch.rows[0]);
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ message: 'Error logging collection event.' });
  }
});

// Get all batches
app.get('/api/batches', authenticateToken, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'farmer') {
      result = await query(
        `SELECT b.*, u.name as farmer_name 
         FROM batches b 
         JOIN users u ON b.farmer_id = u.id 
         WHERE b.farmer_id = $1 
         ORDER BY b.created_at DESC`,
        [req.user.id]
      );
    } else {
      result = await query(
        `SELECT b.*, u.name as farmer_name 
         FROM batches b 
         JOIN users u ON b.farmer_id = u.id 
         ORDER BY b.created_at DESC`
      );
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting batches:', error);
    res.status(500).json({ message: 'Error fetching batches.' });
  }
});

// Get single batch by ID (lookup)
app.get('/api/batches/:batchId', authenticateToken, async (req, res) => {
  const { batchId } = req.params;

  try {
    const result = await query(
      `SELECT b.*, u.name as farmer_name, u.email as farmer_email
       FROM batches b
       JOIN users u ON b.farmer_id = u.id
       WHERE b.batch_id = $1`,
      [batchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `Batch ${batchId} not found.` });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error looking up batch:', error);
    res.status(500).json({ message: 'Error searching batch.' });
  }
});


// ----------------------------------------
// Quality Testing Routes
// ----------------------------------------

// Log a quality test for a batch
app.post('/api/batches/:batchId/quality-test', authenticateToken, async (req, res) => {
  if (req.user.role !== 'lab' && req.user.role !== 'stakeholder') {
    return res.status(403).json({ message: 'Only labs or managers can record quality tests.' });
  }

  const { batchId } = req.params;
  const {
    testType, labName, testDate, technician,
    moistureContent, pesticideResult, pesticideLevel,
    dnaResult, overallCompliance, notes, certificateUrl
  } = req.body;

  if (!testType || !technician || !overallCompliance) {
    return res.status(400).json({ message: 'Missing required quality test fields.' });
  }

  try {
    // Verify batch exists
    const batchRes = await query('SELECT batch_id FROM batches WHERE batch_id = $1', [batchId]);
    if (batchRes.rows.length === 0) {
      return res.status(404).json({ message: `Batch ${batchId} not found.` });
    }

    // Insert test
    const insertRes = await query(
      `INSERT INTO quality_tests (
        batch_id, test_type, lab_name, test_date, technician,
        moisture_content, pesticide_result, pesticide_level,
        dna_result, overall_compliance, notes, certificate_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        batchId, testType, labName || 'AyurLab Certified Testing', testDate, technician,
        moistureContent || null, pesticideResult || 'not-detected', pesticideLevel || null,
        dnaResult || null, overallCompliance, notes || null, certificateUrl || null
      ]
    );

    // Update batch status
    await query(
      "UPDATE batches SET status = 'Quality Check' WHERE batch_id = $1",
      [batchId]
    );

    res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    console.error('Error adding quality test:', error);
    res.status(500).json({ message: 'Error recording quality test.' });
  }
});


// ----------------------------------------
// Processing Step Routes
// ----------------------------------------

// Log processing step for a batch
app.post('/api/batches/:batchId/processing', authenticateToken, async (req, res) => {
  if (req.user.role !== 'lab' && req.user.role !== 'stakeholder') {
    return res.status(403).json({ message: 'Only lab technicians or managers can record processing steps.' });
  }

  const { batchId } = req.params;
  const {
    stepType, facilityName, startDate, endDate,
    processedBy, method, temperature, duration,
    outputWeight, outputUnit, storageLocation
  } = req.body;

  if (!stepType || !processedBy || !facilityName) {
    return res.status(400).json({ message: 'Missing required processing step fields.' });
  }

  try {
    // Verify batch exists
    const batchRes = await query('SELECT batch_id FROM batches WHERE batch_id = $1', [batchId]);
    if (batchRes.rows.length === 0) {
      return res.status(404).json({ message: `Batch ${batchId} not found.` });
    }

    // Insert step
    const insertRes = await query(
      `INSERT INTO processing_steps (
        batch_id, step_type, facility_name, start_date, end_date,
        processed_by, method, temperature, duration,
        output_weight, output_unit, storage_location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        batchId, stepType, facilityName, startDate, endDate,
        processedBy, method || null, temperature || null, duration || null,
        outputWeight ? parseFloat(outputWeight) : null, outputUnit || 'kg', storageLocation || null
      ]
    );

    // Update batch status based on step
    let nextStatus = 'In Processing';
    if (stepType.toLowerCase().includes('packaging') || stepType.toLowerCase().includes('final')) {
      nextStatus = 'Completed';
    }
    await query(
      "UPDATE batches SET status = $1 WHERE batch_id = $2",
      [nextStatus, batchId]
    );

    res.status(201).json(insertRes.rows[0]);
  } catch (error) {
    console.error('Error adding processing step:', error);
    res.status(500).json({ message: 'Error recording processing step.' });
  }
});


// ----------------------------------------
// Provenance / Public Portal Routes
// ----------------------------------------

// Public lookup for product journey
app.get('/api/provenance/:batchId', async (req, res) => {
  const { batchId } = req.params;
  const location = req.query.location || 'Unknown';

  try {
    // Get batch
    const batchRes = await query(
      `SELECT b.*, u.name as farmer_name, u.email as farmer_email
       FROM batches b
       JOIN users u ON b.farmer_id = u.id
       WHERE b.batch_id = $1`,
      [batchId]
    );

    if (batchRes.rows.length === 0) {
      return res.status(404).json({ message: `Batch ${batchId} not found.` });
    }

    // Track scan
    await query('INSERT INTO consumer_scans (batch_id, location) VALUES ($1, $2)', [batchId, location]);

    const batch = batchRes.rows[0];

    // Get quality tests
    const testsRes = await query(
      `SELECT * FROM quality_tests WHERE batch_id = $1 ORDER BY test_date ASC, id ASC`,
      [batchId]
    );

    // Get processing steps
    const stepsRes = await query(
      `SELECT * FROM processing_steps WHERE batch_id = $1 ORDER BY start_date ASC, id ASC`,
      [batchId]
    );

    // Compile timeline
    const timeline = [];

    // 1. Collection Event
    timeline.push({
      id: `coll-${batch.batch_id}`,
      type: 'collection',
      title: 'Collection Event',
      date: safeDate(batch.harvest_date),
      location: batch.address || 'Unknown site',
      collector: `${batch.farmer_name} - Farmer ${batch.farmer_id}`,
      farmerName: batch.farmer_name,
      farmerId: batch.farmer_id,
      details: {
        weight: `${batch.weight} ${batch.unit}`,
        quality: batch.visual_quality,
        coords: batch.latitude ? { lat: parseFloat(batch.latitude), lng: parseFloat(batch.longitude) } : null,
        pestDisease: batch.pest_disease,
        moistureLevel: batch.moisture_level ? `${batch.moisture_level}%` : null,
        collectorNotes: batch.collector_notes,
        photoUrl: batch.photo_url || null
      },
      status: 'completed'
    });

    // 2. Custody Handover (derived: +1 day from harvest_date; no separate DB table for handover events)
    const harvestDateObj = new Date(safeDate(batch.harvest_date));
    harvestDateObj.setDate(harvestDateObj.getDate() + 1);
    const handoverDate = harvestDateObj.toISOString().split('T')[0];

    timeline.push({
      id: `hand-${batch.batch_id}`,
      type: 'handover',
      title: 'Custody Handover',
      date: handoverDate,
      from: batch.farmer_name,
      to: stepsRes.rows.length > 0 ? stepsRes.rows[0].facility_name : 'Processing Not Started',
      note: 'Handover date is estimated as harvest date + 1 day.',
      status: 'completed'
    });

    // 3. Quality Tests
    testsRes.rows.forEach((test) => {
      timeline.push({
        id: `test-${test.id}`,
        type: 'testing',
        title: `Quality Testing - ${test.test_type}`,
        date: safeDate(test.test_date),
        lab: test.lab_name,
        certificateUrl: test.certificate_url || null,
        results: {
          moisture: test.moisture_content ? `${test.moisture_content}%` : 'N/A',
          pesticide: test.pesticide_result === 'not-detected' ? 'Not Detected' : `Detected (${test.pesticide_level || 'Low'})`,
          dna: test.dna_result || 'Verified Species'
        },
        compliance: test.overall_compliance === 'Passed' ? 'Passed All Tests' : `Non-compliant: ${test.notes || 'failed'}`,
        status: 'completed'
      });
    });

    // 4. Processing Steps
    stepsRes.rows.forEach((step) => {
      const isPackaging = step.step_type.toLowerCase().includes('packaging') || step.step_type.toLowerCase().includes('final');

      if (isPackaging) {
        // Packaging step — use end_date as the packaging completion date
        timeline.push({
          id: `pkg-${step.id}`,
          type: 'packaging',
          title: 'Final Packaging',
          date: safeDate(step.end_date),
          manufacturer: step.facility_name,
          packagingDate: safeDate(step.end_date),
          details: {
            outputWeight: `${step.output_weight || batch.weight} ${step.output_unit || 'kg'}`,
            storageLocation: step.storage_location
          },
          status: 'completed'
        });
      } else {
        // General processing step
        timeline.push({
          id: `proc-${step.id}`,
          type: 'processing',
          title: `Processing & Formulation - ${step.step_type}`,
          date: safeDate(step.start_date),
          steps: [
            step.method ? `Method: ${step.method}` : null,
            step.temperature ? `Temp: ${step.temperature}°C` : null,
            step.duration ? `Duration: ${step.duration} hrs` : null
          ].filter(Boolean),
          outputWeight: step.output_weight ? `${step.output_weight} ${step.output_unit}` : 'N/A',
          facility: step.facility_name,
          status: 'completed'
        });
      }
    });

    res.json({
      batchId: batch.batch_id,
      productName: stepsRes.rows.length > 0 ? `${batch.herb_name.split(' ')[0]} Extract` : batch.herb_name,
      status: 'verified',
      timeline
    });
  } catch (error) {
    console.error('Error generating provenance:', error);
    res.status(500).json({ message: 'Error retrieving provenance timeline.' });
  }
});

// QR Signature Payload endpoint
app.get('/api/provenance/:batchId/qr-payload', async (req, res) => {
  const { batchId } = req.params;
  const payload = JSON.stringify({ batchId, timestamp: Date.now() });
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  res.json({ 
    payload, 
    signature, 
    verificationUrl: `https://ayurtrace.com/verify?payload=${encodeURIComponent(payload)}&signature=${signature}` 
  });
});

// Post consumer feedback for batch
app.post('/api/provenance/:batchId/feedback', async (req, res) => {
  const { batchId } = req.params;
  const { rating, comment, category } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required.' });
  }

  try {
    const existing = await query('SELECT batch_id FROM batches WHERE batch_id = $1', [batchId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: `Batch ${batchId} not found.` });
    }

    await query(
      `INSERT INTO feedback (batch_id, rating, comment, category) VALUES ($1, $2, $3, $4)`,
      [batchId, rating, comment, category || null]
    );

    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ message: 'Error saving feedback.' });
  }
});

// Get all feedback for a specific batch
app.get('/api/provenance/:batchId/feedback', async (req, res) => {
  const { batchId } = req.params;
  try {
    const result = await query(
      'SELECT id, rating, comment, category, created_at FROM feedback WHERE batch_id = $1 ORDER BY created_at DESC',
      [batchId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching batch feedback:', error);
    res.status(500).json({ message: 'Error retrieving feedback.' });
  }
});

// Get all feedback for the logged-in farmer's batches
app.get('/api/farmer/feedback', authenticateToken, async (req, res) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ message: 'Only farmers can view their feedback.' });
  }
  try {
    const result = await query(
      `SELECT f.id, f.batch_id, f.rating, f.comment, f.category, f.created_at, b.herb_name
       FROM feedback f
       JOIN batches b ON f.batch_id = b.batch_id
       WHERE b.farmer_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching farmer feedback:', error);
    res.status(500).json({ message: 'Error retrieving farmer feedback.' });
  }
});



// ----------------------------------------
// Stakeholder Dashboard API
// ----------------------------------------

// Fetch all metrics
app.get('/api/stakeholder/metrics', authenticateToken, async (req, res) => {
  if (req.user.role !== 'stakeholder') {
    return res.status(403).json({ message: 'Only managers can access metrics.' });
  }

  try {
    // 1. Total weight of completed harvests
    const weightRes = await query('SELECT COALESCE(SUM(weight), 0) as total FROM batches');
    const totalWeight = parseFloat(weightRes.rows[0].total).toFixed(1);

    // 2. Active farmers
    const farmersRes = await query("SELECT COUNT(DISTINCT id) as count FROM users WHERE role = 'farmer'");
    const activeFarmers = parseInt(farmersRes.rows[0].count);

    // 3. Total Batches
    const batchesRes = await query('SELECT COUNT(*) as count FROM batches');
    const totalBatches = parseInt(batchesRes.rows[0].count);

    // Get Consumer Scans
    const scansRes = await query('SELECT COUNT(*) as count FROM consumer_scans');
    const consumerScans = parseInt(scansRes.rows[0].count);

    // Get Carbon Footprint (estimate: 0.05 kg CO₂e per kg of fresh herb — based on average
    // Ayurvedic herb supply chain transport/storage emission factor; not a certified measurement)
    const carbonRes = await query('SELECT COALESCE(SUM(weight * 0.05), 0) as carbon FROM batches');
    const carbonFootprintVal = parseFloat(carbonRes.rows[0].carbon).toFixed(2);

    // 4. Pending Quality (batches without tests)
    const pendingRes = await query(
      `SELECT COUNT(*) as count FROM batches b 
       WHERE b.batch_id NOT IN (SELECT DISTINCT batch_id FROM quality_tests)`
    );
    const pendingQuality = parseInt(pendingRes.rows[0].count);

    // 5. Compliance Rate: (Passed tests / Total tests) * 100
    const passedTestsRes = await query("SELECT COUNT(*) as count FROM quality_tests WHERE overall_compliance = 'Passed'");
    const totalTestsRes = await query("SELECT COUNT(*) as count FROM quality_tests");
    const passedTests = parseInt(passedTestsRes.rows[0].count);
    const totalTests = parseInt(totalTestsRes.rows[0].count);
    const complianceRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 100;

    // 6. Average quality score from feedback
    const avgScoreRes = await query('SELECT COALESCE(AVG(rating), 0) as avg FROM feedback');
    const avgQualityScore = parseFloat(avgScoreRes.rows[0].avg).toFixed(1);

    // 7. Recent Batches (Latest 5)
    const recentBatchesRes = await query(
      `SELECT b.batch_id as "batchId", b.herb_name as product, b.farmer_id as farmer, 
              b.harvest_date as date, b.status, b.address as location
       FROM batches b
       ORDER BY b.created_at DESC
       LIMIT 5`
    );
    const recentBatches = recentBatchesRes.rows.map(b => ({
      ...b,
      date: b.date.toISOString().split('T')[0]
    }));

    // 8. Alerts (Simulated alerts based on real issues, e.g. high moisture or pest disease)
    const alerts = [];
    const highMoistureBatches = await query(
      `SELECT batch_id, moisture_level FROM batches WHERE moisture_level > 10.0 LIMIT 2`
    );
    highMoistureBatches.rows.forEach(b => {
      alerts.push({
        id: `alert-moisture-${b.batch_id}`,
        type: 'warning',
        message: `Batch ${b.batch_id} moisture level (${b.moisture_level}%) exceeds threshold.`,
        time: 'Just now'
      });
    });

    const pestBatches = await query(
      `SELECT batch_id FROM batches WHERE pest_disease = true LIMIT 2`
    );
    pestBatches.rows.forEach(b => {
      alerts.push({
        id: `alert-pest-${b.batch_id}`,
        type: 'warning',
        message: `Pest/Disease warning logged on batch ${b.batch_id}.`,
        time: '1 hour ago'
      });
    });

    // 9. Harvest trends (grouped by weekly dates)
    const harvestTrendRes = await query(
      `SELECT TO_CHAR(harvest_date, 'Mon DD') as name, SUM(weight) as value 
       FROM batches 
       GROUP BY harvest_date 
       ORDER BY harvest_date ASC 
       LIMIT 10`
    );
    const harvestTrend = harvestTrendRes.rows.map(r => ({
      name: r.name,
      value: parseFloat(r.value)
    }));

    // 10. Quality Pie Chart distribution
    const qualityData = [
      { name: 'Passed', value: passedTests, fill: '#10b981' },
      { name: 'Failed', value: totalTests - passedTests, fill: '#ef4444' }
    ];

    // 11. Farmer Performance lists
    const farmerPerfRes = await query(
      `SELECT b.farmer_id as name, COUNT(b.batch_id) as harvests, 
              COALESCE(ROUND(AVG(f.rating), 1), 4.5) as quality
       FROM batches b
       LEFT JOIN feedback f ON b.batch_id = f.batch_id
       GROUP BY b.farmer_id`
    );
    const farmerPerformance = farmerPerfRes.rows.map(r => ({
      name: r.name,
      harvests: parseInt(r.harvests),
      quality: parseFloat(r.quality),
      compliance: 100 // default or compute from tests passed
    }));

    // 12. Regional volumes
    const regionalRes = await query(
      `SELECT COALESCE(address, 'Unknown') as region, COUNT(batch_id) as batches 
       FROM batches 
       GROUP BY address`
    );
    const regionalData = regionalRes.rows.map(r => ({
      region: r.region.split(',')[0],
      batches: parseInt(r.batches),
      quality: 4.5
    }));

    // Return compiled metrics object
    res.json({
      totalHarvested: `${totalWeight} kg`,
      pendingQuality,
      complianceRate,
      consumerScans,
      activeFarmers,
      totalBatches,
      avgQualityScore,
      carbonFootprint: `${carbonFootprintVal} tons CO₂`,
      harvestTrend,
      qualityData,
      recentBatches,
      farmerPerformance,
      regionalData,
      alertsData: alerts
    });
  } catch (error) {
    console.error('Error fetching stakeholder metrics:', error);
    res.status(500).json({ message: 'Error retrieving manager metrics.' });
  }
});


// ----------------------------------------
// Production Static Frontend Serving (Optional)
// ----------------------------------------
const frontendDist = path.join(__dirname, '../frontend/dist');
if (process.env.SERVE_FRONTEND === 'true' || (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDist))) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(frontendDist, 'index.html'));
    }
  });
}

// ----------------------------------------
// Start Web Server
// ----------------------------------------
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`AyurTrace backend listening on http://${HOST}:${PORT}`);
});
