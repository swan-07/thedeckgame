import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { RequireAdmin, RequireAuth } from "./components/ProtectedRoute";
import { useAuth } from "./lib/auth";
import About from "./routes/About";
import AdminGameEditor from "./routes/admin/GameEditor";
import AdminGameReview from "./routes/admin/GameReview";
import AdminGames from "./routes/admin/AdminGames";
import Apply from "./routes/Apply";
import ApplicationDetail from "./routes/ApplicationDetail";
import CardDetail from "./routes/CardDetail";
import Home from "./routes/Home";
import Login from "./routes/Login";
import MyApplications from "./routes/MyApplications";
import Profile from "./routes/Profile";

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="spinner" />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/card/:suit/:rank" element={<CardDetail />} />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/apply/:gameId"
          element={
            <RequireAuth>
              <Apply />
            </RequireAuth>
          }
        />
        <Route
          path="/applications"
          element={
            <RequireAuth>
              <MyApplications />
            </RequireAuth>
          }
        />
        <Route
          path="/applications/:id"
          element={
            <RequireAuth>
              <ApplicationDetail />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminGames />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/games/new"
          element={
            <RequireAdmin>
              <AdminGameEditor />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/games/:id/edit"
          element={
            <RequireAdmin>
              <AdminGameEditor />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/games/:id/review"
          element={
            <RequireAdmin>
              <AdminGameReview />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
