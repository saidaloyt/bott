const { prisma } = require('../config/database');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { generateAccessCode } = require('../utils/code');

class UserService {
  async findByTelegramId(telegramId) {
    return prisma.user.findUnique({ where: { telegramId: String(telegramId) } });
  }

  async findByAccessCode(code) {
    return prisma.user.findUnique({ where: { accessCode: code } });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });
  }

  async updateProfile(telegramId, data) {
    return prisma.user.update({
      where: { telegramId: String(telegramId) },
      data,
    });
  }

  async completeRegistration(telegramId, data) {
    let code = generateAccessCode();
    while (await prisma.user.findUnique({ where: { accessCode: code } })) {
      code = generateAccessCode();
    }
    return prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { ...data, accessCode: code },
    });
  }

  async getAll(page = 1) {
    const { skip, take } = getPaginationParams(page);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip, take,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { orders: true } } },
      }),
      prisma.user.count(),
    ]);
    return { users, meta: buildPaginationMeta(total, page) };
  }

  async search(query, page = 1) {
    const { skip, take } = getPaginationParams(page);
    const where = {
      OR: [
        { fullName: { contains: query } },
        { phone: { contains: query } },
        { email: { contains: query } },
      ],
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    return { users, meta: buildPaginationMeta(total, page) };
  }

  async count() {
    return prisma.user.count();
  }

  async requestAdminAccess(telegramId) {
    return prisma.user.update({
      where: { telegramId: String(telegramId) },
      data: { adminRequest: true },
    });
  }

  async getPendingAdminRequests() {
    return prisma.user.findMany({
      where: { adminRequest: true, isSubAdmin: false, isAdmin: false },
    });
  }

  async approveSubAdmin(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { isSubAdmin: true, adminRequest: false },
    });
  }

  async revokeSubAdmin(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { isSubAdmin: false, adminRequest: false },
    });
  }

  async getSubAdmins() {
    return prisma.user.findMany({ where: { isSubAdmin: true } });
  }
}

module.exports = new UserService();
