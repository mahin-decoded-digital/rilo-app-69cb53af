import { Router, type Request, type Response } from 'express';
import { db } from '../lib/db';
import type { Transaction, ApiResponse } from '../models/index';

const router = Router();
const transactionsCollection = db.collection('transactions');

// Helper to get userId from headers safely
const getUserId = (req: Request): string | null => {
  const userId = req.headers['x-user-id'];
  if (Array.isArray(userId)) return userId[0] || null;
  return userId || null;
};

// Get all transactions for a user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' } as ApiResponse<never>);
    }

    const transactions = await transactionsCollection.find({ userId });
    
    res.json({ data: transactions as unknown as Transaction[] } as ApiResponse<Transaction[]>);
  } catch (error) {
    console.error('[transactions] Error:', error);
    res.status(500).json({ error: 'Internal server error' } as ApiResponse<never>);
  }
});

// Create transaction
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { type, amount, category, description, date } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' } as ApiResponse<never>);
    }

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ error: 'Type, amount, category, and date are required' } as ApiResponse<never>);
    }

    const id = await transactionsCollection.insertOne({
      type,
      amount,
      category,
      description: description || '',
      date,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const transaction = await transactionsCollection.findById(id);
    
    res.status(201).json({ data: transaction as unknown as Transaction } as ApiResponse<Transaction>);
  } catch (error) {
    console.error('[transactions POST] Error:', error);
    res.status(500).json({ error: 'Internal server error' } as ApiResponse<never>);
  }
});

// Update transaction
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' } as ApiResponse<never>);
    }

    if (!id) {
       return res.status(400).json({ error: 'ID is required' } as ApiResponse<never>);
    }

    // Check ownership
    const existing = await transactionsCollection.findById(id);
    if (!existing || (existing as any).userId !== userId) {
      return res.status(404).json({ error: 'Transaction not found' } as ApiResponse<never>);
    }

    const updated = await transactionsCollection.updateOne(id, {
      type,
      amount,
      category,
      description: description || '',
      date,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update transaction' } as ApiResponse<never>);
    }

    const transaction = await transactionsCollection.findById(id);
    
    res.json({ data: transaction as unknown as Transaction } as ApiResponse<Transaction>);
  } catch (error) {
    console.error('[transactions PUT] Error:', error);
    res.status(500).json({ error: 'Internal server error' } as ApiResponse<never>);
  }
});

// Delete transaction
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' } as ApiResponse<never>);
    }

    if (!id) {
       return res.status(400).json({ error: 'ID is required' } as ApiResponse<never>);
    }

    // Check ownership
    const existing = await transactionsCollection.findById(id);
    if (!existing || (existing as any).userId !== userId) {
      return res.status(404).json({ error: 'Transaction not found' } as ApiResponse<never>);
    }

    const deleted = await transactionsCollection.deleteOne(id);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete transaction' } as ApiResponse<never>);
    }

    res.json({ data: { success: true } });
  } catch (error) {
    console.error('[transactions DELETE] Error:', error);
    res.status(500).json({ error: 'Internal server error' } as ApiResponse<never>);
  }
});

export default router;