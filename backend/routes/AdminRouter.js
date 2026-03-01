const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Image = require('../models/Image'); // Adjust the path according to your project structure

const AdminRouter = express.Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        // Generate unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = file.fieldname + '-' + uniqueSuffix + ext;
        cb(null, name);
    }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

// Initialize multer with configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Helper function to generate URL for the uploaded image
const generateImageUrl = (req, filename) => {
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// Single image upload route
AdminRouter.post('/upload/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No image file provided' 
            });
        }

        // Generate custom name for the image
        const customName = req.body.name || req.file.originalname.split('.')[0];
        
        // Generate URL for the uploaded image
        const imageUrl = generateImageUrl(req, req.file.filename);

        // Create image record in database
        const image = new Image({
            name: customName,
            url: imageUrl
        });

        await image.save();

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                _id: image._id,
                name: image.name,
                url: image.url,
                createdAt: image.createdAt
            }
        });

    } catch (error) {
        // If error occurs, delete the uploaded file
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Error uploading image',
            error: error.message
        });
    }
});

// Multiple images upload route
AdminRouter.post('/upload/images', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No image files provided' 
            });
        }

        const uploadedImages = [];

        // Process each uploaded file
        for (const file of req.files) {
            // Generate URL for each image
            const imageUrl = generateImageUrl(req, file.filename);
            
            // Create image record in database
            const image = new Image({
                name: file.originalname.split('.')[0],
                url: imageUrl
            });

            await image.save();
            
            uploadedImages.push({
                _id: image._id,
                name: image.name,
                url: image.url
            });
        }

        res.status(201).json({
            success: true,
            message: `${uploadedImages.length} images uploaded successfully`,
            data: uploadedImages
        });

    } catch (error) {
        // If error occurs, delete all uploaded files
        if (req.files) {
            req.files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error uploading images',
            error: error.message
        });
    }
});

// Get all images
AdminRouter.get('/images', async (req, res) => {
    try {
        const images = await Image.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: images.length,
            data: images
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching images',
            error: error.message
        });
    }
});

// Get single image by ID
AdminRouter.get('/image/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        res.status(200).json({
            success: true,
            data: image
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching image',
            error: error.message
        });
    }
});

// Delete image by ID
AdminRouter.delete('/image/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Extract filename from URL
        const filename = image.url.split('/').pop();
        const filepath = path.join('uploads', filename);

        // Delete file from filesystem
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        // Delete from database
        await image.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting image',
            error: error.message
        });
    }
});

// Update image name
AdminRouter.put('/image/:id', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        const image = await Image.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true, runValidators: true }
        );

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Image updated successfully',
            data: image
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating image',
            error: error.message
        });
    }
});

// Error handling middleware for multer errors
AdminRouter.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: error.message
        });
    } else if (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next();
});

module.exports = AdminRouter;