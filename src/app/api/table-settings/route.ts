import { createApiHandler } from '@/lib/apiUtils';

export const GET = createApiHandler('/api/table-settings', 'GET', false);
export const POST = createApiHandler('/api/table-settings', 'POST', true); 