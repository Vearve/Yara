import { Navigate } from 'react-router-dom';

/**
 * Smart redirect component that routes users to appropriate dashboard
 * - Consultants (multi-workspace users) → /portfolio
 * - Regular users (single workspace) → /dashboard
 */
export default function SmartRedirect() {
  const isConsultant = localStorage.getItem('isConsultant') === '1';
  
  if (isConsultant) {
    return <Navigate to="/portfolio" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
}
