import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // For github codespace only:
  // Overwrites origin header to the appropriate url instead of localhost
  
  console.log("origin is " + req.headers.get('origin'));
  console.log("forwarded-host is " + req.headers.get('x-forwarded-host'));
  const headers = new Headers(req.headers);
  const host = 'super-guacamole-4jw9pqjrw5j5cj6jq-3000.app.github.dev';
  headers.set('origin', `https://${host}`);
  headers.set('x-forwarded-host', host);
  return NextResponse.next({ request: { headers } });
}