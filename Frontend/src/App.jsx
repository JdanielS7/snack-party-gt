import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Quote from "./pages/Quote";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SnackBarCustomization from "./pages/SnackBarCustomization";
import AdminGallery from "./pages/AdminGallery";
import AdminCatalog from "./pages/AdminCatalog";
import AdminQuotes from "./pages/AdminQuotes";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cargar usuario desde localStorage
    try {
      const stored = localStorage.getItem('user');
      const parsed = stored ? JSON.parse(stored) : null;
      setUser(parsed);
      setIsAdmin(parsed?.rol === 'Admin');
    } catch (e) {
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    setUser(null);
    setIsAdmin(false);
    window.location.replace('/');
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar isAdmin={isAdmin} user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/quote" element={<Quote />} />
            <Route path="/gallery" element={<Gallery />} />
            {isAdmin && <Route path="/admin/gallery" element={<AdminGallery />} />}
            {isAdmin && <Route path="/admin/catalog" element={<AdminCatalog />} />}
            {isAdmin && <Route path="/admin/quotes" element={<AdminQuotes />} />}
            <Route path="/contact" element={<Contact />} />
            <Route path="/inventory" element={<Inventory isAdmin={isAdmin} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/snack-bar-customization" element={<SnackBarCustomization />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
