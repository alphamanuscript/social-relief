import { Stats } from '../types';
import axios from 'axios';

export const Statistics = {
  async getStats() {
    const res = await axios.get<Stats>('/stats');
    return res.data;
  },
}