/**
 * GRONERY - Modern Grocery E-Commerce & Inventory Management System
 * Client Application Logic
 */

// ==================== STATE ====================
const state = {
  groceries: [],
  categories: [],
  stats: {
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalStockQuantity: 0,
    bestSellersCount: 0,
    seasonalCount: 0
  },
  cart: JSON.parse(localStorage.getItem('gronery_cart') || '[]'),
  favorites: JSON.parse(localStorage.getItem('gronery_favorites') || '[]'),
  activeCategory: 'All',
  activeFilter: 'all',
  searchQuery: '',
  sortBy: 'default',
  isAdminMode: localStorage.getItem('gronery_admin_mode') === 'true',
  appliedCoupon: null,
  editingItemId: null
};

// Category Configuration (Pixel-matching Dribbble cards & icons)
const CATEGORY_CONFIG = [
  { name: 'All', label: 'All Aisles', icon: '🛒', className: 'cat-card-all', fallbackCount: 16 },
  { name: 'Grains', label: 'Grains & Pantry', icon: '🌾', className: 'cat-card-grains', fallbackCount: 82 },
  { name: 'Vegetables', label: 'Fresh Vegetables', icon: '🥦', className: 'cat-card-vegetables', fallbackCount: 215 },
  { name: 'Strawberry / Fruits', label: 'Strawberry & Fruits', icon: '🍓', className: 'cat-card-fruits', fallbackCount: 140 },
  { name: 'Apple', label: 'Crisp Apples', icon: '🍎', className: 'cat-card-apple', fallbackCount: 65 },
  { name: 'Orange', label: 'Sweet Oranges', icon: '🍊', className: 'cat-card-orange', fallbackCount: 48 },
  { name: 'Potato', label: 'Farm Potatoes', icon: '🥔', className: 'cat-card-potato', fallbackCount: 90 },
  { name: 'Carrot', label: 'Organic Carrots', icon: '🥕', className: 'cat-card-carrot', fallbackCount: 54 },
  { name: 'Dairy', label: 'Dairy & Eggs', icon: '🥛', className: 'cat-card-dairy', fallbackCount: 35 }
];

// ==================== MOCK GROCERY DATASET & FALLBACKS ====================
const MOCK_GROCERIES = [
  {
    id: "item-1-strawberry",
    name: "Organic Strawberries",
    category: "Strawberry / Fruits",
    price: 12.00,
    originalPrice: 15.00,
    unit: "kg",
    stockQuantity: 45,
    lowStockAlert: 10,
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
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
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    rating: 5.0,
    reviewsCount: 94,
    isBestSeller: true,
    isSeasonal: false,
    badge: "ARTISAN",
    description: "36-hour slow-fermented crusty sourdough bread made with organic unbleached wheat flour and spring water."
  }
];

function getFilteredMockGroceries(category = null, filter = null, search = null, sort = null) {
  let items = [...MOCK_GROCERIES];

  const catStr = category !== null ? String(category).trim() : (state.activeCategory || 'All');
  const filterStr = filter !== null ? String(filter).trim() : (state.activeFilter || 'all');
  const searchStr = search !== null ? String(search).trim() : (state.searchQuery || '');
  const sortStr = sort !== null ? String(sort).trim() : (state.sortBy || 'default');

  // Check Category-specific special aliases
  const isCategoryBestSeller = ['bestsellers', 'best_sellers', 'bestseller', 'best-sellers', 'best sellers'].includes(catStr.toLowerCase());
  const isCategorySeasonal = ['seasonal', 'seasonal_offers', 'seasonal-offers', 'seasonal offers'].includes(catStr.toLowerCase());

  // Check Filter-specific special aliases
  const isFilterBestSeller = ['best_sellers', 'bestsellers', 'bestseller', 'best-sellers', 'best sellers'].includes(filterStr.toLowerCase());
  const isFilterSeasonal = ['seasonal', 'seasonal_offers', 'seasonal-offers', 'seasonal offers'].includes(filterStr.toLowerCase());

  if (isCategoryBestSeller || isFilterBestSeller) {
    items = items.filter(i => i.isBestSeller);
  }
  if (isCategorySeasonal || isFilterSeasonal) {
    items = items.filter(i => i.isSeasonal);
  }

  // Filter by category if not All, and not a special category alias
  const isAllCat = !catStr || ['all', 'all items', 'all aisles', 'all_items', 'all categories', '*'].includes(catStr.toLowerCase());
  if (!isAllCat && !isCategoryBestSeller && !isCategorySeasonal) {
    const cLow = catStr.toLowerCase();
    items = items.filter(i => i.category.toLowerCase().includes(cLow));
  }

  // Filter by stock status
  if (filterStr === 'in_stock' || filterStr === 'instock') {
    items = items.filter(i => i.inStock && i.stockQuantity > 0);
  } else if (filterStr === 'low_stock' || filterStr === 'lowstock') {
    items = items.filter(i => {
      const alert = i.lowStockAlert !== undefined ? i.lowStockAlert : 10;
      return i.inStock && i.stockQuantity <= alert && i.stockQuantity > 0;
    });
  } else if (filterStr === 'out_of_stock' || filterStr === 'outofstock') {
    items = items.filter(i => !i.inStock || i.stockQuantity <= 0);
  }

  // Filter by search
  if (searchStr) {
    const sLow = searchStr.toLowerCase();
    items = items.filter(i =>
      i.name.toLowerCase().includes(sLow) ||
      i.category.toLowerCase().includes(sLow) ||
      (i.description && i.description.toLowerCase().includes(sLow))
    );
  }

  // Sorting
  if (sortStr === 'price_asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (sortStr === 'price_desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (sortStr === 'rating') {
    items.sort((a, b) => b.rating - a.rating);
  } else if (sortStr === 'name') {
    items.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortStr === 'stock') {
    items.sort((a, b) => a.stockQuantity - b.stockQuantity);
  }

  // If search was empty and somehow 0 items matched, return all mock items so page is never empty
  if (items.length === 0 && !searchStr) {
    return MOCK_GROCERIES;
  }

  return items;
}

function getMockCategoriesWithCounts() {
  const counts = {};
  MOCK_GROCERIES.forEach(item => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });
  return Object.entries(counts).map(([category, count]) => ({ category, count }));
}

