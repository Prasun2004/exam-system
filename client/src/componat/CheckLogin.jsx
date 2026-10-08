import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";

const CheckLogin = ({
  children,
  requiredRole = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    const checkLogin = async () => {
      try {
        const response = await api.get("/api/auth/me");

        if (!mounted) return;

        if (
          response.data?.success &&
          response.data?.user
        ) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        if (!mounted) return;

        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkLogin();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-600 font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in but wrong role
  if (
    requiredRole &&
    user.role !== requiredRole
  ) {
    if (user.role === "student") {
      return (
        <Navigate
          to="/student"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
};

export default CheckLogin;