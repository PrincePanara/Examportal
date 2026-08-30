import React from 'react';
import { Navigate } from 'react-router-dom';

// The root landing page redirects to the student login
export function Landing() {
  return <Navigate to="/login" replace />;
}