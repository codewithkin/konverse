import {redirect} from "next/navigation";
import {auth} from "../auth";
import {headers} from "next/headers";

export async function confirmSignInServer() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth/signin");
  }
}
