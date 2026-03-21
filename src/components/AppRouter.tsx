import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import InstanceDetail from "@/components/InstanceDetail";
import ServerList from "@/components/ServerList";

interface AppRouterProps {
  refreshInterval?: number;
}

export const AppRouter: React.FC<AppRouterProps> = ({
  refreshInterval = 2000,
}) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<ServerList refreshInterval={refreshInterval} />}
        />
        <Route path="/instance/:uuid" element={<InstanceDetailRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const InstanceDetailRoute: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();

  if (!uuid) {
    return <Navigate to="/" replace />;
  }

  return <InstanceDetail uuid={uuid} />;
};

export default AppRouter;
