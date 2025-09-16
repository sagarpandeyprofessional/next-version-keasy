import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

// Mock data for demo
const mockItems = [
  {
    id: 1,
    title: "Samsung 4K Smart TV",
    description: "55-inch Samsung Smart TV in excellent condition. Only 1 year old with no issues.",
    price: 400000,
    condition: "second-hand",
    category: "Electronics",
    location: "Seoul",
    sellerName: "John Doe",
  },
  {
    id: 2,
    title: "IKEA Wooden Table",
    description: "Sturdy wooden table from IKEA. Seats 4 people comfortably.",
    price: 120000,
    condition: "second-hand",
    category: "Furniture",
    location: "Busan",
    sellerName: "Jane Smith",
  },
];

export default function EditMarketplaceItemPage() {
  const { id } = useParams(); // get item id from URL
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
  });

  // Load item based on ID
  useEffect(() => {
    const foundItem = mockItems.find((i) => i.id === parseInt(id));
    if (foundItem) {
      setItem(foundItem);
      setForm({
        title: foundItem.title,
        description: foundItem.description,
        price: foundItem.price,
        location: foundItem.location,
      });
    } else {
      setItem(null);
    }
  }, [id]);

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Item updated!\n\n${JSON.stringify(form, null, 2)}`);
    navigate(`/marketplace/${id}`);
  };

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center text-lg text-gray-600">Item not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <Link
          to="/marketplace/my"
          className="mb-6 flex items-center text-black hover:underline dark:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to My Listings
        </Link>

        <h1 className="mb-4 text-3xl font-bold text-black dark:text-white">
          Edit Listing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-black focus:ring-black dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-black focus:ring-black dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price (₩)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-black focus:ring-black dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-black focus:ring-black dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Save Changes
            </button>
            <Link
              to={`/marketplace/${id}`}
              className="rounded-md border border-black bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 dark:border-white dark:bg-black dark:text-white dark:hover:bg-gray-900"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}