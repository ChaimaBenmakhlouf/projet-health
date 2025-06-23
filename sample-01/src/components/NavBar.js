// src/components/NavBar.jsx

import React, { useState, useEffect } from 'react';
import { NavLink as RouterNavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faTrash,
  faFilePdf,
  faPowerOff,
  faCog
} from '@fortawesome/free-solid-svg-icons';

import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { useAuth0 } from "@auth0/auth0-react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  const [hasData, setHasData] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const logoutWithRedirect = () =>
    logout({ logoutParams: { returnTo: window.location.origin } });

  // Vérifier si l'utilisateur a déjà des données (pour "Dashboard" vs "Formulaires")
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(
          `http://localhost:3001/get-user-info?auth0_id=${user.sub}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHasData(res.ok);
      } catch {
        setHasData(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Supprimer toutes les données (RGPD) puis déconnecter
  const deleteUserData = async () => {
    if (
      !window.confirm(
        "⚠️ Voulez-vous vraiment supprimer toutes vos données ?\n" +
        "Cette action est irréversible."
      )
    ) return;

    try {
      const token = await getAccessTokenSilently();
      const url = `http://localhost:3001/delete-user-info?auth0_id=${user.sub}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(res.status);
      alert("✅ Données supprimées, vous allez être déconnecté·e.");
      logoutWithRedirect();
    } catch (err) {
      console.error("❌ deleteUserData erreur :", err);
      alert("❌ Impossible de supprimer vos données. Vérifie la console.");
    }
  };

  return (
    <div className="nav-container">
      <Navbar
        color="light"
        light
        expand="md"
        style={{
          backgroundColor: "#f8f9fa",
          padding: "10px 20px",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <Container>
          <NavbarBrand
            style={{
              fontFamily: "Sixtyfour Convergence, sans-serif",
              fontSize: "1.7rem",
              fontWeight: "bold",
              color: "#3E4677",
              cursor: "pointer"
            }}
            onClick={() => window.location.href = "/"}
          >
            MyHealthy
          </NavbarBrand>
          <NavbarToggler onClick={toggle} style={{ border: "none" }} />
          <Collapse isOpen={isOpen} navbar>

            {/* Liens Desktop */}
            <Nav className="me-auto d-flex align-items-center" navbar>
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/"
                  exact
                  activeClassName="router-link-exact-active"
                  className="navbar__link"
                >
                  <FontAwesomeIcon icon={faHome} className="me-2" />
                  Accueil
                </NavLink>
              </NavItem>

              {isAuthenticated && (
                <>
                  <NavItem>
                    <NavLink
                      tag={RouterNavLink}
                      to="/prescriptions"
                      activeClassName="router-link-exact-active"
                      className="navbar__link"
                    >
                      Prescriptions
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      tag={RouterNavLink}
                      to="/forms"
                      activeClassName="router-link-exact-active"
                      className="navbar__link"
                    >
                      {hasData ? "Dashboard" : "Formulaires"}
                    </NavLink>
                  </NavItem>

                  <NavItem>
                    <NavLink
                      tag={RouterNavLink}
                      to="/settings"
                      activeClassName="router-link-exact-active"
                      className="navbar__link"
                    >
                      <FontAwesomeIcon icon={faCog} className="me-2" />
                      Paramètres
                    </NavLink>
                  </NavItem>
                </>
              )}
            </Nav>

            {/* Bouton Se connecter ou Menu Utilisateur */}
            {!isAuthenticated ? (
              <Nav className="d-none d-md-block" navbar>
                <NavItem>
                  <Button
                    className="btn btn-primary"
                    onClick={() => loginWithRedirect()}
                  >
                    Se connecter
                  </Button>
                </NavItem>
              </Nav>
            ) : (
              <Nav className="d-none d-md-block" navbar>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <img
                      src={user.picture}
                      alt="Profile"
                      width="40"
                      className="rounded-circle"
                      style={{ border: "2px solid #3E4677" }}
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>{user.name}</DropdownItem>

                    <DropdownItem
                      tag={RouterNavLink}
                      to="/profile"
                      activeClassName="router-link-exact-active"
                      className="navbar__link"
                    >
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Profile
                    </DropdownItem>

                    <DropdownItem divider />

                    <DropdownItem
                      style={{ color: "#e63935" }}
                      onClick={deleteUserData}
                    >
                      <FontAwesomeIcon icon={faTrash} className="me-2" />
                      Supprimer mes données
                    </DropdownItem>

                    <DropdownItem
                      onClick={() => alert("Export PDF déclenché !")}
                      style={{ color: "#66bb6a" }}
                    >
                      <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                      Exporter mes données
                    </DropdownItem>

                    <DropdownItem divider />

                    <DropdownItem onClick={logoutWithRedirect}>
                      <FontAwesomeIcon icon={faPowerOff} className="me-2" />
                      Se déconnecter
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Nav>
            )}

            {/* Mobile menu (d-md-none) */}
            {isAuthenticated && (
              <Nav
                className="d-md-none justify-content-between"
                navbar
                style={{ minHeight: 170 }}
              >
                <NavItem>
                  <span className="user-info">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="rounded-circle me-2"
                      width="50"
                    />
                    <strong>{user.name}</strong>
                  </span>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  <RouterNavLink
                    to="/profile"
                    activeClassName="router-link-exact-active"
                    className="navbar__link"
                  >
                    Profile
                  </RouterNavLink>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  <button
                    className="navbar__link btn"
                    style={{ color: "#e63935", background: "transparent" }}
                    onClick={deleteUserData}
                  >
                    Supprimer mes données
                  </button>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon={faPowerOff} className="me-2" />
                  <button
                    className="navbar__link btn"
                    style={{ background: "transparent" }}
                    onClick={logoutWithRedirect}
                  >
                    Se déconnecter
                  </button>
                </NavItem>
              </Nav>
            )}
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