function getMockStats() {
  const total = MOCK_GROCERIES.length;
  const lowStock = MOCK_GROCERIES.filter(i => {
    const alert = i.lowStockAlert !== undefined ? i.lowStockAlert : 10;
    return i.inStock && i.stockQuantity <= alert && i.stockQuantity > 0;
  }).length;
  const outOfStock = MOCK_GROCERIES.filter(i => !i.inStock || i.stockQuantity <= 0).length;
  const totalStockQuantity = MOCK_GROCERIES.reduce((sum, i) => sum + i.stockQuantity, 0);
  const bestSellers = MOCK_GROCERIES.filter(i => i.isBestSeller).length;
  const seasonal = MOCK_GROCERIES.filter(i => i.isSeasonal).length;

  return {
    totalProducts: total,
    lowStockCount: lowStock,
    outOfStockCount: outOfStock,
    totalStockQuantity,
    bestSellersCount: bestSellers,
    seasonalCount: seasonal
  };
}

// ==================== DOM ELEMENTS ====================
const elements = {
  // Admin & Header
  adminTopbar: document.getElementById('adminTopbar'),
  adminToggle: document.getElementById('adminToggle'),
  statTotalProducts: document.getElementById('statTotalProducts'),
  statTotalStock: document.getElementById('statTotalStock'),
  statLowStock: document.getElementById('statLowStock'),
  btnOpenAddModal: document.getElementById('btnOpenAddModal'),
  btnOpenInventoryTable: document.getElementById('btnOpenInventoryTable'),
  btnResetData: document.getElementById('btnResetData'),
  searchInput: document.getElementById('searchInput'),
  btnOpenFavorites: document.getElementById('btnOpenFavorites'),
  favCountBadge: document.getElementById('favCountBadge'),
  btnOpenCart: document.getElementById('btnOpenCart'),
  cartCountBadge: document.getElementById('cartCountBadge'),
  footerAdminLink: document.getElementById('footerAdminLink'),

  // Categories & Catalog
  categoriesGrid: document.getElementById('categoriesGrid'),
  categoryFilterBar: document.getElementById('categoryFilterBar'),
  categoryFilterText: document.getElementById('categoryFilterText'),
  btnClearCategoryFilter: document.getElementById('btnClearCategoryFilter'),
  categoryActivePill: document.getElementById('categoryActivePill'),
  filterPillsContainer: document.getElementById('filterPillsContainer'),
  sortSelector: document.getElementById('sortSelector'),
  productsGrid: document.getElementById('productsGrid'),
  catalogCount: document.getElementById('catalogCount'),
  btnClaimWeeklyDeal: document.getElementById('btnClaimWeeklyDeal'),
  btnExploreOrganic: document.getElementById('btnExploreOrganic'),
  dealTimer: document.getElementById('dealTimer'),

  // Drawers
  drawerBackdrop: document.getElementById('drawerBackdrop'),
  cartDrawer: document.getElementById('cartDrawer'),
  btnCloseCart: document.getElementById('btnCloseCart'),
  cartItemsList: document.getElementById('cartItemsList'),
  cartItemsCountText: document.getElementById('cartItemsCountText'),
  shippingProgressText: document.getElementById('shippingProgressText'),
  shippingProgressAmount: document.getElementById('shippingProgressAmount'),
  shippingProgressFill: document.getElementById('shippingProgressFill'),
  cartSubtotal: document.getElementById('cartSubtotal'),
  cartDelivery: document.getElementById('cartDelivery'),
  discountRow: document.getElementById('discountRow'),
  cartDiscount: document.getElementById('cartDiscount'),
  cartTax: document.getElementById('cartTax'),
  cartFinalTotal: document.getElementById('cartFinalTotal'),
  promoCodeInput: document.getElementById('promoCodeInput'),
  btnApplyCoupon: document.getElementById('btnApplyCoupon'),
  btnProceedCheckout: document.getElementById('btnProceedCheckout'),

  // Favorites
  favoritesDrawer: document.getElementById('favoritesDrawer'),
  btnCloseFavorites: document.getElementById('btnCloseFavorites'),
  favoritesItemsList: document.getElementById('favoritesItemsList'),
  favDrawerCount: document.getElementById('favDrawerCount'),
  favDrawerFooter: document.getElementById('favDrawerFooter'),
  btnAddAllFavoritesToCart: document.getElementById('btnAddAllFavoritesToCart'),

  // Modals
  groceryItemModal: document.getElementById('groceryItemModal'),
  groceryModalTitle: document.getElementById('groceryModalTitle'),
  btnCloseGroceryModal: document.getElementById('btnCloseGroceryModal'),
  btnCancelGroceryModal: document.getElementById('btnCancelGroceryModal'),
  groceryForm: document.getElementById('groceryForm'),
  formItemId: document.getElementById('formItemId'),
  formName: document.getElementById('formName'),
  formCategory: document.getElementById('formCategory'),
  formUnit: document.getElementById('formUnit'),
  formPrice: document.getElementById('formPrice'),
  formOriginalPrice: document.getElementById('formOriginalPrice'),
  formStock: document.getElementById('formStock'),
  formLowStockAlert: document.getElementById('formLowStockAlert'),
  formRating: document.getElementById('formRating'),
  formImageUrl: document.getElementById('formImageUrl'),
  formBadge: document.getElementById('formBadge'),
  formIsBestSeller: document.getElementById('formIsBestSeller'),
  formIsSeasonal: document.getElementById('formIsSeasonal'),
  formDescription: document.getElementById('formDescription'),

  // Inventory Table Modal
  inventoryTableModal: document.getElementById('inventoryTableModal'),
  btnCloseInventoryModal: document.getElementById('btnCloseInventoryModal'),
  btnCloseInvFooter: document.getElementById('btnCloseInvFooter'),
  inventoryTableBody: document.getElementById('inventoryTableBody'),
  invTotalBadge: document.getElementById('invTotalBadge'),
  invSearchInput: document.getElementById('invSearchInput'),
  btnInvFilterAll: document.getElementById('btnInvFilterAll'),
  btnInvFilterLow: document.getElementById('btnInvFilterLow'),
  btnInvAddNew: document.getElementById('btnInvAddNew'),

  // Success Modal & Toast
  checkoutSuccessModal: document.getElementById('checkoutSuccessModal'),
  btnCloseSuccessModal: document.getElementById('btnCloseSuccessModal'),
  successOrderNum: document.getElementById('successOrderNum'),
  successItemCount: document.getElementById('successItemCount'),
  successOrderTotal: document.getElementById('successOrderTotal'),
  toastContainer: document.getElementById('toastContainer')
};

