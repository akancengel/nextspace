import { revalidatePath } from "next/cache";

export async function POST(req) {
  try {
    const { secret, path } = await req.json();

    // secret should match a server-side secret (set REVALIDATE_SECRET in your deploy env)
    if (secret !== process.env.REVALIDATE_SECRET) {
      return new Response(JSON.stringify({ message: "Invalid secret" }), { status: 401 });
    }

    if (!path) {
      return new Response(JSON.stringify({ message: "Path is required" }), { status: 400 });
    }

    try {
      await revalidatePath(path);
      return new Response(JSON.stringify({ revalidated: true }), { status: 200 });
    } catch (err) {
      return new Response(JSON.stringify({ message: "Failed to revalidate", error: String(err) }), { status: 500 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ message: "Invalid request", error: String(err) }), { status: 400 });
  }
}
