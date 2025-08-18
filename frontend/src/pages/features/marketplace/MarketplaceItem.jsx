// src/pages/MarketplaceItemPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// Mock categories, locations, and helper
const categories = [
  "Electronics", "Furniture", "Clothing", "Books",
  "Home Appliances", "Kitchen", "Sports", "Beauty", "Toys", "Other"
];

const locations = [
  "Seoul", "Busan", "Incheon", "Daegu", "Daejeon",
  "Gwangju", "Suwon", "Ulsan", "Jeju", "Gyeonggi-do"
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Mock marketplace data
const mockMarketplaceItems = [
  // Electronics (10)
  { id: 1, title: "Samsung 4K Smart TV", description: "55-inch Samsung Smart TV in excellent condition.", price: 400000, condition: "second-hand", category: "Electronics", location: "Seoul", image: "https://images.unsplash.com/photo-1588447135624-1a0e22060cda?auto=format&fit=crop&w=400&q=80", sellerName: "John Doe" },
  { id: 2, title: "MacBook Pro 2022", description: "M1 Pro chip, 16 GB RAM, 512 GB SSD, like-new.", price: 1500000, condition: "second-hand", category: "Electronics", location: "Seoul", image: "https://images.unsplash.com/photo-1555617117-08fda6a9ec7d?auto=format&fit=crop&w=400&q=80", sellerName: "Mike Johnson" },
  { id: 3, title: "Wireless Headphones", description: "Noise-canceling headphones, barely used.", price: 120000, condition: "second-hand", category: "Electronics", location: "Busan", image: "https://images.unsplash.com/photo-1518441842130-1c90ed69f0d6?auto=format&fit=crop&w=400&q=80", sellerName: "Anna Kim" },
  { id: 4, title: "iPhone 14 Pro", description: "256 GB, perfect condition.", price: 1100000, condition: "second-hand", category: "Electronics", location: "Incheon", image: "https://images.unsplash.com/photo-1628625179422-065f1bbda920?auto=format&fit=crop&w=400&q=80", sellerName: "James Lee" },
  { id: 5, title: "Samsung Galaxy S22", description: "128 GB, comes with charger.", price: 750000, condition: "second-hand", category: "Electronics", location: "Daegu", image: "https://images.unsplash.com/photo-1648774383583-17fc2aa55cb3?auto=format&fit=crop&w=400&q=80", sellerName: "Emily Park" },
  { id: 6, title: "Gaming Monitor", description: "27-inch 144 Hz monitor, like-new.", price: 300000, condition: "second-hand", category: "Electronics", location: "Daejeon", image: "https://images.unsplash.com/photo-1585386959984-a4155228fc46?auto=format&fit=crop&w=400&q=80", sellerName: "Kevin Lim" },
  { id: 7, title: "Bluetooth Speaker", description: "Portable waterproof Bluetooth speaker.", price: 70000, condition: "new", category: "Electronics", location: "Gwangju", image: "https://images.unsplash.com/photo-1555617117-0d944454ef56?auto=format&fit=crop&w=400&q=80", sellerName: "Sara Cho" },
  { id: 8, title: "DSLR Camera", description: "Canon EOS 90D with lens kit & bag.", price: 850000, condition: "second-hand", category: "Electronics", location: "Suwon", image: "https://images.unsplash.com/photo-1519183071298-a2962e9b7f12?auto=format&fit=crop&w=400&q=80", sellerName: "Tom Park" },
  { id: 9, title: "Apple Watch Series 7", description: "Used 3 months, excellent condition.", price: 350000, condition: "second-hand", category: "Electronics", location: "Ulsan", image: "https://images.unsplash.com/photo-1603415526960-f6f1f9c68c1b?auto=format&fit=crop&w=400&q=80", sellerName: "Nina Kim" },
  { id: 10, title: "Wireless Mouse", description: "Logitech MX Master 3, barely used.", price: 90000, condition: "second-hand", category: "Electronics", location: "Jeju", image: "https://images.unsplash.com/photo-1587574293340-0b6cfd8bdf5e?auto=format&fit=crop&w=400&q=80", sellerName: "Oliver Lee" },

  // Furniture (10)
  { id: 11, title: "IKEA Desk", description: "White IKEA desk, minor scratches.", price: 50000, condition: "second-hand", category: "Furniture", location: "Busan", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80", sellerName: "Jane Smith" },
  { id: 12, title: "Office Chair", description: "Ergonomic office chair.", price: 40000, condition: "second-hand", category: "Furniture", location: "Seoul", image: "https://images.unsplash.com/photo-1600185366584-8cda0f5ceae3?auto=format&fit=crop&w=400&q=80", sellerName: "Peter Choi" },
  { id: 13, title: "Bookshelf", description: "Wooden bookshelf, 5 tiers.", price: 60000, condition: "second-hand", category: "Furniture", location: "Daejeon", image: "https://images.unsplash.com/photos/white-wooden-bookshelf-QTqulWu6Sok?auto=format&fit=crop&w=400&q=80", sellerName: "Lisa Park" },
  { id: 14, title: "Dining Table", description: "4-seater oak dining table.", price: 120000, condition: "second-hand", category: "Furniture", location: "Incheon", image: "https://images.unsplash.com/photo-1550583724-b2692fe76e42?auto=format&fit=crop&w=400&q=80", sellerName: "Michael Choi" },
  { id: 15, title: "Sofa Couch", description: "3-seater fabric sofa.", price: 200000, condition: "second-hand", category: "Furniture", location: "Seoul", image: "https://images.unsplash.com/photo-1586201375761-83865001e0b1?auto=format&fit=crop&w=400&q=80", sellerName: "Jessica Lim" },
  { id: 16, title: "Bed Frame", description: "Queen bed frame, solid wood.", price: 180000, condition: "second-hand", category: "Furniture", location: "Busan", image: "https://images.unsplash.com/photo-1600585154340-be6161d1a62b?auto=format&fit=crop&w=400&q=80", sellerName: "Chris Han" },
  { id: 17, title: "Wardrobe", description: "2-door wardrobe, lightly used.", price: 150000, condition: "second-hand", category: "Furniture", location: "Gwangju", image: "https://images.unsplash.com/photo-1580927752452-c9f0a73a1fbd?auto=format&fit=crop&w=400&q=80", sellerName: "Anna Park" },
  { id: 18, title: "Coffee Table", description: "Round coffee table, living room use.", price: 70000, condition: "second-hand", category: "Furniture", location: "Suwon", image: "https://images.unsplash.com/photo-1555041469-c8eec71077d9?auto=format&fit=crop&w=400&q=80", sellerName: "Daniel Kim" },
  { id: 19, title: "TV Stand", description: "Modern TV stand, dark wood.", price: 60000, condition: "second-hand", category: "Furniture", location: "Ulsan", image: "https://images.unsplash.com/photo-1598300052700-0f6f9c2b6b2e?auto=format&fit=crop&w=400&q=80", sellerName: "Sophia Lee" },
  { id: 20, title: "Corner Bookshelf", description: "L-shaped corner bookshelf.", price: 80000, condition: "second-hand", category: "Furniture", location: "Jeju", image: "https://images.unsplash.com/photo-1580927752452-c9f0a73a1fbd?auto=format&fit=crop&w=400&q=80", sellerName: "Brian Park" },

  // Clothing (5)
  { id: 21, title: "Winter Coat", description: "North Face coat, size M.", price: 120000, condition: "second-hand", category: "Clothing", location: "Incheon", image: "https://images.unsplash.com/photo-1600185366592-223d5b022f68?auto=format&fit=crop&w=400&q=80", sellerName: "Sarah Lee" },
  { id: 22, title: "Leather Jacket", description: "Black leather jacket, size L.", price: 200000, condition: "second-hand", category: "Clothing", location: "Seoul", image: "https://images.unsplash.com/photo-1556909210-5e4f1c482c88?auto=format&fit=crop&w=400&q=80", sellerName: "Tom Lim" },
  { id: 23, title: "Running Shoes", description: "Nike Air Zoom, size 270 mm.", price: 90000, condition: "second-hand", category: "Clothing", location: "Busan", image: "https://images.unsplash.com/photo-1600185366591-223d5b022f67?auto=format&fit=crop&w=400&q=80", sellerName: "Jenny Choi" },
  { id: 24, title: "Floral Summer Dress", description: "Floral dress, size M.", price: 45000, condition: "second-hand", category: "Clothing", location: "Daegu", image: "https://images.unsplash.com/photo-1520974735190-7d327d1739ff?auto=format&fit=crop&w=400&q=80", sellerName: "Alice Kim" },
  { id: 25, title: "Levi's 501 Jeans", description: "Waist 32 denim jeans.", price: 55000, condition: "second-hand", category: "Clothing", location: "Daejeon", image: "https://images.unsplash.com/photo-1587740896430-5f6f1c3b9c1b?auto=format&fit=crop&w=400&q=80", sellerName: "Mark Lee" },

  // Books (5)
  { id: 26, title: "Korean Textbooks Set", description: "Levels 1–6, great for TOPIK prep.", price: 60000, condition: "second-hand", category: "Books", location: "Daegu", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80", sellerName: "David Kim" },
  { id: 27, title: "Harry Potter Box Set", description: "Hardcover, complete series.", price: 120000, condition: "second-hand", category: "Books", location: "Seoul", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", sellerName: "Emma Park" },
  { id: 28, title: "Recipe Book", description: "500-recipe cookbook, beginner-friendly.", price: 25000, condition: "new", category: "Books", location: "Busan", image: "https://images.unsplash.com/photo-1524492449090-1b4e2e7e0c2b?auto=format&fit=crop&w=400&q=80", sellerName: "Lisa Choi" },
  { id: 29, title: "Science Textbook", description: "High school physics & chemistry.", price: 40000, condition: "second-hand", category: "Books", location: "Incheon", image: "https://images.unsplash.com/photo-1524995997945-16f32f2a19f8?auto=format&fit=crop&w=400&q=80", sellerName: "Michael Lee" },
  { id: 30, title: "Art Sketchbook", description: "Large sketchbook, unused.", price: 20000, condition: "new", category: "Books", location: "Gwangju", image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80", sellerName: "Sophia Lim" },

  // Home Appliances (5)
  { id: 31, title: "Cuckoo Rice Cooker", description: "Brand-new rice cooker.", price: 80000, condition: "new", category: "Home Appliances", location: "Seoul", image: "https://images.unsplash.com/photo-1590080879170-6c1040a0e9f3?auto=format&fit=crop&w=400&q=80", sellerName: "Emily Park" },
  { id: 32, title: "High-Speed Blender", description: "Perfect for smoothies.", price: 60000, condition: "new", category: "Home Appliances", location: "Busan", image: "https://images.unsplash.com/photo-1580910051070-0b5b6c0d3b4f?auto=format&fit=crop&w=400&q=80", sellerName: "Kevin Park" },
  { id: 33, title: "Air Purifier", description: "Quiet & efficient bedroom purifier.", price: 120000, condition: "second-hand", category: "Home Appliances", location: "Daejeon", image: "https://images.unsplash.com/photo-1580910051071-0c5b6c0d3b4f?auto=format&fit=crop&w=400&q=80", sellerName: "Anna Kim" },
  { id: 34, title: "Cordless Vacuum Cleaner", description: "Barely used cordless vac.", price: 90000, condition: "second-hand", category: "Home Appliances", location: "Incheon", image: "https://images.unsplash.com/photo-1580910051072-0d5b6c0d3b4f?auto=format&fit=crop&w=400&q=80", sellerName: "David Lee" },
  { id: 35, title: "Countertop Microwave", description: "20L capacity, new.", price: 70000, condition: "new", category: "Home Appliances", location: "Seoul", image: "https://images.unsplash.com/photo-1580910051073-0e5b6c0d3b4f?auto=format&fit=crop&w=400&q=80", sellerName: "Jessica Park" },

  // Kitchen (5)
  { id: 36, title: "Stainless Knife Set", description: "6-piece new knife set.", price: 40000, condition: "new", category: "Kitchen", location: "Seoul", image: "https://images.unsplash.com/photo-1590080879171-6c1040a0e9f4?auto=format&fit=crop&w=400&q=80", sellerName: "Tom Lee" },
  { id: 37, title: "Bamboo Cutting Board Set", description: "Set of 2 new boards.", price: 15000, condition: "new", category: "Kitchen", location: "Busan", image: "https://images.unsplash.com/photo-1590080879172-6c1040a0e9f5?auto=format&fit=crop&w=400&q=80", sellerName: "Alice Kim" },
  { id: 38, title: "Nonstick Cookware Set", description: "10-piece cookware, new.", price: 80000, condition: "new", category: "Kitchen", location: "Daegu", image: "https://images.unsplash.com/photo-1590080879173-6c1040a0e9f6?auto=format&fit=crop&w=400&q=80", sellerName: "Michael Choi" },
  { id: 39, title: "Drip Coffee Maker", description: "12-cup new drip coffee maker.", price: 50000, condition: "new", category: "Kitchen", location: "Incheon", image: "https://images.unsplash.com/photo-1590080879174-6c1040a0e9f7?auto=format&fit=crop&w=400&q=80", sellerName: "Sara Lim" },
  { id: 40, title: "Electric Kettle", description: "1.7 L auto shut-off kettle.", price: 25000, condition: "new", category: "Kitchen", location: "Gwangju", image: "https://images.unsplash.com/photo-1590080879175-6c1040a0e9f8?auto=format&fit=crop&w=400&q=80", sellerName: "Brian Kim" },

  // Sports (5)
  { id: 41, title: "Yoga Mat", description: "6 mm non-slip yoga mat.", price: 20000, condition: "new", category: "Sports", location: "Seoul", image: "https://images.unsplash.com/photo-1590080879176-6c1040a0e9f9?auto=format&fit=crop&w=400&q=80", sellerName: "Anna Lee" },
  { id: 42, title: "Adjustable Dumbbell Set", description: "2–20 kg dumbbells.", price: 120000, condition: "new", category: "Sports", location: "Busan", image: "https://images.unsplash.com/photo-1590080879177-6c1040a0e9fa?auto=format&fit=crop&w=400&q=80", sellerName: "Tom Choi" },
  { id: 43, title: "Mountain Bike", description: "21-speed mountain bike, barely used.", price: 300000, condition: "second-hand", category: "Sports", location: "Daegu", image: "https://images.unsplash.com/photo-1590080879178-6c1040a0e9fb?auto=format&fit=crop&w=400&q=80", sellerName: "Jenny Kim" },
  { id: 44, title: "Tennis Racket", description: "Wilson racket, like-new.", price: 70000, condition: "second-hand", category: "Sports", location: "Daejeon", image: "https://images.unsplash.com/photo-1590080879179-6c1040a0e9fc?auto=format&fit=crop&w=400&q=80", sellerName: "David Lee" },
  { id: 45, title: "Official Basketball", description: "Brand new regulation basketball.", price: 30000, condition: "new", category: "Sports", location: "Incheon", image: "https://images.unsplash.com/photo-1590080879180-6c1040a0e9fd?auto=format&fit=crop&w=400&q=80", sellerName: "Sophia Park" },

  // Beauty (2)
  { id: 46, title: "Perfume Gift Set", description: "Three 50 ml perfumes, sealed.", price: 80000, condition: "new", category: "Beauty", location: "Seoul", image: "https://images.unsplash.com/photo-1590080879181-6c1040a0e9fe?auto=format&fit=crop&w=400&q=80", sellerName: "Emily Kim" },
  { id: 47, title: "Skincare Duo", description: "Moisturizer + serum, new.", price: 60000, condition: "new", category: "Beauty", location: "Busan", image: "https://images.unsplash.com/photo-1590080879182-6c1040a0e9ff?auto=format&fit=crop&w=400&q=80", sellerName: "Michael Park" },

  // Toys (1)
  { id: 48, title: "LEGO Star Wars Set", description: "Complete unopened set.", price: 120000, condition: "new", category: "Toys", location: "Seoul", image: "https://images.unsplash.com/photo-1590080879183-6c1040a0ea00?auto=format&fit=crop&w=400&q=80", sellerName: "Tom Lee" },

  // Other (2)
  { id: 49, title: "Vintage Film Camera", description: "Classic film camera, functional.", price: 90000, condition: "second-hand", category: "Other", location: "Busan", image: "https://images.unsplash.com/photo-1519183071298-a2962e9b7f12?auto=format&fit=crop&w=400&q=80", sellerName: "Jenny Park" },
  { id: 50, title: "Handmade Wooden Bowl", description: "Unique handmade wooden bowl.", price: 50000, condition: "new", category: "Other", location: "Seoul", image: "https://images.unsplash.com/photo-1600185366592-223d5b022f68?auto=format&fit=crop&w=400&q=80", sellerName: "Alice Choi" },
];

// Component
export default function MarketplaceItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500)); // simulate API
        const foundItem = mockMarketplaceItems.find(
          (product) => product.id === parseInt(id)
        );
        if (!foundItem) throw new Error("Item not found");
        setItem(foundItem);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (isLoading) return <p className="text-center py-20">Loading...</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!item) return <p className="text-center py-20">No item found.</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link to="/marketplace" className="mb-6 inline-flex items-center text-blue-600 hover:underline">
        ← Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="w-full aspect-square bg-gray-200 rounded-lg overflow-hidden">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-2 py-1 text-xs rounded-full text-white ${item.condition === "new" ? "bg-green-600" : "bg-gray-600"}`}>
              {item.condition === "new" ? "New" : "Second-hand"}
            </span>
            <span className="text-sm text-gray-500">{item.category}</span>
            <span className="text-sm text-gray-500">{item.location}</span>
          </div>

          <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
          <p className="text-2xl font-semibold mb-6">{formatCurrency(item.price)}</p>

          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="mb-6 text-gray-700">{item.description}</p>

          <h2 className="text-lg font-semibold mb-2">Seller</h2>
          <p className="mb-6">{item.sellerName} • {new Date(item.created_at).toLocaleDateString()}</p>

          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-black text-white rounded-md">Contact Seller</button>
            <button className="px-4 py-2 border border-black rounded-md">Save to Favorites</button>
          </div>
        </div>
      </div>
    </div>
  );
}
