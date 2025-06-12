import {NextResponse} from "next/server";
import prisma from "@/helpers/prisma";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user || !session.user.id) {
            return new NextResponse("Unauthorized", {status: 401});
        }

        const userId = session.user.id;
        const body = await request.json();
        const {name} = body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return new NextResponse(
                "Store name is required and must be a non-empty string.",
                {status: 400}
            );
        }

        const newStore = await prisma.store.create({
            data: {
                name: name.trim(),
                ownerId: userId,
            },
        });

        return NextResponse.json(newStore, {status: 201});
    } catch (error: any) {
        if (error.code === "P2002" && error.meta?.target?.includes("name")) {
            return new NextResponse(
                "A store with this name already exists. Please choose a different name.",
                {status: 409}
            );
        }
        console.error("Error creating store:", error);
        return new NextResponse(
            "Failed to create store: " +
                (error.message || "An unknown error occurred"),
            {status: 500}
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user || !session.user.id) {
            return new NextResponse("Unauthorized", {status: 401});
        }

        const userId = session.user.id;

        const userStores = await prisma.store.findMany({
            where: {
                ownerId: userId,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return NextResponse.json(userStores, {status: 200});
    } catch (error) {
        console.error("Error fetching user stores:", error);
        return new NextResponse("Failed to fetch user stores", {status: 500});
    }
}
