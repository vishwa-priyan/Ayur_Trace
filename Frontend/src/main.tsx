import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import "./index.css";
import Login from "@/pages/Login";
import Collection from "@/pages/CollectionEvent";
import QualityTest from "@/pages/QualityTest";
import Stakeholder from "@/pages/StakeholderDashboard";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/collection"
            element={
              <ProtectedRoute>
                <Collection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quality-test"
            element={
              <ProtectedRoute>
                <QualityTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stakeholder"
            element={
              <ProtectedRoute>
                <Stakeholder />
              </ProtectedRoute>
            }
          />
          {/* other public routes or a catch-all */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);