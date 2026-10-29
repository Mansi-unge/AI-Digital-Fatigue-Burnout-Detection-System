import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const location = useLocation();

  const storedUser = localStorage.getItem("user");

  // User is not logged in
  if (!storedUser) {

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );

  }

  // User is logged in
  return children;
};

export default ProtectedRoute;