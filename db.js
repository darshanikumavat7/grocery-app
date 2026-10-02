const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const crypto = require('node:crypto');

const dbPath = path.join(__dirname, 'grocery.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance
db.exec('PRAGMA journal_mode = WAL;');

// Initialize Tables
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS groceries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      originalPrice REAL,
      unit TEXT NOT NULL,
      stockQuantity INTEGER NOT NULL,
      inStock INTEGER NOT NULL DEFAULT 1,
      imageUrl TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 5.0,
      reviewsCount INTEGER NOT NULL DEFAULT 42,
      isBestSeller INTEGER NOT NULL DEFAULT 0,
      isSeasonal INTEGER NOT NULL DEFAULT 0,
      badge TEXT,
      description TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // Check if table has data; if empty, seed with initial mock data
  const countRow = db.prepare('SELECT COUNT(*) as count FROM groceries').get();
  if (countRow.count === 0) {
    seedInitialData();
  }
}

const SAMPLE_GROCERIES = [
  {
    name: "Organic Strawberry",
    category: "Strawberry / Fruits",
    price: 12.00,
    originalPrice: 15.00,
    unit: "per kg",
    stockQuantity: 45,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewsCount: 142,
    isBestSeller: 1,
    isSeasonal: 1,
    badge: "BESTSELLER",
    description: "Sweet, juicy organic strawberries freshly picked from local eco-farms. Packed with antioxidants and vitamin C."
  },
  {
    name: "Honeycrisp Fresh Apples",
    category: "Apple",
    price: 4.50,
    originalPrice: 6.00,
    unit: "per kg",
    stockQuantity: 88,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewsCount: 96,
    isBestSeller: 1,
    isSeasonal: 0,
    badge: "FRESH",
    description: "Crisp, sweet, and bursting with cider-like crunch. Ideal for snacking, baking, and fresh salads."
  },
  {
    name: "Sweet Valencia Oranges",
    category: "Orange",
    price: 3.80,
    originalPrice: 4.90,
    unit: "per kg",
    stockQuantity: 32,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 64,
    isBestSeller: 0,
    isSeasonal: 1,
    badge: "JUICY",
    description: "Sun-ripened Valencia oranges loaded with natural sweetness and high juice yield for daily morning hydration."
  },
  {
    name: "Crisp Organic Carrots",
    category: "Carrot",
    price: 2.50,
    originalPrice: 3.20,
    unit: "per bunch",
    stockQuantity: 60,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewsCount: 88,
    isBestSeller: 1,
    isSeasonal: 0,
    badge: "ORGANIC",
    description: "Crunchy, sweet farm carrots with healthy greens attached. Rich in beta-carotene and essential vitamins."
  },
  {
    name: "Farm Russet Potatoes",
    category: "Potato",
    price: 3.20,
    originalPrice: 4.00,
    unit: "per kg",
    stockQuantity: 115,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
    rating: 4.6,
    reviewsCount: 52,
    isBestSeller: 0,
    isSeasonal: 0,
    badge: "PANTRY",
    description: "Hearty, starchy russet potatoes suitable for fluffy mashed potatoes, roasting, or homemade french fries."
  },
  {
    name: "Organic Golden Onions",
    category: "Grains",
    price: 2.90,
    originalPrice: 3.50,
    unit: "per kg",
    stockQuantity: 74,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 48,
    isBestSeller: 0,
    isSeasonal: 0,
    badge: "FARM PICK",
    description: "Fragrant yellow sweet onions, foundational aromatic for stews, stir fries, roasts, and savory dishes."
  },
  {
    name: "Artisan Whole Rolled Oats & Grains",
    category: "Grains",
    price: 5.40,
    originalPrice: 6.80,
    unit: "per pack",
    stockQuantity: 40,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewsCount: 110,
    isBestSeller: 1,
    isSeasonal: 0,
    badge: "FIBER RICH",
    description: "Stone-milled whole oats and mixed multi-grains. High in dietary fiber, low GI, and heart-healthy."
  },
  {
    name: "Fresh Broccoli Crowns",
    category: "Vegetables",
    price: 3.50,
    originalPrice: 4.50,
    unit: "per bunch",
    stockQuantity: 28,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewsCount: 79,
    isBestSeller: 1,
    isSeasonal: 0,
    badge: "SUPERFOOD",
    description: "Tender, vibrant green florets loaded with vitamins K and C. Harvested cold to preserve maximum crispness."
  },
  {
    name: "Organic Pasture Whole Milk",
    category: "Dairy",
    price: 4.20,
    originalPrice: 5.00,
    unit: "per liter",
    stockQuantity: 52,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewsCount: 135,
    isBestSeller: 1,
    isSeasonal: 0,
    badge: "100% PURE",
    description: "Pasteurized, non-homogenized whole milk from grass-fed cows. Creamy, nutrient dense, and clean."
  },
  {
    name: "Ripe Hass Avocados",
    category: "Vegetables",
    price: 6.00,
    originalPrice: 8.00,
    unit: "per pack (3 pcs)",
    stockQuantity: 6,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
    rating: 5.0,
    reviewsCount: 210,
    isBestSeller: 1,
    isSeasonal: 1,
    badge: "LOW STOCK",
    description: "Buttery, rich Hass avocados with dark pebbled skin. Perfect for guacamole, toasts, and salads."
  },
  {
    name: "Tender Baby Spinach",
    category: "Vegetables",
    price: 3.90,
    originalPrice: 4.80,
    unit: "per pack",
    stockQuantity: 4,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
    rating: 4.8,
    reviewsCount: 67,
    isBestSeller: 0,
    isSeasonal: 1,
    badge: "LOW STOCK",
    description: "Pre-washed tender baby spinach leaves. Mild, sweet flavor ideal for green smoothies or sautéing."
  },
  {
    name: "Wild Mountain Blueberries",
    category: "Strawberry / Fruits",
    price: 5.80,
    originalPrice: 7.20,
    unit: "per pack",
    stockQuantity: 35,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewsCount: 122,
    isBestSeller: 1,
    isSeasonal: 1,
    badge: "ANTIOXIDANT",
    description: "Plump, deep blue berries with a natural bloom. Bursting with sweet-tart natural flavor."
  },
  {
    name: "Free-Range Farm Eggs",
    category: "Dairy",
    price: 5.20,
    originalPrice: 6.00,
    unit: "per dozen",
    stockQuantity: 64,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewsCount: 168,
    isBestSeller: 1,
    isSeasonal: 0,
    badge: "FREE RANGE",
    description: "Grade-A large brown eggs from pasture-raised hens with bright golden yolks and firm whites."
  },
  {
    name: "Sweet Vine Cherry Tomatoes",
    category: "Vegetables",
    price: 3.40,
    originalPrice: 4.20,
    unit: "per pack",
    stockQuantity: 42,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    rating: 4.7,
    reviewsCount: 55,
    isBestSeller: 0,
    isSeasonal: 1,
    badge: "SWEET & CRISP",
    description: "Clusters of vibrant red vine tomatoes with concentrated sun sweetness and snappy thin skins."
  },
  {
    name: "Artisanal Sourdough Loaf",
    category: "Grains",
    price: 6.50,
    originalPrice: 7.50,
    unit: "per loaf",
    stockQuantity: 18,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    rating: 5.0,
    reviewsCount: 94,
    isBestSeller: 1,
    isSeasonal: 0,
    badge: "ARTISAN",
    description: "36-hour slow-fermented crusty sourdough bread made with organic unbleached wheat flour and spring water."
  },
  {
    name: "Cold-Pressed Extra Virgin Olive Oil",
    category: "Grains",
    price: 14.50,
    originalPrice: 18.00,
    unit: "per bottle (500ml)",
    stockQuantity: 22,
    inStock: 1,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    rating: 4.9,
    reviewsCount: 82,
    isBestSeller: 1,
    isSeasonal: 0,
    badge: "PREMIUM",
    description: "Single-estate early-harvest extra virgin olive oil with peppery finish and high polyphenol content."
  }
];

