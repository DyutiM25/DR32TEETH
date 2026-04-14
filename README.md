# DR32TEETH - Healthcare Management System

DR32TEETH is a comprehensive healthcare management platform designed to streamline the workflow between patients, doctors, and administrators. It provides a robust set of tools for appointment scheduling, digital prescriptions, medical certificates, and role-based dashboard management.

## 🚀 Key Features

### 👤 Role-Based Portals
- **Patient Portal**: Book appointments, view medical history, and download prescriptions/certificates.
- **Doctor Portal**: Manage daily schedules, conduct consultations, and issue digital prescriptions.
- **Admin Portal**: System-wide oversight, user management, and analytics.

### 📅 Appointment Management
- Real-time booking and scheduling.
- Automated status updates and reminders.

### 📝 Digital Documentation
- **Prescriptions**: Generate professional PDF prescriptions with a single click.
- **Medical Certificates**: Automated generation of medical certificates for patients.

### 📊 Comprehensive Dashboard
- Interactive visualizations for patient stats, appointment trends, and more.

## 🛠️ Technology Stack

### Frontend
- **React 19** with **Vite** for a fast development experience.
- **Tailwind CSS** for modern, responsive styling.
- **React Router 7** for seamless navigation.

### Backend
- **Node.js** & **Express** for a scalable API.
- **Prisma ORM** with **PostgreSQL** for robust data management.
- **Redis** for efficient caching and session management.
- **PDFKit** for high-quality document generation.

## 📁 Project Structure

```text
dr32teeth/
├── frontend/     # React + Vite application
└── backend/      # Node.js + Express + Prisma API
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis

## ▶️ Run Locally

### Backend env
Create `backend/.env` with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dr32teeth"
DIRECT_URL="postgresql://user:password@localhost:5432/dr32teeth"
JWT_ACCESS_SECRET="your_secret_key"
REDIS_URL="redis://localhost:6379"
PORT=3000
```

### Frontend env
Create `frontend/.env` with:

```env
VITE_API_BASE_URL="http://localhost:3000/api"
```

### Start the app

1. Start the backend:
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

2. Start the frontend in a second terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dr32teeth
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file based on .env.example
   npx prisma generate
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 📄 License

This project is licensed under the ISC License.
