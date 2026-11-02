import { Routes, Route, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import CareHistory from "./pages/CareHistory.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MyPlants from "./pages/MyPlants.jsx";
import PlantEditor from "./pages/PlantEditor.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function NotFound() {
  return <div className="not-found"><span>🌱</span><h1>Page not found</h1><p>Let’s get you back to your plants.</p><Link className="button button-primary" to="/">Back to dashboard</Link></div>;
}

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plants" element={<MyPlants />} />
          <Route path="/plants/new" element={<PlantEditor />} />
          <Route path="/plants/:id/edit" element={<PlantEditor />} />
          <Route path="/history" element={<CareHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <footer className="page-footer">Take a deep breath. You’re doing great. <span>♡</span></footer>
      </main>
    </div>
  );
}
