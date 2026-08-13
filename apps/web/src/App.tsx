import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import CardDetail from "./routes/CardDetail";
import Home from "./routes/Home";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/card/:suit/:rank" element={<CardDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
