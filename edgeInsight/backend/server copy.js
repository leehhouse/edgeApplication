process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  require('dotenv').config();
  const express = require('express');
  const { InfluxDB } = require('@influxdata/influxdb-client');
  const cors = require('cors');
  
  const app = express();
  app.use(cors());
  
  const port = 3001;
  
  const token = process.env.INFLUXDB_TOKEN;
  const org = process.env.INFLUXDB_ORG;
  const bucket = process.env.INFLUXDB_BUCKET;
  
  const client = new InfluxDB({ url: 'http://localhost:8086', token: token });
  console.log('InfluxDB client initialized');
  const queryApi = client.getQueryApi(org);
  
  app.get('/fields', async (req, res) => {
    const fluxQuery = `
      from(bucket: "${bucket}")
      |> range(start: -1h, stop: now())
      |> filter(fn: (r) => r["_measurement"] == "remoteGenerator")
      |> group(columns: ["_field"])
      |> distinct(column: "_field")
    `;
    try {
      const result = await queryApi.collectRows(fluxQuery);
      res.json(result.map(row => row._value));
    } catch (error) {
      console.error(`Error querying data from InfluxDB! ${error.stack}`);
      res.status(500).send('Error querying data from InfluxDB!');
    }
  });
  
  app.get('/data', async (req, res) => {
    const { field } = req.query;
    const fluxQuery = `
      from(bucket: "${bucket}")
      |> range(start: -1h, stop: now())
      |> filter(fn: (r) => r["_measurement"] == "remoteGenerator")
      |> filter(fn: (r) => r["_field"] == "${field}")
      |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
      |> yield(name: "mean")
    `;
    try {
      const result = await queryApi.collectRows(fluxQuery);
      res.json(result);
    } catch (error) {
      console.error(`Error querying data from InfluxDB! ${error.stack}`);
      res.status(500).send('Error querying data from InfluxDB!');
    }
  });
  
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });