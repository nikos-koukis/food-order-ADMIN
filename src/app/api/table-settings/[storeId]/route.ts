import { createApiHandler } from '@/lib/apiUtils';

export const GET = createApiHandler('/api/table-settings/:storeId', 'GET', false);
export const POST = createApiHandler('/api/table-settings/:storeId', 'POST', true);