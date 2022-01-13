import * as express from 'express';
import {
  findShortestRouteByIataApi,
  findShortestRouteByIcaoApi,
  ShortestRouteResponse,
} from './ext-api/shortest-route-ext-api';
import { initializeAirportsData } from './modules/airports';
import { log } from './modules/logger';
import { StatusCodes } from 'http-status-codes';
import { initializeAdjacencyList } from './modules/graph/graph';

const app = express();
const port = 8080;

app.get('/monitoring/health', (_, res) => {
  res.send('Status: OK!');
});

app.get('/api/airports/iata/routes/shortest', async (req, res) => {
  try {
    const response: ShortestRouteResponse = await findShortestRouteByIataApi(
      req.query,
    );
    log.info(`Response-${JSON.stringify(response)}`);
    const { data, error, status }: ShortestRouteResponse = response;
    res.status(status).json(data ? { data } : { error });
  } catch (e) {
    log.error(e);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Something went wrong!' });
  }
});

app.get('/api/airports/icao/routes/shortest', async (req, res) => {
  try {
    const response: ShortestRouteResponse = await findShortestRouteByIcaoApi(
      req.query,
    );
    log.info(`Response-${JSON.stringify(response)}`);
    const { data, error, status }: ShortestRouteResponse = response;
    res.status(status).json(data ? { data } : { error });
  } catch (e) {
    log.error(e);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Something went wrong!' });
  }
});

log.info('Initializing server');
initializeAirportsData()
  .then(() => initializeAdjacencyList())
  .then(() => {
    app.listen(port, () => {
      log.info(`Server started at http://localhost:${port}`);
    });
  });
