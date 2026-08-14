# ✈️ TripVault

TripVault is a full-stack travel journal app that lets users plan trips, upload memories, and share their adventures through a public traveler profile.

## Live Demo

- Frontend: https://your-vercel-app.vercel.app
- Backend API: https://your-render-app.onrender.com

## App Preview

![TripVault preview](https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80)

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Authentication: JWT, bcryptjs
- Media Storage: Cloudinary
- Styling: Custom CSS

## Features

- User registration and login
- Protected dashboard routes
- Full trip CRUD workflow
- Photo upload support with Cloudinary
- Cover image and photo gallery display
- Public user profile pages without login
- Search, sorting, and rating filters
- Responsive design for mobile and desktop

## Local Setup

1. Clone the project
2. Install the root dependencies:
   ```bash
   npm install
   ```
3. Install the client dependencies:
   ```bash
   cd client
   npm install
   ```
4. Create a `.env` file in the `server` folder using the variables shown below
5. Start the backend:
   ```bash
   cd ..
   npm run dev
   ```
6. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```

## Environment Variables

Server `.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Client `.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Project Structure

```text
TripVault/
├── client/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── index.js
├── .env.example
├── package.json
├── README.md
└── .gitignore
```

## Deployment

- Deploy the backend to Render as a Node.js Web Service
- Deploy the frontend to Vercel
- Set all required environment variables in the platform dashboard
- Update `VITE_API_URL` in the frontend to the live Render backend URL

## Notes

- The app is designed for a production-ready deployment flow with Render + Vercel.
- Free tier hosting may take a moment to wake up on first request.