function seedInitialData() {
  const insertStmt = db.prepare(`
    INSERT INTO groceries (
      id, name, category, price, originalPrice, unit,
      stockQuantity, inStock, imageUrl, rating, reviewsCount,
      isBestSeller, isSeasonal, badge, description, createdAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  const now = new Date().toISOString();
  for (const item of SAMPLE_GROCERIES) {
    const id = crypto.randomUUID();
    insertStmt.run(
      id,
      item.name,
      item.category,
      item.price,
      item.originalPrice || null,
      item.unit,
      item.stockQuantity,
      item.stockQuantity > 0 ? 1 : 0,
      item.imageUrl,
      item.rating || 5.0,
      item.reviewsCount || 50,
      item.isBestSeller ? 1 : 0,
      item.isSeasonal ? 1 : 0,
      item.badge || null,
      item.description || '',
      now
    );
  }
}

function resetSampleData() {
  db.exec('DELETE FROM groceries;');
  seedInitialData();
  return { success: true, count: SAMPLE_GROCERIES.length };
}

// Queries
function getAllGroceries(filters = {}) {
  let query = 'SELECT * FROM groceries WHERE 1=1';
  const params = [];

  if (filters.category && filters.category !== 'All') {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters.search && filters.search.trim()) {
    query += ' AND (name LIKE ? OR category LIKE ? OR description LIKE ?)';
    const term = `%${filters.search.trim()}%`;
    params.push(term, term, term);
  }

  if (filters.stockStatus) {
    if (filters.stockStatus === 'in_stock') {
      query += ' AND inStock = 1 AND stockQuantity > 0';
    } else if (filters.stockStatus === 'low_stock') {
      query += ' AND inStock = 1 AND stockQuantity <= 10 AND stockQuantity > 0';
    } else if (filters.stockStatus === 'out_of_stock') {
      query += ' AND (inStock = 0 OR stockQuantity <= 0)';
    }
  }

  if (filters.filter) {
    if (filters.filter === 'best_sellers') {
      query += ' AND isBestSeller = 1';
    } else if (filters.filter === 'seasonal') {
      query += ' AND isSeasonal = 1';
    }
  }

  // Sorting
  if (filters.sort === 'price_asc') {
    query += ' ORDER BY price ASC';
  } else if (filters.sort === 'price_desc') {
    query += ' ORDER BY price DESC';
  } else if (filters.sort === 'rating') {
    query += ' ORDER BY rating DESC';
  } else if (filters.sort === 'name') {
    query += ' ORDER BY name ASC';
  } else if (filters.sort === 'stock') {
    query += ' ORDER BY stockQuantity ASC';
  } else {
    // Default: Best sellers first, then recently added
    query += ' ORDER BY isBestSeller DESC, createdAt DESC';
  }

  const rows = db.prepare(query).all(...params);
  // Transform sqlite 1/0 integers to booleans
  return rows.map(r => ({
    ...r,
    inStock: Boolean(r.inStock),
    isBestSeller: Boolean(r.isBestSeller),
    isSeasonal: Boolean(r.isSeasonal)
  }));
}

function getGroceryById(id) {
  const row = db.prepare('SELECT * FROM groceries WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    inStock: Boolean(row.inStock),
    isBestSeller: Boolean(row.isBestSeller),
    isSeasonal: Boolean(row.isSeasonal)
  };
}

function createGrocery(data) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const stockQuantity = parseInt(data.stockQuantity, 10) || 0;
  const inStock = stockQuantity > 0 ? 1 : 0;
  const price = parseFloat(data.price) || 0;
  const originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
  const rating = parseFloat(data.rating) || 5.0;
  const reviewsCount = parseInt(data.reviewsCount, 10) || 1;
  const isBestSeller = data.isBestSeller ? 1 : 0;
  const isSeasonal = data.isSeasonal ? 1 : 0;

  const stmt = db.prepare(`
    INSERT INTO groceries (
      id, name, category, price, originalPrice, unit,
      stockQuantity, inStock, imageUrl, rating, reviewsCount,
      isBestSeller, isSeasonal, badge, description, createdAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    id,
    data.name.trim(),
    data.category.trim(),
    price,
    originalPrice,
    data.unit.trim() || 'per item',
    stockQuantity,
    inStock,
    data.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    rating,
    reviewsCount,
    isBestSeller,
    isSeasonal,
    data.badge || (isBestSeller ? 'BESTSELLER' : null),
    data.description || '',
    now
  );

  return getGroceryById(id);
}

function updateGrocery(id, data) {
  const existing = getGroceryById(id);
  if (!existing) return null;

  const name = data.name !== undefined ? data.name.trim() : existing.name;
  const category = data.category !== undefined ? data.category.trim() : existing.category;
  const price = data.price !== undefined ? parseFloat(data.price) : existing.price;
  const originalPrice = data.originalPrice !== undefined ? (data.originalPrice ? parseFloat(data.originalPrice) : null) : existing.originalPrice;
  const unit = data.unit !== undefined ? data.unit.trim() : existing.unit;
  const stockQuantity = data.stockQuantity !== undefined ? parseInt(data.stockQuantity, 10) : existing.stockQuantity;
  const inStock = stockQuantity > 0 ? 1 : 0;
  const imageUrl = data.imageUrl !== undefined ? data.imageUrl.trim() : existing.imageUrl;
  const rating = data.rating !== undefined ? parseFloat(data.rating) : existing.rating;
  const reviewsCount = data.reviewsCount !== undefined ? parseInt(data.reviewsCount, 10) : existing.reviewsCount;
  const isBestSeller = data.isBestSeller !== undefined ? (data.isBestSeller ? 1 : 0) : (existing.isBestSeller ? 1 : 0);
  const isSeasonal = data.isSeasonal !== undefined ? (data.isSeasonal ? 1 : 0) : (existing.isSeasonal ? 1 : 0);
  const badge = data.badge !== undefined ? data.badge : existing.badge;
  const description = data.description !== undefined ? data.description : existing.description;

  const stmt = db.prepare(`
    UPDATE groceries SET
      name = ?,
      category = ?,
      price = ?,
      originalPrice = ?,
      unit = ?,
      stockQuantity = ?,
      inStock = ?,
      imageUrl = ?,
      rating = ?,
      reviewsCount = ?,
      isBestSeller = ?,
      isSeasonal = ?,
      badge = ?,
      description = ?
    WHERE id = ?
  `);

  stmt.run(
    name,
    category,
    price,
    originalPrice,
    unit,
    stockQuantity,
    inStock,
    imageUrl,
    rating,
    reviewsCount,
    isBestSeller,
    isSeasonal,
    badge,
    description,
    id
  );

  return getGroceryById(id);
}

function adjustStock(id, delta) {
  const existing = getGroceryById(id);
  if (!existing) return null;

  let newQuantity = existing.stockQuantity + delta;
  if (newQuantity < 0) newQuantity = 0;
  const inStock = newQuantity > 0 ? 1 : 0;

  db.prepare('UPDATE groceries SET stockQuantity = ?, inStock = ? WHERE id = ?').run(newQuantity, inStock, id);
  return getGroceryById(id);
}

function deleteGrocery(id) {
  const existing = getGroceryById(id);
  if (!existing) return false;
  db.prepare('DELETE FROM groceries WHERE id = ?').run(id);
  return true;
}

function getCategoriesWithCounts() {
  const rows = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM groceries 
    GROUP BY category 
    ORDER BY count DESC
  `).all();
  return rows;
}

function getStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM groceries').get().count;
  const lowStock = db.prepare('SELECT COUNT(*) as count FROM groceries WHERE inStock = 1 AND stockQuantity <= 10 AND stockQuantity > 0').get().count;
  const outOfStock = db.prepare('SELECT COUNT(*) as count FROM groceries WHERE inStock = 0 OR stockQuantity <= 0').get().count;
  const totalStockQuantity = db.prepare('SELECT SUM(stockQuantity) as sum FROM groceries').get().sum || 0;
  const bestSellers = db.prepare('SELECT COUNT(*) as count FROM groceries WHERE isBestSeller = 1').get().count;
  const seasonal = db.prepare('SELECT COUNT(*) as count FROM groceries WHERE isSeasonal = 1').get().count;

  return {
    totalProducts: total,
    lowStockCount: lowStock,
    outOfStockCount: outOfStock,
    totalStockQuantity,
    bestSellersCount: bestSellers,
    seasonalCount: seasonal
  };
}

module.exports = {
  initDatabase,
  getAllGroceries,
  getGroceryById,
  createGrocery,
  updateGrocery,
  adjustStock,
  deleteGrocery,
  getCategoriesWithCounts,
  getStats,
  resetSampleData
};
