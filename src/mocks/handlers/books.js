import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { booksView } from '../logic.js';
import { run } from './respond.js';

export const booksHandlers = [http.get(EP.books, () => run(booksView))];
