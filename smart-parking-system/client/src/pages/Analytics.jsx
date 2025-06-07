import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { FaArrowUp, FaHandPointer, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Sidebar from './Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const viewOptions = [
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'indoor', label: 'Indoor' },
];

const TOTAL_CAPACITY = {
  'Multi': 381,
  'Outdoor': 150
};

const dropdownStyles = {
  control: (base) => ({
    ...base,
    borderRadius: '999px',
    padding: '2px 6px',
    fontSize: '0.85rem',
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    color: '#fff',
    fontWeight: 'bold',
    width: 130,
    minHeight: '32px',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#1e1e1e',
    color: '#fff',
    zIndex: 10,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#fff',
    fontWeight: 'bold'
  }),
  option: (base, { isFocused }) => ({
    ...base,
    backgroundColor: isFocused ? '#333' : '#1e1e1e',
    color: '#fff',
    padding: '10px 15px',
    fontWeight: 'bold'
  }),
  menuPortal: base => ({ 
    ...base, 
    zIndex: 9999 
  }),
};

const CombinedAnalyticsPage = () => {
  const [combinedData, setCombinedData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState({ value: 'Multi', label: 'Multi' });
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeOptions, setTimeOptions] = useState([]);
  const [occupancyPercent, setOccupancyPercent] = useState(0);

  const [viewType, setViewType] = useState('outdoor');
  const [popularData, setPopularData] = useState([]);
  const [averageStay, setAverageStay] = useState(0);

  useEffect(() => {
    fetch('/combined_occupancy.json')
      .then(res => res.json())
      .then(json => {
        const times = [...new Set(json.occupancy_data.map(d => d.time))];
        setTimeOptions(times.map(t => ({ value: t, label: t })));
        setSelectedTime({ value: times[0], label: times[0] });
        setCombinedData(json.occupancy_data);
      });
  }, []);

  useEffect(() => {
    if (!selectedTime || !selectedLocation || combinedData.length === 0) return;

    const filtered = combinedData.filter(d => {
      const isOutdoor = d.location_type.toLowerCase() === 'outdoor';
      const matchLocation = selectedLocation.value === 'Outdoor' ? isOutdoor : !isOutdoor;
      return matchLocation && d.time === selectedTime.value;
    });

    const totalDetected = filtered.reduce((sum, d) => sum + d.vehicle_count, 0);
    const percent = (totalDetected / TOTAL_CAPACITY[selectedLocation.value]) * 100;
    setOccupancyPercent(Math.min(100, Math.round(percent)));
  }, [selectedTime, selectedLocation, combinedData]);

  useEffect(() => {
    if (!combinedData.length) return;

    const isOutdoor = viewType === 'outdoor';

    // Group by hour
    const hourlyMap = {};

    combinedData.forEach(d => {
      const matchLocation = d.location_type.toLowerCase() === (isOutdoor ? 'outdoor' : 'indoor');
      if (!matchLocation) return;

      const hour = d.time.toLowerCase();  // e.g. '10am', '2pm'
      if (!hourlyMap[hour]) hourlyMap[hour] = 0;
      hourlyMap[hour] += d.vehicle_count;
    });

    const formatted = Object.entries(hourlyMap).map(([hour, vehicles]) => ({
      hour,
      vehicles
    })).sort((a, b) => {
      const convert = (t) => {
        const [h, period] = t.replace(':00', '').toLowerCase().split(/(am|pm)/);
        const hour = parseInt(h);
        return period === 'pm' && hour !== 12 ? hour + 12 : hour === 12 ? 12 : hour;
      };
      return convert(a.hour) - convert(b.hour);
    });

    setPopularData(formatted);

    const total = formatted.reduce((sum, item) => sum + item.vehicles, 0);
    const activeHours = formatted.filter(item => item.vehicles > 0).length;
    const avg = total > 0 && activeHours > 0 ? (activeHours * 1).toFixed(1) : '0';
    setAverageStay(avg);
  }, [viewType, combinedData]);

  const getBarColor = () => {
    if (occupancyPercent >= 80) return '#ff4c4c';
    if (occupancyPercent >= 50) return '#ffd700';
    return '#00ff66';
  };

  return (
    <div className="homepage">
      <Sidebar />
      <div className="main-content">
        <h1 className="home-title">Analytics Dashboard</h1>

        {/* Single Occupancy Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: 'white' }}>Occupancy Dashboard</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <Select
              options={[{ value: 'Multi', label: 'Multi' }, { value: 'Outdoor', label: 'Outdoor' }]}
              value={selectedLocation}
              onChange={(option) => setSelectedLocation(option)}
              styles={dropdownStyles}
            />
            <Select
              options={timeOptions}
              value={selectedTime}
              onChange={(option) => setSelectedTime(option)}
              styles={dropdownStyles}
              menuPortalTarget={document.body}
            />
          </div>

          <div style={{ background: '#111', padding: '1rem', borderRadius: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ color: '#00ff66' }}>Occupancy</h3>
            <div style={{ background: '#333', borderRadius: '1rem', height: '30px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: `${occupancyPercent}%`, height: '100%', background: getBarColor(), transition: 'width 0.5s ease-in-out' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '14px', color: 'white' }}>
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '14px', textAlign: 'center', color: 'white' }}>
            <span style={{ color: '#00ff66' }}>■ Low (0–49%) </span>
            <span style={{ color: '#ffd700', marginLeft: '1rem' }}>■ Medium (50–79%) </span>
            <span style={{ color: '#ff4c4c', marginLeft: '1rem' }}>■ High (80–100%)</span>
          </div>
        </div>

         {/* Popular Times Dashboard */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'white' }}>Popular Times Dashboard</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <Select
                value={viewOptions.find(opt => opt.value === viewType)}
                onChange={(selected) => setViewType(selected.value)}
                options={viewOptions}
                styles={dropdownStyles}
                menuPortalTarget={document.body}
              />
            </div>
          </div>
              {/* Popular Times Chart Box */}
        <div style={{
          width: '100%',
          maxWidth: '700px',
          minWidth: '400px',
          margin: '0 auto',
          padding: '2rem',
          backgroundColor: '#0d0d0d',
          borderRadius: '12px',
          boxShadow: '0 0 25px rgba(0, 255, 100, 0.2)',
          color: '#d1ffd6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>Popular Times Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '14px', color: '#99ffcc' }}>
              <div><FaCalendarAlt className="text-green-400" /> <strong>{dayjs().format('dddd')}</strong></div>
              <div><FaClock className="text-green-400" /> <strong>{dayjs().format('h:mm A')}</strong></div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularData}>
              <XAxis dataKey="hour" stroke="#88ffcc" />
              <YAxis allowDecimals={false} stroke="#88ffcc" />
              <Tooltip content={({ active, payload, label }) => active && payload && payload.length ? (
                <div style={{ background: 'rgba(0, 0, 0, 0.85)', border: '1px solid #00ff99', borderRadius: '10px', padding: '10px 14px', color: '#ccffcc', fontSize: '14px' }}>
                  <div style={{ fontWeight: 'bold', color: '#66ffcc' }}>{label}</div>
                  <div>🚗 Vehicles: <strong>{payload[0].value}</strong></div>
                </div>
              ) : null} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="vehicles" fill="url(#greenGradient)" barSize={24} radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff88" />
                  <stop offset="100%" stopColor="#005533" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>

          <div style={{ marginTop: '2rem', textAlign: 'center', color: '#ccffcc' }}>
            People typically spend up to <strong className="text-green-400">{averageStay} hours</strong> here.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedAnalyticsPage;
