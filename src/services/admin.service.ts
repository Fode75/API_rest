import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';

export const createUserInvite = async (data: { email: string; name: string; password: string; role?: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'USER' }) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    return { conflict: true, user: null };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || 'USER',
      isActive: true
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  return { conflict: false, user: newUser };
};