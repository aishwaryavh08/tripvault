# ✈️ TripVault

TripVault is a full-stack travel management web application built using the MERN stack.

## 🚀 Features

### Authentication
- User registration
- User login
- Password hashing using bcrypt
- JWT-based authentication
- Protected routes
- Logout functionality
- Current user authentication

### Frontend
- React
- React Router
- Responsive UI
- Login page
- Registration page
- Dashboard

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## 🛠️ Tech Stack

**Frontend**
- React
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose

**Authentication**
- JSON Web Token (JWT)
- bcryptjs

## 📁 Project Structure

```text
TripVault/
│
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Dashboard.jsx
│       ├── App.jsx
│       └── App.css
│
├── server/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── .env
│   └── index.js
│
├── package.json
└── README.md
