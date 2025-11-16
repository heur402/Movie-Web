import Season from '../models/Season.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create new season
const createSeason = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, seasonNumber, year, description, episodes } = req.body;

    // Check if season already exists
    const existingSeason = await Season.findOne({ title, seasonNumber });
    if (existingSeason) {
      return res.status(400).json({ 
        message: `Season ${seasonNumber} of "${title}" already exists` 
      });
    }

    const seasonData = {
      title,
      seasonNumber: parseInt(seasonNumber),
      year: parseInt(year),
      description,
      status: 'uploading',
      uploadProgress: 0
    };

    // Handle file upload
    if (req.file) {
      seasonData.fileInfo = {
        originalName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        uploadDate: new Date()
      };

      // Process the file based on type
      if (req.file.mimetype.includes('zip') || req.file.mimetype.includes('rar')) {
        await processArchiveFile(req.file, seasonData);
      } else {
        await processVideoFile(req.file, seasonData, episodes);
      }
    }

    const season = new Season(seasonData);
    await season.save();

    // Simulate processing completion
    setTimeout(async () => {
      season.status = 'completed';
      season.uploadProgress = 100;
      await season.save();
    }, 3000);

    res.status(201).json({
      message: 'Season created successfully',
      season: {
        _id: season._id,
        title: season.title,
        seasonNumber: season.seasonNumber,
        status: season.status,
        uploadProgress: season.uploadProgress
      }
    });

  } catch (error) {
    console.error('Error creating season:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Error creating season', 
      error: error.message 
    });
  }
};

// Process archive file
const processArchiveFile = async (file, seasonData) => {
  try {
    const zip = new AdmZip(file.path);
    const entries = zip.getEntries();
    
    // Filter video files
    const videoEntries = entries.filter(entry => 
      !entry.isDirectory && entry.entryName.match(/\.(mp4|mkv|avi|mov|wmv)$/i)
    );

    // Create episodes from video files
    seasonData.episodes = videoEntries.map((entry, index) => ({
      episodeNumber: index + 1,
      title: `Episode ${index + 1}`,
      videoUrl: `/uploads/${file.filename}/extracted/${entry.entryName}`,
      fileSize: entry.header.size
    }));

    // Extract files
    const extractPath = path.join('uploads', path.parse(file.filename).name, 'extracted');
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }
    
    zip.extractAllTo(extractPath, true);

  } catch (error) {
    throw new Error(`Failed to process archive: ${error.message}`);
  }
};

// Process single video file
const processVideoFile = async (file, seasonData, episodeTitles = []) => {
  const episodes = [];
  const episodeCount = episodeTitles.length || 1;

  for (let i = 0; i < episodeCount; i++) {
    episodes.push({
      episodeNumber: i + 1,
      title: episodeTitles[i] || `Episode ${i + 1}`,
      videoUrl: `/uploads/videos/${file.filename}`,
      fileSize: file.size / episodeCount // Approximate size per episode
    });
  }

  seasonData.episodes = episodes;
};

// Get all seasons
const getSeasons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const seasons = await Season.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-episodes.videoUrl') // Exclude video URLs from list
      .exec();

    const total = await Season.countDocuments(query);

    res.json({
      seasons,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Error fetching seasons:', error);
    res.status(500).json({ 
      message: 'Error fetching seasons', 
      error: error.message 
    });
  }
};

// Get single season
const getSeason = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    res.json(season);
  } catch (error) {
    console.error('Error fetching season:', error);
    res.status(500).json({ 
      message: 'Error fetching season', 
      error: error.message 
    });
  }
};

// Update season
const updateSeason = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const season = await Season.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    res.json({
      message: 'Season updated successfully',
      season
    });
  } catch (error) {
    console.error('Error updating season:', error);
    res.status(500).json({ 
      message: 'Error updating season', 
      error: error.message 
    });
  }
};

// Delete season
const deleteSeason = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    // Clean up uploaded files
    if (season.fileInfo) {
      const fileDir = path.dirname(season.fileInfo.filePath);
      if (fs.existsSync(fileDir)) {
        fs.rmSync(fileDir, { recursive: true, force: true });
      }
    }

    await Season.findByIdAndDelete(req.params.id);

    res.json({ message: 'Season deleted successfully' });
  } catch (error) {
    console.error('Error deleting season:', error);
    res.status(500).json({ 
      message: 'Error deleting season', 
      error: error.message 
    });
  }
};

export {
  createSeason,
  getSeasons,
  getSeason,
  updateSeason,
  deleteSeason
};