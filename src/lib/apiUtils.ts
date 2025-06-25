import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosRequestConfig, Method } from 'axios';

/**
 * Creates a NextJS API route handler for forwarding requests to the backend API
 */
export function createApiHandler(
  path: string,
  method: Method = 'GET',
  includeBody: boolean = false,
  responseProcessor?: (response: any) => any
) {
  return async function handler(
    request: NextRequest,
    context: any = { params: {} }
  ) {
    try {
      // Resolve params if it's a Promise
      const params = await (context.params instanceof Promise ? context.params : context.params || {});
      
      // Get cookies from the request
      const cookieHeader = request.headers.get('cookie');
      
      // Create headers object with cookies
      const headers = cookieHeader ? { Cookie: cookieHeader } : {};
      
      // Replace path parameters with actual values from params
      let finalPath = path;
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          finalPath = finalPath.replace(`:${key}`, String(value));
        });
      }
      
      const config: AxiosRequestConfig = {
        method,
        url: `${process.env.NEXT_PUBLIC_API_URL}${finalPath}`,
        withCredentials: true,
        headers
      };
      
      // Add body for non-GET requests if needed
      if (includeBody && method !== 'GET') {
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
          const formData = await request.formData();
          config.data = formData;
          config.headers = {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          };
        } else {
          config.data = await request.json().catch(() => ({}));
        }
      }
      
      const response = await axios(config);
      
      // Process cookies in response
      const cookies = response.headers['set-cookie'];
      const nextResponse = NextResponse.json(
        responseProcessor ? responseProcessor(response.data) : response.data
      );
      
      if (cookies) {
        cookies.forEach((cookie: string) => {
          nextResponse.headers.append('Set-Cookie', cookie);
        });
      }
      
      return nextResponse;
    } catch (error: any) {
      console.error(`Error in ${method} ${path}:`, error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);

      const errorMessage = method === 'POST' && path.includes('login')
        ? 'Invalid credentials'
        : `${method} request to ${path} failed`;

      return NextResponse.json(
        {
          error: errorMessage,
          details: error.response?.data || error.message || 'No additional details available',
          status: error.response?.status || 500
        },
        { status: error.response?.status || 500 }
      );
    }
  };
}