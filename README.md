# 🌿 AyurTrace: Herb Traceability System

AyurTrace is a modern, web-based herb traceability system designed to ensure the authenticity, quality, and compliance of Ayurvedic herbs throughout the supply chain—**from farm to pharmacy**. Using a secure backend and a responsive frontend, the application enables farmers to log harvest data, labs to input testing and compliance records, and stakeholders to review audits and analytics, while giving the public access to tracing the origin and feedback history of individual batches.

---

## 🏗️ Architecture & Tech Stack

The application is structured as a monorepo consisting of two primary components:

*   **Backend (`/backend`)**: Built with **Node.js**, **Express**, and **PostgreSQL** (pg). It provides secure REST APIs, role-based JWT authentication, database migration utilities, and auto-seeding.
*   **Frontend (`/frontend`)**: Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **shadcn/ui**. It uses **TanStack Query** for API requests, **lucide-react** for iconography, and is styled with a custom nature-inspired theme.

---

## ✨ Features by Role

### 👨‍🌾 1. Farmer Interface
*   **Log Harvest Collection**: Record herb name, harvest date, batch ID, weight, and visual quality rating.
*   **GPS Geo-tagging**: Capture farm coordinates (latitude and longitude) and address to trace source location.
*   **Moisture & Pest Checks**: Log initial moisture levels and pest/disease status on the field.

### 🧪 2. Lab & Processing Portal
*   **Quality & Compliance Logging**: Add chemical analysis reports including moisture compliance, DNA authenticity testing, and pesticide level indicators.
*   **Processing Step Tracking**: Log details of post-harvest processing methods (e.g., drying, cleaning, extraction), facility name, and output weight.

### 📈 3. Manager & Stakeholder Portal
*   **Executive Metrics Dashboard**: View total active batches, overall compliance passing rate, and volume of herbs processed.
*   **Supplier & Auditor Feeds**: Track the live status of batches as they transition from harvest to processing.
*   **Sustainability Analytics**: Monitor carbon footprint offsets and supplier audit compliance scores.

### 🔍 4. Public Provenance & Feedback
*   **Farm-to-Shelf Journey**: Visualize the timeline of a batch including harvest coordinates, testing compliance, and processing details.
*   **Verify Compliance Certificates**: View test reports (DNA extraction, pesticide checks) and certificates.
*   **Submit & View Feedback**: Customers can search a Batch ID (or scan a simulated QR code), view ratings, and submit reviews.

---

## 🛠️ Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.x or higher recommended)
*   [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)
*   [PostgreSQL](https://www.postgresql.org/) (v14.x or higher)

---

## 🚀 Setup & Installation

### Step 1: Clone and Navigate to the Directory
```bash
git clone <repository-url>
cd Ayur_Trace
```

### Step 2: Database Setup
1.  Open your PostgreSQL shell (`psql`) or database tool (pgAdmin, DBeaver).
2.  Create a database named `ayur_trace`:
    ```sql
    CREATE DATABASE ayur_trace;
    ```

### Step 3: Backend Configuration & Run
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables. A pre-configured `.env` is already provided. If your PostgreSQL database credentials differ (e.g., password, host, port), update `.env`:
    *   `DATABASE_URL=postgres://<username>:<password>@<host>:<port>/ayur_trace`
    *   `PORT=5000`
    *   `JWT_SECRET=ayurtrace_jwt_secret_key_2026`
4.  Run database migrations and seed mockup data:
    ```bash
    npm run migrate
    ```
    *This runs [migrate.js](file:///d:/Tech/Ayur_Trace/backend/migrate.js) which creates all tables (`users`, `batches`, `quality_tests`, `processing_steps`, `feedback`) and seeds demo accounts and records.*
5.  Start the development server:
    ```bash
    npm run dev
    ```
    *The backend server will run on `http://localhost:5000`.*

### Step 4: Frontend Configuration & Run
1.  Open a new terminal window and navigate to the `frontend` folder from the project root:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    *The frontend will run on `http://localhost:8080`. Vite is pre-configured to proxy `/api/*` requests to the Express server running on port `5000`.*

---

## 📝 Demo Credentials & Testing Walkthrough

To experience the full end-to-end functionality, use these seeded testing accounts:

| Role | Username/ID/Email | Password | Key Actions |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@example.com` or `F2025001` | `password123` | Log new collection batches |
| **Lab/Processor** | `lab@example.com` or `LAB001` | `password123` | Add lab compliance results & processing steps |
| **Manager/Stakeholder** | `manager@example.com` or `MGR001` | `password123` | Monitor batch compliance, audits, & sustainability stats |

### 🔍 Recommended Testing Sequence:
1.  **Sign In as Farmer**: Log in using `farmer@example.com` / `password123`. Click on **Farmer Collection**, then click **Start Collection Event**. Create a new batch, e.g., Batch ID: `AYR202606001`. Fill in details for a herb (e.g., "Shatavari"), set the coordinates, and submit.
2.  **Sign In as Lab & Processor**: Log in using `lab@example.com` / `password123`. Click **Lab Interface**, input your batch ID `AYR202606001` to search. Once found, use the form to log a **Quality Test** (e.g., DNA compliance "Passed", Pesticides "Not Detected"). Then add a **Processing Step** (e.g., "Dehydration" at facility "Ayur-Facility A").
3.  **Analyze as Manager**: Log in using `manager@example.com` / `password123`. Go to the **Stakeholder Portal** to see the system-wide charts, passing rates, and the audit timeline reflecting your new batch.
4.  **View Public Traceability**: Log out or open an incognito window, and go to `http://localhost:8080/provenance/AYR202606001` directly. Observe the interactive visual timeline showing the exact coordinates of origin, lab certifications, processing information, and user reviews. You can submit a rating/review at the bottom of the page!

---

## 📁 Repository Structure

```
Ayur_Trace/
├── backend/
│   ├── .env               # Database and API environment configurations
│   ├── db.js              # pg Database connection pool setup
│   ├── index.js           # REST API endpoints & server entry point
│   ├── migrate.js         # Table migration and DB seeding script
│   ├── schema.sql         # SQL schema definitions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable shadcn & custom layouts (e.g., ProtectedRoute)
│   │   ├── contexts/      # AuthContext for role-based sessions
│   │   ├── pages/         # Dashboard, Login, Collection, Quality, Provenance, Stakeholder
│   │   ├── App.tsx        # React routes definition
│   │   └── firebase.ts    # Firebase client initializations
│   ├── vite.config.ts     # Config with proxy for local development
│   └── package.json
└── README.md              # Project documentation
```

---

## 🛡️ License

This project is licensed under the MIT License.
