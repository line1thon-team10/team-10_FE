import { toBooks } from './adapters/books.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getBooks = async () => toBooks(await http.get(EP.books));
