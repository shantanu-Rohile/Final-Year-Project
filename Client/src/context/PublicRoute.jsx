// src/context/PublicRoute.jsx
// If the user is already authenticated, don't show public pages like login/signup.
// Redirect them to the app home.

import React from "react";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/home" replace /> : children;
}
