const { InfluxDB, Point, FluxTableMetaData } = require('@influxdata/influxdb-client')

// You can generate a Token from the "Tokens Tab" in the UI
const token = 'GcZC-ANUV0qRxYPV2IZlQ4_DJJxQxXEElqWHU_4eNnFDW9bN2KlSxEn-wtPkgF-ntHzgsR9yYm2WyvRxFRNgXQ=='
const org = 'edge_org'
const bucket = 'edge_data'

const client = new InfluxDB({ url: 'http://localhost:8086', token: token })

const queryApi = client.getQueryApi(org)

const query = `from(bucket: "${bucket}") |> range(start: -1h) |> filter(fn: (r) => r._measurement == "remoteGenerator") |> filter(fn: (r) => r._field == "voltage")`

console.log('Starting query')

queryApi.queryRows(query, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row)
    console.log(`Row: ${o._time} ${o._measurement} in '${o._field}' is ${o._value}`)
  },
  error(error) {
    console.error('Error processing query result', error)
  },
  complete() {
    console.log('Finished querying')
  },
})