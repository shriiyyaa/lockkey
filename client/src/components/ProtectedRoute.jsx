import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // INSTANT: If we have a cached user, render immediately — no spinner ever
  // The only time loading=true is when we have a token but NO cached user (rare edge case)
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-mono-950 flex items-center justify-center">
        <div className="text-ivory font-black text-[10px] tracking-[0.3em] uppercase animate-pulse">
          VALIDATING_SESSION...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}
