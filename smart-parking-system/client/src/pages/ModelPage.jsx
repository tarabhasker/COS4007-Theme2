import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import {
  FaArrowUp,
  FaHandPointer,
  FaArrowLeft,
} from 'react-icons/fa';
import Sidebar from './Sidebar';

const locations = [
  "Indoor - 1A", "Indoor - 1B", "Indoor - 2A", "Indoor - 2B", "Indoor - 3A", "Indoor - 3B",
  "Indoor - 4A", "Indoor - 4B", "Indoor - 5A", "Indoor - 5B", "Indoor - 6A", "Indoor - 6B", "Outdoor"
];

const times = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, '0')}:00`
);

const ModelPage = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [gradioConfirmed, setGradioConfirmed] = useState(false);
  const [showGradio, setShowGradio] = useState(false);
  const gradioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedModel && location && date && time && selectedImageFile) {
      setShowGradio(true);
      setTimeout(() => {
        gradioRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setShowGradio(false);
    }
  }, [selectedModel, location, date, time, selectedImageFile]);
  

  const handleImageChange = (e) => {
    setSelectedImageFile(e.target.files[0]);
  };

  const handleAddToDatabase = async () => {
    if (!selectedImageFile) return alert("Please upload an image.");

    const formData = new FormData();
    formData.append("image", selectedImageFile);
    formData.append("location", location);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("model", selectedModel);


    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        alert(`✅ Data added to database! Vehicle count: ${result.count}`);
      } else {
        alert("❌ Prediction failed.");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Server error.");
    }
  };

  return (
    <div className="homepage">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <FaArrowLeft
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer', color: '#fff', fontSize: '1.5rem', marginBottom: '0.2rem' }}
              title="Back to Home"
            />
            <h1 className="home-title">Model</h1>
          </div>
        </div>

        {/* Form Section */}
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

          {/* Location */}
          <div className="form-field">
            <label>Location</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">Select location</option>
              {locations.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="form-field">
            <label>Date</label>
            <input
              type="date"
              className="date-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Time */}
          <div className="form-field">
            <label>Time</label>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              <option value="">Select time</option>
              {times.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div className="form-field">
            <label>Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />

            {/* Preview Image */}
            {selectedImageFile && (
              <div style={{ marginTop: '0.2rem' }}>
                <img
                  src={URL.createObjectURL(selectedImageFile)}
                  alt="Preview"
                  style={{
                    width: '100%',
                    minWidth: '400px',
                    maxWidth: '400px',
                    maxHeight: '200px',
                    borderRadius: '10px',
                    border: '1px solid #111',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </div>

        </div>

        {/* Gradio Section */}
        {showGradio && (
          <div ref={gradioRef} className="gradio-section">
            <p style={{ fontStyle: 'italic', color: '#b3ff6d', marginBottom: '1rem' }}>
              * Upload the same image to test the model out before adding to database
            </p>
            <iframe
              src={`https://1e2d3ba3ec199f67e1.gradio.live?model=${selectedModel}`} // 👈 dynamic model
              title="YOLO Gradio Interface"
              width="100%"
              height="650"
              style={{ border: 'none', borderRadius: '12px' }}
            />
            <div className="text-center mt-4">
              {!gradioConfirmed ? (
                <button onClick={() => setGradioConfirmed(true)} className="btn model-action-btn">
                  Confirm Output
                </button>
              ) : (
                <button onClick={handleAddToDatabase} className="btn model-action-btn">
                  Add to Database
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ModelPage;
