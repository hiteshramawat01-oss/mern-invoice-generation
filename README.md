# 🧾 Invoice Generation App — MERN Stack

A production-ready full-stack invoice generation app rebuilt from Figma Make (Supabase) to a standard **MongoDB · Express · React · Node.js** architecture.

---

## 📁 Project Structure

```
invoice-app/
├── client/                   # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Login, Signup pages
│   │   │   ├── invoice/      # Dashboard, Form, Preview, Settings dialogs
│   │   │   ├── admin/        # Admin login & dashboard
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── context/          # AuthContext (global auth state)
│   │   ├── services/         # API service layer (api.ts)
│   │   ├── types/            # TypeScript interfaces
│   │   └── App.tsx           # React Router routes
│   └── package.json
│
├── server/                   # Express REST API
│   ├── src/
│   │   ├── config/           # MongoDB connection
│   │   ├── controllers/      # auth, invoice, business, item, admin
│   │   ├── middleware/        # JWT auth, admin guard
│   │   ├── models/           # User, Business, Invoice, MasterItem
│   │   ├── routes/           # Route definitions
│   │   └── scripts/          # createAdmin.js seed script
│   └── package.json
│
└── package.json              # Root scripts (run both with concurrently)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)

### 1. Clone & Install

```bash
# Install all dependencies (root + server + client)
npm run install:all
```

### 2. Configure the Server

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/invoice_app
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> **MongoDB Atlas:** Replace `MONGO_URI` with your Atlas connection string, e.g.:
> `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/invoice_app`

### 3. Create the Admin User

```bash
npm run seed:admin
# Creates admin@invoiceapp.com / Admin@1234
# Or set env vars: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin
```

### 4. Run in Development

```bash
# From project root — starts both server (port 5000) and client (port 5173)
npm run dev
```

Open http://localhost:5173

---

## 🔐 Authentication

| Role  | How to get access | Default credentials (dev) |
|-------|------------------|--------------------------|
| User  | Sign up via /signup | — |
| Admin | Run seed script | admin@invoiceapp.com / Admin@1234 |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register + create business profile |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Business (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/business` | Get business details |
| PUT | `/api/business` | Update business details + logo + brand |

### Invoices (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List all user's invoices |
| GET | `/api/invoices/next-number` | Get next auto-incremented number |
| GET | `/api/invoices/:id` | Get single invoice |
| POST | `/api/invoices` | Create invoice |
| PUT | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |

### Master Items (read: all users; write: admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | List active items |
| POST | `/api/items` | Create item (admin) |
| PUT | `/api/items/:id` | Update item (admin) |
| DELETE | `/api/items/:id` | Soft-delete item (admin) |

### Admin (admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users + invoice counts |
| PUT | `/api/admin/users/:id/toggle` | Activate/deactivate user |
| GET | `/api/admin/stats` | Total users & invoices |

---

## 🔄 Key Changes from Figma Make Version

| Before (Figma Make) | After (MERN) |
|--------------------|--------------|
| Supabase Auth | JWT + bcryptjs |
| Supabase Edge Functions (Deno) | Express.js REST API |
| localStorage for invoices & items | MongoDB (persistent, cross-device) |
| Hardcoded admin credentials | Role-based (admin role in DB) |
| Single-file architecture | Proper MVC + service layer |
| `/utils/supabase/*` config | `.env` environment variables |

---

## 🏗️ Production Deployment

### Build the client
```bash
npm run build:client
# Output in client/dist/
```

### Serve static files from Express (optional)
Add to `server/src/index.js`:
```js
const path = require("path");
app.use(express.static(path.join(__dirname, "../../client/dist")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../../client/dist/index.html")));
```

### Environment variables for production
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Use MongoDB Atlas for `MONGO_URI`
- Set `CLIENT_URL` to your production domain

---

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Router v6, sonner (toasts)

**Backend:** Node.js, Express 4, Mongoose 8, JWT, bcryptjs, helmet, express-rate-limit

**Database:** MongoDB
