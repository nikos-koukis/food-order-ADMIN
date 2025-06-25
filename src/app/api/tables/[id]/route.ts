import { createApiHandler } from '@/lib/apiUtils';

export const PUT = createApiHandler('/api/tables/:id', 'PUT', true);
export const DELETE = createApiHandler('/api/tables/:id', 'DELETE', true);

