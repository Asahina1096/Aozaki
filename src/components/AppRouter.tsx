import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

const ServerList = lazy(() => import("@/components/ServerList"));

const InstanceDetail = lazy(async () => {
  const [, instanceDetailModule] = await Promise.all([
    import("@/i18n/config"),
    import("@/components/InstanceDetail"),
  ]);

  return instanceDetailModule;
});

interface AppRouterProps {
  refreshInterval?: number;
}

export const AppRouter: React.FC<AppRouterProps> = ({ refreshInterval = 2000 }) => {
  return (
    <BrowserRouter>
      <HeaderNavigationBridge />
      <Routes>
        <Route path="/" element={<HomeRoute refreshInterval={refreshInterval} />} />
        <Route path="/instance/:uuid" element={<InstanceDetailRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const HomeRoute: React.FC<AppRouterProps> = ({ refreshInterval = 2000 }) => {
  return (
    <Suspense fallback={null}>
      <ServerList refreshInterval={refreshInterval} />
    </Suspense>
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

  return (
    <Suspense fallback={null}>
      <InstanceDetail uuid={uuid} />
    </Suspense>
  );
};

export default AppRouter;
