# DR32TEETH - Backend API

This is the backend server for the DR32TEETH platform, built using Node.js, Express, and Prisma.

## 🚀 Features

- **Authentication**: JWT-based authentication with role-based access control (Admin, Doctor, Patient).
- **Appointment System**: API endpoints for booking, canceling, and managing medical appointments.
- **Consultations**: Manage patient-doctor interactions and history.
- **Document Generation**: Automated PDF generation for prescriptions and medical certificates using `PDFKit`.
- **Database Management**: Seamless data handling with Prisma ORM and PostgreSQL.
- **Caching**: Redis integration for session management and performance optimization.

## 🛠️ Tech Stack

- **Framework**: Express.js
- **Runtime**: Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Cache**: Redis
- **Security**: bcryptjs for hashing, JWT for token management
- **Mail**: Nodemailer for system notifications

## 📂 Directory Structure

```text
backend/
├── config/             # Configuration files (DB, etc.)
├── controllers/        # Business logic for each route
├── middleware/         # Auth and validation middleware
├── prisma/             # Prisma schema and migrations
├── routes/             # API route definitions
├── utils/              # Helper functions (PDF gen, mailer)
└── server.js           # Entry point
```

## ⚙️ Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root of the `backend` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dr32teeth"
   DIRECT_URL="postgresql://user:password@localhost:5432/dr32teeth"
   JWT_ACCESS_SECRET="your_secret_key"
   REDIS_URL="redis://localhost:6379"
   PORT=3000
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the Server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔗 API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/appointments` - Fetch appointments
- `POST /api/prescriptions` - Generate prescription PDF
- `GET /api/admin/stats` - Admin dashboard stats (Admin Only)
