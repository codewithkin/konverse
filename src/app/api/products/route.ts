import prisma from "@/helpers/prisma";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Unauthorized", {status: 401});
    }

    const userId = session.user.id;
    const body = await request.json();

    // Destructure storeId from the request body
    const {name, description, price, stock, category, imageUrl, storeId} = body;

    // Add validation for storeId
    if (
      !name ||
      typeof price !== "number" ||
      typeof stock !== "number" ||
      stock < 0 ||
      price < 0 ||
      !storeId // storeId is now required
    ) {
      return new NextResponse("Missing required fields or invalid data types", {
        status: 400,
      });
    }

    // Verify the store exists and belongs to the authenticated user
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
        ownerId: userId, // Ensure the user owns this store
      },
    });

    if (!store) {
      return new NextResponse(
        "Store not found or does not belong to the user.",
        {status: 403}
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price,
        stock,
        category: category || null,
        imageUrl: imageUrl || null,
        user: {
          connect: {
            id: userId,
          },
        },
        store: {
          // Explicitly connect to the store using its ID
          connect: {
            id: storeId,
          },
        },
      },
    });

    return NextResponse.json(newProduct, {status: 201});
  } catch (error) {
    console.error("Error creating product:", error);
    return new NextResponse("Failed to create product", {status: 500});
  }
}
