import {NextResponse} from "next/server";
import prisma from "@/helpers/prisma";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export async function GET(
  request: Request,
  {params}: {params: Promise<{userId: string}>}
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const {userId} = await params;

    if (!session) {
      return new NextResponse("Unauthorized", {status: 401});
    }

    const stores = await prisma.store.findMany({
      where: {
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(stores, {status: 200});
  } catch (error) {
    console.error("Error fetching user stores:", error);
    return new NextResponse("Failed to fetch stores", {status: 500});
  }
}
