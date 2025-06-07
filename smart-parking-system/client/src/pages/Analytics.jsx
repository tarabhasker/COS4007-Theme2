import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { FaArrowUp, FaHandPointer, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Sidebar from './Sidebar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { AreaChart, Area, Legend } from 'recharts';


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
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [popularDate, setPopularDate] = useState(dayjs().format('YYYY-MM-DD'));  
  const [viewType, setViewType] = useState('outdoor');
  const [popularData, setPopularData] = useState([]);
  const [averageStay, setAverageStay] = useState(0);
  const [averageOccupancyData, setAverageOccupancyData] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/popular_times_indoor.json').then(res => res.json()),
      fetch('/popular_times_outdoor.json').then(res => res.json())
    ]).then(([indoorData, outdoorData]) => {
      const allDates = new Set([
        ...Object.keys(indoorData || {}),
        ...Object.keys(outdoorData || {})
      ]);
  
      const aggregated = Array.from(allDates).map(date => {
        const indoor = indoorData[date]
          ? Object.values(indoorData[date]).reduce((a, b) => a + b, 0)
          : 0;
        const outdoor = outdoorData[date]
          ? Object.values(outdoorData[date]).reduce((a, b) => a + b, 0)
          : 0;
        return { date, Indoor: indoor, Outdoor: outdoor };
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
  
      setAverageOccupancyData(aggregated);
    });
  }, []);
  
  useEffect(() => {
    fetch('/combined_occupancy.json')
      .then(res => res.json())
      .then(json => {
        const sampleDate = Object.keys(json)[0];
        const times = [...new Set(json[sampleDate].map(d => d.time))];
        setTimeOptions(times.map(t => ({ value: t, label: t })));
        setSelectedTime({ value: times[0], label: times[0] });
        setCombinedData(json);
      });
  }, []);
  

  useEffect(() => {
    if (!selectedTime || !selectedLocation || !combinedData || !combinedData[selectedDate]) {
      setOccupancyPercent(0);
      return;
    }
  
    const dataForDate = combinedData[selectedDate];
    const filtered = dataForDate.filter(d => {
      const isOutdoor = d.location_type.toLowerCase() === 'outdoor';
      const matchLocation = selectedLocation.value === 'Outdoor' ? isOutdoor : !isOutdoor;
      return matchLocation && d.time === selectedTime.value;
    });
  
    if (filtered.length === 0) {
      setOccupancyPercent(0);
      return;
    }
  
    const totalDetected = filtered.reduce((sum, d) => sum + d.vehicle_count, 0);
    const percent = (totalDetected / TOTAL_CAPACITY[selectedLocation.value]) * 100;
    setOccupancyPercent(Math.min(100, Math.round(percent)));
  }, [selectedTime, selectedLocation, combinedData, selectedDate]);
  

  useEffect(() => {
    const file = viewType === 'indoor'
      ? '/popular_times_indoor.json'
      : '/popular_times_outdoor.json';
  
    fetch(file)
      .then(res => res.json())
      .then(json => {
        const dataForDate = json[popularDate]; // Expects "YYYY-MM-DD" as key
        if (!dataForDate) {
          setPopularData([]);  // No data for this date
          setAverageStay(0);
          return;
        }
  
        const formatted = Object.entries(dataForDate).map(([hour, count]) => ({
          hour,
          vehicles: count
        }));
  
        setPopularData(formatted);
  
        const totalVehicles = formatted.reduce((sum, item) => sum + item.vehicles, 0);
        const activeHours = formatted.filter(item => item.vehicles > 0).length;
        const avg = totalVehicles > 0 && activeHours > 0 ? (activeHours * 1).toFixed(1) : '0';
        setAverageStay(avg);
      });
  }, [viewType, popularDate]);
  

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

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        {/* LEFT SIDE: Occupancy + Popular */}
        <div style={{ flex: '1', maxWidth: '100%', minWidth: '700px', maxWidth: '700px' }}>
    <div style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.33%' }}>
          <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        <div style={{
          marginBottom: '3rem',
          marginTop:'3rem',
          padding: '2rem',
          border: '1px solid #04075e',
          borderRadius: '20px',
          backgroundColor: '#0a0a0a',
          maxWidth: '900px',
          marginLeft: '0',
          marginRight: '0',
          boxShadow: '0 0 10px #04075e',
        }}>
        {/* Single Occupancy Bar */}
        <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ color: 'white', margin: 0 }}>Occupancy By Hour</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '0.4rem 1rem',
                backgroundColor: '#1e1e1e',
                color: '#fff',
                border: '1px solid #33ff99',
                borderRadius: '999px',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                height: '32px',
              }}
            />
          </div>
        </div>

          <div style={{ background: '#111', padding: '2rem', borderRadius: '1rem', maxWidth: '700px', width: '100%',
  minWidth: '700px',margin: '0 auto' }}>
            <div style={{ background: '#333', borderRadius: '1rem', height: '30px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: `${occupancyPercent}%`, height: '100%', background: getBarColor(), transition: 'width 0.5s ease-in-out' }} />
            </div>
            {combinedData[selectedDate] ? null : (
              <div style={{ color: '#ff8080', textAlign: 'center', marginTop: '1rem' }}>
                No occupancy data available for this date.
              </div>
            )}
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
        </div>

        <div style={{
          padding: '2rem',
          border: '1px solid #04075e',
          borderRadius: '20px',
          backgroundColor: '#0a0a0a',
          maxWidth: '900px',
          marginLeft: '0',
          marginRight: '0',
          boxShadow: '0 0 10px #04075e',
        }}>
         {/* Popular Times Dashboard */}
          <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h2 style={{ color: 'white', margin: 0 }}>Popular Times Dashboard</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Select
                value={viewOptions.find(opt => opt.value === viewType)}
                onChange={(selected) => setViewType(selected.value)}
                options={viewOptions}
                styles={dropdownStyles}
                menuPortalTarget={document.body}
              />
              <input
                type="date"
                value={popularDate}
                onChange={(e) => setPopularDate(e.target.value)}
                style={{
                  padding: '0.4rem 1rem',
                  backgroundColor: '#1e1e1e',
                  color: '#fff',
                  border: '1px solid #33ff99',
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  height: '32px',
                }}
              />
            </div>
          </div>
          </div>
              {/* Popular Times Chart Box */}
        <div style={{
          width: '100%',
          maxWidth: '700px',
          minWidth: '700px',
          margin: '0 auto',
          padding: '2rem',
          backgroundColor: '#111',
          borderRadius: '12px',
          color: '#d1ffd6'
        }}>

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
            {popularData.length > 0 ? (
              <>People typically spend up to <strong className="text-green-400">{averageStay} hours</strong> here.</>
            ) : (
              <span style={{ color: '#ff8080' }}>No data available for this date.</span>
            )}
          </div>
          </div>
          </div>
          </div>
        </div>
        </div>

        {/* RIGHT SIDE: Average Occupancy Area Chart */}
        <div style={{ flex: '0 0 40%', minWidth: '500px', height: '850px' }}>
    <div style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.33%' }}>
        <div style={{
          flex: '0 0 700px',
          minWidth: '550px',
          height: '900px',
          padding: '2rem',
          border: '1px solid #04075e',
          borderRadius: '20px',
          backgroundColor: '#0a0a0a',
          boxShadow: '0 0 10px #04075e',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          marginTop: '3rem',
        }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Average Occupancy</h3>
          <div style={{
            backgroundColor: '#111',
            padding: '1rem',
            borderRadius: '1rem',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={averageOccupancyData}>
                <XAxis dataKey="date" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Legend />
                <Tooltip content={({ active, payload, label }) =>
                  active && payload ? (
                    <div style={{
                      background: '#000',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #00ff99',
                      color: '#fff'
                    }}>
                      <strong>{label}</strong><br />
                      {payload.map(p => (
                        <div key={p.dataKey} style={{ color: p.stroke }}>
                          {p.dataKey}: {p.value}
                        </div>
                      ))}
                    </div>
                  ) : null
                } />
                <Area
                  type="monotone"
                  dataKey="Indoor"
                  stackId="1"
                  stroke="#33d2ff"
                  fill="#33d2ff"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="Outdoor"
                  stackId="1"
                  stroke="#33ff88"
                  fill="#33ff88"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedAnalyticsPage;
