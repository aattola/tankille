import { Duration, sub } from 'date-fns';

import { axios } from '../httpClient';
import { AccessCache, Asema, ClientOptions, LoginOptions, RefreshToken } from '../types/client';

export * from '../types/client';

export const DefaultHeaders = {
  'User-Agent':
    'FuelFellow/3.9.19 Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.58 Mobile Safari/537.36"',
  Host: 'api.tankille.fi',
  'Content-Type': 'application/json',
  'X-Requested-With': 'fi.creosys.fuelfellow',
};

/**
 * Start using package by creating a new instance of the Client class and calling the login method.
 *
 * ```ts
 * const client = new Client();
 * await client.login({
 *   email: 'test@test.com',
 *   password: 'testpass'
 * });
 * ```
 *
 * Then you can start using the API by calling the getStations method.
 * ```ts
 * const stations = await client.getStations();
 * console.log(stations);
 * ```
 *
 * You can also get a single station by calling the getStation method.
 * ```ts
 * const station = await client.getStation('57468337076757d9a7acf610');
 * console.log(station);
 * ```
 *
 * Checkout API documentation for more methods.
 * @see {@link Client.getStations}
 * @see {@link Client.getStation}
 * @see {@link Client.getStationsByLocation}
 * @see {@link Client.login}
 */
class Client {
  private token = '';
  private refreshToken = '';

  tokenCache: AccessCache = {
    lastFetch: 0,
    data: {} as { accessToken: string },
  };

  private options: ClientOptions = {
    device: 'Android SDK built for arm64 (84a3f2b1d5e6c789)',
    // userAgent: 'FuelFellow/3.9.19 (Android SDK built for arm64; Android 14)',
    // Host: 'api.tankille.fi',
    // 'Content-Type': 'application/json',
    // 'X-Requested-With': 'fi.creosys.fuelfellow',
    // 'Accept-Encoding': 'gzip, deflate, br',
    // Origin: 'https://www.tankille.fi',
    // Referer: 'https://www.tankille.fi/',
  };

  private headers: { [key: string]: string } = {
    ...DefaultHeaders,
  };

  constructor(options?: ClientOptions, overrideHeaders?: { [key: string]: string }) {
    this.getStations = this.getStations.bind(this);

    if (!options) return;
    this.options = options;
    this.token = options.token;
    if (!this.options.userAgent) return;
    this.headers = {
      ...DefaultHeaders,
      ...(overrideHeaders || {}),
    };
  }

  async #auth() {
    if (!this.refreshToken) {
      // TODO: relogin auto
      console.log('TODO: autologin');
      return;
    }

    this.token = await this.#getSessionToken({
      refreshToken: this.refreshToken,
    });
  }

  async #getRefreshToken(loginOptions: LoginOptions): Promise<RefreshToken> {
    const response = await axios
      .post<RefreshToken>(
        '/auth/login',
        {
          device: this.options.device,
          ...loginOptions,
        },
        { headers: this.headers }
      )
      .catch((error) => {
        if (error && error.response && error.response.data && error.response.data.message) {
          if (error.response.data.message.includes('Device blacklisted')) {
            throw new Error('Device blacklisted, please change client device option.');
          }
        }

        // throw error to user?
        throw error;
      });

    return response.data;
  }

  async #getSessionToken({ refreshToken }: RefreshToken): Promise<string> {
    const timeSinceLastFetch = Date.now() - this.tokenCache.lastFetch;
    // 10h cache accesstokenille (vanhenee 12 tunnissa)
    if (timeSinceLastFetch <= 36000) {
      return this.tokenCache.data.accessToken;
    }

    const response = await axios.post<{ accessToken: string }>(
      '/auth/refresh',
      {
        token: refreshToken,
      },
      { headers: this.headers }
    );

    if (response.data) {
      this.tokenCache = {
        lastFetch: Date.now(),
        data: response.data,
      };

      return response.data.accessToken;
    }

    throw new Error('ei tokenia löytynt');
  }

  async getStations() {
    await this.#auth();
    const res = await axios.get<Asema[]>(`/stations`, {
      headers: {
        ...this.headers,
        'x-access-token': this.token,
      },
    });

    if (res.status !== 200) throw new Error('Fetch error !== 200');
    if (!res.data) throw new Error('Ei löytynyt stationeita');

    return res.data;
  }

  async getStationsByLocation(
    location: { lat: number; lon: number },
    distance = 15000
  ): Promise<Asema[]> {
    if (!location || isNaN(location.lat) || isNaN(location.lat)) throw new Error('Ei sijaintia');
    if (isNaN(distance)) throw new Error('Etäisyys ei ole numero haloo');
    await this.#auth();

    const res = await axios.get<Asema[]>(
      `/stations?location=${location.lon},${location.lat}&distance=${distance}`,
      {
        headers: {
          ...this.headers,
          'x-access-token': this.token,
        },
      }
    );

    if (!res.data) {
      throw new Error('Asemia ei löytynyt');
    }

    return res.data;
  }

  async getStation(stationId: string, date: Duration = { days: 14 }): Promise<Asema> {
    if (!stationId) throw new Error('stationId puuttuu');
    await this.#auth();

    const since = sub(new Date(), date);

    const res = await axios.get<Asema>(`/stations/${stationId}/prices?since=${since}`, {
      headers: {
        ...this.headers,
        'x-access-token': this.token,
      },
    });

    if (res.status !== 200) throw new Error('Fetch error !== 200');
    if (!res.data) throw new Error('Ei löytynyt stationia');

    return res.data;
  }

  /**
   * Login to the API
   * @param {LoginOptions} loginOptions - Login options
   * @returns {Promise<string>} Access token
   * @throws {Error} If email or password is missing
   * @throws {Error} If user is already logged in
   * @throws {Error} If login fails
   *
   */
  async login(loginOptions: LoginOptions): Promise<string> {
    if (!loginOptions.email || !loginOptions.password)
      throw new Error('Unohdit sähköpostin tai salasanan');

    if (!loginOptions.force && this.token) throw new Error('Olet kirjautunut jo sisään');

    const token = await this.#getRefreshToken(loginOptions);
    const accessToken = await this.#getSessionToken(token);
    this.token = accessToken;
    this.refreshToken = token.refreshToken;

    return accessToken;
  }
}

export { Client };
