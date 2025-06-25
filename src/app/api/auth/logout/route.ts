import { createApiHandler } from '@/lib/apiUtils';

export const POST = createApiHandler('/api/auth/logout', 'POST', false, () => ({ success: true }));