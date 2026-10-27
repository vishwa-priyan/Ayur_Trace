# 🌿 AyurTrace: Herb Traceability System

AyurTrace is a modern, enterprise-grade herb traceability system designed to ensure the authenticity, quality, and regulatory compliance of Ayurvedic herbs throughout the supply chain—**from farm to pharmacy**. By leveraging a secure REST backend, role-based access controls, automated database-level audit triggers, and a responsive frontend, the application enables farmers to log harvest details, labs to record compliance audits, processors to catalog formulation steps, and stakeholders to monitor real-time compliance metrics. The public can instantly trace individual product batches back to their agricultural origins.

---

## 🏗️ System Architecture

AyurTrace is structured as a client-server monorepo. It features a React single-page application (SPA) frontend that communicates with an Express.js REST API backend connected to a PostgreSQL database.

### Core Architecture Flow

```mermaid
graph TD
  %% Client/User Roles
  subgraph Clients [Frontend Client Portal]
    Farmer[👨‍🌾 Farmer Interface]
    Lab[🧪 Lab & Processor Portal]
    Manager[📈 Manager Dashboard]
    Consumer[🔍 Public Provenance Portal]
  end

  %% API Server & Routing
  subgraph Server [Backend REST Service]
    Proxy[Vite Proxy Router: Port 8080] -->|Proxies /api/* requests| Express[Express.js Server: Port 5000]
    Express --> Auth[JWT & bcryptjs Auth Middleware]
    Express --> Uploads[Multer File Storage Uploads]
    Express --> QueryEngine[db.jspg Connection Pool]
  end

  %% Database Layer
  subgraph Storage [PostgreSQL Database Ledger]
    QueryEngine --> Schema[(schema.sql Tables)]
    Schema -->|Triggers log_audit_event| AuditLogs[(audit_logs DB Table)]
  end

  %% Data Relations
  Farmer -->|Logs Harvest & Coordinates| Proxy
  Lab -->|Logs Quality Tests & Processing Steps| Proxy
  Manager -->|Fetches Recharts Analytics & Runs Audits| Proxy
  Consumer -->|Searches Batch ID / Scans QR Code| Proxy
```

### Batch Status State Transitions

An individual herb batch flows through a structured set of lifecycle phases:

```mermaid
stateDiagram-v2
  [*] --> Collected : Farmer submits Collection Event
  Collected --> QualityCheck : Lab starts Quality Test & Uploads Certificate
  QualityCheck --> InProcessing : Post-Harvest Processing Step recorded
  InProcessing --> Completed : Final Packaging/Labeling step logged
  Completed --> [*] : Verified product reaches shelf with signed QR
```

---

## 🛠️ Technology Stack

