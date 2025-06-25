import { createApiHandler } from '@/lib/apiUtils';

export const GET = createApiHandler('/api/categories/:id', 'GET', false);
export const PUT = createApiHandler('/api/categories/:id', 'PUT', true);
export const DELETE = createApiHandler('/api/categories/:id', 'DELETE', false); 