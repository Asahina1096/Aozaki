import { ArrowLeft } from "lucide-react";
import React from "react";
import {
  BrowserRouter,
  Link,
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

  return (
    <div>
      <Link
        to="/"
        aria-label="Back to list"
        className="mb-4 -ml-2 inline-flex items-center rounded-lg p-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      </Link>
      <InstanceDetail uuid={uuid} />
    </div>
  );
};

export default AppRouter;
