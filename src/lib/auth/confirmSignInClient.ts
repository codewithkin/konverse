import {redirect} from "next/navigation";
import {authClient} from "../auth-client";

export async function confirmSignInClient() {
  const session = await authClient.getSession();

  if (!session) {
    return redirect("/auth/signin");
  }
}
