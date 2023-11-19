import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LiquidGauge from 'react-liquid-gauge';

const MyGauges = ({ selectedFields }) => {
  const [allData, setAllData] = useState({});
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    console.log(selectedFields);
    const fetchData = async () => {
      let newData = {};
      if (Array.isArray(selectedFields)) {
        for (const field of selectedFields) {
          const result = await axios.get(`http://localhost:3001/lastData?field=${field}`);
          newData[field] = result.data._value;
        }
      }
      setAllData(newData);
    };

    fetchData();
  }, [selectedFields, update]);

  return (
    <div className="container">
      <div className="row">
        <button onClick={() => setUpdate(!update)}>Update</button>
        {Array.isArray(selectedFields) && selectedFields.map((field, index) => (
          <div key={index}>
            <h2>{field}</h2>
            <LiquidGauge
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
          </div>
        ))}
      </div>
    </div>  
  );
};

export default MyGauges;