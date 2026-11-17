import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive || !user.password) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET_MISSING');
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    secret,
    { expiresIn: '1h' }
  );

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
};