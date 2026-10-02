const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const dbPath = path.join(__dirname, 'grocery.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance
db.exec('PRAGMA journal_mode = WAL;');

// Load built-in 15 popular grocery items from groceries.json
let SAMPLE_GROCERIES = [];
try {
  const jsonPath = path.join(__dirname, 'groceries.json');
  if (fs.existsSync(jsonPath)) {
    SAMPLE_GROCERIES = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
} catch (err) {
  console.warn('Could not read groceries.json, fallback array will be used:', err);
}

// Fallback in case groceries.json is missing or empty
if (!SAMPLE_GROCERIES || SAMPLE_GROCERIES.length === 0) {
  SAMPLE_GROCERIES = [
    {
      id: "item-1-strawberry",
      name: "Organic Strawberries",
      category: "Strawberry / Fruits",
      price: 12.00,
      originalPrice: 15.00,
      unit: "kg",
      stockQuantity: 45,
      lowStockAlert: 10,
      imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
      rating: 4.9,
      reviewsCount: 142,
      isBestSeller: true,
      isSeasonal: true,
      badge: "BESTSELLER",
      description: "Sweet, juicy organic strawberries freshly picked from local eco-farms. Packed with antioxidants and vitamin C."
    },
    {
      id: "item-2-apple",
      name: "Honeycrisp Fresh Apples",
      category: "Apple",
      price: 4.50,
      originalPrice: 6.00,
      unit: "kg",
      stockQuantity: 88,
      lowStockAlert: 15,
      imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
      rating: 4.8,
      reviewsCount: 96,
      isBestSeller: true,
      isSeasonal: false,
      badge: "FRESH",
      description: "Crisp, sweet, and bursting with cider-like crunch. Ideal for snacking, baking, and fresh salads."
    },
    {
      id: "item-3-orange",
      name: "Sweet Valencia Oranges",
      category: "Orange",
      price: 3.80,
      originalPrice: 4.90,
      unit: "kg",
      stockQuantity: 32,
      lowStockAlert: 10,
      imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80",
      rating: 4.7,
      reviewsCount: 64,
      isBestSeller: false,
      isSeasonal: true,
      badge: "JUICY",
      description: "Sun-ripened Valencia oranges loaded with natural sweetness and high juice yield for daily morning hydration."
    },
    {
      id: "item-4-carrot",
      name: "Crisp Organic Carrots",
      category: "Carrot",
      price: 2.50,
      originalPrice: 3.20,
      unit: "bunch",
      stockQuantity: 60,
      lowStockAlert: 12,
      imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80",
      rating: 4.9,
      reviewsCount: 88,
      isBestSeller: true,
      isSeasonal: false,
      badge: "ORGANIC",
      description: "Crunchy, sweet farm carrots with healthy greens attached. Rich in beta-carotene and essential vitamins."
    },
    {
      id: "item-5-potato",
      name: "Farm Russet Potatoes",
      category: "Potato",
      price: 3.20,
      originalPrice: 4.00,
      unit: "kg",
      stockQuantity: 115,
      lowStockAlert: 20,
      imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
      rating: 4.6,
      reviewsCount: 52,
      isBestSeller: false,
      isSeasonal: false,
      badge: "PANTRY",
      description: "Hearty, starchy russet potatoes suitable for fluffy mashed potatoes, roasting, or homemade french fries."
    },
    {
      id: "item-6-onion",
      name: "Organic Golden Onions",
      category: "Grains",
      price: 2.90,
      originalPrice: 3.50,
      unit: "kg",
      stockQuantity: 74,
      lowStockAlert: 15,
      imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80",
      rating: 4.7,
      reviewsCount: 48,
      isBestSeller: false,
      isSeasonal: false,
      badge: "FARM PICK",
      description: "Fragrant yellow sweet onions, foundational aromatic for stews, stir fries, roasts, and savory dishes."
    },
    {
      id: "item-7-oats",
      name: "Artisan Whole Rolled Oats",
      category: "Grains",
      price: 5.40,
      originalPrice: 6.80,
      unit: "pack",
      stockQuantity: 40,
      lowStockAlert: 10,
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
      rating: 4.8,
      reviewsCount: 110,
      isBestSeller: true,
      isSeasonal: false,
      badge: "FIBER RICH",
      description: "Stone-milled whole oats and mixed multi-grains. High in dietary fiber, low GI, and heart-healthy."
    },
    {
      id: "item-8-broccoli",
      name: "Fresh Broccoli Crowns",
      category: "Vegetables",
      price: 3.50,
      originalPrice: 4.50,
      unit: "bunch",
      stockQuantity: 28,
      lowStockAlert: 8,
      imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80",
      rating: 4.8,
      reviewsCount: 79,
      isBestSeller: true,
      isSeasonal: false,
      badge: "SUPERFOOD",
      description: "Tender, vibrant green florets loaded with vitamins K and C. Harvested cold to preserve maximum crispness."
    },
    {
      id: "item-9-milk",
      name: "Organic Pasture Whole Milk",
      category: "Dairy",
      price: 4.20,
      originalPrice: 5.00,
      unit: "liter",
      stockQuantity: 52,
      lowStockAlert: 10,
      imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
      rating: 4.9,
      reviewsCount: 135,
      isBestSeller: true,
      isSeasonal: false,
      badge: "100% PURE",
      description: "Pasteurized, non-homogenized whole milk from grass-fed cows. Creamy, nutrient dense, and clean."
    },
    {
      id: "item-10-avocado",
      name: "Ripe Hass Avocados",
      category: "Vegetables",
      price: 6.00,
      originalPrice: 8.00,
      unit: "pack (3 pcs)",
      stockQuantity: 6,
      lowStockAlert: 10,
      imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
      rating: 5.0,
      reviewsCount: 210,
      isBestSeller: true,
      isSeasonal: true,
      badge: "LOW STOCK",
      description: "Buttery, rich Hass avocados with dark pebbled skin. Perfect for guacamole, toasts, and salads."
    },
    {
      id: "item-11-spinach",
      name: "Tender Baby Spinach",
      category: "Vegetables",
      price: 3.90,
      originalPrice: 4.80,
      unit: "pack",
      stockQuantity: 4,
      lowStockAlert: 10,
      imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
      rating: 4.8,
      reviewsCount: 67,
      isBestSeller: false,
      isSeasonal: true,
      badge: "LOW STOCK",
      description: "Pre-washed tender baby spinach leaves. Mild, sweet flavor ideal for green smoothies or sautéing."
    },
    {
      id: "item-12-blueberries",
      name: "Wild Mountain Blueberries",
      category: "Strawberry / Fruits",
      price: 5.80,
      originalPrice: 7.20,
      unit: "pack",
      stockQuantity: 35,
      lowStockAlert: 10,
      imageUrl: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80",
      rating: 4.9,
      reviewsCount: 122,
      isBestSeller: true,
      isSeasonal: true,
      badge: "ANTIOXIDANT",
      description: "Plump, deep blue berries with a natural bloom. Bursting with sweet-tart natural flavor."
    },
    {
      id: "item-13-eggs",
      name: "Free-Range Farm Eggs",
      category: "Dairy",
      price: 5.20,
      originalPrice: 6.00,
      unit: "dozen",
      stockQuantity: 64,
      lowStockAlert: 12,
      imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80",
      rating: 4.9,
      reviewsCount: 168,
      isBestSeller: true,
      isSeasonal: false,
      badge: "FREE RANGE",
      description: "Grade-A large brown eggs from pasture-raised hens with bright golden yolks and firm whites."
    },
    {
      id: "item-14-tomatoes",
      name: "Sweet Vine Cherry Tomatoes",
      category: "Vegetables",
      price: 3.40,
      originalPrice: 4.20,
      unit: "pack",
      stockQuantity: 42,
      lowStockAlert: 10,
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
      rating: 4.7,
      reviewsCount: 55,
      isBestSeller: false,
      isSeasonal: true,
      badge: "SWEET & CRISP",
      description: "Clusters of vibrant red vine tomatoes with concentrated sun sweetness and snappy thin skins."
    },
    {
      id: "item-15-sourdough",
      name: "Artisanal Sourdough Loaf",
      category: "Grains",
      price: 6.50,
      originalPrice: 7.50,
      unit: "loaf",
      stockQuantity: 18,
      lowStockAlert: 8,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
      rating: 5.0,
      reviewsCount: 94,
      isBestSeller: true,
      isSeasonal: false,
      badge: "ARTISAN",
      description: "36-hour slow-fermented crusty sourdough bread made with organic unbleached wheat flour and spring water."
    }
  ];
}

// Initialize Tables and run migrations
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
      lowStockAlert INTEGER NOT NULL DEFAULT 10,
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

  // Ensure lowStockAlert column exists if table existed previously
  try {
    const cols = db.prepare("PRAGMA table_info(groceries)").all();
    const hasLowStockAlert = cols.some(c => c.name === 'lowStockAlert');
    if (!hasLowStockAlert) {
      db.exec("ALTER TABLE groceries ADD COLUMN lowStockAlert INTEGER NOT NULL DEFAULT 10;");
    }
  } catch (err) {
    console.warn('PRAGMA table_info check warning:', err);
  }

  // Check if table has data; if empty, seed with initial mock data
  const countRow = db.prepare('SELECT COUNT(*) as count FROM groceries').get();
  if (countRow.count === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  const insertStmt = db.prepare(`
    INSERT INTO groceries (
      id, name, category, price, originalPrice, unit,
      stockQuantity, inStock, lowStockAlert, imageUrl, rating, reviewsCount,
      isBestSeller, isSeasonal, badge, description, createdAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  const now = new Date().toISOString();
  for (const item of SAMPLE_GROCERIES) {
    const id = item.id || crypto.randomUUID();
    const stockQuantity = Math.max(0, parseInt(item.stockQuantity, 10) || 0);
    const lowStockAlert = item.lowStockAlert !== undefined && item.lowStockAlert !== null ? Math.max(0, parseInt(item.lowStockAlert, 10)) : 10;
    insertStmt.run(
      id,
      item.name,
      item.category,
      parseFloat(item.price) || 0,
      item.originalPrice ? parseFloat(item.originalPrice) : null,
      item.unit || 'kg',
      stockQuantity,
      stockQuantity > 0 ? 1 : 0,
      lowStockAlert,
      item.imageUrl,
      parseFloat(item.rating) || 5.0,
      parseInt(item.reviewsCount, 10) || 50,
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

// Row Formatter ensuring all fields are cleanly typed and present
function formatGroceryRow(row) {
  if (!row) return null;
  const stockQuantity = Math.max(0, parseInt(row.stockQuantity, 10) || 0);
  const lowStockAlert = row.lowStockAlert !== undefined && row.lowStockAlert !== null ? Math.max(0, parseInt(row.lowStockAlert, 10)) : 10;
  return {
    ...row,
    price: parseFloat(row.price) || 0,
    originalPrice: row.originalPrice !== null && row.originalPrice !== undefined ? parseFloat(row.originalPrice) : null,
    stockQuantity,
    lowStockAlert,
    inStock: Boolean(row.inStock && stockQuantity > 0),
    isLowStock: Boolean(stockQuantity > 0 && stockQuantity <= lowStockAlert),
    isBestSeller: Boolean(row.isBestSeller),
    isSeasonal: Boolean(row.isSeasonal)
  };
}

// Fallback in-memory filter in case of sqlite errors
function getFallbackFilteredGroceries(filters = {}) {
  let items = SAMPLE_GROCERIES.map((item, index) => formatGroceryRow({
    ...item,
    id: item.id || `sample-${index + 1}`,
    createdAt: new Date().toISOString()
  }));

  const rawCategory = filters.category !== undefined && filters.category !== null ? String(filters.category).trim() : '';
  const rawFilter = filters.filter !== undefined && filters.filter !== null ? String(filters.filter).trim() : '';
  const rawSearch = filters.search !== undefined && filters.search !== null ? String(filters.search).trim() : '';
  const rawStockStatus = filters.stockStatus !== undefined && filters.stockStatus !== null ? String(filters.stockStatus).trim() : '';
  const isBestSellerFlag = filters.isBestSeller === true || filters.isBestSeller === 'true' || filters.isBestSeller === 1 || filters.isBestSeller === '1';
  const isSeasonalFlag = filters.isSeasonal === true || filters.isSeasonal === 'true' || filters.isSeasonal === 1 || filters.isSeasonal === '1';
  const inStockFlag = filters.inStock === true || filters.inStock === 'true' || filters.inStock === 1 || filters.inStock === '1';

  const isCategoryBestSeller = ['bestsellers', 'best_sellers', 'bestseller', 'best-sellers', 'best sellers'].includes(rawCategory.toLowerCase());
  const isCategorySeasonal = ['seasonal', 'seasonal_offers', 'seasonal-offers', 'seasonal offers'].includes(rawCategory.toLowerCase());

  const isFilterBestSeller = ['bestsellers', 'best_sellers', 'bestseller', 'best-sellers', 'best sellers'].includes(rawFilter.toLowerCase());
  const isFilterSeasonal = ['seasonal', 'seasonal_offers', 'seasonal-offers', 'seasonal offers'].includes(rawFilter.toLowerCase());

  if (isBestSellerFlag || isCategoryBestSeller || isFilterBestSeller) {
    items = items.filter(item => item.isBestSeller);
  }

  if (isSeasonalFlag || isCategorySeasonal || isFilterSeasonal) {
    items = items.filter(item => item.isSeasonal);
  }

  const isAllCategory = !rawCategory || ['all', 'all items', 'all aisles', 'all_items', 'all categories', '*'].includes(rawCategory.toLowerCase());

  if (!isAllCategory && !isCategoryBestSeller && !isCategorySeasonal) {
    const catLower = rawCategory.toLowerCase();
    items = items.filter(item => item.category.toLowerCase().includes(catLower));
  }

  if (inStockFlag || rawStockStatus === 'in_stock' || rawFilter === 'in_stock' || rawFilter === 'instock') {
    items = items.filter(item => item.inStock && item.stockQuantity > 0);
  } else if (rawStockStatus === 'low_stock' || rawFilter === 'low_stock' || rawFilter === 'lowstock') {
    items = items.filter(item => item.isLowStock);
  } else if (rawStockStatus === 'out_of_stock' || rawFilter === 'out_of_stock' || rawFilter === 'outofstock') {
    items = items.filter(item => !item.inStock || item.stockQuantity <= 0);
  }

  if (rawSearch) {
    const searchLower = rawSearch.toLowerCase();
    items = items.filter(item =>
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.category && item.category.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  }

  return items;
}

// Queries
function getAllGroceries(filters = {}) {
  try {
    let query = 'SELECT * FROM groceries WHERE 1=1';
    const params = [];

    // Normalize parameter inputs safely
    const rawCategory = filters && filters.category !== undefined && filters.category !== null ? String(filters.category).trim() : '';
    const rawFilter = filters && filters.filter !== undefined && filters.filter !== null ? String(filters.filter).trim() : '';
    const rawSearch = filters && filters.search !== undefined && filters.search !== null ? String(filters.search).trim() : '';
    const rawStockStatus = filters && filters.stockStatus !== undefined && filters.stockStatus !== null ? String(filters.stockStatus).trim() : '';
    const rawSort = filters && filters.sort !== undefined && filters.sort !== null ? String(filters.sort).trim() : '';

    // Boolean flags
    const isBestSellerFlag = filters && (filters.isBestSeller === true || filters.isBestSeller === 'true' || filters.isBestSeller === 1 || filters.isBestSeller === '1');
    const isSeasonalFlag = filters && (filters.isSeasonal === true || filters.isSeasonal === 'true' || filters.isSeasonal === 1 || filters.isSeasonal === '1');
    const inStockFlag = filters && (filters.inStock === true || filters.inStock === 'true' || filters.inStock === 1 || filters.inStock === '1');

    const isCategoryBestSeller = ['bestsellers', 'best_sellers', 'bestseller', 'best-sellers', 'best sellers'].includes(rawCategory.toLowerCase());
    const isCategorySeasonal = ['seasonal', 'seasonal_offers', 'seasonal-offers', 'seasonal offers'].includes(rawCategory.toLowerCase());

    const isFilterBestSeller = ['bestsellers', 'best_sellers', 'bestseller', 'best-sellers', 'best sellers'].includes(rawFilter.toLowerCase());
    const isFilterSeasonal = ['seasonal', 'seasonal_offers', 'seasonal-offers', 'seasonal offers'].includes(rawFilter.toLowerCase());

    // 1. Handle Best Seller filter
    if (isBestSellerFlag || isCategoryBestSeller || isFilterBestSeller) {
      query += ' AND isBestSeller = 1';
    }

    // 2. Handle Seasonal filter
    if (isSeasonalFlag || isCategorySeasonal || isFilterSeasonal) {
      query += ' AND isSeasonal = 1';
    }

    // 3. Handle Category filter
    const isAllCategory = !rawCategory || ['all', 'all items', 'all aisles', 'all_items', 'all categories', '*'].includes(rawCategory.toLowerCase());

    if (!isAllCategory && !isCategoryBestSeller && !isCategorySeasonal) {
      query += ' AND (LOWER(category) = LOWER(?) OR category LIKE ?)';
      params.push(rawCategory, `%${rawCategory}%`);
    }

    // 4. Handle Stock Status / Low Stock
    if (inStockFlag || rawStockStatus === 'in_stock' || rawFilter === 'in_stock' || rawFilter === 'instock') {
      query += ' AND inStock = 1 AND stockQuantity > 0';
    } else if (rawStockStatus === 'low_stock' || rawFilter === 'low_stock' || rawFilter === 'lowstock') {
      query += ' AND inStock = 1 AND stockQuantity <= lowStockAlert AND stockQuantity > 0';
    } else if (rawStockStatus === 'out_of_stock' || rawFilter === 'out_of_stock' || rawFilter === 'outofstock') {
      query += ' AND (inStock = 0 OR stockQuantity <= 0)';
    }

    // 5. Handle Search
    if (rawSearch) {
      query += ' AND (name LIKE ? OR category LIKE ? OR description LIKE ?)';
      const term = `%${rawSearch}%`;
      params.push(term, term, term);
    }

    // 6. Sorting
    if (rawSort === 'price_asc') {
      query += ' ORDER BY price ASC';
    } else if (rawSort === 'price_desc') {
      query += ' ORDER BY price DESC';
    } else if (rawSort === 'rating') {
      query += ' ORDER BY rating DESC';
    } else if (rawSort === 'name') {
      query += ' ORDER BY name ASC';
    } else if (rawSort === 'stock') {
      query += ' ORDER BY stockQuantity ASC';
    } else {
      query += ' ORDER BY isBestSeller DESC, createdAt DESC';
    }

    const rows = db.prepare(query).all(...params);
    return rows.map(formatGroceryRow);
  } catch (error) {
    console.error('Error executing query in getAllGroceries, falling back to safe sample data:', error);
    return getFallbackFilteredGroceries(filters);
  }
}

function getGroceryById(id) {
  const row = db.prepare('SELECT * FROM groceries WHERE id = ?').get(id);
  return formatGroceryRow(row);
}

function createGrocery(data) {
  const id = data.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const stockQuantity = parseInt(data.stockQuantity, 10) >= 0 ? parseInt(data.stockQuantity, 10) : 0;
  const lowStockAlert = data.lowStockAlert !== undefined && data.lowStockAlert !== null ? Math.max(0, parseInt(data.lowStockAlert, 10)) : 10;
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
      stockQuantity, inStock, lowStockAlert, imageUrl, rating, reviewsCount,
      isBestSeller, isSeasonal, badge, description, createdAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    id,
    String(data.name || '').trim(),
    String(data.category || '').trim(),
    price,
    originalPrice,
    String(data.unit || 'kg').trim(),
    stockQuantity,
    inStock,
    lowStockAlert,
    String(data.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80').trim(),
    rating,
    reviewsCount,
    isBestSeller,
    isSeasonal,
    data.badge ? String(data.badge).trim() : (isBestSeller ? 'BESTSELLER' : null),
    String(data.description || '').trim(),
    now
  );

  return getGroceryById(id);
}

function updateGrocery(id, data) {
  const existing = getGroceryById(id);
  if (!existing) return null;

  const name = data.name !== undefined ? String(data.name).trim() : existing.name;
  const category = data.category !== undefined ? String(data.category).trim() : existing.category;
  const price = data.price !== undefined ? parseFloat(data.price) : existing.price;
  const originalPrice = data.originalPrice !== undefined ? (data.originalPrice ? parseFloat(data.originalPrice) : null) : existing.originalPrice;
  const unit = data.unit !== undefined ? String(data.unit).trim() : existing.unit;
  const stockQuantity = data.stockQuantity !== undefined ? Math.max(0, parseInt(data.stockQuantity, 10)) : existing.stockQuantity;
  const lowStockAlert = data.lowStockAlert !== undefined ? Math.max(0, parseInt(data.lowStockAlert, 10)) : (existing.lowStockAlert || 10);
  const inStock = stockQuantity > 0 ? 1 : 0;
  const imageUrl = data.imageUrl !== undefined ? String(data.imageUrl).trim() : existing.imageUrl;
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
      lowStockAlert = ?,
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
    lowStockAlert,
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

function setStock(id, newQuantity) {
  const existing = getGroceryById(id);
  if (!existing) return null;

  let qty = parseInt(newQuantity, 10);
  if (isNaN(qty) || qty < 0) qty = 0;
  const inStock = qty > 0 ? 1 : 0;

  db.prepare('UPDATE groceries SET stockQuantity = ?, inStock = ? WHERE id = ?').run(qty, inStock, id);
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
  const lowStock = db.prepare('SELECT COUNT(*) as count FROM groceries WHERE inStock = 1 AND stockQuantity <= lowStockAlert AND stockQuantity > 0').get().count;
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
  SAMPLE_GROCERIES,
  initDatabase,
  getAllGroceries,
  getGroceryById,
  createGrocery,
  updateGrocery,
  adjustStock,
  setStock,
  deleteGrocery,
  getCategoriesWithCounts,
  getStats,
  resetSampleData
};
