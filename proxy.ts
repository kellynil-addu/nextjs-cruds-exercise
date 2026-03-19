import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const codespaceHost = 'super-guacamole-4jw9pqjrw5j5cj6jq-3000.app.github.dev'; 

export function proxy(req: NextRequest) {
  // For github codespace only:
  // Overwrites origin header to the appropriate url instead of localhost
  // From https://github.com/vercel/next.js/discussions/62050#discussioncomment-10725955

  const forwardedHost = req.headers.get('x-forwarded-host');
  
  if (codespaceHost === forwardedHost) {
    const headers = new Headers(req.headers);
    headers.set('origin', `https://${codespaceHost}`);
    headers.set('x-forwarded-host', codespaceHost);
    return NextResponse.next({ request: { headers } });
  }
}