import { createApiHandler } from '@/lib/apiUtils';

export const POST = createApiHandler('/auth/refresh', 'POST', false, () => ({ success: true }));