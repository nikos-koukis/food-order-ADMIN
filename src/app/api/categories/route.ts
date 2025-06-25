import { createApiHandler } from '@/lib/apiUtils';

export const GET = createApiHandler('/api/categories', 'GET', false);
export const POST = createApiHandler('/api/categories', 'POST', true); 