import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🔐 Secure Notes
        </Link>

        {isAuthenticated && (
          <div className="navbar-menu">
            <span className="navbar-user">
              👤 {user?.name}
            </span>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
