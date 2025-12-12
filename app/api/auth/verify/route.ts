// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();

    // Get the stored key from environment variable
    const storedKey = process.env.APP_ACCESS_KEY;

    // Simple key comparison
    if (key === storedKey) {
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid access key',
      },
      { status: 401 }
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during authentication',
      },
      { status: 500 }
    );
  }
}
