import Axios from 'axios';

import { API_URL } from './constants';

const axios = Axios.create({
  baseURL: API_URL,
});

export { axios };
