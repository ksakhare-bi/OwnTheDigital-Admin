import { OPTIONS as handleOptions, POST as handlePost} from "../contacts/route";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  return handlePost(request);
}
