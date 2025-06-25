import { createApiHandler } from '@/lib/apiUtils';

export const POST = createApiHandler('/api/auth/login', 'POST', true, (response: any) => ({ success: true }));