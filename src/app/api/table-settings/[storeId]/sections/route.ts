import { createApiHandler } from '@/lib/apiUtils';

export const GET = createApiHandler('/api/table-settings/:storeId/sections', 'GET', false);
export const POST = createApiHandler('/api/table-settings/:storeId/sections', 'POST', true);