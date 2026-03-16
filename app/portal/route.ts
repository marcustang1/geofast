import { Portal } from "@creem_io/nextjs";

export const GET = Portal({
  apiKey: process.env.CREEM_API_KEY!,
  testMode: process.env.CREEM_API_KEY?.startsWith("creem_test_") ?? true,
});
