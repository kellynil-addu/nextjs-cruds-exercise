import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // For github codespace only:
  // Overwrites origin header to the appropriate url instead of localhost
  
  const url = req.nextUrl;

  console.log("POST and slash dis should work")
  const headers = new Headers(req.headers);
  const host = 'super-guacamole-4jw9pqjrw5j5cj6jq-3000.app.github.dev';
  headers.set('origin', `https://${host}`);
  headers.set('x-forwarded-host', host);
  return NextResponse.next({ request: { headers } });
}