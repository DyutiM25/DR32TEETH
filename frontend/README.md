# DR32TEETH - Frontend Application

This is the patient-facing and provider-facing web application for the DR32TEETH platform, built with React 19 and Vite.

## 🚀 Features

- **Modern UI/UX**: Built with Tailwind CSS for a sleek, responsive, and accessible interface.
- **Dynamic Dashboards**:
  - **Patient Dashboard**: Manage appointments and view health records.
  - **Doctor Dashboard**: Interactive schedule management and consultation tools.
  - **Admin Dashboard**: System administration and user oversight.
- **Real-time Feedback**: Integrated `react-hot-toast` for intuitive user notifications.
- **Smooth Navigation**: Client-side routing with `React Router 7`.
- **Carousel Components**: Enhanced visual experience using `react-slick`.

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Routing**: React Router 7

## 📂 Directory Structure

```text
frontend/
├── src/
│   ├── api/            # API service layers (Axios instances)
│   ├── components/     # Reusable UI components
│   ├── context/        # Global state management
│   ├── pages/          # Page-level components (Admin, Doctor, Patient, etc.)
│   ├── assets/         # Images, fonts, and global styles
│   └── App.jsx         # Main application component
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite configuration
```

## ⚙️ Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🎨 Styling

The application uses Tailwind CSS. To modify the theme or add custom utilities, refer to `tailwind.config.js`.

## 📄 License

This project is licensed under the ISC License.
