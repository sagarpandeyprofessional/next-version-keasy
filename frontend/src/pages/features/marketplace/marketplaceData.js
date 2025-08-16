// marketplaceData.js

export const categories = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Home Appliances',
  'Kitchen',
  'Sports',
  'Beauty',
  'Toys',
  'Other'
];

export const locations = [
  'Seoul',
  'Busan',
  'Incheon',
  'Daegu',
  'Daejeon',
  'Gwangju',
  'Suwon',
  'Ulsan',
  'Jeju',
  'Gyeonggi-do'
];

// Helper function to format currency in Korean Won
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(amount);
};
