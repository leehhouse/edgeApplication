import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [selectedMeasurement, setSelectedMeasurement] = useState('');

  useEffect(() => {
    const fetchMeasurements = async () => {
      const result = await axios.get('http://localhost:3001/measurements');
      setMeasurements(result.data);
    };

    fetchMeasurements();
  }, []);

  useEffect(() => {
    if (selectedMeasurement) {
      const fetchData = async () => {
        const result = await axios.get(`http://localhost:3001/data?measurement=${selectedMeasurement}`);
        setData(result.data);
      };

      fetchData();
    }
  }, [selectedMeasurement]);

  const handleMeasurementChange = (event) => {
    setSelectedMeasurement(event.target.value);
  };

  return (
    <div>
      <select value={selectedMeasurement} onChange={handleMeasurementChange}>
        {measurements.map((measurement) => (
          <option key={measurement} value={measurement}>{measurement}</option>
        ))}
      </select>

      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={selectedMeasurement} stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
  );
};

export default MyComponent;