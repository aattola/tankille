import test from 'ava';
import dotenv from 'dotenv';

dotenv.config();

import { Client } from './client';

let client: Client;

test.serial('login', async (t) => {
  client = new Client();

  const res = await client.login({
    email: process.env.TEST_EMAIL ?? '',
    password: process.env.TEST_PASSWORD ?? '',
  });

  t.pass(res);
});

test.serial('try to login with wrong email', async (t) => {
  try {
    await client.login({
      email: 'testinen@testi.fi',
      password: 'testinen',
      force: true,
    });

    t.fail();
  } catch (err) {
    t.pass();
  }
});

test.serial('try to login without email & pass', async (t) => {
  try {
    await client.login({
      email: '',
      password: '',
    });

    t.fail('Allowed to login again');
  } catch (err) {
    t.pass();
  }
});

test.serial('login again (no force)', async (t) => {
  try {
    await client.login({
      email: process.env.TEST_EMAIL ?? '',
      password: process.env.TEST_PASSWORD ?? '',
    });

    t.fail('Allowed to login again');
  } catch (err) {
    t.pass();
  }
});

test.serial('login again (force)', async (t) => {
  const res = await client.login({
    email: process.env.TEST_EMAIL ?? '',
    password: process.env.TEST_PASSWORD ?? '',
    force: true,
  });

  t.pass(res);
});

test('getStations', async (t) => {
  const stations = await client.getStations();

  t.true(stations.length > 1);
});

test('getStation by id', async (t) => {
  const station = await client.getStation('57468337076757d9a7acf610');

  t.assert(station);
});

test('getStationByLocation with location and radius', async (t) => {
  const stations = await client.getStationsByLocation({ lat: 61.497941, lon: 23.764002 }, 2000);

  t.true(stations.length > 2);
});