// ==================== API HELPERS ====================
const API = {
  /**
   * Fetch groceries using relative API endpoint with query parameters
   * Gracefully handles filters, categories, search, sorting and falls back safely to mock groceries on error or empty response.
   */
  async getGroceries(customFilter = null, customCategory = null) {
    const selectedFilter = customFilter !== null ? customFilter : state.activeFilter;
    const selectedCategory = customCategory !== null ? customCategory : state.activeCategory;

    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory.toLowerCase() !== 'all') {
      params.append('category', selectedCategory);
    }
    if (state.searchQuery && state.searchQuery.trim()) {
      params.append('search', state.searchQuery.trim());
    }
    if (selectedFilter && selectedFilter.toLowerCase() !== 'all') {
      params.append('filter', selectedFilter);
    } else if (selectedFilter && selectedFilter.toLowerCase() === 'all') {
      params.append('filter', 'all');
    }
    if (state.sortBy && state.sortBy !== 'default') {
      params.append('sort', state.sortBy);
    }

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    // Always use relative URL instead of hardcoded host
    const relativeUrl = `/api/groceries${queryStr}`;

    try {
      const res = await fetch(relativeUrl);
      if (!res.ok) {
        console.warn(`Server returned HTTP ${res.status} for ${relativeUrl}. Falling back to mock grocery items.`);
        return {
          success: true,
          data: getFilteredMockGroceries(selectedCategory, selectedFilter, state.searchQuery, state.sortBy),
          fallback: true
        };
      }

      // Robust JSON parsing
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        return json;
      }

      // If data is empty or missing, safely fall back to mock grocery items rather than showing an error
      console.info(`API returned empty data for ${relativeUrl}. Falling back to mock grocery items.`);
      return {
        success: true,
        data: getFilteredMockGroceries(selectedCategory, selectedFilter, state.searchQuery, state.sortBy),
        fallback: true
      };
    } catch (err) {
      console.warn(`Network or parsing error for ${relativeUrl}, safely using mock grocery items:`, err);
      return {
        success: true,
        data: getFilteredMockGroceries(selectedCategory, selectedFilter, state.searchQuery, state.sortBy),
        fallback: true
      };
    }
  },

  async getCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        return json;
      }
      return { success: true, data: getMockCategoriesWithCounts() };
    } catch (err) {
      console.warn('Failed to fetch /api/categories, using fallback:', err);
      return { success: true, data: getMockCategoriesWithCounts() };
    }
  },

  async getStats() {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && json.data) {
        return json;
      }
      return { success: true, data: getMockStats() };
    } catch (err) {
      console.warn('Failed to fetch /api/stats, using fallback:', err);
      return { success: true, data: getMockStats() };
    }
  },

  async createGrocery(data) {
    try {
      const res = await fetch('/api/groceries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Error creating grocery:', err);
      return { success: false, error: err.message };
    }
  },

  async updateGrocery(id, data) {
    try {
      const res = await fetch(`/api/groceries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Error updating grocery:', err);
      return { success: false, error: err.message };
    }
  },

  async adjustStock(id, delta) {
    try {
      const res = await fetch(`/api/groceries/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
      return await res.json();
    } catch (err) {
      console.error('Error adjusting stock:', err);
      return { success: false, error: err.message };
    }
  },

  async deleteGrocery(id) {
    try {
      const res = await fetch(`/api/groceries/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.error('Error deleting grocery:', err);
      return { success: false, error: err.message };
    }
  },

  async resetSeedData() {
    try {
      const res = await fetch('/api/groceries/seed-reset', {
        method: 'POST'
      });
      return await res.json();
    } catch (err) {
      console.error('Error resetting seed data:', err);
      return { success: false, error: err.message };
    }
  }
};

// ==================== INITIALIZATION ====================
async function initApp() {
  setupEventListeners();
  updateAdminUI();
  updateBadges();
  startCountdownTimer();
  await refreshData();
}

async function refreshData(selectedFilter = null, selectedCategory = null) {
  if (selectedFilter !== null) state.activeFilter = selectedFilter;
  if (selectedCategory !== null) state.activeCategory = selectedCategory;

  try {
    const [groceriesRes, categoriesRes, statsRes] = await Promise.allSettled([
      API.getGroceries(state.activeFilter, state.activeCategory),
      API.getCategories(),
      API.getStats()
    ]);

    if (groceriesRes.status === 'fulfilled' && groceriesRes.value && Array.isArray(groceriesRes.value.data) && groceriesRes.value.data.length > 0) {
      state.groceries = groceriesRes.value.data;
    } else {
      state.groceries = getFilteredMockGroceries(state.activeCategory, state.activeFilter, state.searchQuery, state.sortBy);
    }

    if (categoriesRes.status === 'fulfilled' && categoriesRes.value && Array.isArray(categoriesRes.value.data)) {
      state.categories = categoriesRes.value.data;
    } else {
      state.categories = getMockCategoriesWithCounts();
    }

    if (statsRes.status === 'fulfilled' && statsRes.value && statsRes.value.data) {
      state.stats = statsRes.value.data;
    } else {
      state.stats = getMockStats();
    }

    renderCategories();
    renderProducts();
    renderAdminStats();
    renderCart();
  } catch (err) {
    console.error('Recovering gracefully in refreshData:', err);
    state.groceries = getFilteredMockGroceries(state.activeCategory, state.activeFilter, state.searchQuery, state.sortBy);
    state.categories = getMockCategoriesWithCounts();
    state.stats = getMockStats();
    renderCategories();
    renderProducts();
    renderAdminStats();
    renderCart();
  }
}

// ==================== RENDERING ====================

// Render Categories Grid
function renderCategories() {
  const categoryCountMap = {};
  state.categories.forEach(c => {
    categoryCountMap[c.category] = c.count;
  });

  const totalCount = state.groceries.length;

  elements.categoriesGrid.innerHTML = CATEGORY_CONFIG.map(cat => {
    let count = cat.fallbackCount;
    if (cat.name === 'All') {
      count = totalCount;
    } else if (categoryCountMap[cat.name] !== undefined) {
      // Scale count nicely for realism matching the Dribbble design (e.g. 82, 215 items)
      count = categoryCountMap[cat.name] * 8 + cat.fallbackCount;
    }

    const isActive = state.activeCategory === cat.name;

    return `
      <div class="category-card ${cat.className} ${isActive ? 'active' : ''}" 
           data-category="${cat.name}" 
           onclick="handleCategoryClick('${cat.name}')"
           role="button"
           tabindex="0"
           aria-pressed="${isActive}">
        <div class="category-icon-bubble">${cat.icon}</div>
        <div class="category-name">${cat.label}</div>
        <div class="category-count">${count} Items</div>
      </div>
    `;
  }).join('');

  // Update Category Filter indicator
  if (state.activeCategory && state.activeCategory !== 'All') {
    elements.categoryFilterBar.style.display = 'flex';
    elements.categoryFilterText.innerHTML = `Filtered by category: <strong>${state.activeCategory}</strong> (${state.groceries.length} items found)`;
  } else {
    elements.categoryFilterBar.style.display = 'none';
  }
}

// Render Products Grid
function renderProducts() {
  const count = state.groceries.length;
  elements.catalogCount.textContent = `Showing ${count} item${count === 1 ? '' : 's'}`;

  if (count === 0) {
    elements.productsGrid.innerHTML = `
      <div class="catalog-empty-state">
        <div class="empty-icon">🥬</div>
        <h3 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; margin-bottom: 6px;">No Groceries Match Your Criteria</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px;">Try adjusting your search terms or clearing the current filters.</p>
        <button type="button" class="btn-primary-shop" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  elements.productsGrid.innerHTML = state.groceries.map(item => {
    const isFav = state.favorites.includes(item.id);
    const inStock = item.inStock && item.stockQuantity > 0;
    const alertLevel = item.lowStockAlert !== undefined ? item.lowStockAlert : 10;
    const isLowStock = inStock && item.stockQuantity <= alertLevel;

    // Badges logic
    let badgeHtml = '';
    if (item.badge) {
      const badgeClass = item.isBestSeller ? 'badge-bestseller' : (item.isSeasonal ? 'badge-seasonal' : 'badge-custom');
      badgeHtml = `<span class="product-badge ${badgeClass}">${item.badge}</span>`;
    } else if (item.isBestSeller) {
      badgeHtml = `<span class="product-badge badge-bestseller">BEST SELLER</span>`;
    } else if (item.isSeasonal) {
      badgeHtml = `<span class="product-badge badge-seasonal">SEASONAL</span>`;
    }

    // Stock Status
    let stockClass = 'in-stock';
    let stockText = `${item.stockQuantity} in stock`;
    if (!inStock) {
      stockClass = 'out-of-stock';
      stockText = 'Out of stock';
    } else if (isLowStock) {
      stockClass = 'low-stock';
      stockText = `Low stock: ${item.stockQuantity} left`;
    }

    // Admin Controls HTML
    const adminControlsHtml = state.isAdminMode ? `
      <div class="admin-card-controls">
        <div class="admin-stock-stepper">
          <span style="font-size: 0.75rem; color: var(--text-muted);">Stock:</span>
          <button type="button" class="stock-step-btn" title="Decrease Stock" onclick="adjustItemStock('${item.id}', -1)">-</button>
          <span class="stock-step-value" id="stock-val-${item.id}">${item.stockQuantity}</span>
          <button type="button" class="stock-step-btn" title="Increase Stock" onclick="adjustItemStock('${item.id}', 1)">+</button>
        </div>
        <div class="admin-item-actions">
          <button type="button" class="btn-icon-edit" title="Edit Item Details" onclick="openEditModal('${item.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button type="button" class="btn-icon-delete" title="Delete Grocery Item" onclick="confirmDeleteItem('${item.id}', '${item.name.replace(/'/g, "\\'")}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>
    ` : '';

    return `
      <article class="product-card" data-id="${item.id}">
        <!-- Image & Floating Badges -->
        <div class="product-image-box">
          <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'">
          
          <div class="card-top-badges">
            ${badgeHtml}
          </div>

          <button type="button" 
                  class="btn-favorite ${isFav ? 'active' : ''}" 
                  onclick="toggleFavorite('${item.id}')"
                  title="${isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                  aria-label="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#EF4444' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>
        </div>

        <!-- Details -->
        <div class="product-details">
          <span class="product-category-tag">${item.category}</span>
          <h3 class="product-title">${item.name}</h3>

          <div class="product-rating">
            <div class="rating-stars">
              ${'★'.repeat(Math.round(item.rating))}
            </div>
            <span class="rating-score">${item.rating.toFixed(1)}</span>
            <span class="rating-count">(${item.reviewsCount})</span>
          </div>

          <div class="stock-status-pill ${stockClass}">
            <span class="stock-dot"></span>
            <span>${stockText}</span>
          </div>

          <div class="product-footer">
            <div class="product-pricing">
              <div class="price-row">
                <span class="current-price">$${item.price.toFixed(2)}</span>
                ${item.originalPrice ? `<span class="original-price">$${item.originalPrice.toFixed(2)}</span>` : ''}
              </div>
              <span class="product-unit">${item.unit}</span>
            </div>

            <button type="button" 
                    class="btn-add-cart" 
                    onclick="addToCart('${item.id}')"
                    ${!inStock ? 'disabled' : ''}
                    title="${inStock ? 'Add to Shopping Cart' : 'Item is currently sold out'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              ${inStock ? 'Add' : 'Sold Out'}
            </button>
          </div>
        </div>

        <!-- Admin Controls if Admin Mode Active -->
        ${adminControlsHtml}
      </article>
    `;
  }).join('');
}

// Render Admin Stats Topbar
function renderAdminStats() {
  if (!state.isAdminMode) return;
  elements.statTotalProducts.textContent = `📦 ${state.stats.totalProducts} Products`;
  elements.statTotalStock.textContent = `📊 ${state.stats.totalStockQuantity} Units`;
  elements.statLowStock.textContent = `⚠️ ${state.stats.lowStockCount} Low Stock`;
  elements.invTotalBadge.textContent = `${state.stats.totalProducts} Items`;
}

// Render Cart Drawer
function renderCart() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  elements.cartCountBadge.textContent = totalItems;
  elements.cartItemsCountText.textContent = `${totalItems} Item${totalItems === 1 ? '' : 's'}`;

  if (state.cart.length === 0) {
    elements.cartItemsList.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 12px;">🛒</div>
        <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">Your Cart is Empty</h4>
        <p style="font-size: 0.85rem; margin-bottom: 20px;">Explore our crisp organic fruits and vegetables to start shopping!</p>
        <button type="button" class="btn-primary-shop" style="padding: 10px 20px; font-size: 0.85rem;" onclick="closeAllDrawers()">Browse Aisles</button>
      </div>
    `;
    elements.cartSubtotal.textContent = '$0.00';
    elements.cartDelivery.textContent = '$0.00';
    elements.cartTax.textContent = '$0.00';
    elements.cartFinalTotal.textContent = '$0.00';
    elements.shippingProgressText.textContent = 'Add $35.00 for FREE Delivery';
    elements.shippingProgressAmount.textContent = '$0.00 / $35.00';
    elements.shippingProgressFill.style.width = '0%';
    elements.discountRow.style.display = 'none';
    elements.btnProceedCheckout.disabled = true;
    return;
  }

  elements.btnProceedCheckout.disabled = false;

  let subtotal = 0;
  elements.cartItemsList.innerHTML = state.cart.map(cartItem => {
    const itemTotal = cartItem.item.price * cartItem.quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-item-row">
        <img src="${cartItem.item.imageUrl}" alt="${cartItem.item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${cartItem.item.name}</div>
          <div class="cart-item-price-unit">$${cartItem.item.price.toFixed(2)} ${cartItem.item.unit}</div>
          
          <div class="cart-item-controls">
            <div class="cart-stepper">
              <button type="button" onclick="updateCartQuantity('${cartItem.item.id}', -1)">-</button>
              <span>${cartItem.quantity}</span>
              <button type="button" onclick="updateCartQuantity('${cartItem.item.id}', 1)">+</button>
            </div>
            <button type="button" class="btn-remove-item" onclick="removeFromCart('${cartItem.item.id}')">Remove</button>
          </div>
        </div>

        <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
      </div>
    `;
  }).join('');

  // Shipping progress ($35 threshold)
  const freeShippingThreshold = 35.00;
  const isFreeDelivery = subtotal >= freeShippingThreshold;
  const deliveryFee = isFreeDelivery ? 0 : 3.99;
  
  if (isFreeDelivery) {
    elements.shippingProgressText.innerHTML = '🎉 <strong>You unlocked FREE Express Delivery!</strong>';
    elements.shippingProgressAmount.textContent = 'Free Delivery';
    elements.shippingProgressFill.style.width = '100%';
    elements.cartDelivery.textContent = 'FREE';
    elements.cartDelivery.style.color = '#16A34A';
  } else {
    const needed = (freeShippingThreshold - subtotal).toFixed(2);
    const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
    elements.shippingProgressText.textContent = `Add $${needed} more for FREE Delivery`;
    elements.shippingProgressAmount.textContent = `$${subtotal.toFixed(2)} / $35.00`;
    elements.shippingProgressFill.style.width = `${progressPercent}%`;
    elements.cartDelivery.textContent = `$${deliveryFee.toFixed(2)}`;
    elements.cartDelivery.style.color = 'inherit';
  }

  // Discount from coupon
  let discount = 0;
  if (state.appliedCoupon === 'FRESH80') {
    discount = subtotal * 0.20; // 20% discount
    elements.discountRow.style.display = 'flex';
    elements.cartDiscount.textContent = `-$${discount.toFixed(2)} (20% OFF)`;
  } else {
    elements.discountRow.style.display = 'none';
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * 0.05; // 5% estimated tax
  const finalTotal = taxableAmount + deliveryFee + tax;

  elements.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  elements.cartTax.textContent = `$${tax.toFixed(2)}`;
  elements.cartFinalTotal.textContent = `$${finalTotal.toFixed(2)}`;
}

// Render Favorites Drawer
function renderFavorites() {
  const count = state.favorites.length;
  elements.favCountBadge.textContent = count;
  elements.favDrawerCount.textContent = `${count} Item${count === 1 ? '' : 's'}`;

  if (count === 0) {
    elements.favoritesItemsList.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 12px;">❤️</div>
        <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">Your Wishlist is Empty</h4>
        <p style="font-size: 0.85rem;">Click the heart icon on any grocery item to save it for quick shopping.</p>
      </div>
    `;
    elements.favDrawerFooter.style.display = 'none';
    return;
  }

  elements.favDrawerFooter.style.display = 'block';

  // Find favorite items from current or cached data
  elements.favoritesItemsList.innerHTML = state.favorites.map(favId => {
    const item = state.groceries.find(g => g.id === favId);
    if (!item) return '';

    return `
      <div class="cart-item-row">
        <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price-unit">$${item.price.toFixed(2)} ${item.unit}</div>
          <button type="button" class="btn-remove-item" onclick="toggleFavorite('${item.id}')">Remove</button>
        </div>
        <button type="button" class="btn-add-cart" style="padding: 6px 12px; font-size: 0.775rem;" onclick="addToCart('${item.id}')">
          + Add
        </button>
      </div>
    `;
  }).join('');
}

// Render Inventory Table Modal (Admin Spreadsheet)
function renderInventoryTable(filterTerm = '', showLowOnly = false) {
  let items = [...state.groceries];

  if (filterTerm) {
    const lower = filterTerm.toLowerCase();
    items = items.filter(i => 
      i.name.toLowerCase().includes(lower) || 
      i.category.toLowerCase().includes(lower)
    );
  }

  if (showLowOnly) {
    items = items.filter(i => {
      const alert = i.lowStockAlert !== undefined ? i.lowStockAlert : 10;
      return i.inStock && i.stockQuantity <= alert && i.stockQuantity > 0;
    });
  }

  if (items.length === 0) {
    elements.inventoryTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
          No items found matching the filter.
        </td>
      </tr>
    `;
    return;
  }

  elements.inventoryTableBody.innerHTML = items.map(item => {
    const inStock = item.inStock && item.stockQuantity > 0;
    const alertLevel = item.lowStockAlert !== undefined ? item.lowStockAlert : 10;
    const isLow = inStock && item.stockQuantity <= alertLevel;
    let statusPill = `<span class="stock-status-pill in-stock"><span class="stock-dot"></span> In Stock</span>`;
    if (!inStock) {
      statusPill = `<span class="stock-status-pill out-of-stock"><span class="stock-dot"></span> Out</span>`;
    } else if (isLow) {
      statusPill = `<span class="stock-status-pill low-stock"><span class="stock-dot"></span> Low</span>`;
    }

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${item.imageUrl}" alt="${item.name}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;">
            <div>
              <div style="font-weight: 700;">${item.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${item.badge || 'Standard'}</div>
            </div>
          </div>
        </td>
        <td><span style="background: var(--bg-surface); padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${item.category}</span></td>
        <td style="font-weight: 700;">$${item.price.toFixed(2)} <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">${item.unit}</span></td>
        <td style="font-weight: 800; font-size: 0.95rem;">${item.stockQuantity}</td>
        <td>
          <div class="admin-stock-stepper">
            <button type="button" class="stock-step-btn" onclick="adjustItemStock('${item.id}', -5)">-5</button>
            <button type="button" class="stock-step-btn" onclick="adjustItemStock('${item.id}', -1)">-1</button>
            <button type="button" class="stock-step-btn" onclick="adjustItemStock('${item.id}', 1)">+1</button>
            <button type="button" class="stock-step-btn" onclick="adjustItemStock('${item.id}', 5)">+5</button>
          </div>
        </td>
        <td>${statusPill}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn-icon-edit" title="Edit" onclick="openEditModal('${item.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button type="button" class="btn-icon-delete" title="Delete" onclick="confirmDeleteItem('${item.id}', '${item.name.replace(/'/g, "\\'")}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ==================== EVENT HANDLERS & ACTIONS ====================

function setupEventListeners() {
  // Admin Mode Toggle
  elements.adminToggle.checked = state.isAdminMode;
  elements.adminToggle.addEventListener('change', (e) => {
    state.isAdminMode = e.target.checked;
    localStorage.setItem('gronery_admin_mode', state.isAdminMode);
    updateAdminUI();
    renderProducts();
    renderAdminStats();
    showToast(state.isAdminMode ? 'Admin Mode Activated: Stock controls and inventory tools unlocked' : 'Switched to Shopper Storefront Mode', 'info');
  });

  if (elements.footerAdminLink) {
    elements.footerAdminLink.addEventListener('click', (e) => {
      e.preventDefault();
      state.isAdminMode = true;
      elements.adminToggle.checked = true;
      localStorage.setItem('gronery_admin_mode', 'true');
      updateAdminUI();
      renderProducts();
      renderAdminStats();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Admin Mode Enabled', 'info');
    });
  }

  // Live Search Input (Header)
  let searchDebounce;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.searchQuery = e.target.value;
      refreshData();
    }, 250);
  });

  // Filter Pills (Catalog: "All Items", "Best Sellers", "Seasonal Offers", etc.)
  elements.filterPillsContainer.addEventListener('click', async (e) => {
    const btn = e.target.closest('.filter-pill');
    if (!btn) return;
    
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    
    const selectedFilter = btn.dataset.filter || 'all';
    state.activeFilter = selectedFilter;
    await refreshData(selectedFilter, null);
  });

  // Sort Selector
  elements.sortSelector.addEventListener('change', async (e) => {
    state.sortBy = e.target.value;
    await refreshData();
  });

  // Clear Category Button
  elements.btnClearCategoryFilter.addEventListener('click', async () => {
    state.activeCategory = 'All';
    await refreshData(null, 'All');
  });

  // Promotional Banner Buttons
  elements.btnClaimWeeklyDeal.addEventListener('click', async () => {
    const selectedFilter = 'seasonal';
    state.activeFilter = selectedFilter;
    updateFilterPillActive(selectedFilter);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    await refreshData(selectedFilter, null);
  });

  elements.btnExploreOrganic.addEventListener('click', async () => {
    const selectedFilter = 'best_sellers';
    state.activeFilter = selectedFilter;
    updateFilterPillActive(selectedFilter);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    await refreshData(selectedFilter, null);
  });

  // Cart Drawer
  elements.btnOpenCart.addEventListener('click', () => {
    openDrawer(elements.cartDrawer);
    renderCart();
  });
  elements.btnCloseCart.addEventListener('click', closeAllDrawers);

  // Favorites Drawer
  elements.btnOpenFavorites.addEventListener('click', () => {
    openDrawer(elements.favoritesDrawer);
    renderFavorites();
  });
  elements.btnCloseFavorites.addEventListener('click', closeAllDrawers);
  elements.drawerBackdrop.addEventListener('click', () => {
    closeAllDrawers();
    closeAllModals();
  });

  // Move all favorites to cart
  elements.btnAddAllFavoritesToCart.addEventListener('click', () => {
    let addedCount = 0;
    state.favorites.forEach(id => {
      const item = state.groceries.find(g => g.id === id);
      if (item && item.inStock && item.stockQuantity > 0) {
        addToCart(item.id, false);
        addedCount++;
      }
    });
    renderCart();
    closeAllDrawers();
    showToast(`Added ${addedCount} wishlist items into your cart!`, 'success');
  });

  // Apply Coupon
  elements.btnApplyCoupon.addEventListener('click', () => {
    const code = elements.promoCodeInput.value.trim().toUpperCase();
    if (code === 'FRESH80') {
      state.appliedCoupon = 'FRESH80';
      renderCart();
      showToast('Promo code FRESH80 applied! You get 20% OFF!', 'success');
    } else if (code) {
      showToast('Invalid coupon code. Try FRESH80', 'warning');
    }
  });

  // Proceed to Checkout
  elements.btnProceedCheckout.addEventListener('click', handleCheckout);
  elements.btnCloseSuccessModal.addEventListener('click', () => {
    elements.checkoutSuccessModal.classList.remove('open');
  });

  // Admin Topbar Action Buttons
  elements.btnOpenAddModal.addEventListener('click', openAddModal);
  elements.btnOpenInventoryTable.addEventListener('click', () => {
    openModal(elements.inventoryTableModal);
    renderInventoryTable();
  });
  elements.btnResetData.addEventListener('click', handleResetCatalog);

  // Grocery Item Modal
  elements.btnCloseGroceryModal.addEventListener('click', () => closeModal(elements.groceryItemModal));
  elements.btnCancelGroceryModal.addEventListener('click', () => closeModal(elements.groceryItemModal));
  elements.groceryForm.addEventListener('submit', handleSaveGrocery);

  // Inventory Table Modal Events
  elements.btnCloseInventoryModal.addEventListener('click', () => closeModal(elements.inventoryTableModal));
  elements.btnCloseInvFooter.addEventListener('click', () => closeModal(elements.inventoryTableModal));
  elements.btnInvAddNew.addEventListener('click', () => {
    closeModal(elements.inventoryTableModal);
    openAddModal();
  });

  let invDebounce;
  elements.invSearchInput.addEventListener('input', (e) => {
    clearTimeout(invDebounce);
    invDebounce = setTimeout(() => {
      const isLow = elements.btnInvFilterLow.classList.contains('active');
      renderInventoryTable(e.target.value, isLow);
    }, 200);
  });

  elements.btnInvFilterAll.addEventListener('click', () => {
    elements.btnInvFilterAll.classList.add('active');
    elements.btnInvFilterLow.classList.remove('active');
    renderInventoryTable(elements.invSearchInput.value, false);
  });

  elements.btnInvFilterLow.addEventListener('click', () => {
    elements.btnInvFilterLow.classList.add('active');
    elements.btnInvFilterAll.classList.remove('active');
    renderInventoryTable(elements.invSearchInput.value, true);
  });
}

function updateFilterPillActive(filterName) {
  document.querySelectorAll('.filter-pill').forEach(pill => {
    if (pill.dataset.filter === filterName) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
}

function updateAdminUI() {
  if (state.isAdminMode) {
    elements.adminTopbar.classList.remove('hidden');
  } else {
    elements.adminTopbar.classList.add('hidden');
  }
}

function updateBadges() {
  const totalCart = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  elements.cartCountBadge.textContent = totalCart;
  elements.favCountBadge.textContent = state.favorites.length;
}

// Category Click
window.handleCategoryClick = async function(categoryName) {
  state.activeCategory = categoryName;
  const catalogEl = document.getElementById('catalog');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth' });
  }
  await refreshData(null, categoryName);
};

window.filterByCategory = async function(categoryName) {
  state.activeCategory = categoryName;
  await refreshData(null, categoryName);
  const catalogEl = document.getElementById('catalog');
  if (catalogEl) {
    catalogEl.scrollIntoView({ behavior: 'smooth' });
  }
};

// Reset Filters
window.resetFilters = async function() {
  state.activeCategory = 'All';
  state.activeFilter = 'all';
  state.searchQuery = '';
  if (elements.searchInput) {
    elements.searchInput.value = '';
  }
  updateFilterPillActive('all');
  await refreshData('all', 'All');
};

// ==================== CART ACTIONS ====================

window.addToCart = function(itemId, notify = true) {
  const item = state.groceries.find(g => g.id === itemId);
  if (!item) return;

  if (!item.inStock || item.stockQuantity <= 0) {
    showToast(`${item.name} is currently out of stock`, 'warning');
    return;
  }

  const existing = state.cart.find(c => c.item.id === itemId);
  if (existing) {
    if (existing.quantity >= item.stockQuantity) {
      showToast(`Cannot add more than available stock (${item.stockQuantity})`, 'warning');
      return;
    }
    existing.quantity += 1;
  } else {
    state.cart.push({ item, quantity: 1 });
  }

  localStorage.setItem('gronery_cart', JSON.stringify(state.cart));
  updateBadges();

  if (notify) {
    showToast(`Added ${item.name} to cart 🛒`, 'success');
  }
};

window.updateCartQuantity = function(itemId, delta) {
  const cartIndex = state.cart.findIndex(c => c.item.id === itemId);
  if (cartIndex === -1) return;

  const current = state.cart[cartIndex];
  const newQty = current.quantity + delta;

  if (newQty <= 0) {
    state.cart.splice(cartIndex, 1);
  } else {
    // Check against live stock
    if (newQty > current.item.stockQuantity) {
      showToast(`Only ${current.item.stockQuantity} items in stock!`, 'warning');
      return;
    }
    current.quantity = newQty;
  }

  localStorage.setItem('gronery_cart', JSON.stringify(state.cart));
  updateBadges();
  renderCart();
};

window.removeFromCart = function(itemId) {
  state.cart = state.cart.filter(c => c.item.id !== itemId);
  localStorage.setItem('gronery_cart', JSON.stringify(state.cart));
  updateBadges();
  renderCart();
};

// ==================== FAVORITES ACTIONS ====================

window.toggleFavorite = function(itemId) {
  const index = state.favorites.indexOf(itemId);
  const item = state.groceries.find(g => g.id === itemId);
  const name = item ? item.name : 'Item';

  if (index > -1) {
    state.favorites.splice(index, 1);
    showToast(`Removed ${name} from Wishlist`, 'info');
  } else {
    state.favorites.push(itemId);
    showToast(`Saved ${name} to Wishlist ❤️`, 'success');
  }

  localStorage.setItem('gronery_favorites', JSON.stringify(state.favorites));
  updateBadges();
  renderProducts();
  renderFavorites();
};

// ==================== ADMIN STOCK & CRUD ACTIONS ====================

// Quick stock adjust directly from card or table with instant optimistic UI update
window.adjustItemStock = async function(id, delta) {
  const item = state.groceries.find(g => g.id === id);
  if (!item) return;

  const previousStock = item.stockQuantity;
  const previousInStock = item.inStock;
  const previousIsLow = item.isLowStock;
  const nextStock = Math.max(0, item.stockQuantity + delta);

  // 1. Instant optimistic UI update
  item.stockQuantity = nextStock;
  item.inStock = nextStock > 0;
  const alertLevel = item.lowStockAlert !== undefined ? item.lowStockAlert : 10;
  item.isLowStock = nextStock > 0 && nextStock <= alertLevel;

  // Immediate DOM stepper feedback
  const stepperSpan = document.getElementById(`stock-val-${id}`);
  if (stepperSpan) stepperSpan.textContent = nextStock;

  // Re-render UI immediately
  renderProducts();
  if (elements.inventoryTableModal && elements.inventoryTableModal.classList.contains('open')) {
    const isLow = elements.btnInvFilterLow.classList.contains('active');
    renderInventoryTable(elements.invSearchInput.value, isLow);
  }

  // Optimistic admin stats
  state.stats.totalStockQuantity = state.groceries.reduce((sum, g) => sum + g.stockQuantity, 0);
  state.stats.lowStockCount = state.groceries.filter(g => {
    const a = g.lowStockAlert !== undefined ? g.lowStockAlert : 10;
    return g.inStock && g.stockQuantity <= a && g.stockQuantity > 0;
  }).length;
  state.stats.outOfStockCount = state.groceries.filter(g => !g.inStock || g.stockQuantity <= 0).length;
  renderAdminStats();

  // 2. Persist to Backend API
  try {
    const res = await API.adjustStock(id, delta);
    if (res.success && res.data) {
      item.stockQuantity = res.data.stockQuantity;
      item.inStock = res.data.inStock;
      if (res.data.lowStockAlert !== undefined) item.lowStockAlert = res.data.lowStockAlert;
      if (res.data.isLowStock !== undefined) item.isLowStock = res.data.isLowStock;

      // Re-fetch authoritative stats from backend
      const statsRes = await API.getStats();
      if (statsRes.success) state.stats = statsRes.data;

      renderProducts();
      renderAdminStats();

      if (elements.inventoryTableModal && elements.inventoryTableModal.classList.contains('open')) {
        const isLow = elements.btnInvFilterLow.classList.contains('active');
        renderInventoryTable(elements.invSearchInput.value, isLow);
      }

      showToast(`Stock updated: ${res.data.name} is now ${res.data.stockQuantity}`, 'info');
    } else {
      // Rollback on failure
      item.stockQuantity = previousStock;
      item.inStock = previousInStock;
      item.isLowStock = previousIsLow;
      renderProducts();
      renderAdminStats();
      showToast(res.error || 'Failed to update stock on server', 'warning');
    }
  } catch (err) {
    // Rollback on network error
    item.stockQuantity = previousStock;
    item.inStock = previousInStock;
    item.isLowStock = previousIsLow;
    renderProducts();
    renderAdminStats();
    showToast('Network error while updating stock', 'warning');
  }
};

window.openAddModal = function() {
  state.editingItemId = null;
  elements.groceryModalTitle.textContent = 'Add New Grocery Item';
  elements.formItemId.value = '';
  elements.groceryForm.reset();
  elements.formRating.value = '4.9';
  elements.formUnit.value = 'kg';
  if (elements.formLowStockAlert) {
    elements.formLowStockAlert.value = '10';
  }
  openModal(elements.groceryItemModal);
};

window.openEditModal = function(id) {
  const item = state.groceries.find(g => g.id === id);
  if (!item) return;

  state.editingItemId = id;
  elements.groceryModalTitle.textContent = 'Edit Grocery Item';
  elements.formItemId.value = item.id;
  elements.formName.value = item.name;
  elements.formCategory.value = item.category;
  elements.formUnit.value = item.unit;
  elements.formPrice.value = item.price;
  elements.formOriginalPrice.value = item.originalPrice || '';
  elements.formStock.value = item.stockQuantity;
  if (elements.formLowStockAlert) {
    elements.formLowStockAlert.value = item.lowStockAlert !== undefined ? item.lowStockAlert : 10;
  }
  elements.formRating.value = item.rating;
  elements.formImageUrl.value = item.imageUrl;
  elements.formBadge.value = item.badge || '';
  elements.formIsBestSeller.checked = Boolean(item.isBestSeller);
  elements.formIsSeasonal.checked = Boolean(item.isSeasonal);
  elements.formDescription.value = item.description || '';

  // Close inventory table if open so edit modal is front and center
  closeModal(elements.inventoryTableModal);
  openModal(elements.groceryItemModal);
};

async function handleSaveGrocery(e) {
  e.preventDefault();

  const payload = {
    name: elements.formName.value.trim(),
    category: elements.formCategory.value,
    unit: elements.formUnit.value.trim(),
    price: parseFloat(elements.formPrice.value),
    originalPrice: elements.formOriginalPrice.value ? parseFloat(elements.formOriginalPrice.value) : null,
    stockQuantity: parseInt(elements.formStock.value, 10),
    lowStockAlert: elements.formLowStockAlert ? parseInt(elements.formLowStockAlert.value, 10) || 10 : 10,
    rating: parseFloat(elements.formRating.value) || 5.0,
    imageUrl: elements.formImageUrl.value.trim(),
    badge: elements.formBadge.value.trim() || null,
    isBestSeller: elements.formIsBestSeller.checked,
    isSeasonal: elements.formIsSeasonal.checked,
    description: elements.formDescription.value.trim()
  };

  try {
    let res;
    if (state.editingItemId) {
      res = await API.updateGrocery(state.editingItemId, payload);
    } else {
      res = await API.createGrocery(payload);
    }

    if (res.success) {
      closeModal(elements.groceryItemModal);
      showToast(state.editingItemId ? 'Item updated successfully!' : 'New grocery item added to catalog!', 'success');
      await refreshData();
      if (elements.inventoryTableModal && elements.inventoryTableModal.classList.contains('open')) {
        renderInventoryTable();
      }
    } else {
      showToast(res.error || 'Failed to save item', 'warning');
    }
  } catch (err) {
    showToast('Network error while saving item', 'warning');
  }
}

window.confirmDeleteItem = async function(id, name) {
  if (confirm(`Are you sure you want to remove "${name}" from the store catalog?`)) {
    try {
      const res = await API.deleteGrocery(id);
      if (res.success) {
        showToast(`Deleted "${name}"`, 'info');
        await refreshData();
        if (elements.inventoryTableModal.classList.contains('open')) {
          renderInventoryTable();
        }
      }
    } catch (err) {
      showToast('Failed to delete item', 'warning');
    }
  }
};

async function handleResetCatalog() {
  if (confirm('Reset store database back to standard sample items?')) {
    try {
      const res = await API.resetSeedData();
      if (res.success) {
        showToast('Store catalog successfully reset to default sample data!', 'success');
        await refreshData();
        if (elements.inventoryTableModal.classList.contains('open')) {
          renderInventoryTable();
        }
      }
    } catch (err) {
      showToast('Failed to reset catalog', 'warning');
    }
  }
}

// ==================== CHECKOUT SIMULATION ====================

function handleCheckout() {
  if (state.cart.length === 0) return;

  const orderNum = Math.floor(1000 + Math.random() * 9000);
  const totalPaid = elements.cartFinalTotal.textContent;
  const itemCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);

  elements.successOrderNum.textContent = orderNum;
  elements.successItemCount.textContent = `${itemCount} items`;
  elements.successOrderTotal.textContent = totalPaid;

  // Clear Cart
  state.cart = [];
  state.appliedCoupon = null;
  localStorage.setItem('gronery_cart', JSON.stringify(state.cart));
  updateBadges();

  closeAllDrawers();
  openModal(elements.checkoutSuccessModal);
}

// ==================== DRAWER & MODAL UTILITIES ====================

function openDrawer(drawer) {
  elements.drawerBackdrop.classList.add('open');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAllDrawers() {
  elements.drawerBackdrop.classList.remove('open');
  elements.cartDrawer.classList.remove('open');
  elements.favoritesDrawer.classList.remove('open');
  document.body.style.overflow = '';
}

function openModal(modal) {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function closeAllModals() {
  elements.groceryItemModal.classList.remove('open');
  elements.inventoryTableModal.classList.remove('open');
  elements.checkoutSuccessModal.classList.remove('open');
  document.body.style.overflow = '';
}

// ==================== TOAST SYSTEM ====================

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==================== COUNTDOWN TIMER ====================

function startCountdownTimer() {
  let secondsLeft = 18 * 3600 + 42 * 60 + 15;

  setInterval(() => {
    secondsLeft--;
    if (secondsLeft <= 0) secondsLeft = 24 * 3600;

    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    elements.dealTimer.textContent = `${hours}h : ${minutes < 10 ? '0' : ''}${minutes}m : ${seconds < 10 ? '0' : ''}${seconds}s`;
  }, 1000);
}

window.handleNewsletter = function() {
  showToast('Thanks for subscribing to Gronery Fresh Harvest Club! 💌', 'success');
};

// Launch App when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
