import { createApiHandler } from '@/lib/apiUtils';

export const GET = createApiHandler('/api/tables', 'GET', false);
export const POST = createApiHandler('/api/tables', 'POST', true);


