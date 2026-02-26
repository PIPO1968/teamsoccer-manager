import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import League from './pages/League';
import Transfers from './pages/Transfers';

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/league" element={<League />} />
              <Route path="/transfers" element={<Transfers />} />
            </Routes>
          </main>
        </div>
      </GameProvider>
    </BrowserRouter>
  );
}

export default App;
