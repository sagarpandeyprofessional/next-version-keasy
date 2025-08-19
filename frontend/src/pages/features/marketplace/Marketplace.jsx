import React, { useState, useEffect, useCallback } from 'react';
import { FaBars, FaPlus, FaTimes } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import styles from './Marketplace.module.css';

// Mock data & helpers (mimic your marketplaceData.js)
const mockMarketplaceItems = [
  // same items you gave, with keys: id, title, description, price, condition, category, location, image, created_at, sellerName
  {
    id: 1,
    title: "Samsung 4K Smart TV",
    description: "55-inch Samsung Smart TV in excellent condition. Only 1 year old with no issues.",
    price: 400000,
    condition: "second-hand",
    category: "Electronics",
    location: "Seoul",
    image: "/images/marketplace/tv.jpg",
    created_at: "2023-06-15T00:00:00Z",
    sellerName: "John Doe"
  },
  {
    id: 2,
    title: "IKEA Desk",
    description: "White IKEA desk, perfect for home office. Minor scratches but good condition overall.",
    price: 50000,
    condition: "second-hand",
    category: "Furniture",
    location: "Busan",
    image: "/images/marketplace/desk.jpg",
    created_at: "2023-07-02T00:00:00Z",
    sellerName: "Jane Smith"
  },
  {
    id: 3,
    title: "MacBook Pro 2022",
    description: "M1 Pro chip, 16GB RAM, 512GB SSD. Like new condition with original box and accessories.",
    price: 1500000,
    condition: "second-hand",
    category: "Electronics",
    location: "Seoul",
    image: "/images/marketplace/macbook.jpg",
    created_at: "2023-08-10T00:00:00Z",
    sellerName: "Mike Johnson"
  },
  {
    id: 4,
    title: "Winter Coat",
    description: "North Face winter coat, size M. Perfect for Korean winters. Used for one season only.",
    price: 120000,
    condition: "second-hand",
    category: "Clothing",
    location: "Incheon",
    image: "/images/marketplace/coat.jpg",
    created_at: "2023-09-05T00:00:00Z",
    sellerName: "Sarah Lee"
  },
  {
    id: 5,
    title: "Korean Language Textbooks",
    description: "Complete set of Korean language textbooks (Levels 1-6). Perfect for TOPIK preparation.",
    price: 60000,
    condition: "second-hand",
    category: "Books",
    location: "Daegu",
    image: "/images/marketplace/books.jpg",
    created_at: "2023-10-12T00:00:00Z",
    sellerName: "David Kim"
  },
  {
    id: 6,
    title: "Rice Cooker (New)",
    description: "Brand new Cuckoo rice cooker. Got as a gift but already have one.",
    price: 80000,
    condition: "new",
    category: "Home Appliances",
    location: "Seoul",
    image: "/images/marketplace/rice-cooker.jpg",
    created_at: "2023-10-20T00:00:00Z",
    sellerName: "Emily Park"
  }
];

const categories = ["Electronics", "Furniture", "Clothing", "Books", "Home Appliances"];
const locations = ["Seoul", "Busan", "Incheon", "Daegu"];

