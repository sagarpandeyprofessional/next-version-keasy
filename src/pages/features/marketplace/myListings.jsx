// MyListingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Categories & locations
export const categories = [
  'Electronics', 'Furniture', 'Clothing', 'Books', 'Home Appliances',
  'Kitchen', 'Sports', 'Beauty', 'Toys', 'Other',
];

export const locations = [
  'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon',
  'Gwangju', 'Suwon', 'Ulsan', 'Jeju', 'Gyeonggi-do',
];

// Currency formatter
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Mock listings
const mockUserListings = [
  {
    id: 101,
    title: 'iPhone 13 Pro - Like New',
    description: 'Used for 6 months, perfect condition with original box and accessories.',
    price: 850000,
    condition: 'second-hand',
    category: 'Electronics',
    location: 'Seoul',
    image: '',
    created_at: new Date(2023, 10, 5).toISOString(),
    sellerName: 'Current User',
  },
  {
    id: 102,
    title: 'Coffee Table - Solid Wood',
    description: 'Beautiful handcrafted coffee table made of solid oak. 120x60cm.',
    price: 180000,
    condition: 'second-hand',
    category: 'Furniture',
    location: 'Seoul',
    image: '',
    created_at: new Date(2023, 9, 22).toISOString(),
    sellerName: 'Current User',
  },
  {
    id: 103,
    title: 'Korean Language Books (Beginner)',
    description: 'Complete set of Korean language textbooks for beginners. Levels 1-2.',
    price: 30000,
    condition: 'second-hand',
    category: 'Books',
    location: 'Seoul',
    image: '',
    created_at: new Date(2023, 8, 15).toISOString(),
    sellerName: 'Current User',
  },
];

// Mock auth hook
const useAuthMock = () => {
  const [user] = useState({ id: 1, name: 'Current User' });
  const [authLoading] = useState(false);
  return { user, authLoading };
};

export default function MyListingsPage() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuthMock();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchListings = async () => {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 500));
      setListings(mockUserListings);
      setIsLoading(false);
    };
    fetchListings();
  }, [user]);

  const confirmDelete = (id) => setDeleteItemId(id);
  const cancelDelete = () => setDeleteItemId(null);
  const deleteItem = async (id) => {
    setIsDeleting(true);
    await new Promise((r) => setTimeout(r, 500));
    setListings(listings.filter((item) => item.id !== id));
    setDeleteItemId(null);
    setIsDeleting(false);
  };

  if (authLoading) return <p className="text-center mt-20">Checking authentication...</p>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="mt-2 text-gray-600">Manage your marketplace listings</p>
        </div>
        <div className="mt-4 flex space-x-4 md:mt-0">
          <Link
            to="/marketplace"
            className="flex items-center justify-center rounded-md border border-black px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ← Back
          </Link>
          <Link
            to="/marketplace/post"
            className="flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Post New Listing
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p>Loading your listings...</p>
      ) : listings.length === 0 ? (
        <div className="text-center mt-20">
          <p>No listings yet.</p>
          <Link
            to="/marketplace/post"
            className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Post a Listing
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Posted Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listings.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </td>
                  <td className="px-6 py-4">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/marketplace/${item.id}`} className="text-black hover:text-gray-700">
                        View
                      </Link>
                      <Link to={`/marketplace/edit/${item.id}`} className="text-black hover:text-gray-700">
                        Edit
                      </Link>
                      <button onClick={() => confirmDelete(item.id)} className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-medium">Confirm Deletion</h3>
            <p className="mt-2">Are you sure you want to delete this listing? This cannot be undone.</p>
            <div className="mt-4 flex justify-end space-x-3">
              <button onClick={cancelDelete} className="px-4 py-2 border rounded-md">
                Cancel
              </button>
              <button
                onClick={() => deleteItem(deleteItemId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
