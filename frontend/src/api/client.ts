import createClient from 'openapi-fetch';
import type { paths } from './types';

const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4010',
});

export default client;
