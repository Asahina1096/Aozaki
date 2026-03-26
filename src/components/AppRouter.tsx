import React, { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import InstanceDetail from "@/components/InstanceDetail";
import ServerList from "@/components/ServerList";

interface AppRouterProps {
  refreshInterval?: number;
}

export const AppRouter: React.FC<AppRouterProps> = ({ refreshInterval = 2000 }) => {
  return (
    <BrowserRouter>
      <HeaderNavigationBridge />
      <Routes>
        <Route path="/" element={<ServerList refreshInterval={refreshInterval} />} />
        <Route path="/instance/:uuid" element={<InstanceDetailRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const HeaderNavigationBridge: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleNavigateHome = () => {
      navigate("/");
    };

    window.addEventListener("aozaki:navigate-home", handleNavigateHome);
    return () => {
      window.removeEventListener("aozaki:navigate-home", handleNavigateHome);
    };
  }, [navigate]);

  return null;
};

const InstanceDetailRoute: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();

  if (!uuid) {
    return <Navigate to="/" replace />;
  }

  return <InstanceDetail uuid={uuid} />;
};

export default AppRouter;
