import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TournamentProvider } from './context/TournamentContext';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { WinnerPage } from './pages/WinnerPage';

export default function App() {
  return (
    <BrowserRouter>
      <TournamentProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/winner" element={<WinnerPage />} />
        </Routes>
      </TournamentProvider>
    </BrowserRouter>
  );
}
