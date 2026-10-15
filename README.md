# ResearchFlow — Research & Thesis Work Progress Management Portal

**ResearchFlow** is a dynamic, user-specific thesis and research management system built with React, Node.js/Express, TypeScript, and PostgreSQL.

---

## 🌟 Key Features

### 1. Dual-Role Architecture
- **Admin Portal:**
  - Create & manage scholar/customer accounts with custom credentials.
  - Dynamic Thesis Chapters ($1 \to 2 \to \dots \to N$): Add, edit, reorder, and delete chapters per project.
  - Chapter progress tracking ($0\% - 100\%$) with auto-calculated overall thesis progress:
    $$\text{overall\_progress} = \text{round}\left(\frac{\sum \text{chapter\_progress}}{N}\right)$$
  - Review Document Upload: Upload review PDFs, assign version tags, and release directly to scholars.
  - Payment tracking, supervisor notes, activity logs, and email notifications.
- **Scholar / Customer Dashboard:**
  - Strict data isolation: each scholar accesses only their specific research thesis, chapters, and progress.
  - Dynamic Chapter Roadmap: live progression view across all assigned chapters.
  - Protected Document Viewer: in-browser confidential PDF viewing with dynamic watermarking and screenshot attempt monitoring.
  - Payment breakdown & progress overview.

### 2. Document Security & Protected Viewer
- Private document storage and serving.
- Canvas-based dynamic watermarks with scholar identity, timestamp, and confidentiality tags.
- Copy, print, download, and right-click restrictions.
- Screenshot attempt detection and security event logging (`/api/security-events`).

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite, TanStack Query.
- **Backend:** Node.js, Express, TypeScript, PostgreSQL (`pg`), JWT authentication, bcryptjs.
- **Database:** PostgreSQL 18.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials:
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/researchflow

# Initialize Database Schema & Seed Data
npm run db:init

# Start Backend Server
npm run dev
# Server will run on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite Frontend
npm run dev
# Accessible on http://localhost:5173
```

---

## 🔑 Default Credentials (Development)

### Admin Console
- **Username:** `admin` (or `admin@researchflow.com`)
- **Password:** `Admin@123`

### Scholar Dashboard (Rahul Sharma)
- **Username:** `rahul.sharma` (or `rahul.sharma@gmail.com`)
- **Password:** `Rahul@123`

---

## 📂 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL & Cloudinary config
│   │   ├── controllers/     # Chapter, Admin, Auth, UserPortal, Security controllers
│   │   ├── db/              # SQL schema & migrations
│   │   ├── middleware/      # JWT authentication & admin authorization
│   │   ├── routes/          # Express API routes
│   │   ├── scripts/         # initDb setup script
│   │   └── server.ts        # Express entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/      # Admin, Chapter, Layout, Dashboard, Viewer components
│   │   ├── context/         # AuthContext & ToastContext
│   │   ├── pages/           # Admin & Scholar pages
│   │   ├── services/        # API clients & data services
│   │   └── types/           # Database & Admin TypeScript interfaces
│   └── index.html
└── package.json             # Root workspace scripts
```

---

## 📄 License
This project is licensed under the MIT License.
