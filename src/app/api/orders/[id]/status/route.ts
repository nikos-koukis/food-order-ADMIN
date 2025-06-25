
import { createApiHandler } from '@/lib/apiUtils';

export const PUT = createApiHandler('/api/orders/:id/status', 'PUT', true);
// export const DELETE = createApiHandler('/api/orders/:id', 'DELETE', false);

