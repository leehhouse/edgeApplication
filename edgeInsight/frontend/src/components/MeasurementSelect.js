import React from 'react';
import Select from 'react-select';
import axios from 'axios';

const MeasurementSelect = ({ onMeasurementChange }) => {
  const [measurements, setMeasurements] = React.useState([]);

  React.useEffect(() => {
    const fetchMeasurements = async () => {
      const result = await axios.get('http://localhost:3001/measurements');
      setMeasurements(result.data);
    };

    fetchMeasurements();
  }, []);

  const measurementOptions = measurements.map(measurement => ({ value: measurement, label: measurement }));

  const handleChange = (option) => {
    onMeasurementChange(option.value);
  };

  return (
    <div className="container">
        <div className="col-3">
        <label htmlFor="measurement-select">Select Measurement </label>
        <Select
            options={measurementOptions}
            onChange={handleChange}
        />
        </div>
    </div>
  );
};

export default MeasurementSelect;