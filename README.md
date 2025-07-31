
# Farmily

Farmily is a full-stack web app connecting farmers, buyers, and delivery agents for direct farm-to-table commerce. It enables farmers to sell produce, buyers to order fresh products, and delivery agents to manage logistics—all on a single platform.


## Features
- Buyer: Browse, search, and order farm products
- Farmer: Upload products, manage orders, view wallet/earnings
- Delivery Agent: View assigned deliveries, update status, track earnings
- Secure JWT authentication for all users
- MongoDB database for persistent storage
- Responsive, modern UI (HTML, CSS, JS)


## Folder Structure
```
farmily/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── .env
│   ├── server.js
│   └── config.js
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
|
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── buyerDashboard.html
│   ├── farmerDashboard.html
│   ├── deliveryDashboard.html
│   ├── wallet.html
│   ├── payment.html
│   ├── myOrders.html
|
├── README.md
├── package.json
└── .gitignore
```


## Setup Instructions

### 1. Backend
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Set up `.env` with your MongoDB URI and JWT secret:
   ```env
   MONGO_URI=mongodb://localhost:27017/farmily
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
3. Start backend server:
   ```bash
   node server.js
   ```

### 2. Frontend
1. Open `frontend/index.html` in your browser.
2. For API calls, ensure backend is running on `http://localhost:5000`.


## Tech Stack
- Node.js, Express.js, MongoDB, JWT
- HTML, CSS, JavaScript (no frameworks)



