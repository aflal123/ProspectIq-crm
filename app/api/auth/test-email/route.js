import { NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/mailer';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const testEmail = searchParams.get('email') || 'ahamedaflal100@gmail.com';
  try {
    console.log(`🧪 Starting professional mail test to ${testEmail}...`);
    await sendOTPEmail(testEmail, '123456');
    return NextResponse.json({
      success: true,
      message: `Test email accepted by provider for ${testEmail}. Check your inbox/spam.`
    });
  } catch (err) {
    console.error('❌ Professional Test Failed:', err.message);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
