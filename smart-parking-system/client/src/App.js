import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../src/pages/HomePage';
import ModelPage from '../src/pages/ModelPage';
import HeatmapPage from '../src/pages/Heatmap';
import AnalyticsPage from '../src/pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/model" element={<ModelPage />} />
        <Route path="/heatmap" element={<HeatmapPage/>} />
        <Route path="/analytics" element={<AnalyticsPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
