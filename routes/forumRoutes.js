const express = require("express");
const router = express.Router();
const Category = require('../models/Category');
const Thread = require('../models/Thread');

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new category
router.post('/categories', async (req, res) => {
    try {
        const category = new Category(req.body);
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get threads by category
router.get('/categories/:categoryId/threads', async (req, res) => {
    try {
        const threads = await Thread.find({ categoryId: req.params.categoryId });
        res.json(threads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single thread
router.get('/threads/:threadId', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        res.json(thread);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new thread
router.post('/threads', async (req, res) => {
    try {
        const thread = new Thread({
            categoryId: req.body.categoryId,
            title: req.body.title,
            author: req.body.author,
            messages: [{
                author: req.body.author,
                text: req.body.firstMessage,
                timestamp: new Date()
            }]
        });
        const newThread = await thread.save();
        res.status(201).json(newThread);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get thread messages
router.get('/threads/:threadId/messages', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        res.json(thread.messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add message to thread
router.post('/threads/:threadId/messages', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        
        thread.messages.push({
            author: req.body.author,
            text: req.body.text,
            timestamp: new Date()
        });
        
        const updatedThread = await thread.save();
        res.json(updatedThread.messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
