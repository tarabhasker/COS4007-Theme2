import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import {
  FaThLarge,
  FaCar,
  FaChartBar,
  FaArrowUp,
  FaHandPointer,
  FaArrowLeft,
} from 'react-icons/fa';
import { FaCalendarAlt } from 'react-icons/fa';
import Sidebar from './Sidebar'; 


const locations = [
  "Swinburne Multi Storey - Level 1A", "1B", "2A", "2B", "3A", "3B",
  "4A", "4B", "5A", "5B", "6A", "6B", "Swinburne Outdoor"
];

const times = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, '0')}:00`
);

const ModelPage = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showGradio, setShowGradio] = useState(false);
  const gradioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedModel && location && date && time) {
      setShowGradio(true);
      setTimeout(() => {
        gradioRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setShowGradio(false);
    }
  }, [selectedModel, location, date, time]);

  return (
    <div className="homepage">
      {/* Sidebar */}
      <Sidebar /> 
      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <FaArrowLeft
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer', color: '#fff', fontSize: '1.5rem', marginBottom: '0.2rem' }}
              title="Back to Home"
            />
            <h1 className="home-title">Model</h1>
          </div>
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

          {/* Model Selector */}
          <div className="model-buttons">
            <button
              className={`model-btn ${selectedModel === 'YOLOv5' ? 'active' : ''}`}
              onClick={() => setSelectedModel('YOLOv5')}
            >
              YOLOv5
            </button>
            <button
              className={`model-btn ${selectedModel === 'YOLOv8' ? 'active' : ''}`}
              onClick={() => setSelectedModel('YOLOv8')}
            >
              YOLOv8
            </button>
          </div>

          {/* Form Fields */}
          <div className="form-field">
            <label>Location</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Select location</option>
              {locations.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Date</label>
            <input
                type="date"
                className="date-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            </div>


          <div className="form-field">
            <label>Time</label>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              <option value="">Select time</option>
              {times.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gradio Embed */}
        {showGradio && (
          <div ref={gradioRef} className="gradio-section">
            <iframe
              src="https://8f44a067e512312359.gradio.live"
              title="YOLOv8 Gradio Interface"
              width="100%"
              height="650"
              style={{ border: 'none', borderRadius: '12px' }}
            />
          </div>
        )}

        {/* Footer Features */}
        <div className="features">
          <span>State-of-the-art YOLO Model</span>
          <span className="dot" />
          <span>Comprehensive Dataset</span>
          <span className="dot" />
          <span>High detection accuracy</span>
          <span className="dot" />
          <span>Scalable and generalizable</span>
        </div>
      </div>
    </div>
  );
};

export default ModelPage;
