const express = require('express');
const cors = require('cors');
const path = require('node:path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
db.initDatabase();

// ==================== REST API ENDPOINTS ====================

/**
 * GET /api/groceries
 * Query parameters:
 * - category: e.g. "Fruits", "Vegetables", "All"
 * - search: search string for name/description/category
 * - stockStatus: "in_stock", "low_stock", "out_of_stock", "all"
 * - filter: "best_sellers", "seasonal"
 * - sort: "price_asc", "price_desc", "rating", "name", "stock"
 */
app.get('/api/groceries', (req, res) => {
  try {
    const { category, search, stockStatus, filter, sort } = req.query;
    const items = db.getAllGroceries({ category, search, stockStatus, filter, sort });
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching groceries:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/groceries/:id
 */
app.get('/api/groceries/:id', (req, res) => {
  try {
    const item = db.getGroceryById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/groceries
 * Add new grocery item to store data
 */
app.post('/api/groceries', (req, res) => {
  try {
    const { name, category, price, unit, stockQuantity } = req.body;
    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, and price are required fields'
      });
    }

    const newItem = db.createGrocery(req.body);
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Error creating grocery item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/groceries/:id
 * Update quantity, price, or item details
 */
app.put('/api/groceries/:id', (req, res) => {
  try {
    const updated = db.updateGrocery(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({
      success: true,
      message: 'Item updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating grocery item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/groceries/:id/stock
 * Rapid stock adjuster for Admin mode (+1 or -1 or custom delta)
 */
app.patch('/api/groceries/:id/stock', (req, res) => {
  try {
    const delta = parseInt(req.body.delta, 10);
    if (isNaN(delta)) {
      return res.status(400).json({ success: false, error: 'Valid delta integer required' });
    }
    const updated = db.adjustStock(req.params.id, delta);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({
      success: true,
      message: `Stock updated to ${updated.stockQuantity}`,
      data: updated
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/groceries/:id
 * Remove item from shop data
 */
app.delete('/api/groceries/:id', (req, res) => {
  try {
    const deleted = db.deleteGrocery(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/categories
 * Live categories with item counts
 */
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategoriesWithCounts();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/stats
 * Admin dashboard inventory summary
 */
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/groceries/seed-reset
 * Restore default demo groceries
 */
app.post('/api/groceries/seed-reset', (req, res) => {
  try {
    const result = db.resetSampleData();
    res.json({ success: true, message: 'Database reset to sample catalog', ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback to index.html for client-side navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌿 Gronery Server running at http://localhost:${PORT}`);
});
