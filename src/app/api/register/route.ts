import { GET as handleGet, POST as handlePost } from "../auth/register/route";

export async function GET(request: Request) {
  return handleGet();
}

export async function POST(request: Request) {
  return handlePost(request);
}

