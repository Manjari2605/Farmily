# Farmily

A full-stack web app connecting farmers, buyers, delivery agents, and admins for direct farm-to-table commerce.

## Features
- Buyer product browsing, search, and filter
- Farmer product upload and earnings dashboard
- Delivery agent dashboard with assigned orders and earnings
- Admin dashboard (protected, role-based)
- JWT authentication for all users
- MongoDB database
- Pure HTML/CSS/JS frontend (no frameworks)

## Folder Structure
```
farmily/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── data/
│   ├── .env
│   ├── server.js
│   └── config.js
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── buyerDashboard.html
│   ├── farmerDashboard.html
│   ├── deliveryDashboard.html
│   └── adminDashboard.html
├── README.md
├── package.json
└── .gitignore
```

## Setup Instructions

### 1. Backend
- Install dependencies:
  ```bash
  cd backend
  npm install
  ```
- Set up `.env` with your MongoDB URI and JWT secret:
  ```env
  MONGO_URI=mongodb://localhost:27017/farmily
  JWT_SECRET=your_jwt_secret
  PORT=5000
  ```
- Start backend server:
  ```bash
  node server.js
  ```

### 2. Frontend
- Open `frontend/index.html` in your browser.
- For API calls, ensure backend is running on `http://localhost:5000`.

### 3. Dummy Data
- Dummy data is in `backend/data/` and loaded on server start.

### 4. Admin Access
- Login as admin using credentials in dummy data.
- Only admin can access `/adminDashboard.html` and backend admin routes.

---

## Tech Stack
- Node.js, Express.js, MongoDB, JWT
- HTML, CSS, JavaScript (no frameworks)

## License
MIT
