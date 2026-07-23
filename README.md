# 🎓 ABC College — Student Feedback System

A web-based Student Feedback Management System built for **ABC College (ABC)**. Students submit feedback for their subjects/staff, and admins can view, analyse, and export reports as PDF.

🌐 **Live Site:** [https://deepakuk17.github.io/College-Feedback-System/](https://deepakuk17.github.io/College-Feedback-System/)

---

## ✨ Features

### 👤 Student Portal
- Login with **Roll Number** (case-insensitive) + Password
- View assigned subjects for the current session
- Submit feedback for each subject (10-question rating form, scale 1–5)
- Change password after first login
- Feedback can only be submitted once per subject (locked after submission)

### 🛠️ Admin Portal
- Secure admin login
- Create & manage **feedback sessions** (batch, year, section, academic year, faculty type)
- Assign students and subjects to sessions
- View real-time submission status (completed / pending)
- View detailed **response analysis** per subject and per question
- Export a full **PDF Report** (landscape A4) including:
  - College logo + header
  - Session details
  - Subject-wise analysis table (Q1–Q10 per-question averages, student count, overall avg)
  - Question-wise NOTE table (2-column layout)
  - Dean signature (auto-labelled: Dean / FOE / FOP / FASam)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (custom design system) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| PDF Export | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| Hosting | GitHub Pages |
| CI / Keep-Alive | GitHub Actions |

---

## 🗄️ Database Schema (Supabase)

| Table | Description |
|---|---|
| `students` | Roll number, name, password, department |
| `sessions` | Feedback session config (batch, year, section, faculty type, academic year) |
| `assignments` | Links students ↔ subjects ↔ sessions, tracks completion |
| `responses` | Stores Q1–Q10 ratings per student per subject |
| `subjects` | Subject code, name, staff name |

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- A Supabase project with the schema above

### 1. Clone the repo
```bash
git clone https://github.com/DeepakUK17/College-Feedback-System.git
cd College-Feedback-System
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:5173/College-Feedback-System/](http://localhost:5173/College-Feedback-System/)

---

## 🚀 Deployment (GitHub Pages)

```bash
npm run deploy
```

This runs `vite build` and publishes the `dist/` folder to the `gh-pages` branch automatically.

> Make sure `vite.config.js` has `base: '/College-Feedback-System/'` set correctly.

---

## 🔒 GitHub Secrets Required

For the CI workflow to work, add these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

---

## 🤖 Supabase Keep-Alive (Auto Ping)

Supabase free-plan databases **pause after 7 days of inactivity**. To prevent this, a GitHub Actions workflow runs every day at **9:00 AM IST** and sends a lightweight read request to the database — keeping it active automatically.

**Workflow file:** `.github/workflows/supabase-keepalive.yml`

You can also trigger it manually from the **Actions** tab → **Supabase Keep-Alive Ping** → **Run workflow** → select `main`.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Navigation bar
│   └── DevCredit.jsx       # Developer credit footer
├── pages/
│   ├── Landing.jsx         # Home / landing page
│   ├── StudentLogin.jsx    # Student login
│   ├── StudentDashboard.jsx# Student subject list + feedback status
│   ├── FeedbackForm.jsx    # 10-question feedback form
│   ├── AdminLogin.jsx      # Admin login
│   ├── AdminDashboard.jsx  # Session management + student assignment
│   ├── AdminResponseView.jsx # Response analysis + PDF export
│   └── ChangePassword.jsx  # Change password page
├── utils/
│   └── pdfReport.js        # PDF report generator (jsPDF)
├── supabase.js             # Supabase client setup
└── App.jsx                 # Routes
```

---

## 👨‍💻 Developer

Built by **Deepak** for ABC College.  
For issues or enhancements, open a GitHub Issue or contact the developer.
