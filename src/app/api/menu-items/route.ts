
import { createApiHandler } from '@/lib/apiUtils';

export const GET = createApiHandler('/api/menu-items', 'GET', false);
export const POST = createApiHandler('/api/menu-items', 'POST', true); 
