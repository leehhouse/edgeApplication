import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

const MyComponent = () => {
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState(['current','rpm']); // Initialize as an array
  const [allData, setAllData] = useState([]);
  const [timeRange, setTimeRange] = useState('30m'); // Add state for time range
  const [selectedMeasurement, setSelectedMeasurement] = useState('remoteGenerator'); // Add state for selected measurement
  const [measurements, setMeasurements] = useState([]); // Add state for measurements
  const colors = ['blue', 'purple', 'red', 'orange', 'green']; // Add colors for the lines

  useEffect(() => {
    const fetchMeasurements = async () => {
      // Replace with your actual endpoint for fetching measurements
      const result = await axios.get('http://localhost:3001/measurements');
      console.log('Fetched measurements:', result.data); // Log fetched measurements
      setMeasurements(result.data);
    };

    fetchMeasurements();
  }, []);

  console.log('Measurements state:', measurements); // Log measurements state

  useEffect(() => {
    console.log('Current selectedMeasurement:', selectedMeasurement); // Log current selected measurement
    const fetchFields = async () => {
      try {
        const result = await axios.get('http://localhost:3001/fields');
        console.log('Fetched fieldsxxxxxx:', result.data); // Log fetched fields
        setFields(result.data);
      } catch (error) {
        console.error('Error fetching fields:', error); // Log any errors
      }
    };

    // Only fetch fields if a measurement is selected
    if (selectedMeasurement) {
      fetchFields();
    }
  }, [selectedMeasurement]);

  useEffect(() => {
    const fetchData = async () => {
      let newData = [];
      const endTime = new Date();
      let startTime;
      switch (timeRange) {
        case '15m':
          startTime = new Date(endTime.getTime() - 15 * 60 * 1000);
          break;
        case '30m':
          startTime = new Date(endTime.getTime() - 30 * 60 * 1000);
          break;
        case '1h':
          startTime = new Date(endTime.getTime() - 1 * 60 * 60 * 1000);
          break;
        case '6h':
          startTime = new Date(endTime.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '12h':
          startTime = new Date(endTime.getTime() - 12 * 60 * 60 * 1000);
          break;
        case '48h':
          startTime = new Date(endTime.getTime() - 48 * 60 * 60 * 1000);
          break;  
        default:
          startTime = new Date(endTime.getTime() - 30 * 60 * 1000);
      }
      
      if (selectedMeasurement) {
        for (const field of selectedFields) {
          const result = await axios.get(`http://localhost:3001/data?measurement=${selectedMeasurement}&field=${field}&start=${startTime.toISOString()}&end=${endTime.toISOString()}`);
          const mappedData = result.data.map(item => ({
            ...item,
            [field]: item._value,
          }));
    
          if (newData.length === 0) {
            newData = mappedData;
          } else {
            // Merge the new data with the existing data
            newData = newData.map((item, index) => ({
              ...item,
              ...mappedData[index],
            }));
          }
        }
      }
      setAllData(newData);
    };

    fetchData();
  }, [selectedFields, timeRange, selectedMeasurement]); // Depend on selectedFields instead of selectedField

  const handleFieldChange = (field, isChecked) => { // New handler for checkbox change
    if (isChecked) {
      setSelectedFields([...selectedFields, field]);
    } else {
      setSelectedFields(selectedFields.filter(f => f !== field));
    }
  };
  
  // New handler for removing a field
  const handleRemoveField = (field) => {
    setSelectedFields(selectedFields.filter(f => f !== field));
  }; 

  return (
    <div className="container">
      <div className="row">
        <div className="col-9">
          <h1 style={{ textAlign: 'left' }}>Remote Generator</h1> {/* Add title */}
        </div>
        <div className="col-3">
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="form-select">
            <option value="30m">Last 30 minutes</option>
            <option value="1h">Last 1 hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="12h">Last 12 hours</option>
            <option value="24h">Last 24 hours</option>
            <option value="48h">Last 48 hours</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div className="col-3">
          {/* Add dropdown for selecting measurement */}
          <label htmlFor="measurement-select">Select Measurement</label>
          <select id="measurement-select" value={selectedMeasurement} onChange={(e) => setSelectedMeasurement(e.target.value)} className="form-select">
            {measurements.map((measurement, index) => {
              console.log('Rendering measurement:', measurement); // Log rendering measurement
              return <option value={measurement} key={index}>{measurement}</option>
            })}
          </select>
        </div>
      </div>
      <div className="row">
        <div className="col-3">
          <div className="form-check">
            {fields.map(field => (
              <label key={field} className="form-check-label">
                <input type="checkbox" className="form-check-input" checked={selectedFields.includes(field)} onChange={(e) => handleFieldChange(field, e.target.checked)} />
                {field}
              </label>
            ))}
          </div>
        </div>
        <div className="col-9">
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={allData}>
              {selectedFields.map((field, index) => (
                <Line type="monotone" dataKey={field} stroke={colors[index % colors.length]} key={field} />
              ))}
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MyComponent;