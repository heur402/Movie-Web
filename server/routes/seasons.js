// routes/seasons.js
import express from 'express';
import { body } from 'express-validator';
import {
  createSeason,
  getSeasons,
  getSeason,
  updateSeason,
  deleteSeason
} from '../controllers/seasonController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Validation rules
const seasonValidation = [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('seasonNumber').isInt({ min: 1 }).withMessage('Season number must be a positive integer'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 5 }).withMessage('Invalid year'),
  body('description').optional().isString().trim(),
];

// Routes
router.post(
  '/',
  upload.single('file'),
  seasonValidation,
  createSeason
);

router.get('/', getSeasons);
router.get('/:id', getSeason);
router.put('/:id', seasonValidation, updateSeason);
router.delete('/:id', deleteSeason);

export default router; // ES module default export