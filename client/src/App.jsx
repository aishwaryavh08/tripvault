// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";

// function ProtectedRoute({ children }) {
//   const token = localStorage.getItem("token");

//   return token ? children : <Navigate to="/" replace />;
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Login */}
//         <Route path="/" element={<Login />} />

//         {/* Register */}
//         <Route path="/register" element={<Register />} />

//         {/* Protected Dashboard */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />

//         {/* Redirect unknown routes */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

// import { Routes, Route, Navigate } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import TripPhotos from "./pages/TripPhotos";
// import TripDetails from "./pages/TripDetails";
// import Profile from "./pages/Profile";
// import EditProfile from "./pages/EditProfile";
// import PublicProfile from "./pages/PublicProfile";
// import "./App.css";

// function ProtectedRoute({ children }) {
//   const token = localStorage.getItem("token");
//   return token ? children : <Navigate to="/login" replace />;
// }

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/login" replace />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
      
//       <Route
//   path="/dashboard"
//   element={
//     <ProtectedRoute>
//       <Dashboard />
//     </ProtectedRoute>
//   }
// />
// <Route
//   path="/edit-profile"
//   element={
//     <PublicProfile/>
//   }
// />

// <Route
//   path="/profile/:username"
//   element={
//     <ProtectedRoute>
//       <Profile />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/trip/:id"
//   element={
//     <ProtectedRoute>
//       <TripDetails />
//     </ProtectedRoute>
//   }
// />

// <Route
//   path="/trip/:id/photos"
//   element={
//     <ProtectedRoute>
//       <TripPhotos />
//     </ProtectedRoute>
//   }
// />
//     </Routes>
    
//   );
// }

// export default App;



import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TripPhotos from "./pages/TripPhotos";
import TripDetails from "./pages/TripDetails";
import EditProfile from "./pages/EditProfile";
import PublicProfile from "./pages/PublicProfile";

import "./App.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/profile/:username" element={<PublicProfile />} />

        <Route
          path="/trip/:id"
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trip/:id/photos"
          element={
            <ProtectedRoute>
              <TripPhotos />
            </ProtectedRoute>
          }
        />
      </Routes>

      <footer className="app-footer">
        <p>
          © 2026 TripVault • Built by <a href="https://github.com" target="_blank" rel="noreferrer">Aishwarya V H</a>
        </p>
      </footer>
    </>
  );
}

export default App;