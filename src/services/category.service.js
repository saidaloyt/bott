const { prisma } = require('../config/database');

class CategoryService {
  /**
   * Корневые категории (без родителя)
   */
  async getRoots() {
    return prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Подкатегории
   */
  async getChildren(parentId) {
    return prisma.category.findMany({
      where: { parentId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Одна категория
   */
  async getById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });
  }

  /**
   * Создать категорию
   */
  async create(data, parentId = null) {
    const payload = typeof data === 'string'
      ? { name: data.trim(), nameRu: data.trim(), nameUz: data.trim(), nameEn: data.trim() }
      : {
          ...data,
          name: (data.nameRu || data.nameUz || data.nameEn || data.name || '').trim(),
          nameUz: data.nameUz?.trim(),
          nameRu: data.nameRu?.trim(),
          nameEn: data.nameEn?.trim(),
        };
    return prisma.category.create({
      data: { ...payload, parentId },
    });
  }

  /**
   * Переименовать категорию
   */
  async rename(id, data) {
    const payload = typeof data === 'string'
      ? { name: data.trim(), nameRu: data.trim(), nameUz: data.trim(), nameEn: data.trim() }
      : {
          ...data,
          name: (data.nameRu || data.nameUz || data.nameEn || data.name || '').trim(),
          nameUz: data.nameUz?.trim(),
          nameRu: data.nameRu?.trim(),
          nameEn: data.nameEn?.trim(),
        };
    return prisma.category.update({
      where: { id },
      data: payload,
    });
  }

  /**
   * Удалить категорию (каскадно удаляет подкатегории через Prisma)
   */
  async delete(id) {
    return prisma.category.delete({ where: { id } });
  }

  /**
   * Дерево всех категорий
   */
  async getTree() {
    const all = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return this._buildTree(all, null);
  }

  _buildTree(categories, parentId) {
    return categories
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        ...c,
        children: this._buildTree(categories, c.id),
      }));
  }

  /**
   * Хлебные крошки категории
   */
  async getBreadcrumbs(categoryId) {
    const crumbs = [];
    let current = await this.getById(categoryId);
    while (current) {
      crumbs.unshift(current);
      current = current.parentId ? await this.getById(current.parentId) : null;
    }
    return crumbs;
  }

  /**
   * Есть ли у категории товары или дочерние категории?
   */
  async hasContent(id) {
    const [childCount, productCount] = await Promise.all([
      prisma.category.count({ where: { parentId: id } }),
      prisma.product.count({ where: { categoryId: id } }),
    ]);
    return { hasChildren: childCount > 0, hasProducts: productCount > 0 };
  }
}

module.exports = new CategoryService();
