const { prisma } = require('../config/database');

class PhotoPresetService {
  async getAll() {
    return prisma.photoPreset.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(name, fileId) {
    return prisma.photoPreset.create({ data: { name, fileId } });
  }

  async delete(id) {
    return prisma.photoPreset.delete({ where: { id } });
  }

  async getById(id) {
    return prisma.photoPreset.findUnique({ where: { id } });
  }
}

module.exports = new PhotoPresetService();
