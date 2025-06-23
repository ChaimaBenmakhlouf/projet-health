// src/App.jsx

import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import PrescriptionView from "./views/PrescriptionView";
import Profile from "./views/Profile";
import ExternalApi from "./views/ExternalApi";
import Forms from "./views/Forms";
import Settings from "./views/Settings";

import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  const { isLoading, error, isAuthenticated } = useAuth0();

  // Demande la permission de Notification dès la connexion
  useEffect(() => {
    if (isAuthenticated && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [isAuthenticated]);

  if (error) return <div>Oops… {error.message}</div>;
  if (isLoading) return <Loading />;

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/external-api" element={<ExternalApi />} />
            <Route path="/forms" element={<Forms />} />
            <Route path="/prescriptions" element={<PrescriptionView />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
