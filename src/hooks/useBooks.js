import { useQuery } from '@tanstack/react-query';
import { getBooks } from '@/api/books.js';
import { QK } from './queryKeys.js';

export const useBooks = () => useQuery({ queryKey: QK.books, queryFn: getBooks });
