// import React from "react";
// import ReactDOM from "react-dom/client";
// import {BrowserRouter,Routes,Route} from "react-router-dom";
// import App from "./App";
// import "./index.css";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <Routes>
//         <Route path="*" element={<App />} />
//       </Routes>
//     </BrowserRouter>
//   </React.StrictMode>
// );

//     <App />
//   </React.StrictMode>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
if (typeof window !== "undefined") {
  window.__TRIPVAULT_API_URL__ = apiBaseUrl;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
