import { Router, type Request, type Response } from 'express';
import { db } from '../lib/db';
import type { AuthResponse, ApiResponse } from '../models/index';

const router = Router();
const usersCollection = db.collection('users');

// Helper to get userId from headers safely
const getUserId = (req: Request): string | null => {
  const userId = req.headers['x-user-id'];
  if (Array.isArray(userId)) return userId[0] || null;
  return userId || null;
};

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password are required' } as ApiResponse<never>);
    }

    // Check if user exists
    const existingUsers = await usersCollection.find({ email });
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' } as ApiResponse<never>);
    }

    // Create user
    const userId = await usersCollection.insertOne({
      email,
      name,
      password, // In production, hash this!
      createdAt: new Date().toISOString(),
    });

    const user = await usersCollection.findById(userId);
    if (!user) {
      return res.status(500).json({ error: 'Failed to create user' } as ApiResponse<never>);
    }

    const { password: _pwd, ...userWithoutPassword } = user as any;
    
    const response: ApiResponse<AuthResponse> = {
      data: { 
        user: userWithoutPassword as any, 
        token: userId 
      }
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('[auth/register] Error:', error);
    res.status(500).json({ error: 'Internal server error' } as ApiResponse<never>);
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' } as ApiResponse<never>);
    }

    // Find user
    const users = await usersCollection.find({ email, password });
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' } as ApiResponse<never>);
    }

    const { password: _pwd, ...userWithoutPassword } = user as any;
    
    const response: ApiResponse<AuthResponse> = {
      data: { 
        user: userWithoutPassword as any, 
        token: (user as any)._id 
      }
    };
    res.json(response);
  } catch (error) {
    console.error('[auth/login] Error:', error);
    res.status(500).json({ error: 'Internal server error' } as ApiResponse<never>);
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' } as ApiResponse<never>);
    }

    const user = await usersCollection.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' } as ApiResponse<never>);
    }

    const { password: _pwd, ...userWithoutPassword } = user as any;
    res.json({ data: userWithoutPassword } as ApiResponse<Omit<import('../models/index').User, 'password'>>);
  } catch (error) {
    console.error('[auth/me] Error:', error);
    res.status(500).json({ error: 'Internal server error' } as ApiResponse<never>);
  }
});

export default router;