import React, { useState } from 'react';
import logo from './Analytics.png';
import './App.css';
import MyComponent from './components/MyComponent.js'; // Import MyComponent
import MyGauges from './components/MyGauges.js'; // Import myGauges
import MeasurementSelect from './components/MeasurementSelect.js'; // Import MeasurementSelect
import MultiLine from './components/MultiLine.js'; // Import MultiLine
import axios from 'axios';

function App() {
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [fields, setFields] = useState([]);

  const handleMeasurementChange = async (selectedMeasurement) => {
    setSelectedMeasurement(selectedMeasurement);
    
    const response = await axios.get(`http://localhost:3001/fields?measurement=${selectedMeasurement}`);
    const fields = response.data;

    setFields(fields);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" /> {/* Use Analytics.png as the logo */} 
        <div className="container">
          <MyComponent /> {/* Use MyComponent */}
        </div>
{/*        <div className="row">
          <div className="col-4">
            <MyGauges /> 
          </div>
          <div className="col-4">
            <MyGauges /> 
          </div>
          <div className="col-4">
            <MyGauges /> 
          </div>
        </div> */}
        <div className="container">
          <MeasurementSelect onMeasurementChange={handleMeasurementChange} /> {/* Use MeasurementSelect */}
        </div>
        <div className="container">
          <MultiLine /> {/* Use MultiLine */}
        </div>
      </header>
    </div>
  );
}

export default App;
