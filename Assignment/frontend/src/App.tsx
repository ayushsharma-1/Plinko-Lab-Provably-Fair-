import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Game from './pages/Game';
import Verifier from './pages/Verifier';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="nav">
          <div className="nav-container">
            <h1 className="logo">Plinko Lab</h1>
            <div className="nav-links">
              <Link to="/">Game</Link>
              <Link to="/verify">Verify</Link>
            </div>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="/verify" element={<Verifier />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
