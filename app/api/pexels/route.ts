import { NextRequest, NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const ipBuckets = new Map<string, Bucket>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? 'unknown';
}

function applyRateLimit(ip: string) {
  const now = Date.now();
  const existing = ipBuckets.get(ip);

  if (!existing || existing.resetAt < now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  ipBuckets.set(ip, existing);
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - existing.count };
}

function parsePositiveInt(value: string | null, fallback: number, label: string): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return parsed;
}

export async function GET(request: NextRequest) {
  const key = process.env.PEXELS_API_KEY;

  if (!key) {
    return NextResponse.json({ error: 'PEXELS_API_KEY is not configured on server.' }, { status: 500 });
  }

  const ip = getClientIp(request);
  const rateLimit = applyRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      {
        status: 429,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (endpoint !== 'search' && endpoint !== 'curated') {
    return NextResponse.json(
      { error: "endpoint must be either 'search' or 'curated'." },
      { status: 400 }
    );
  }

  try {
    const per_page = parsePositiveInt(searchParams.get('per_page'), 12, 'per_page');
    const page = parsePositiveInt(searchParams.get('page'), 1, 'page');

    if (per_page > 30) {
      return NextResponse.json({ error: 'per_page cannot exceed 30.' }, { status: 400 });
    }

    const upstreamQuery = new URLSearchParams({
      per_page: String(per_page),
      page: String(page)
    });

    if (endpoint === 'search') {
      const q = searchParams.get('q')?.trim();
      if (!q) {
        return NextResponse.json(
          { error: "Query parameter 'q' is required for search endpoint." },
          { status: 400 }
        );
      }
      upstreamQuery.set('query', q);
    }

    const upstreamUrl = `https://api.pexels.com/v1/${endpoint}?${upstreamQuery.toString()}`;

    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        Authorization: key
      },
      next: {
        revalidate: 300
      }
    });

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text();
      return NextResponse.json(
        { error: 'Pexels request failed.', details: text },
        { status: upstreamRes.status }
      );
    }

    const data = await upstreamRes.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-RateLimit-Remaining': String(rateLimit.remaining)
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Invalid query parameters.',
        details: error instanceof Error ? error.message : 'Unknown validation error.'
      },
      { status: 400 }
    );
  }
}