### Frontend Service (`/frontend`)
*   **Base Framework**: React 18 (built with [React](https://react.dev/) and Vite for rapid development and optimized compilation)
*   **Routing**: React Router DOM (v6) for path mapping and route authorization
*   **State Management & API Querying**: TanStack Query (React Query v5) for cache-aware background API synchronization
*   **Styling & UI Components**: Tailwind CSS v3 and shadcn/ui components (built on top of Radix UI primitives)
*   **Data Visualization**: Recharts (v2) for rendering real-time stakeholder graphs and distributions
*   **QR Scanner & Generator**: `html5-qrcode` (for real-time camera QR scanning) and `qrcode` (for SVG/Canvas data-URL generation)
*   **Date Operations**: `date-fns` for localized chronological formats
*   **Form Management**: React Hook Form with Zod schemas for client-side field validation

### Backend Service (`/backend`)
*   **Application Server**: Node.js and Express.js for REST API endpoints
*   **Database Connectivity**: Node Postgres (`pg`) driver with connection pooling support
*   **Security & Authentication**: JSON Web Tokens (`jsonwebtoken` v9) and `bcryptjs` (v2.4) for secure password hashing and role verification
*   **File Uploads**: `multer` for receiving and storing local visual attachments (harvest photos and lab compliance certificates)
*   **Hot Reloading**: `nodemon` for active backend development auto-restarting

### Database Layer (PostgreSQL)
*   **Relational Schema**: Handled via SQL scripts in [`backend/schema.sql`](file:///d:/Tech/Ayur_Trace/backend/schema.sql)
*   **Audit Engine**: Database-level PL/pgSQL database trigger (`log_audit_event()`) that runs automatically on insert, update, or delete operations to record every history change in the `audit_logs` table
*   **Seed Utility**: Custom [`backend/migrate.js`](file:///d:/Tech/Ayur_Trace/backend/migrate.js) to initialize the schema and seed accounts without removing existing data

---

## 🗄️ Database Schema & Ledger Design

The database schema defines 7 tables, linked through foreign key relations.

```
                  +------------------+
                  |      users       |
                  +------------------+
                  | PK  id           | <-------+
                  |     name         |         |
                  |     email        |         |
                  |     role         |         |
                  +------------------+         |
                           |                   |
                           | 1                 | 1
                           |                   |
                           | N                 | N (farmer_id)
                  +------------------+         |
                  |     batches      | --------+
                  +------------------+
                  | PK  batch_id     | <-------------------------+-------------------------+
                  |     herb_name    |                           |                         |
                  |     weight/unit  |                           |                         |
                  |     status       |                           |                         |
                  +------------------+                           |                         |
                           |                                     |                         |
                           | 1                                   | 1                       | 1
                           |                                     |                         |
                           | N                                   | N                       | N
                  +------------------+                 +------------------+      +------------------+
                  |  quality_tests   |                 | processing_steps |      |     feedback     |
                  +------------------+                 +------------------+      +------------------+
                  | PK  id           |                 | PK  id           |      | PK  id           |
                  | FK  batch_id     |                 | FK  batch_id     |      | FK  batch_id     |
                  |     compliance   |                 |     step_type    |      |     rating (1-5) |
                  |     dna_result   |                 |     facility_name|      |     comment      |
                  +------------------+                 +------------------+      +------------------+
```

### Table Breakdown

1.  **`users`**: Stores user authentication credentials.
    *   `id` (VARCHAR PRIMARY KEY), `name` (VARCHAR), `email` (VARCHAR UNIQUE), `password_hash` (VARCHAR), `role` (VARCHAR - `'farmer'`, `'lab'`, `'stakeholder'`).
2.  **`batches`**: Tracks the primary herb collection.
    *   `batch_id` (VARCHAR PRIMARY KEY), `herb_name` (VARCHAR), `weight` (DECIMAL), `unit` (VARCHAR), `harvest_date` (DATE), `visual_quality` (VARCHAR), `pest_disease` (BOOLEAN), `moisture_level` (DECIMAL), `latitude` (DECIMAL), `longitude` (DECIMAL), `address` (TEXT), `collector_notes` (TEXT), `farmer_id` (VARCHAR REFERENCES `users`), `photo_url` (VARCHAR), `status` (VARCHAR), `created_at` (TIMESTAMP).
3.  **`quality_tests`**: Logs chemical testing and compliance.
    *   `id` (SERIAL PRIMARY KEY), `batch_id` (VARCHAR REFERENCES `batches`), `test_type` (VARCHAR), `lab_name` (VARCHAR), `test_date` (DATE), `technician` (VARCHAR), `moisture_content` (VARCHAR), `pesticide_result` (VARCHAR), `pesticide_level` (VARCHAR), `dna_result` (VARCHAR), `overall_compliance` (VARCHAR), `notes` (TEXT), `certificate_url` (VARCHAR), `created_at` (TIMESTAMP).
4.  **`processing_steps`**: Details processing phases (drying, formulation, cleaning, final packaging).
    *   `id` (SERIAL PRIMARY KEY), `batch_id` (VARCHAR REFERENCES `batches`), `step_type` (VARCHAR), `facility_name` (VARCHAR), `start_date` (DATE), `end_date` (DATE), `processed_by` (VARCHAR), `method` (VARCHAR), `temperature` (VARCHAR), `duration` (VARCHAR), `output_weight` (DECIMAL), `output_unit` (VARCHAR), `storage_location` (VARCHAR), `created_at` (TIMESTAMP).
5.  **`feedback`**: Captures rating logs from consumers.
    *   `id` (SERIAL PRIMARY KEY), `batch_id` (VARCHAR REFERENCES `batches`), `rating` (INTEGER CHECK 1-5), `comment` (TEXT), `category` (VARCHAR), `created_at` (TIMESTAMP).
6.  **`consumer_scans`**: Tracks QR code scans by region.
    *   `id` (SERIAL PRIMARY KEY), `batch_id` (VARCHAR REFERENCES `batches`), `scanned_at` (TIMESTAMP), `location` (VARCHAR).
7.  **`audit_logs`**: Populated by a trigger to store transaction histories.
    *   `id` (SERIAL PRIMARY KEY), `table_name` (VARCHAR), `record_id` (VARCHAR), `action` (VARCHAR - `'INSERT'`, `'UPDATE'`, `'DELETE'`), `new_data` (JSONB), `created_at` (TIMESTAMP).

> [!NOTE]
> The **Audit System** operates on the database engine. If a technician, farmer, or manager makes an addition or change, the triggers insert a copy of the payload into `audit_logs`. This ensures that even if an entry is edited, the historical database footprint is preserved.

---

## 🔄 Role-Based Supply Chain Flows

### 👨‍🌾 1. Farmer Interface
*   **Collection Logging**: Farmers use [`frontend/src/pages/CollectionEvent.jsx`](file:///d:/Tech/Ayur_Trace/frontend/src/pages/CollectionEvent.jsx) to log new harvests.
*   **Auto-Batch ID Generation**: The UI automatically generates a structured ID in the format: `AYR` + `YYYY` + `MM` + `6-digit timestamp` to prevent naming collisions.
*   **GPS Geo-tagging**: The system queries the browser Geolocation API to find the farmer's coordinates (latitude and longitude) and embeds them.
*   **Visual Mapping**: Coordinates are displayed dynamically via an OpenStreetMap static mapping embed in [`frontend/src/components/MapDisplay.jsx`](file:///d:/Tech/Ayur_Trace/frontend/src/components/MapDisplay.jsx).
*   **Initial Metrics**: Moisture check level, pest check flags, collector notes, and upload photo of raw herbs.

### 🧪 2. Lab & Processor Portal
*   **Verification Lookup**: Lab technicians use [`frontend/src/pages/QualityTest.jsx`](file:///d:/Tech/Ayur_Trace/frontend/src/pages/QualityTest.jsx) to find a batch by entering its Batch ID or scanning a QR code using the browser camera.
*   **Quality & Compliance Logging**: Tests record specific parameters, such as DNA authentication (matching the certified Ayurvedic species), pesticide residue status, and moisture percentage compliance. Certifications are uploaded as PDF/image files.
*   **Processing Step Tracking**: Techs log post-harvest processing methods (such as drying, cleaning, steam distillation, extraction, or final packaging), output weight, facilities, and storage coordinates.

### 📈 Corporate Manager Dashboard
*   **Executive Dashboard**: Managers access [`frontend/src/pages/StakeholderDashboard.jsx`](file:///d:/Tech/Ayur_Trace/frontend/src/pages/StakeholderDashboard.jsx) to inspect real-time metrics.
*   **Carbon Footprint Estimation**: The system calculates carbon footprint estimates dynamically: `weight * 0.05` kg of CO₂e per kg of fresh herb (reflecting transport/storage metrics).
*   **Analytical Graphs**:
    *   *Line Chart*: Harvest volume weights over time.
    *   *Pie Chart*: Passed vs Failed Quality Test distribution.
    *   *Regional Volume Map*: Batch volume totals by city.
*   **System Alert Feed**: Automatically flags high moisture levels (>10.0%) or positive pest findings on the fields.
*   **Reporting Tools**: Managers can run database audits or export the filtered batch lists to CSV format instantly.

### 🔍 Public Provenance Portal
*   **Timeline Journey**: Anyone can access [`frontend/src/pages/Provenance.jsx`](file:///d:/Tech/Ayur_Trace/frontend/src/pages/Provenance.jsx) directly by routing to `/provenance/:batchId`.
*   **Secured Verification**: The portal displays the verification status of the batch.
*   **HMAC QR Validation Payload**: The QR Generator in [`frontend/src/components/QRGenerator.jsx`](file:///d:/Tech/Ayur_Trace/frontend/src/components/QRGenerator.jsx) signs the batch URL payload using a secure server-side HMAC SHA-256 signature algorithm.
*   **Feedback Portal**: Consumers can view feedback history and submit ratings and reviews, which sync back to the farmer's account.

---

## 🛠️ Step-by-Step Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.x or higher)
*   [npm](https://www.npmjs.com/) (packaged with Node.js)
*   [PostgreSQL](https://www.postgresql.org/) (v14.x or higher, running locally or in the cloud)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Ayur_Trace
```

### Step 2: PostgreSQL Database Setup
1.  Open your PostgreSQL command line tool (`psql`) or a graphical database explorer (such as pgAdmin or DBeaver).
2.  Create a fresh database named `ayur_trace`:
    ```sql
    CREATE DATABASE ayur_trace;
    ```

### Step 3: Configure and Start the Backend Server
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install backend dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment parameters. A standard configuration file is pre-populated in [`backend/.env`](file:///d:/Tech/Ayur_Trace/backend/.env):
    ```env
    DATABASE_URL=postgres://postgres:password@localhost:5432/ayur_trace
    PORT=5000
    JWT_SECRET=ayurtrace_jwt_secret_key_2026
    ```
    *Modify the credentials (username, password, host, port) in the `DATABASE_URL` string to match your local PostgreSQL configuration.*
4.  Run migrations and seed default user accounts:
    ```bash
    npm run migrate
    ```
    *This runs the [`backend/migrate.js`](file:///d:/Tech/Ayur_Trace/backend/migrate.js) script, creating the database schema and adding mock user profiles.*
5.  Start the backend API server in development mode:
    ```bash
    npm run dev
    ```
    *The Express application will start on `http://localhost:5000`.*

### Step 4: Configure and Start the Frontend Server
1.  Open a new terminal window, return to the project root directory, and navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite local development server:
    ```bash
    npm run dev
    ```
    *The web application will launch at `http://localhost:8080`. Vite is pre-configured in [`frontend/vite.config.js`](file:///d:/Tech/Ayur_Trace/frontend/vite.config.js) to proxy `/api/*` endpoints to the Express API running on port `5000`.*

### Docker Compose

Docker Compose runs the production Vite build, Express API, and PostgreSQL database together. The API container serves the frontend on port `5000`, so only one application URL is needed.

1. Create a `.env` file in the repository root with a strong JWT secret:
   ```env
   JWT_SECRET=replace_with_a_long_random_secret
   POSTGRES_PASSWORD=replace_with_a_database_password
   ```
2. Build and start the services:
   ```bash
   docker compose up --build
   ```
3. Open `http://localhost:5000`. PostgreSQL data and uploaded files are stored in named Docker volumes.

The migration runs when the API container starts and is safe to run against an existing database. To stop the services without deleting data:
```bash
docker compose down
```

To remove the database and uploaded files as well, use `docker compose down -v`.

---

## 📝 Demo Credentials & Testing Walkthrough

Use these seeded test accounts to explore the platform:

| Role | Email / User ID | Password | Primary Key Actions |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@example.com` or `F2025001` | `password123` | Log new collection batches and view reviews |
| **Lab/Processor** | `lab@example.com` or `LAB001` | `password123` | Verify batch, record test reports & post-harvest processing steps |
| **Manager/Stakeholder** | `manager@example.com` or `MGR001` | `password123` | Inspect charts, export reports, run system audits, view alerts |

### 🚀 Recommended Verification Scenario

1.  **Create a Batch (Farmer)**:
    *   Sign in at `http://localhost:8080/login` as a Farmer using `farmer@example.com` and `password123`.
    *   Go to the **Farmer Collection** tab. Click **Start Collection Event**.
    *   Select an herb (e.g., *Ashwagandha (Withania somnifera)*), enter a weight (e.g., `450`), choose a moisture classification, and note the visual check quality.
    *   Click **Record Collection Event**. The application will display a successful insertion modal with a generated Batch ID (e.g., `AYR202608123456`) and render a downloadable QR code.
2.  **Add Testing & Processing (Lab / Processor)**:
    *   Log out and log back in as Lab Personnel using `lab@example.com` and `password123`.
    *   Open the **Lab Interface** tab. Search for the generated Batch ID (e.g., `AYR202608123456`).
    *   In the **Quality Test** tab, fill out the chemical parameters (DNA authentication: `Passed`, Pesticides: `not-detected`, Moisture: `8.5%`, overall compliance: `Passed`). Click **Submit Test**.
    *   In the **Processing Step** tab, log a dehydration process (Facility: `AyurProcess Center`, Method: `Solar Dehydration`, Temperature: `40°C`, Storage: `Aisle 4 Shelf B`). Click **Log Processing Step**.
3.  **Inspect Analytics (Manager)**:
    *   Log out and log back in as a Corporate Manager using `manager@example.com` and `password123`.
    *   Go to the **Stakeholder Portal**. Explore the Recharts analytics, check the updated total harvested weight, verify the compliance rate, and check the alert log.
    *   Click **Export CSV** to save a local report.
4.  **Trace Provenance (Public Consumer)**:
    *   Without signing in, open `http://localhost:8080/provenance/AYR202608123456` in your browser.
    *   Review the interactive SVG/CSS timeline detailing the collection coordinates, lab reports, and processing details.
    *   Submit a rating and comment.
    *   Log back in as a Farmer to see this customer feedback listed in your history panel.

---

## 📁 Repository Structure Index

```
Ayur_Trace/
├── backend/                       # REST API Backend Service
│   ├── uploads/                   # Local uploads directory for files and certificates
│   ├── .env                       # Backend environment configuration (credentials & ports)
│   ├── db.js                      # pg Database pool and query execution engine
│   ├── index.js                   # Express application routes, middleware, and entry file
│   ├── migrate.js                 # Automatic DB initialization and mock data seeder
│   ├── schema.sql                 # PostgreSQL tables and PL/pgSQL database triggers
│   └── package.json               # Backend dependencies and nodemon scripts
├── frontend/                      # React SPA Frontend Service
│   ├── public/                    # Static page assets
│   ├── src/                       # Source files
│   │   ├── assets/                # Images, background banners, and default graphics
│   │   ├── components/            # Reusable UI layout elements
│   │   │   ├── ui/                # Core shadcn / Radix component primitives
│   │   │   ├── MapDisplay.jsx     # OpenStreetMap static coordinates embed
│   │   │   ├── ProtectedRoute.jsx # Role-based navigation interceptor
│   │   │   └── QRGenerator.jsx    # QR canvas renderer pointing to public provenance URL
│   │   ├── contexts/              # React Context provider definitions
│   │   │   └── AuthContext.jsx    # Token auth state provider and validation
│   │   ├── hooks/                 # Custom UI hooks (use-mobile, use-toast)
│   │   ├── lib/                   # Utility helpers (utils.js)
│   │   ├── pages/                 # Full application pages
│   │   │   ├── CollectionEvent.jsx# Farmer harvest and coordinate entry portal
│   │   │   ├── Dashboard.jsx      # Main landing search page with QR camera support
│   │   │   ├── Login.jsx          # Role-based credentials login page
│   │   │   ├── NotFound.jsx       # Fallback 404 screen
│   │   │   ├── Provenance.jsx     # Consumer public traceability timeline
│   │   │   ├── QualityTest.jsx    # Lab compliance logging and processing logs
│   │   │   └── StakeholderDashboard.jsx # Stakeholder Recharts analytics view
│   │   ├── App.css                # Style variables and animations
│   │   ├── App.jsx                # Router config and query client setup
│   │   ├── index.css              # Main Tailwind import directives
│   │   └── main.jsx               # React virtual DOM entry file
│   ├── tailwind.config.js         # Tailwind theme customizations
│   ├── vite.config.js             # Vite compiler config & port 5000 proxy configuration
│   └── package.json               # Frontend dependencies and development scripts
├── .gitignore                     # Git filter patterns
└── README.md                      # Project documentation (this file)
```

---

## 🔒 Security & Data Compliance Standards

*   **Role-Based Access Control (RBAC)**: Route authorization checks on both the client (via [`ProtectedRoute.jsx`](file:///d:/Tech/Ayur_Trace/frontend/src/components/ProtectedRoute.jsx)) and server (checking `req.user.role` in [`backend/index.js`](file:///d:/Tech/Ayur_Trace/backend/index.js)) prevent unauthorized data changes.
*   **Cryptographic Security**: Passwords are securely hashed using `bcryptjs`. Request headers are validated using JWT authorization.
*   **Tamper-Evident Logs**: The `audit_logs` trigger captures all data modifications at the database level, ensuring changes are visible during audits.
