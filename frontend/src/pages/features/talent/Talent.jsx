// import React, { useState, useEffect } from 'react';
// import { Search, Filter, Plus, Mail, Phone, Globe, MapPin, Star, Edit, Trash2, ArrowLeft, Upload, X } from 'lucide-react';
// import { supabase } from '../../../api/supabase-client';

// // Mock Supabase client - Replace with actual Supabase client
// const dsupabase = {
//   from: (table) => ({
//     select: () => ({
//       eq: () => ({
//         single: () => Promise.resolve({ data: null, error: null })
//       }),
//       order: () => Promise.resolve({ data: [], error: null })
//     }),
//     insert: (data) => Promise.resolve({ data, error: null }),
//     update: (data) => ({
//       eq: () => Promise.resolve({ data, error: null })
//     }),
//     delete: () => ({
//       eq: () => Promise.resolve({ data: null, error: null })
//     })
//   }),
//   storage: {
//     from: (bucket) => ({
//       upload: (path, file) => Promise.resolve({ data: { path }, error: null }),
//       remove: (paths) => Promise.resolve({ data: null, error: null }),
//       getPublicUrl: (path) => ({ data: { publicUrl: `https://example.com/${path}` } })
//     })
//   }
// };

// // Mock current user - Replace with actual auth
// const [currentUser, setCurrentUser] = useState('');
// useEffect(() => {
//     const fetchUser = async () => {
//       const { data } = await supabase.auth.getUser();
//       setCurrentUser(data?.user?.id || null);
//     };
//     fetchUser();
//   }, []);

// // Router simulation
// const Router = ({ children }) => {
//   const [currentPath, setCurrentPath] = useState('/talents');
//   const [params, setParams] = useState({});

//   const navigate = (path) => {
//     setCurrentPath(path);
//     const match = path.match(/\/talents\/([^/]+)(\/edit)?/);
//     if (match) {
//       setParams({ id: match[1], edit: !!match[2] });
//     } else {
//       setParams({});
//     }
//   };

//   return (
//     <RouterContext.Provider value={{ currentPath, params, navigate }}>
//       {children}
//     </RouterContext.Provider>
//   );
// };

// const RouterContext = React.createContext();

// // Main App Component
// const App = () => {
//   const [currentPath, setCurrentPath] = useState('/talents');
//   const [params, setParams] = useState({});

//   const navigate = (path) => {
//     setCurrentPath(path);
//     const match = path.match(/\/talents\/([^/]+)(\/edit)?/);
//     if (match) {
//       setParams({ id: match[1], edit: !!match[2] });
//     } else {
//       setParams({});
//     }
//   };

//   const renderComponent = () => {
//     if (currentPath === '/talents') {
//       return <TalentsListComponent navigate={navigate} />;
//     } else if (currentPath === '/talents/new') {
//       return <TalentFormComponent navigate={navigate} />;
//     } else if (params.id && params.edit) {
//       return <TalentEditComponent navigate={navigate} talentId={params.id} />;
//     } else if (params.id) {
//       return <TalentDetailComponent navigate={navigate} talentId={params.id} />;
//     }
//     return <TalentsListComponent navigate={navigate} />;
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {renderComponent()}
//     </div>
//   );
// };

// // 1. Talents List Component
// const TalentsListComponent = ({ navigate }) => {
//   const [talents, setTalents] = useState([]);
//   const [filteredTalents, setFilteredTalents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [filters, setFilters] = useState({
//     type: '',
//     category: '',
//     minPrice: '',
//     maxPrice: '',
//     languages: []
//   });

//   useEffect(() => {
//     loadTalents();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [searchTerm, talents]);

//   const loadTalents = async () => {
//     const { data, error } = await supabase
//       .from('talent')
//       .select('*')
//       .order('id', { ascending: false });
    
//     if (!error && data) {
//       setTalents(data);
//       setFilteredTalents(data);
//     }
//   };

//   const applyFilters = () => {
//     let result = talents;

