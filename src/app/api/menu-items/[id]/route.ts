
import { createApiHandler } from '@/lib/apiUtils';

export const PUT = createApiHandler('/api/menu-items/:id', 'PUT', true);
export const DELETE = createApiHandler('/api/menu-items/:id', 'DELETE', false);

