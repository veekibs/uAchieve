import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';

// Simple in-memory rate limit store
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // Max 10 checks per minute per IP

export async function GET(req: Request) {
  try {
    // Basic Rate Limiting Logic
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const userRateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - userRateData.lastReset > RATE_LIMIT_WINDOW) {
      userRateData.count = 1;
      userRateData.lastReset = now;
    } else {
      userRateData.count++;
    }
    rateLimitMap.set(ip, userRateData);

    if (userRateData.count > MAX_REQUESTS) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ exists: false });
    }

    // Check our Prisma database for the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}