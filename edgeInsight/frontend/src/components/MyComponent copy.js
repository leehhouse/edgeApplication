import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

const MyComponent = () => {
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]); // Initialize as an array
  const [allData, setAllData] = useState([]);
  const colors = ['blue', 'purple', 'red', 'orange', 'green']; // Add colors for the lines

  useEffect(() => {
    const fetchFields = async () => {
      const result = await axios.get('http://localhost:3001/fields');
      setFields(result.data);
    };

    fetchFields();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let newData = [];
      for (const field of selectedFields) {
        const result = await axios.get(`http://localhost:3001/data?field=${field}`);
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
      setAllData(newData);
    };

    fetchData();
  }, [selectedFields]); // Depend on selectedFields instead of selectedField

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
        {/* Display selected fields with remove buttons */}
        <div className="selected-fields">
          {selectedFields.map((field, index) => (
            <span key={index}>
              {field} <button className="remove-button" onClick={() => handleRemoveField(field)}>x</button>{index < selectedFields.length - 1 && ', '}
            </span>
          ))}
        </div>
      </div>
        <div className="col-3">
          {/* Replace checkboxes with a dropdown */}
          <label htmlFor="field-select">Select Measurements</label>
          <select id="field-select" onChange={(e) => handleFieldChange(e.target.value, true)}>
            <option value="">--Please choose an option--</option>
            {fields.map((field, index) => (
              <option key={index} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
      </div>
  
      <div className="row">
        <div className="col-12">
          <ResponsiveContainer width="100%" height={300}>
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
                  activeDot={{ r: 8 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MyComponent;