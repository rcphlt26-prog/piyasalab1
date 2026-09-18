export const dynamic = "force-dynamic";

export function GET() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.replace(/^ca-/, "");
  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : "# Set NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX before enabling AdSense.\n";

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