//     // Real-time search
//     if (searchTerm) {
//       result = result.filter(t => 
//         t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         t.email?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Apply other filters
//     if (filters.type) {
//       result = result.filter(t => t.type === filters.type);
//     }
//     if (filters.category) {
//       result = result.filter(t => 
//         t.category && t.category.includes(filters.category)
//       );
//     }
//     if (filters.minPrice) {
//       result = result.filter(t => t.pricing >= parseFloat(filters.minPrice));
//     }
//     if (filters.maxPrice) {
//       result = result.filter(t => t.pricing <= parseFloat(filters.maxPrice));
//     }
//     if (filters.languages.length > 0) {
//       result = result.filter(t => 
//         t.languages && filters.languages.some(lang => t.languages.includes(lang))
//       );
//     }

//     setFilteredTalents(result);
//   };

//   const handleApplyFilters = () => {
//     applyFilters();
//     setShowFilters(false);
//   };

//   const toggleFavourite = async (talent) => {
//     const favourites = talent.favourites || [];
//     const isFav = favourites.includes(currentUser.id);
    
//     const newFavourites = isFav
//       ? favourites.filter(id => id !== currentUser.id)
//       : [...favourites, currentUser.id];

//     await supabase
//       .from('talent')
//       .update({ favourites: newFavourites })
//       .eq('id', talent.id);

//     loadTalents();
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Find Talents</h1>
//         <p className="text-gray-600">Discover amazing service providers and freelancers</p>
//       </div>

//       {/* Search and Actions */}
//       <div className="mb-6 flex flex-col md:flex-row gap-4">
//         <div className="flex-1 relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search by name, description, or email..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//         <button
//           onClick={() => setShowFilters(!showFilters)}
//           className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//         >
//           <Filter className="w-5 h-5" />
//           Filters
//         </button>
//         <button
//           onClick={() => navigate('/talents/new')}
//           className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//         >
//           <Plus className="w-5 h-5" />
//           Become a Talent
//         </button>
//       </div>

