const { prisma } = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

function parsePhotos(product) {
  if (!product) return product;
  try {
    product.photos = JSON.parse(product.photos || '[]');
  } catch {
    product.photos = [];
  }
  return product;
}

function parsePhotosMany(products) {
  return products.map(parsePhotos);
}

class ProductService {
  async getByCategory(categoryId, page = 1) {
    const { skip, take } = getPaginationParams(page);
    const where = { categoryId, stock: { gt: 0 } };
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);
    return { products: parsePhotosMany(products), meta: buildPaginationMeta(total, page) };
  }

  async getAll(page = 1) {
    const { skip, take } = getPaginationParams(page);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip, take,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count(),
    ]);
    return { products: parsePhotosMany(products), meta: buildPaginationMeta(total, page) };
  }

  async getById(id) {
    if (!id) return null
  
    return prisma.product.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        category: true
      }
    })
  }

  async deletePhoto(productId, photo) {
    const product = await this.getById(productId)
    if (!product) return null
  
    const updatedPhotos = product.photos.filter(p => p !== photo)
  
    return prisma.product.update({
      where: {
        id: Number(productId)
      },
      data: {
        photos: updatedPhotos
      }
    })
  }
  
  async replacePhoto(productId, oldPhoto, newPhoto) {
    const product = await this.getById(productId)
    if (!product) return null
  
    const updatedPhotos = product.photos.map(p =>
      p === oldPhoto ? newPhoto : p
    )
  
    return prisma.product.update({
      where: {
        id: Number(productId)
      },
      data: {
        photos: updatedPhotos
      }
    })
  }

  async search(query, page = 1) {
    const { skip, take } = getPaginationParams(page);
    const where = {
      AND: [
        { stock: { gt: 0 } },
        {
          OR: [
            { title: { contains: query } },
            { titleUz: { contains: query } },
            { titleRu: { contains: query } },
            { titleEn: { contains: query } },
            { description: { contains: query } },
            { descriptionUz: { contains: query } },
            { descriptionRu: { contains: query } },
            { descriptionEn: { contains: query } },
          ],
        },
      ],
    };
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take }),
      prisma.product.count({ where }),
    ]);
    return { products: parsePhotosMany(products), meta: buildPaginationMeta(total, page) };
  }

  async create(data) {
    const { photos, ...rest } = data;
    return parsePhotos(await prisma.product.create({
      data: { ...rest, photos: JSON.stringify(photos || []) },
    }));
  }

  async update(id, data) {
    const { photos, ...rest } = data;
    const updateData = { ...rest };
    if (photos !== undefined) updateData.photos = JSON.stringify(photos);
    return parsePhotos(await prisma.product.update({ where: { id }, data: updateData }));
  }

  async delete(id) {
    return prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { productId: id } });
      await tx.$executeRaw`UPDATE "order_items" SET "productId" = NULL WHERE "productId" = ${id}`;
      return tx.product.delete({ where: { id } });
    });
  }

  async addPhoto(id, fileId) {
    const product = await this.getById(id);
    const photos = [...(product.photos || []), fileId];
    return prisma.product.update({ where: { id }, data: { photos: JSON.stringify(photos) } });
  }

  async updateStock(id, stock) {
    return prisma.product.update({ where: { id }, data: { stock: parseInt(stock) } });
  }

  async getMostPurchased() {
    const result = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 1,
    });
    if (!result.length) return null;
    return {
      product: await this.getById(result[0].productId),
      totalSold: result[0]._sum.quantity,
    };
  }
}

module.exports = new ProductService();
