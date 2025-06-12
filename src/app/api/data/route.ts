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

    console.log("Session: ", session);

    if (!session) {
      return new NextResponse("Unauthorized", {status: 401});
    }

    const userId = data.user.id;

    // Fetch total products for the user
    const totalProducts = await prisma.product.count({
      where: {userId: userId},
    });

    // Calculate total units in stock and low stock items
    const products = await prisma.product.findMany({
      where: {userId: userId},
      select: {
        stock: true,
      },
    });

    const totalUnitsInStock = products.reduce(
      (sum, product) => sum + product.stock,
      0
    );
    const lowStockItems = products.filter(
      (product) => product.stock < 5
    ).length;

    // Fetch total orders and pending orders for the user
    const totalOrders = await prisma.order.count({
      where: {userId: userId},
    });

    const pendingOrders = await prisma.order.count({
      where: {
        userId: userId,
        status: "pending", // Assuming 'pending' is a status in your Order model
      },
    });

    return NextResponse.json({
      totalProducts,
      totalUnitsInStock,
      lowStockItems,
      totalOrders,
      pendingOrders,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return new NextResponse("Internal Server Error", {status: 500});
  }
}
