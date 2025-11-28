export type ClientOptions = {
  [key: string]: string;
};

export type LoginOptions = {
  readonly email: string;
  readonly password: string;
  force?: boolean;
};

export type RefreshToken = {
  refreshToken: string;
};

export interface AsemaOsoite {
  street: string;
  city: string;
  zipcode: string;
  country: string;
}

export interface AsemaLocation {
  type: string;
  coordinates: number[];
}

export interface AsemaHinta {
  updated: string;
  tag: string;
  price: number;
  delta: number;
  reporter: string;
  _id: string;
}

export type Fuels = '95' | '98' | 'dsl' | 'ngas' | 'bgas' | '98+' | 'dsl+' | '85' | 'hvo';

export interface Asema {
  address: AsemaOsoite;
  location: AsemaLocation;
  fuels: Fuels[];
  _id: string;
  name: string;
  chain: string;
  brand: string;
  price: AsemaHinta[];
  __v: number;
  updated: string;
}

export type AccessCache = {
  data: {
    accessToken: string;
  };
  lastFetch: number;
};
