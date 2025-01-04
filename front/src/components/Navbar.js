import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.scss';
const Navbar = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate('/'); 
  };

  const goToUploadPage = () => {
    navigate('/upload'); 
  };

  return (
    <nav className="navbar">
      <button onClick={goToHome} className="navbar-button">Home</button>
      <button onClick={goToUploadPage} className="navbar-button">Commencer</button>
    </nav>
  );
};

export default Navbar;
