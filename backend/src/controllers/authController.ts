import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'researchflow_secure_jwt_token_key_2026_super_secret';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username/Email and Password are required.' });
      return;
    }

    const cleanInput = username.trim().toLowerCase();

    // Query user by username or email
    const result = await query(
      `SELECT * FROM users WHERE LOWER(username) = $1 OR LOWER(email) = $1 LIMIT 1`,
      [cleanInput]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    const user = result.rows[0];

    // Check account status
    if (user.status === 'Inactive') {
      res.status(403).json({ error: 'Your account has been deactivated. Please contact your Research Administrator.' });
      return;
    }

    // Verify bcrypt password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    // Sign JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.full_name,
      email: user.email,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        phone: user.phone,
        university: user.university,
        department: user.department,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed. Please try again.', details: error.message });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const result = await query(
      `SELECT id, username, email, full_name, role, status, phone, university, department, avatar_url, created_at
       FROM users WHERE id = $1 LIMIT 1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User record not found.' });
      return;
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};
