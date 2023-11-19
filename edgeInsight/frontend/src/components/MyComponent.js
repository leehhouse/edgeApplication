import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';

const MyComponent = () => {
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState(['current','rpm']); // Initialize as an array
  const [allData, setAllData] = useState([]);
  const [timeRange, setTimeRange] = useState('30m'); // Add state for time range
  const [selectedMeasurement, setSelectedMeasurement] = useState('remoteGenerator'); // Add state for selected measurement
  const [measurements, setMeasurements] = useState([]); // Add state for measurements
  const colors = ['blue', 'purple', 'red', 'orange', 'green']; // Add colors for the lines

  const measurementOptions = measurements.map(measurement => ({ value: measurement, label: measurement }));
  const fieldOptions = fields.map(field => ({ value: field, label: field }));
  const timeOptions = [
    { value: '30m', label: 'Last 30 minutes' },
    { value: '1h', label: 'Last 1 hour' },
    { value: '6h', label: 'Last 6 hours' },
    { value: '12h', label: 'Last 12 hours' },
    { value: '24h', label: 'Last 24 hours' },
    { value: '48h', label: 'Last 48 hours' },
  ];

  // Add this function inside your MyComponent function
  const handleMeasurementChange = async (event) => {
  // Store the selected measurement
  const selectedMeasurement = event.target.value;
  setSelectedMeasurement(selectedMeasurement);
  
  // Fetch the fields for the selected measurement
  const response = await axios.get(`http://localhost:3001/fields?measurement=${selectedMeasurement}`);
  const fields = response.data;

  // Update the fields state
  setFields(fields);
  };

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
        // const result = await axios.get('http://localhost:3001/fields');
        const result = await axios.get(`http://localhost:3001/fields?measurement=${selectedMeasurement}`);
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
      {/* Row with component title, measurement select, and time select */}
      <div className="row">
        <div className="col-3">
          {/* Add dropdown for selecting measurement */}
          <label htmlFor="measurement-select">Select Measurement</label>
          <Select
            options={measurementOptions}
            value={measurementOptions.find(option => option.value === selectedMeasurement)}
            onChange={option => handleMeasurementChange(option.value)}
          />
        </div>
        <div className="col-6">
          {/* Replace checkboxes with a dropdown */}
          <label htmlFor="field-select">Select Fields</label>
          <Select
            options={fieldOptions}
            isMulti
            value={selectedFields.map(field => ({ value: field, label: field }))}
            onChange={options => setSelectedFields(options.map(option => option.value))}
          />
        </div>
        <div className="col-3">
          <label htmlFor="measurement-select">Select Timeframe</label>
          <Select
            options={timeOptions}
            value={timeOptions.find(option => option.value === timeRange)}
            onChange={option => setTimeRange(option.value)}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12 p-3">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={allData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              {selectedFields.map((field, index) => (
                <YAxis 
                  key={index} 
                  yAxisId={index} 
                  orientation={index % 2 === 0 ? 'left' : 'right'} 
                  stroke={colors[index % colors.length]}
                />
              ))}
              <Tooltip />
              <Legend />
              {selectedFields.map((field, index) => (
                <Line 
                  key={index} 
                  type="monotone" 
                  dataKey={field} 
                  stroke={colors[index % colors.length]} 
                  yAxisId={index}
                  dot={false}
                />
              ))}
              <Brush dataKey='time' height={30} stroke="#8884d8"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MyComponent;