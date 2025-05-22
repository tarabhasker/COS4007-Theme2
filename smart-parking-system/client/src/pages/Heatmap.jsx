import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import {
  FaArrowUp,
  FaHandPointer,
  FaArrowLeft,
} from 'react-icons/fa';
import Sidebar from './Sidebar'; 

const HeatmapPage = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showGradio, setShowGradio] = useState(false);
  const gradioRef = useRef(null);
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {/* Sidebar */}
      <Sidebar /> 
      {/* Main Content */}
      <div className="main-content">
        <div className="header">
        <h1 className="home-title">Occupancy Heatmap</h1>
          <div className="stats">
            <div className="stat">
              <h2>1,050 <span className="stat-icon"><FaArrowUp /></span></h2>
              <p>Image Uploads</p>
            </div>
            <div className="stat">
              <h2>34 <span className="stat-icon"><FaHandPointer /></span></h2>
              <p>New requests</p>
            </div>
          </div>
        </div>

        <div className="hero-section">
        </div>

      </div>
    </div>
  );
};

export default HeatmapPage;
