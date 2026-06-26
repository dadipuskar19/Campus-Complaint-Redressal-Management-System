# Real-Time Campus Complaint Management System - Vignan's Institute

An enterprise-grade, secure, and AI-powered Campus Complaint Management System designed for **Vignan's Institute of Information Technology (Autonomous), Visakhapatnam**. 

This application features a modern dark/light dashboard, real-time WebSocket notifications, Google Gemini AI complaint evaluation, Web Speech API integration, and comprehensive data export tools.

---

## 🚀 Key Features

1. **AI-Driven Smart Routing (Gemini 1.5)**: Auto-categorizes complaint tickets, suggests priority levels, runs spam checks, performs sentiment analysis, and drafts immediate student response cards.
2. **Local NLP Fallback Engine**: If no Gemini API key is configured, the server automatically boots an advanced keyword rule engine. It provides categorizations, duplicate detection, and spam warnings out of the box.
3. **Real-Time WebSocket Channels**: Synced with Socket.io. Triggers desktop toasts and updates dashboard statistics instantly when administrators modify tickets.
4. **Voice-to-Text Input**: Employs the HTML5 Web Speech API to allow students to speak and dictate details into textareas.
5. **Branding & Layout**: Features Vignan's Autonomous Institute branding logo and official blue-crimson-red color palette, optimized with beautiful glassmorphism designs.
6. **Data Exports**: Admins can pull custom filtered datasets as Microsoft Excel Sheets (`.xlsx` using `xlsx`) or printed PDF Logbooks (`.pdf` using `pdfkit`).
7. **PWA Support**: Built-in service worker and web app manifest for offline shell caching and home-screen mobile installation.
8. **DB Fallback Mode**: If MongoDB is not running locally, the system automatically falls back to JSON file storage in `server/data/` so the application runs 100% database-free out of the box.

---

## 🛠️ Technology Stack

- **Frontend**: Vite, React.js, Tailwind CSS, Recharts (Charts), Framer Motion (Animations), Axios, Socket.io-Client, Lucide React (Icons), QRCode.React.
- **Backend**: Node.js, Express.js, Socket.io (WebSockets), PDFKit (PDF reports), ExcelJS/XLSX (Excel reports).
- **Database**: MongoDB (Mongoose ODM) with automatic Local JSON File Fallback.
- **Security**: JWT tokens, bcryptjs password hashing, protected client-side role gateways.

---

## 📁 Folder Directory Structure

```text
d:/CSP BATCH 13/
├── package.json                 # Monorepo runner scripts (concurrently)
├── README.md                    # System documentation
├── client/                      # Vite + React Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── index.html
│   ├── public/
│   │   ├── logo.png             # Copied Vignan Institute Logo
│   │   ├── manifest.json        # PWA Manifest
│   │   └── sw.js                # Service Worker
│   └── src/
│       ├── main.jsx
│       ├── index.css            # Tailwind & glassmorphism variables
│       ├── App.jsx              # Routing and Context mapping
│       ├── context/             # Theme, Auth, Language Contexts
│       ├── components/          # Layout & Sidebar components
│       └── pages/               # Landing, login, signup, dashboards
└── server/                      # Node.js + Express Backend
    ├── package.json
    ├── server.js                # Express & Socket.io server
    ├── config/
    │   └── db.js                # MongoDB connection config
    ├── middleware/
    │   ├── auth.js              # JWT & RBAC gatekeeper
    │   └── error.js             # Express error handler
    ├── models/                  # Mongoose models (User, Complaint, etc.)
    ├── routes/                  # REST controllers (auth, complaints)
    └── services/
        ├── aiService.js         # Gemini API & NLP Fallback
        └── storageService.js    # JSON Database simulator
```

---

## ⚙️ Environmental Setup

Create a `.env` file in the `server` directory (pre-configured with defaults):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.5.1:27017/campus_complaints
JWT_SECRET=supersecretkeyvignan2026
GEMINI_API_KEY=
NODE_ENV=development
```

*Note: If `MONGODB_URI` is not set or fails to connect, the server will alert console and switch to Local JSON Database Mode automatically.*

---

## 🏁 How to Run Locally

### 1. Install dependencies
From the root workspace directory `d:/CSP BATCH 13/`, run:
```bash
npm run install-all
```
This single command installs packages for the root, client, and server folders.

### 2. Boot the servers
Start both client (Vite) and server (Express) concurrently:
```bash
npm run dev
```

The system will print:
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:5000`

---

## 🔐 Testing Credentials

You can test both roles using these pre-configured accounts:

### Student Role
- **Email**: `student@vignan.edu`
- **Password**: `123456`
- *Access*: Register complaints, view history, scan QR codes, download receipts, rate resolved complaints, toggle multilingual text.

### Admin Role
- **Email**: `admin@vignan.edu`
- **Password**: `123456`
- *Access*: View all student complaints, filter by department/status, assign staff, modify logs, delete fake complaints, pull PDF/Excel spreadsheets.
