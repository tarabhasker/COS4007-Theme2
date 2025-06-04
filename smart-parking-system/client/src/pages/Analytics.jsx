import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { FaArrowUp, FaHandPointer, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Sidebar from './Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import Select from 'react-select';

const viewOptions = [
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'indoor', label: 'Indoor' },
];

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState('outdoor');
  const [popularData, setPopularData] = useState([]);
  const [averageStay, setAverageStay] = useState(0);

  useEffect(() => {
    const file = viewType === 'indoor' ? '/popular_times_indoor.json' : '/popular_times_outdoor.json';

    fetch(file)
      .then(res => res.json())
      .then(json => {
        const formatted = Object.entries(json).map(([hour, count]) => ({
          hour,
          vehicles: count
        }));
        setPopularData(formatted);

        const totalVehicles = formatted.reduce((sum, item) => sum + item.vehicles, 0);
        const activeHours = formatted.filter(item => item.vehicles > 0).length;
        const avg = totalVehicles > 0 && activeHours > 0 ? (activeHours * 1).toFixed(1) : '0';
        setAverageStay(avg);
      });
  }, [viewType]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid #00ff99',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#ccffcc',
            fontSize: '14px',
            boxShadow: '0 0 10px #00ff88',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#66ffcc' }}>{label}</div>
          <div>🚗 Vehicles: <strong>{payload[0].value}</strong></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="homepage">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <h1 className="home-title">Analytics Dashboard</h1>
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

        {/* Dropdown Section */}
        <div className="dropdown-container">
          <label className="dropdown-label">Select View</label>
          <div className="dropdown-wrapper">
            <Select
              value={viewOptions.find(opt => opt.value === viewType)}
              onChange={(selected) => setViewType(selected.value)}
              options={viewOptions}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: '#121212',
                  borderColor: '#00ff88',
                  color: '#b7ffbf',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  boxShadow: '0 0 8px #00ff88',
                }),
                
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? '#005533'
                    : state.isSelected
                    ? '#00ff88'
                    : '#121212',
                  color: '#ccffcc',
                  cursor: 'pointer',
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: '#0d0d0d',
                  borderRadius: '6px',
                  boxShadow: '0 0 10px #00ff88',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#b7ffbf',
                  fontWeight: 'bold',
                }),
                dropdownIndicator: () => null,
                indicatorSeparator: () => ({ display: 'none' }),
              }}
            />
          </div>
        </div>


        {/* Chart Section */}
        <div
          className="chart-section"
          style={{
            marginTop: '2rem',
            padding: '2rem',
            backgroundColor: '#0d0d0d',
            borderRadius: '12px',
            boxShadow: '0 0 25px rgba(0, 255, 100, 0.2)',
            color: '#d1ffd6'
          }}
        >
          <div
            className="flex items-center mb-6"
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <h2
              id="popular-title"
              className="text-2xl font-semibold text-green-400 tracking-wide"
              style={{ flex: 1, textAlign: 'left' }}
            >
              Popular Times Overview
            </h2>
            <div
              id="datetime-info"
              className="flex gap-2 text-green-300 text-sm font-medium justify-end"
              style={{ flex: 1, textAlign: 'right' }}
            >
              <FaCalendarAlt className="text-green-400" />
              <strong>{dayjs().format('   dddd')}</strong><br></br>
              <FaClock className="ml-2 text-green-400" />
              <strong>{dayjs().format('   h:mm A')}</strong>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularData}>
              <XAxis dataKey="hour" stroke="#88ffcc" />
              <YAxis allowDecimals={false} stroke="#88ffcc" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar
                dataKey="vehicles"
                fill="url(#greenGradient)"
                barSize={24}
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff88" />
                  <stop offset="100%" stopColor="#005533" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>

          <div
            className="mt-6 text-sm flex flex-col gap-2 rounded-md px-4 py-3"
            style={{
              color: '#ccffcc',
              marginTop: '2rem',
              textAlign: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div>
              People typically spend up to <strong className="text-green-400">{averageStay} hours</strong> here.
            </div>
          </div>
        </div>
      </div>

      {/* Custom Dropdown CSS inlined */}
      <style>{`
        .dropdown-container {
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .dropdown-label {
          color: #b7ffbf;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 6px;
          display: block;
        }

        .dropdown-wrapper {
          position: relative;
          width: 220px;
        }

        .dropdown-select {
          width: 100%;
          padding: 10px 40px 10px 12px;
          background: linear-gradient(to bottom, #1d1f20, #0f1011);
          color: #b7ffbf;
          border: 1px solid #2f2f2f;
          border-radius: 6px;
          font-weight: bold;
          font-size: 14px;
          appearance: none;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
          transition: border 0.3s ease, box-shadow 0.3s ease;
        }

        .dropdown-select:hover,
        .dropdown-select:focus {
          border-color: #00ff88;
          outline: none;
          box-shadow: 0 0 6px #00ff88;
        }

      `}</style>
    </div>
  );
};

export default AnalyticsPage;