//       {/* Filter Panel */}
//       {showFilters && (
//         <div className="mb-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
//           <h3 className="text-lg font-semibold mb-4">Filters</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
//               <select
//                 value={filters.type}
//                 onChange={(e) => setFilters({...filters, type: e.target.value})}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="">All Types</option>
//                 <option value="freelancer">Freelancer</option>
//                 <option value="business">Business</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
//               <input
//                 type="number"
//                 value={filters.minPrice}
//                 onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
//                 placeholder="0"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
//               <input
//                 type="number"
//                 value={filters.maxPrice}
//                 onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
//                 placeholder="1000"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//           <div className="mt-4 flex gap-3">
//             <button
//               onClick={handleApplyFilters}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//             >
//               Apply Filters
//             </button>
//             <button
//               onClick={() => {
//                 setFilters({ type: '', category: '', minPrice: '', maxPrice: '', languages: [] });
//                 setShowFilters(false);
//               }}
//               className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
//             >
//               Clear
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Talents Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredTalents.map((talent) => (
//           <TalentCard
//             key={talent.id}
//             talent={talent}
//             navigate={navigate}
//             toggleFavourite={toggleFavourite}
//           />
//         ))}
//       </div>

//       {filteredTalents.length === 0 && (
//         <div className="text-center py-12">
//           <p className="text-gray-500 text-lg">No talents found matching your criteria</p>
//         </div>
//       )}
//     </div>
//   );
// };

// // Talent Card Component
// const TalentCard = ({ talent, navigate, toggleFavourite }) => {
//   const isFavourite = talent.favourites?.includes(currentUser.id);

//   return (
//     <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden border border-gray-200">
//       <div className="relative">
//         <img
//           src={talent.profile_img || 'https://via.placeholder.com/400x250'}
//           alt={talent.name}
//           className="w-full h-48 object-cover"
//         />
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             toggleFavourite(talent);
//           }}
//           className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
//         >
//           <Star className={`w-5 h-5 ${isFavourite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
//         </button>
//       </div>
      
//       <div className="p-5">
//         <div className="flex items-start justify-between mb-3">
//           <div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-1">{talent.name}</h3>
//             <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
//               {talent.type}
//             </span>
//           </div>
//         </div>
        
//         <p className="text-gray-600 text-sm mb-4 line-clamp-3">
//           {talent.description}
//         </p>
        
//         {talent.pricing && (
//           <p className="text-lg font-bold text-blue-600 mb-4">
//             ${talent.pricing}
//           </p>
//         )}
        
//         <button
//           onClick={() => navigate(`/talents/${talent.id}`)}
//           className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
//         >
//           View Profile
//         </button>
//       </div>
//     </div>
//   );
// };

// // 2. Talent Detail Component
// const TalentDetailComponent = ({ navigate, talentId }) => {
//   const [talent, setTalent] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadTalent();
//   }, [talentId]);

//   const loadTalent = async () => {
//     const { data, error } = await supabase
//       .from('talent')
//       .select('*')
//       .eq('id', talentId)
//       .single();
    
//     if (!error && data) {
//       setTalent(data);
//     }
//     setLoading(false);
//   };

//   if (loading) {
//     return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
//   }

//   if (!talent) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <p className="text-xl text-gray-600 mb-4">Talent not found</p>
//           <button
//             onClick={() => navigate('/talents')}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Back to Talents
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const canEdit = currentUser.id === talent.user_id;

//   return (
//     <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
//       {/* Header */}
//       <div className="mb-6 flex items-center justify-between">
//         <button
//           onClick={() => navigate('/talents')}
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Back to Talents
//         </button>
//         {canEdit && (
//           <button
//             onClick={() => navigate(`/talents/${talentId}/edit`)}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             <Edit className="w-4 h-4" />
//             Edit Profile
//           </button>
//         )}
//       </div>

//       {/* Profile Card */}
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="md:flex">
//           <div className="md:w-1/3">
//             <img
//               src={talent.profile_img || 'https://via.placeholder.com/400'}
//               alt={talent.name}
//               className="w-full h-64 md:h-full object-cover"
//             />
//           </div>
          
//           <div className="md:w-2/3 p-6 md:p-8">
//             <div className="flex items-start justify-between mb-4">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">{talent.name}</h1>
//                 <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
//                   {talent.type}
//                 </span>
//               </div>
//               {talent.pricing && (
//                 <div className="text-right">
//                   <p className="text-sm text-gray-600">Starting at</p>
//                   <p className="text-2xl font-bold text-blue-600">${talent.pricing}</p>
//                 </div>
//               )}
//             </div>

//             <p className="text-gray-700 mb-6">{talent.description}</p>

//             {/* Categories & Skills */}
//             {talent.category && talent.category.length > 0 && (
//               <div className="mb-4">
//                 <h3 className="text-sm font-semibold text-gray-900 mb-2">Categories</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {talent.category.map((cat, idx) => (
//                     <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
//                       {cat}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {talent.skills && talent.skills.length > 0 && (
//               <div className="mb-4">
//                 <h3 className="text-sm font-semibold text-gray-900 mb-2">Skills</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {talent.skills.map((skill, idx) => (
//                     <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
//                       {skill}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {talent.languages && talent.languages.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-gray-900 mb-2">Languages</h3>
//                 <p className="text-gray-700">{talent.languages.join(', ')}</p>
//               </div>
//             )}

//             {/* Contact Options */}
//             <div className="border-t pt-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
//               <div className="space-y-3">
//                 {talent.email && (
//                   <a
//                     href={`mailto:${talent.email}`}
//                     className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
//                   >
//                     <Mail className="w-5 h-5" />
//                     {talent.email}
//                   </a>
//                 )}
//                 {talent.phone && (
//                   <a
//                     href={`tel:${talent.phone}`}
//                     className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
//                   >
//                     <Phone className="w-5 h-5" />
//                     {talent.phone}
//                   </a>
//                 )}
//                 {talent.website && (
//                   <a
//                     href={talent.website}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
//                   >
//                     <Globe className="w-5 h-5" />
//                     {talent.website}
//                   </a>
//                 )}
//                 {talent.location && (
//                   <div className="flex items-center gap-3 text-gray-700">
//                     <MapPin className="w-5 h-5" />
//                     {talent.location.address || 'Location available'}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Portfolio */}
//             {talent.portfolio && (
//               <div className="mt-6 border-t pt-6">
//                 <a
//                   href={talent.portfolio}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition"
//                 >
//                   <Upload className="w-5 h-5" />
//                   View Portfolio (PDF)
//                 </a>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // 3. Talent Form Component (Create)
// const TalentFormComponent = ({ navigate }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     type: 'freelancer',
//     category: [],
//     skills: [],
//     email: '',
//     phone: '',
//     website: '',
//     description: '',
//     pricing: '',
//     languages: [],
//     location: { address: '', lat: 0, lng: 0 }
//   });
//   const [profileImg, setProfileImg] = useState(null);
//   const [portfolio, setPortfolio] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [newCategory, setNewCategory] = useState('');
//   const [newSkill, setNewSkill] = useState('');
//   const [newLanguage, setNewLanguage] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let profileImgUrl = null;
//       let portfolioUrl = null;

//       // Upload profile image
//       if (profileImg) {
//         const imgPath = `${currentUser.id}/${Date.now()}_${profileImg.name}`;
//         const { data: imgData, error: imgError } = await supabase.storage
//           .from('talent')
//           .upload(imgPath, profileImg);
        
//         if (!imgError) {
//           const { data: { publicUrl } } = supabase.storage
//             .from('talent')
//             .getPublicUrl(imgPath);
//           profileImgUrl = publicUrl;
//         }
//       }

//       // Upload portfolio
//       if (portfolio) {
//         const pdfPath = `${currentUser.id}/${Date.now()}_${portfolio.name}`;
//         const { data: pdfData, error: pdfError } = await supabase.storage
//           .from('talent')
//           .upload(pdfPath, portfolio);
        
//         if (!pdfError) {
//           const { data: { publicUrl } } = supabase.storage
//             .from('talent')
//             .getPublicUrl(pdfPath);
//           portfolioUrl = publicUrl;
//         }
//       }

//       // Insert talent record
//       const talentData = {
//         user_id: currentUser.id,
//         name: formData.name,
//         type: formData.type,
//         category: formData.category,
//         skills: formData.skills,
//         email: formData.email,
//         phone: formData.phone,
//         website: formData.website,
//         description: formData.description,
//         profile_img: profileImgUrl,
//         location: formData.location,
//         portfolio: portfolioUrl,
//         pricing: formData.pricing ? parseFloat(formData.pricing) : null,
//         languages: formData.languages,
//         favourites: []
//       };

//       const { data, error } = await supabase
//         .from('talent')
//         .insert([talentData]);

//       if (!error) {
//         navigate('/talents');
//       }
//     } catch (error) {
//       console.error('Error creating talent:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addItem = (field, value, setter) => {
//     if (value.trim()) {
//       setFormData({
//         ...formData,
//         [field]: [...formData[field], value.trim()]
//       });
//       setter('');
//     }
//   };

//   const removeItem = (field, index) => {
//     setFormData({
//       ...formData,
//       [field]: formData[field].filter((_, i) => i !== index)
//     });
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
//       <div className="mb-6">
//         <button
//           onClick={() => navigate('/talents')}
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Back to Talents
//         </button>
//         <h1 className="text-3xl font-bold text-gray-900">Become a Talent</h1>
//         <p className="text-gray-600 mt-2">Share your skills and connect with clients</p>
//       </div>

//       <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8 space-y-6">
//         {/* Name */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
//           <input
//             type="text"
//             value={formData.name}
//             onChange={(e) => setFormData({...formData, name: e.target.value})}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Type */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
//           <select
//             value={formData.type}
//             onChange={(e) => setFormData({...formData, type: e.target.value})}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="freelancer">Freelancer</option>
//             <option value="business">Business</option>
//           </select>
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
//           <input
//             type="email"
//             value={formData.email}
//             onChange={(e) => setFormData({...formData, email: e.target.value})}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Phone */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
//           <input
//             type="tel"
//             value={formData.phone}
//             onChange={(e) => setFormData({...formData, phone: e.target.value})}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Website */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
//           <input
//             type="url"
//             value={formData.website}
//             onChange={(e) => setFormData({...formData, website: e.target.value})}
//             placeholder="https://"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Description */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Description * (max 777 chars)
//           </label>
//           <textarea
//             value={formData.description}
//             onChange={(e) => setFormData({...formData, description: e.target.value.slice(0, 777)})}
//             required
//             rows="4"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//           <p className="text-sm text-gray-500 mt-1">{formData.description.length}/777</p>
//         </div>

//         {/* Categories */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
//           <div className="flex gap-2 mb-2">
//             <input
//               type="text"
//               value={newCategory}
//               onChange={(e) => setNewCategory(e.target.value)}
//               placeholder="Add category"
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               type="button"
//               onClick={() => addItem('category', newCategory, setNewCategory)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Add
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {formData.category.map((cat, idx) => (
//               <span key={idx} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
//                 {cat}
//                 <button type="button" onClick={() => removeItem('category', idx)}>
//                   <X className="w-4 h-4" />
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Skills */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
//           <div className="flex gap-2 mb-2">
//             <input
//               type="text"
//               value={newSkill}
//               onChange={(e) => setNewSkill(e.target.value)}
//               placeholder="Add skill"
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               type="button"
//               onClick={() => addItem('skills', newSkill, setNewSkill)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Add
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {formData.skills.map((skill, idx) => (
//               <span key={idx} className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-sm">
//                 {skill}
//                 <button type="button" onClick={() => removeItem('skills', idx)}>
//                   <X className="w-4 h-4" />
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Languages */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
//           <div className="flex gap-2 mb-2">
//             <input
//               type="text"
//               value={newLanguage}
//               onChange={(e) => setNewLanguage(e.target.value)}
//               placeholder="Add language"
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               type="button"
//               onClick={() => addItem('languages', newLanguage, setNewLanguage)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Add
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {formData.languages.map((lang, idx) => (
//               <span key={idx} className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full text-sm">
//                 {lang}
//                 <button type="button" onClick={() => removeItem('languages', idx)}>
//                   <X className="w-4 h-4" />
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Pricing */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Pricing (Optional)</label>
//           <input
//             type="number"
//             step="0.01"
//             value={formData.pricing}
//             onChange={(e) => setFormData({...formData, pricing: e.target.value})}
//             placeholder="Leave empty for free"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Location */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Location Address</label>
//           <input
//             type="text"
//             value={formData.location.address}
//             onChange={(e) => setFormData({
//               ...formData,
//               location: {...formData.location, address: e.target.value}
//             })}
//             placeholder="City, Country"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Profile Image */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) => setProfileImg(e.target.files[0])}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//           {profileImg && (
//             <p className="text-sm text-green-600 mt-2">Selected: {profileImg.name}</p>
//           )}
//         </div>

//         {/* Portfolio PDF */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio (PDF only)</label>
//           <input
//             type="file"
//             accept=".pdf"
//             onChange={(e) => setPortfolio(e.target.files[0])}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//           {portfolio && (
//             <p className="text-sm text-green-600 mt-2">Selected: {portfolio.name}</p>
//           )}
//         </div>

//         {/* Submit */}
//         <div className="flex gap-4">
//           <button
//             type="submit"
//             disabled={loading}
//             className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
//           >
//             {loading ? 'Creating...' : 'Create Profile'}
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate('/talents')}
//             className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// // 4. Talent Edit Component
// const TalentEditComponent = ({ navigate, talentId }) => {
//   const [talent, setTalent] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     type: 'freelancer',
//     category: [],
//     skills: [],
//     email: '',
//     phone: '',
//     website: '',
//     description: '',
//     pricing: '',
//     languages: [],
//     location: { address: '', lat: 0, lng: 0 }
//   });
//   const [profileImg, setProfileImg] = useState(null);
//   const [portfolio, setPortfolio] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [newCategory, setNewCategory] = useState('');
//   const [newSkill, setNewSkill] = useState('');
//   const [newLanguage, setNewLanguage] = useState('');

//   useEffect(() => {
//     loadTalent();
//   }, [talentId]);

//   const loadTalent = async () => {
//     const { data, error } = await supabase
//       .from('talent')
//       .select('*')
//       .eq('id', talentId)
//       .single();
    
//     if (!error && data) {
//       if (data.user_id !== currentUser.id) {
//         navigate('/talents');
//         return;
//       }
      
//       setTalent(data);
//       setFormData({
//         name: data.name || '',
//         type: data.type || 'freelancer',
//         category: data.category || [],
//         skills: data.skills || [],
//         email: data.email || '',
//         phone: data.phone || '',
//         website: data.website || '',
//         description: data.description || '',
//         pricing: data.pricing || '',
//         languages: data.languages || [],
//         location: data.location || { address: '', lat: 0, lng: 0 }
//       });
//     }
//     setLoading(false);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);

//     try {
//       let profileImgUrl = talent.profile_img;
//       let portfolioUrl = talent.portfolio;

//       // Handle profile image update
//       if (profileImg) {
//         // Delete old image if exists
//         if (talent.profile_img) {
//           const oldPath = talent.profile_img.split('/').slice(-2).join('/');
//           await supabase.storage.from('talent').remove([oldPath]);
//         }
        
//         // Upload new image
//         const imgPath = `${currentUser.id}/${Date.now()}_${profileImg.name}`;
//         const { error: imgError } = await supabase.storage
//           .from('talent')
//           .upload(imgPath, profileImg);
        
//         if (!imgError) {
//           const { data: { publicUrl } } = supabase.storage
//             .from('talent')
//             .getPublicUrl(imgPath);
//           profileImgUrl = publicUrl;
//         }
//       }

//       // Handle portfolio update
//       if (portfolio) {
//         // Delete old portfolio if exists
//         if (talent.portfolio) {
//           const oldPath = talent.portfolio.split('/').slice(-2).join('/');
//           await supabase.storage.from('talent').remove([oldPath]);
//         }
        
//         // Upload new portfolio
//         const pdfPath = `${currentUser.id}/${Date.now()}_${portfolio.name}`;
//         const { error: pdfError } = await supabase.storage
//           .from('talent')
//           .upload(pdfPath, portfolio);
        
//         if (!pdfError) {
//           const { data: { publicUrl } } = supabase.storage
//             .from('talent')
//             .getPublicUrl(pdfPath);
//           portfolioUrl = publicUrl;
//         }
//       }

//       // Update talent record
//       const updateData = {
//         name: formData.name,
//         type: formData.type,
//         category: formData.category,
//         skills: formData.skills,
//         email: formData.email,
//         phone: formData.phone,
//         website: formData.website,
//         description: formData.description,
//         profile_img: profileImgUrl,
//         location: formData.location,
//         portfolio: portfolioUrl,
//         pricing: formData.pricing ? parseFloat(formData.pricing) : null,
//         languages: formData.languages
//       };

//       const { error } = await supabase
//         .from('talent')
//         .update(updateData)
//         .eq('id', talentId);

//       if (!error) {
//         navigate(`/talents/${talentId}`);
//       }
//     } catch (error) {
//       console.error('Error updating talent:', error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
//       return;
//     }

//     try {
//       // Delete files from storage
//       if (talent.profile_img) {
//         const imgPath = talent.profile_img.split('/').slice(-2).join('/');
//         await supabase.storage.from('talent').remove([imgPath]);
//       }
//       if (talent.portfolio) {
//         const pdfPath = talent.portfolio.split('/').slice(-2).join('/');
//         await supabase.storage.from('talent').remove([pdfPath]);
//       }

//       // Delete talent record
//       await supabase
//         .from('talent')
//         .delete()
//         .eq('id', talentId);

//       navigate('/talents');
//     } catch (error) {
//       console.error('Error deleting talent:', error);
//     }
//   };

//   const addItem = (field, value, setter) => {
//     if (value.trim()) {
//       setFormData({
//         ...formData,
//         [field]: [...formData[field], value.trim()]
//       });
//       setter('');
//     }
//   };

//   const removeItem = (field, index) => {
//     setFormData({
//       ...formData,
//       [field]: formData[field].filter((_, i) => i !== index)
//     });
//   };

//   if (loading) {
//     return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
//   }

//   if (!talent) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <p className="text-xl text-gray-600 mb-4">Talent not found</p>
//           <button
//             onClick={() => navigate('/talents')}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Back to Talents
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
//       <div className="mb-6">
//         <button
//           onClick={() => navigate(`/talents/${talentId}`)}
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Back to Profile
//         </button>
//         <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
//         <p className="text-gray-600 mt-2">Update your talent information</p>
//       </div>

//       <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8 space-y-6">
//         {/* Name */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
//           <input
//             type="text"
//             value={formData.name}
//             onChange={(e) => setFormData({...formData, name: e.target.value})}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Type */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
//           <select
//             value={formData.type}
//             onChange={(e) => setFormData({...formData, type: e.target.value})}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="freelancer">Freelancer</option>
//             <option value="business">Business</option>
//           </select>
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
//           <input
//             type="email"
//             value={formData.email}
//             onChange={(e) => setFormData({...formData, email: e.target.value})}
//             required
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Phone */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
//           <input
//             type="tel"
//             value={formData.phone}
//             onChange={(e) => setFormData({...formData, phone: e.target.value})}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Website */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
//           <input
//             type="url"
//             value={formData.website}
//             onChange={(e) => setFormData({...formData, website: e.target.value})}
//             placeholder="https://"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Description */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Description * (max 777 chars)
//           </label>
//           <textarea
//             value={formData.description}
//             onChange={(e) => setFormData({...formData, description: e.target.value.slice(0, 777)})}
//             required
//             rows="4"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//           <p className="text-sm text-gray-500 mt-1">{formData.description.length}/777</p>
//         </div>

//         {/* Categories */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
//           <div className="flex gap-2 mb-2">
//             <input
//               type="text"
//               value={newCategory}
//               onChange={(e) => setNewCategory(e.target.value)}
//               placeholder="Add category"
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               type="button"
//               onClick={() => addItem('category', newCategory, setNewCategory)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Add
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {formData.category.map((cat, idx) => (
//               <span key={idx} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
//                 {cat}
//                 <button type="button" onClick={() => removeItem('category', idx)}>
//                   <X className="w-4 h-4" />
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Skills */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
//           <div className="flex gap-2 mb-2">
//             <input
//               type="text"
//               value={newSkill}
//               onChange={(e) => setNewSkill(e.target.value)}
//               placeholder="Add skill"
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               type="button"
//               onClick={() => addItem('skills', newSkill, setNewSkill)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Add
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {formData.skills.map((skill, idx) => (
//               <span key={idx} className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-sm">
//                 {skill}
//                 <button type="button" onClick={() => removeItem('skills', idx)}>
//                   <X className="w-4 h-4" />
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Languages */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
//           <div className="flex gap-2 mb-2">
//             <input
//               type="text"
//               value={newLanguage}
//               onChange={(e) => setNewLanguage(e.target.value)}
//               placeholder="Add language"
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               type="button"
//               onClick={() => addItem('languages', newLanguage, setNewLanguage)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Add
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {formData.languages.map((lang, idx) => (
//               <span key={idx} className="flex items-center gap-2 px-3 py-1 bg-purple-100 rounded-full text-sm">
//                 {lang}
//                 <button type="button" onClick={() => removeItem('languages', idx)}>
//                   <X className="w-4 h-4" />
//                 </button>
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Pricing */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Pricing (Optional)</label>
//           <input
//             type="number"
//             step="0.01"
//             value={formData.pricing}
//             onChange={(e) => setFormData({...formData, pricing: e.target.value})}
//             placeholder="Leave empty for free"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Location */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Location Address</label>
//           <input
//             type="text"
//             value={formData.location.address}
//             onChange={(e) => setFormData({
//               ...formData,
//               location: {...formData.location, address: e.target.value}
//             })}
//             placeholder="City, Country"
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Profile Image */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
//           {talent.profile_img && !profileImg && (
//             <div className="mb-2">
//               <img src={talent.profile_img} alt="Current" className="w-32 h-32 object-cover rounded-lg" />
//               <p className="text-sm text-gray-500 mt-1">Current image</p>
//             </div>
//           )}
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) => setProfileImg(e.target.files[0])}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//           {profileImg && (
//             <p className="text-sm text-green-600 mt-2">New image selected: {profileImg.name}</p>
//           )}
//         </div>

//         {/* Portfolio PDF */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio (PDF only)</label>
//           {talent.portfolio && !portfolio && (
//             <div className="mb-2">
//               <a href={talent.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
//                 View current portfolio
//               </a>
//             </div>
//           )}
//           <input
//             type="file"
//             accept=".pdf"
//             onChange={(e) => setPortfolio(e.target.files[0])}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//           {portfolio && (
//             <p className="text-sm text-green-600 mt-2">New portfolio selected: {portfolio.name}</p>
//           )}
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
//           <button
//             type="submit"
//             disabled={saving}
//             className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
//           >
//             {saving ? 'Saving...' : 'Save Changes'}
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate(`/talents/${talentId}`)}
//             className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={handleDelete}
//             className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
//           >
//             <Trash2 className="w-4 h-4" />
//             Delete
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default App;
import React from 'react'

const Talent = () => {
  return (
    <div>Talent</div>
  )
}

export default Talent