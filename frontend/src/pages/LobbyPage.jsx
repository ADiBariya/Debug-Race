import { useAuth } from "../features/auth/features.authContext";
import { useNavigate } from "react-router-dom";
import "../styles/lobby.css";

const Lobby = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleCreate = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${code}`);
  };

  const handleJoin = () => {
    const code = prompt("Enter Room Code");
    if (code) navigate(`/room/${code.toUpperCase()}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="home-container">
      {/* Top Navigation */}
      <div className="top-bar">
        <div className="logo">DEBUG RACE</div>

        <div className="top-icons">
          <button className="icon-btn" onClick={() => navigate("/profile")}>
            <i className="fa-regular fa-user"></i>
          </button>
          {/* <button className="icon-btn" onClick={handleLogout}>
            <i className="fa-solid fa-gear"></i>
          </button> */}
        </div>
      </div>

      {/* Main Center Content */}
      <div className="hero-section">
        <h1 className="main-title">DEBUG RACE</h1>

        <p className="subtitle">MULTIPLAYER COMPETITIVE DEBUGGING ARENA</p>

        <div className="button-group">
          <button className="primary-action" onClick={handleCreate}>
            🚀 CREATE LOBBY
          </button>

          <button className="secondary-action" onClick={handleJoin}>
            🔑 JOIN LOBBY
          </button>

          <button className="neutral-action">🏆 LEADERBOARD</button>

          <button className="neutral-action">📊 STATS</button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
