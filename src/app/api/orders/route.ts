import { createApiHandler } from '@/lib/apiUtils';

export const GET = createApiHandler('/api/orders', 'GET', false);