// Utility to format currency ₩ with commas
const formatCurrency = (num) => {
  return '₩' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// ====== FilterSidebar Component ======
const FilterSidebar = ({ filters, setFilters, isMobile, onClose }) => {
  // handlers for each input
  const handleSearchChange = e => setFilters(f => ({ ...f, search: e.target.value }));
  const handleCategoryChange = e => setFilters(f => ({ ...f, category: e.target.value }));
  const handleConditionChange = cond => {
    setFilters(f => {
      const exists = f.condition.includes(cond);
      const newCondition = exists ? f.condition.filter(c => c !== cond) : [...f.condition, cond];
      return { ...f, condition: newCondition };
    });
  };
  const handleMinPriceChange = e => {
    const val = e.target.value ? parseInt(e.target.value) : null;
    setFilters(f => ({ ...f, priceRange: { ...f.priceRange, min: val } }));
  };
  const handleMaxPriceChange = e => {
    const val = e.target.value ? parseInt(e.target.value) : null;
    setFilters(f => ({ ...f, priceRange: { ...f.priceRange, max: val } }));
  };
  const handleLocationChange = e => setFilters(f => ({ ...f, location: e.target.value }));
  const handleClear = () => setFilters({
    search: '',
    category: '',
    condition: [],
    priceRange: { min: null, max: null },
    location: '',
  });

  return (
    <div className={`bg-light p-3 rounded ${isMobile ? 'shadow-lg' : ''} ${styles.filterSidebar}`}>
      {isMobile && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Filters</h5>
          <button className="btn btn-outline-dark btn-sm" onClick={onClose} aria-label="Close Filters">
            <FaTimes />
          </button>
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="searchInput" className="form-label">Search</label>
        <input
          type="text"
          id="searchInput"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Search listings..."
          className="form-control"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="categorySelect" className="form-label">Category</label>
        <select
          id="categorySelect"
          value={filters.category}
          onChange={handleCategoryChange}
          className="form-select"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <fieldset className="mb-3">
        <legend className="col-form-label pt-0">Condition</legend>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="conditionNew"
            checked={filters.condition.includes('new')}
            onChange={() => handleConditionChange('new')}
          />
          <label className="form-check-label" htmlFor="conditionNew">New</label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="conditionUsed"
            checked={filters.condition.includes('second-hand')}
            onChange={() => handleConditionChange('second-hand')}
          />
          <label className="form-check-label" htmlFor="conditionUsed">Second-hand</label>
        </div>
      </fieldset>

      <div className="mb-3">
        <label className="form-label">Price Range (₩)</label>
        <div className="d-flex gap-2">
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="Min"
            value={filters.priceRange.min ?? ''}
            onChange={handleMinPriceChange}
          />
          <input
            type="number"
            min="0"
            className="form-control"
            placeholder="Max"
            value={filters.priceRange.max ?? ''}
            onChange={handleMaxPriceChange}
          />
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="locationSelect" className="form-label">Location</label>
        <select
          id="locationSelect"
          value={filters.location}
          onChange={handleLocationChange}
          className="form-select"
        >
          <option value="">All Locations</option>
          {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </div>

      <button className="btn btn-outline-dark w-100" onClick={handleClear}>Clear Filters</button>
    </div>
  );
};

// ====== MarketplaceItem Component ======
const MarketplaceItem = ({ item }) => {
  const [imgError, setImgError] = useState(false);
  const handleError = () => setImgError(true);
  const imageSrc = imgError ? 'https://via.placeholder.com/300x200?text=No+Image' : item.image;

  return (
    <div className={`card ${styles.marketplaceItem} h-100 shadow-sm`}>
      <div className="position-relative" style={{ height: '200px' }}>
        <img
          src={imageSrc}
          alt={item.title}
          className="card-img-top object-fit-cover"
          onError={handleError}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        <span
          className={`badge position-absolute top-0 start-0 m-2 text-white px-2 py-1 rounded ${item.condition === 'new' ? 'bg-dark' : 'bg-secondary'}`}
        >
          {item.condition === 'new' ? 'New' : 'Second-hand'}
        </span>
      </div>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between mb-1 text-muted small">
          <div>{item.category}</div>
          <div>{item.location}</div>
        </div>
        <h5 className="card-title">{item.title}</h5>
        <p className={`card-text text-truncate ${styles.description}`}>{item.description}</p>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <strong>{formatCurrency(item.price)}</strong>
          <a href={`/marketplace/${item.id}`} className="btn btn-link p-0">
            View Details
          </a>
        </div>
      </div>
    </div>
  );
};

// ====== Main MarketplacePage Component ======
const Marketplace = () => {
  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    condition: [],
    priceRange: { min: null, max: null },
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Simulate fetch marketplace data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setAllItems(mockMarketplaceItems);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Window resize listener for mobile toggle
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...allItems];

    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }

    if (filters.category) filtered = filtered.filter(i => i.category === filters.category);
    if (filters.condition.length > 0) filtered = filtered.filter(i => filters.condition.includes(i.condition));
    if (filters.priceRange.min !== null) filtered = filtered.filter(i => i.price >= filters.priceRange.min);
    if (filters.priceRange.max !== null) filtered = filtered.filter(i => i.price <= filters.priceRange.max);
    if (filters.location) filtered = filtered.filter(i => i.location === filters.location);

    setItems(filtered);
  }, [allItems, filters]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  return (
    <div className={`${styles.page} bg-white`}>
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-5 fw-bold">Marketplace</h1>
            <p className="lead text-muted">Buy, sell, or give away items within the expat community.</p>
          </div>

          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button
              className="btn btn-outline-dark d-md-none"
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              aria-label="Toggle Filters"
            >
              <FiFilter /> Filters
            </button>
            <a href="/marketplace/post" className="btn btn-dark d-flex align-items-center">
              <FaPlus className="me-2" /> Post a new listing
            </a>
          </div>
        </div>

        <div className="d-flex">
          {!isMobile && (
            <div className="flex-shrink-0 me-4" style={{ minWidth: '280px' }}>
              <FilterSidebar filters={filters} setFilters={setFilters} />
            </div>
          )}

          {isMobile && filterDrawerOpen && (
            <div className={styles.mobileFilterOverlay}>
              <FilterSidebar
                filters={filters}
                setFilters={setFilters}
                isMobile
                onClose={() => setFilterDrawerOpen(false)}
              />
            </div>
          )}

          <div className="flex-grow-1">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <div className="spinner-border text-dark" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                {error}
                <button className="btn btn-link" onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center my-5">
                <p className="lead text-muted">No items match your filters.</p>
                <button className="btn btn-link" onClick={() => setFilters({
                  search: '',
                  category: '',
                  condition: [],
                  priceRange: { min: null, max: null },
                  location: '',
                })}>Clear all filters</button>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                {items.map(item => (
                  <div className="col" key={item.id}>
                    <MarketplaceItem item={item} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
