import prisma from "@/helpers/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
                headers: await headers()
        });

        if (!session) {
            return new NextResponse("Unauthorized", {status: 401});
        }

        const userId = session.user.id;
        const body = await request.json();

        const {name, description, price, stock, category, imageUrl} = body;

        if (
            !name ||
            typeof price !== "number" ||
            typeof stock !== "number" ||
            stock < 0 ||
            price < 0
        ) {
            return new NextResponse("Missing required fields or invalid data types", {
                status: 400,
            });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                description: description || "",
                price,
                stock,
                category: category || null,
                imageUrl: imageUrl || null,
                userId: userId,
            },
        });

        return NextResponse.json(newProduct, {status: 201});
    } catch (error) {
        console.error("Error creating product:", error);
        return new NextResponse("Failed to create product", {status: 500});
    }
}
