// Listen for unhandled promise rejections and log them
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const { InfluxDB } = require('@influxdata/influxdb-client');
const cors = require('cors');

// Create an Express app and enable CORS
const app = express();
app.use(cors());

// Define the port the server will listen on
const port = 3001;

// Get InfluxDB credentials from environment variables
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG;
const bucket = process.env.INFLUXDB_BUCKET;

// Initialize InfluxDB client
const client = new InfluxDB({ url: 'http://localhost:8086', token: token });
console.log('InfluxDB client initialized');

// Get a QueryApi instance for making queries to InfluxDB
const queryApi = client.getQueryApi(org);
  
// Define a route for getting field names from InfluxDB
app.get('/fields', async (req, res) => {
  console.log(req.query); // Log the incoming request query
  // Get the measurement query parameter from the request
  const { measurement } = req.query;
  console.log(`Measurement: ${measurement}`); // Log the measurement query parameter
  // Define a Flux query for getting distinct field names from the "remoteGenerator" measurement
  const fluxQuery = `
    from(bucket: "${bucket}")
    |> range(start: -1h, stop: now())
    |> filter(fn: (r) => r["_measurement"] == "${measurement}")
    |> group(columns: ["_field"])
    |> distinct(column: "_field")
  `;
  console.log(`Flux Query: ${fluxQuery}`); // Log the Flux query
  try {
    // Execute the Flux query and send the results as a JSON response
    const result = await queryApi.collectRows(fluxQuery);
    res.json(result.map(row => row._value));
  } catch (error) {
    // Log any errors and send a 500 response
    console.error(`Error querying data from InfluxDB! ${error.stack}`);
    res.status(500).send('Error querying data from InfluxDB!');
  }
});

app.get('/measurements', async (req, res) => {
  // Define a Flux query for getting distinct measurement names
  const fluxQuery = `
    from(bucket: "${bucket}")
    |> range(start: -1h, stop: now())
    |> group(columns: ["_measurement"])
    |> distinct(column: "_measurement")
  `;
  try {
    // Execute the Flux query and send the results as a JSON response
    const result = await queryApi.collectRows(fluxQuery);
    res.json(result.map(row => row._value));
  } catch (error) {
    // Log any errors and send a 500 response
    console.error(`Error querying data from InfluxDB! ${error.stack}`);
    res.status(500).send('Error querying data from InfluxDB!');
  }
});

// Define a route for getting data from InfluxDB
app.get('/data', async (req, res) => {
  // Get the field, start, and end query parameters from the request
  const { field, start, end, measurement } = req.query;

  // Define a Flux query for getting data from the specified field and time range
  const fluxQuery = `
    from(bucket: "${bucket}")
    |> range(start: ${start ? `${start}` : '-1h'}, stop: ${end ? `${end}` : 'now()'})
    |> filter(fn: (r) => r["_measurement"] == "${measurement}")
    |> filter(fn: (r) => r["_field"] == "${field}")
    |> yield(name: "mean")
  `;
  console.log(`start: ${start}, end: ${end}`); // Log the start and end query parameters
  console.log(`fluxQuery: ${fluxQuery}`); // Log the Flux query
  // Execute the Flux query and send the results as a JSON response
  try {
    const result = await queryApi.collectRows(fluxQuery);
    res.json(result);
  } catch (error) {
    // Log any errors and send a 500 response
    console.error(`Error querying data from InfluxDB! ${error.stack}`);
    res.status(500).send('Error querying data from InfluxDB!');
  }
});

// Define a route for getting the last data point from InfluxDB
app.get('/lastData', async (req, res) => {
  // Get the field query parameter from the request
  const { field, measurement } = req.query;

  // Define a Flux query for getting the last data point from the specified field
  const fluxQuery = `
    from(bucket: "${bucket}")
    |> range(start: -1h)
    |> filter(fn: (r) => r["_measurement"] == "${measurement}")
    |> filter(fn: (r) => r["_field"] == "${field}")
    |> last()
  `;
  console.log(`fluxQuery: ${fluxQuery}`); // Log the Flux query

  // Execute the Flux query and send the results as a JSON response
  try {
    const result = await queryApi.collectRows(fluxQuery);
    res.json(result);
  } catch (error) {
    // Log any errors and send a 500 response
    console.error(`Error querying data from InfluxDB! ${error.stack}`);
    res.status(500).send('Error querying data from InfluxDB!');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});