// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaThLarge, FaCar, FaChartBar } from 'react-icons/fa';
import './HomePage.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-icons">
        <NavLink
          to="/"
          className={({ isActive }) => `sidebar-icon ${isActive ? 'active-icon' : ''}`}
        >
          <FaThLarge />
        </NavLink>

        <NavLink
          to="/heatmap"
          className={({ isActive }) => `sidebar-icon ${isActive ? 'active-icon' : ''}`}
        >
          <FaCar />
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) => `sidebar-icon ${isActive ? 'active-icon' : ''}`}
        >
          <FaChartBar />
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
