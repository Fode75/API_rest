import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const mockUser = { id: 1, role: 'USER' };
    
    const accessToken = jwt.sign(
      { userId: mockUser.id, role: mockUser.role },
      String(process.env.JWT_ACCESS_SECRET),
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: mockUser.id },
      String(process.env.JWT_REFRESH_SECRET),
      { expiresIn: '7d' }
    );

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) { res.status(401).json({ error: 'Token manquant.' }); return; }

    const payload = jwt.verify(token, String(process.env.JWT_REFRESH_SECRET)) as { userId: number };
    const mockUser = { id: payload.userId, role: 'USER' };

    const newAccessToken = jwt.sign(
      { userId: mockUser.id, role: mockUser.role },
      String(process.env.JWT_ACCESS_SECRET),
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: mockUser.id },
      String(process.env.JWT_REFRESH_SECRET),
      { expiresIn: '7d' }
    );

    res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ error: 'Token invalide ou expiré.' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) { res.status(400).json({ error: 'Token manquant.' }); return; }

    res.status(200).json({ message: 'Déconnexion réussie. Le token a été révoqué.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la déconnexion.' });
  }
};
