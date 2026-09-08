import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import CardDetail from "./routes/CardDetail";
import GameDetail from "./routes/GameDetail";
import GamesIndex from "./routes/GamesIndex";
import Home from "./routes/Home";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/card/:suit/:rank" element={<CardDetail />} />
        <Route path="/games" element={<GamesIndex />} />
        <Route path="/games/:slug" element={<GameDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
