import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: { email: string; password?: string; name?: string; phone?: string; roleId?: string; googleId?: string }) {
    const hashed = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        phone: data.phone,
        roleId: data.roleId ?? undefined,
        googleId: data.googleId
      }
    });
  }

  /** Finds a role by name, creating it the first time it is needed. */
  async ensureRole(name: string) {
    return this.prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }

  async updatePassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { password: hashed } });
  }

  async validatePassword(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user || !user.password) return null;
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
  }
}
