import dotenv from 'dotenv';

dotenv.config({ quiet: true });

import { Client } from './client';

describe('Client', () => {
  let client: Client;

  beforeAll(() => {
    client = new Client();
  });

  it('logs in', async () => {
    const res = await client.login({
      email: process.env.TEST_EMAIL ?? '',
      password: process.env.TEST_PASSWORD ?? '',
    });

    expect(res).toBeTruthy();
  });

  it('fails to login with wrong email', async () => {
    await expect(
      client.login({
        email: 'testinen@testi.fi',
        password: 'testinen',
        force: true,
      })
    ).rejects.toBeTruthy();
  });

  it('fails to login without email & pass', async () => {
    await expect(
      client.login({
        email: '',
        password: '',
      })
    ).rejects.toBeTruthy();
  });

  it('prevents login again (no force)', async () => {
    await expect(
      client.login({
        email: process.env.TEST_EMAIL ?? '',
        password: process.env.TEST_PASSWORD ?? '',
      })
    ).rejects.toBeTruthy();
  });

  it('allows login again (force)', async () => {
    const res = await client.login({
      email: process.env.TEST_EMAIL ?? '',
      password: process.env.TEST_PASSWORD ?? '',
      force: true,
    });
    expect(res).toBeTruthy();
  });

  it('fetches stations', async () => {
    const stations = await client.getStations();

    expect(stations.length).toBeGreaterThan(1);
  });

  it('fetches station by id', async () => {
    const station = await client.getStation('57468337076757d9a7acf610');

    expect(station).toBeTruthy();
  });

  it('fetches stations by location and radius', async () => {
    const stations = await client.getStationsByLocation({ lat: 61.497941, lon: 23.764002 }, 2000);

    expect(stations.length).toBeGreaterThan(2);
  });
});
