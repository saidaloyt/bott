const { prisma } = require('../config/database');

class CartService {
  async getCart(userId) {
    return prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { id: 'asc' },
    });
  }

  async addItem(userId, productId, quantity = 1) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('product_not_found');
    if (product.stock < 1) throw new Error('out_of_stock');

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      const newQty = Math.min(existing.quantity + quantity, product.stock);
      return prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: newQty },
        include: { product: true },
      });
    }

    return prisma.cartItem.create({
      data: { userId, productId, quantity: Math.min(quantity, product.stock) },
      include: { product: true },
    });
  }

  async updateQty(userId, productId, delta) {
    const item = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
      include: { product: true },
    });
    if (!item) return null;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await prisma.cartItem.delete({ where: { userId_productId: { userId, productId } } });
      return null;
    }

    const maxQty = Math.min(newQty, item.product.stock);
    return prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity: maxQty },
      include: { product: true },
    });
  }

  async removeItem(userId, productId) {
    return prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    }).catch(() => null);
  }

  async clearCart(userId) {
    return prisma.cartItem.deleteMany({ where: { userId } });
  }

  async getTotal(userId) {
    const items = await this.getCart(userId);
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  async isEmpty(userId) {
    const count = await prisma.cartItem.count({ where: { userId } });
    return count === 0;
  }
}

module.exports = new CartService();
