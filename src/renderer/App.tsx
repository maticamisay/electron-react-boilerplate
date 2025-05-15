import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ProductManager from './components/ProductManager';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductManager />} />
      </Routes>
    </Router>
  );
}
