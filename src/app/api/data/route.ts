import prisma from "@/helpers/prisma";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  try {
    const data = await auth.api.getSession({
      headers: await headers(),
    });

    const session = data?.session;

    if (!session) {
      return new NextResponse("Unauthorized", {status: 401});
    }

    const userId = data.user.id;

    const userStores = await prisma.store.findMany({
      where: {ownerId: userId},
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    const totalProducts = await prisma.product.count({
      where: {userId: userId},
    });

    const productsWithOrders = await prisma.product.findMany({
      where: {userId: userId},
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        category: true,
        imageUrl: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    const totalUnitsInStock = productsWithOrders.reduce(
      (sum, product) => sum + product.stock,
      0
    );
    const lowStockItems = productsWithOrders.filter(
      (product) => product.stock < 5
    ).length;

    const totalOrders = await prisma.order.count({
      where: {userId: userId},
    });

    const pendingOrders = await prisma.order.count({
      where: {
        userId: userId,
        status: "pending",
      },
    });

    return NextResponse.json({
      totalProducts,
      totalUnitsInStock,
      lowStockItems,
      totalOrders,
      pendingOrders,
      userStores,
      productsWithOrders,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return new NextResponse("Internal Server Error", {status: 500});
  }
}
