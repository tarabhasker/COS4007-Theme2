import React, { useState, useEffect, useRef } from 'react';
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
  const [time, setTime] = useState('');
  const [heatmapSrc, setHeatmapSrc] = useState('');
  const heatmapRef = useRef(null);
  const navigate = useNavigate();

  const times = ['10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];

  // Update heatmap path on change
  useEffect(() => {
    if (selectedModel && time) {
      const fileName = `overlay_heatmap_${time.toLowerCase()}.jpg`;
      setHeatmapSrc(`/heatmaps/${selectedModel}/${fileName}`);
    }
  }, [selectedModel, time]);

  // Scroll to image when it appears
  useEffect(() => {
    if (heatmapSrc && heatmapRef.current) {
      setTimeout(() => {
        heatmapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [heatmapSrc]);

  return (
    <div className="homepage">
      <Sidebar />
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <FaArrowLeft
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer', color: '#fff', fontSize: '1.5rem' }}
              title="Back to Home"
            />
            <h1 className="home-title">Occupancy Heatmap</h1>
          </div>
        </div>

        {/* Controls */}
        <div className="hero-section">

          {/* Model Selection */}
          <div className="model-buttons" style={{ marginBottom: '1rem' }}>
            <button
              className={`model-btn ${selectedModel === 'yolov5' ? 'active' : ''}`}
              onClick={() => setSelectedModel('yolov5')}
            >
              YOLOv5
            </button>
            <button
              className={`model-btn ${selectedModel === 'yolov8' ? 'active' : ''}`}
              onClick={() => setSelectedModel('yolov8')}
            >
              YOLOv8
            </button>
          </div>

          {/* Time Selection */}
          <div className="form-field">
            <label>Select Time</label>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              <option value="">Select time</option>
              {times.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Heatmap Display */}
          {heatmapSrc && (
            <div ref={heatmapRef} className="gradio-section">
              <h3 style={{ marginTop: '2rem' }}>
                Heatmap: {selectedModel.toUpperCase()} @ {time}
              </h3>
              <img
                src={heatmapSrc}
                alt="Heatmap"
                style={{
                  width: '100%',
                  maxWidth: '800px',
                  borderRadius: '12px',
                  border: '2px solid #0f0',
                  marginTop: '1rem'
                }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HeatmapPage;
