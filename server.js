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
 * GET /api/groceries and /api/items
 * Query parameters:
 * - category: e.g. "Fruits", "Vegetables", "All", "bestsellers"
 * - search: search string for name/description/category
 * - stockStatus: "in_stock", "low_stock", "out_of_stock", "all"
 * - filter: "all", "best_sellers", "bestsellers", "seasonal", "in_stock", "low_stock"
 * - isBestSeller: "true" / "1"
 * - isSeasonal: "true" / "1"
 * - sort: "price_asc", "price_desc", "rating", "name", "stock"
 */
const handleGetGroceries = (req, res) => {
  try {
    const { category, search, stockStatus, filter, sort, isBestSeller, isSeasonal, inStock } = req.query;
    const items = db.getAllGroceries({
      category,
      search,
      stockStatus,
      filter,
      sort,
      isBestSeller,
      isSeasonal,
      inStock
    });

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching groceries:', error);
    // Graceful fallback: return sample groceries so the frontend never crashes with 500
    const fallbackItems = db.SAMPLE_GROCERIES || [];
    res.json({
      success: true,
      count: fallbackItems.length,
      data: fallbackItems,
      fallback: true
    });
  }
};

app.get('/api/groceries', handleGetGroceries);
app.get('/api/items', handleGetGroceries);

/**
 * GET /api/groceries/:id and /api/items/:id
 */
const handleGetGroceryById = (req, res) => {
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
};

app.get('/api/groceries/:id', handleGetGroceryById);
app.get('/api/items/:id', handleGetGroceryById);

/**
 * POST /api/groceries and /api/items
 * Add new grocery item to store data
 */
const handleCreateGrocery = (req, res) => {
  try {
    const { name, category, price } = req.body;
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
};

app.post('/api/groceries', handleCreateGrocery);
app.post('/api/items', handleCreateGrocery);

/**
 * PUT /api/groceries/:id and /api/items/:id
 * Update quantity, price, or item details
 */
const handleUpdateGrocery = (req, res) => {
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
};

app.put('/api/groceries/:id', handleUpdateGrocery);
app.put('/api/items/:id', handleUpdateGrocery);

/**
 * PATCH /api/groceries/:id/stock and /api/items/:id/stock
 * Rapid stock adjuster for Admin mode (+1 or -1 or direct stockQuantity)
 */
const handleAdjustStock = (req, res) => {
  try {
    const { delta, stockQuantity, quantity } = req.body;
    let updated;

    if (stockQuantity !== undefined || quantity !== undefined) {
      const targetQty = stockQuantity !== undefined ? parseInt(stockQuantity, 10) : parseInt(quantity, 10);
      if (isNaN(targetQty) || targetQty < 0) {
        return res.status(400).json({ success: false, error: 'Valid non-negative stock quantity required' });
      }
      updated = db.setStock(req.params.id, targetQty);
    } else if (delta !== undefined) {
      const d = parseInt(delta, 10);
      if (isNaN(d)) {
        return res.status(400).json({ success: false, error: 'Valid delta integer required' });
      }
      updated = db.adjustStock(req.params.id, d);
    } else {
      return res.status(400).json({ success: false, error: 'Either delta or stockQuantity is required' });
    }

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
};

app.patch('/api/groceries/:id/stock', handleAdjustStock);
app.patch('/api/items/:id/stock', handleAdjustStock);
app.patch('/api/groceries/:id', handleUpdateGrocery);
app.patch('/api/items/:id', handleUpdateGrocery);

/**
 * DELETE /api/groceries/:id and /api/items/:id
 * Remove item from shop data
 */
const handleDeleteGrocery = (req, res) => {
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
};

app.delete('/api/groceries/:id', handleDeleteGrocery);
app.delete('/api/items/:id', handleDeleteGrocery);

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

// JSON 404 for unhandled API endpoints so clients receive JSON rather than HTML
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `API endpoint ${req.method} ${req.originalUrl || req.path} not found` });
});

// Fallback to index.html for client-side navigation (non-API routes only)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🌿 Gronery Server running at http://localhost:${PORT}`);
});
