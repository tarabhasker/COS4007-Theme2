import React from 'react';
import { useNavigate } from 'react-router-dom'; // ← import navigation hook
import './HomePage.css';
import Sidebar from './Sidebar'; 
import { FaThLarge, FaCar, FaChartBar, FaArrowUp, FaHandPointer } from 'react-icons/fa';

const HomePage = () => {
    const navigate = useNavigate(); // ← initialize
    const handleTryNow = () => {
      navigate("/model"); // ← navigate to ModelPage
    };

  return (
    <div className="homepage">
      {/* Left Sidebar */}
      <Sidebar /> 

      {/* Main Content */}
      <div className="main-content">
      <div className="header">
      <h1 className="home-title">Home</h1>
        
        </div>

        <div className="hero-section">
          <h2>
            AI-Powered <span className="highlight">Smart Parking</span> Detection System
          </h2>
          <div className="description-box">
            <p>
              As part of our COS40007 capstone, we built an AI-powered vehicle detection system to address parking congestion at Swinburne. Using YOLOv5/YOLOv8 and trained on campus images and PKLot, it detects and counts vehicles across varying conditions, enabling features like occupancy heatmaps and real-time analytics.
            </p>
          </div>
          <button className="try-now-btn" onClick={handleTryNow}>Try Now</button>
        </div>


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

export default HomePage;