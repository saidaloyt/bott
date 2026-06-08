const { prisma } = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

class OrderService {
  // Create order from cart items
  async createFromCart(userId, cartItems, cardLastFour, location = {}) {
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity, 0,
    );

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice,
          status: 'pending',
          cardLastFour,
          deliveryLatitude: location.deliveryLatitude || null,
          deliveryLongitude: location.deliveryLongitude || null,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } }, user: true },
      });

      // Decrement stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  }

  // Legacy single-product create (kept for compatibility)
  async create({ userId, productId, quantity = 1, cardLastFour }) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('product_not_found');
    if (product.stock < quantity) throw new Error('insufficient_stock');

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice: product.price * quantity,
          status: 'pending',
          cardLastFour,
          items: { create: { productId, quantity, price: product.price } },
        },
        include: { items: { include: { product: true } }, user: true },
      });
      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });
      return order;
    });
  }

  async getById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: { user: true, items: { include: { product: true } } },
    });
  }

  async getUserOrders(userId, page = 1) {
    const { skip, take } = getPaginationParams(page);
    const where = { userId };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, meta: buildPaginationMeta(total, page) };
  }

  async getAll({ page = 1, status = null, search = null } = {}) {
    const { skip, take } = getPaginationParams(page);
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.user = {
        OR: [
          { fullName: { contains: search } },
          { phone: { contains: search } },
        ],
      };
    }
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take,
        include: { user: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, meta: buildPaginationMeta(total, page) };
  }

  async updateStatus(orderId, status) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { user: true, items: { include: { product: true } } },
    });
  }

  async cancelUserOrder(orderId, userId) {
    const order = await this.getById(orderId);
    if (!order || order.userId !== userId) throw new Error('order_not_found');
    if (order.status !== 'pending') throw new Error('cannot_cancel');

    // Restore stock
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({ where: { id: orderId }, data: { status: 'cancelled' } });
    });

    return order;
  }

  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalOrders, totalRevenue, dailyOrders, monthlyOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      dailyOrders,
      monthlyOrders,
    };
  }

  async count() {
    return prisma.order.count();
  }
}

module.exports = new OrderService();
