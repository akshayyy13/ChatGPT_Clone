// app/api/webhooks/cloudinary/route.ts
export async function POST(req: Request) {
  // Verify signature if needed, process transformations
  return Response.json({ ok: true });
}
