import { sub } from 'date-fns';

import { axios } from '../httpClient';
import { AccessCache, Asema, ClientOptions, LoginOptions, RefreshToken } from '../types/client';

class Client {
  private token = '';
  private refreshToken = '';

  tokenCache: AccessCache = {
    lastFetch: 0,
    data: <any>{},
  };

  private options: ClientOptions = {
    device: 'Android SDK built for x86_64 (03280ceb8a5367a6)',
    userAgent: 'FuelFellow/3.6.2 (Android SDK built for x86_64; Android 9)',
  };

  private headers: { [key: string]: string } = {
    'User-Agent': 'FuelFellow/3.6.2 (Android SDK built for x86_64; Android 9)',
    Host: 'api.tankille.fi',
    'Content-Type': 'application/json',
  };

  constructor(options?: ClientOptions) {
    if (!options) return;
    this.options = options;
    this.token = options.token;
    if (!this.options.userAgent) return;
    this.headers = {
      'User-Agent': this.options.userAgent,
    };

    this.getStations = this.getStations.bind(this);
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
    const response = await axios.post<RefreshToken>(
      '/auth/login',
      {
        device: this.options.device,
        ...loginOptions,
      },
      { headers: this.headers }
    );

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
        'x-access-token': this.token,
      },
    });

    if (res.status !== 200) throw new Error('Fetch error !== 200');
    if (!res.data) throw new Error('Ei löytynyt stationia');

    return res.data;
  }

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
