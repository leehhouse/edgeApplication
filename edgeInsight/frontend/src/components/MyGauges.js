import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import LiquidGauge from 'react-liquid-gauge';

const MyGauges = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(['current']); // Initialize as an array
  const [allData, setAllData] = useState([]);
  
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
      for (const field of selectedField) {
        const result = await axios.get(`http://localhost:3001/lastData?field=${field}`);
        // console.log(`Last Data for ${field}:`, result.data); // Log the data
        newData[field] = result.data[0]._value; // Assuming the response is an array with one object
      }
      setAllData(newData);
    };
  
    fetchData();
  }, [selectedField]);

  const handleFieldChange = (field) => { // Removed isChecked parameter
    setSelectedField([field]); // Set selectedField to an array containing only the new field
  };
  
  // New handler for removing a field
  const handleRemoveField = (field) => {
    setSelectedField(selectedField.filter(f => f !== field));
  }; 

  return (
    <div className="container" >
        {/* <div className="col-9">
          <div className="selected-fields">
            {selectedField.map((field, index) => (
              <span key={index}>
                {field} <button className="remove-button" onClick={() => handleRemoveField(field)}>x</button>{index < selectedField.length - 1 && ', '}
              </span>
            ))}
          </div> 
        </div> */}
              {/* Replace checkboxes with a dropdown */}
              <label htmlFor="field-select">Select Measurement</label>
              <select id="field-select" onChange={(e) => handleFieldChange(e.target.value)} className="form-select">
                <option value="">--Please choose an option--</option>
                {fields.map((field, index) => (
                  <option key={index} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            <div>
              {selectedField.map((field, index) => (
                <LiquidGauge
                  key={index}
                  value={allData[field] || 0}
                  config={{
                    waveAnimate: true,
                    waveHeight: 0.1,
                    waveAnimateTime: 2000,
                    waveRise: true,
                    waveHeightScaling: true,
                    waveCount: 2,
                    waveOffset: 0.5,
                    textVertPosition: 0.8,
                    waveTextColor: '#000000',
                    waveColor: '#ff0000',
                    textSize: 0.6,
                    displayPercent: false,
                  }}
                />
              ))}
            </div>
      </div> 
  );
};

export default MyGauges;

