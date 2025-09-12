import React, { useEffect, useState, useRef } from 'react';
import { supabase } from "../../../api/supabase-client";
import { Link } from 'react-router';

const getPlaceholderImage = (id, type) =>
  `https://picsum.photos/400/300?random=${id}`; // using Picsum instead of via.placeholder

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data: TagsData, error: TagsError } = await supabase
        .from('category')
        .select('*');

      if (TagsError) {
        console.error('Error fetching categories:', TagsError.message);
        setLoading(false);
      } else {
        const allOption = { name: 'All' };
        const categoriesWithAll = [allOption, ...TagsData];
        setCategories(categoriesWithAll);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch guides
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('guide')
        .select('id, created_at, name, description, img_url, created_by, category');

      if (error) {
        console.error('Error fetching guides:', error.message);
        setLoading(false);
      } else {
        setGuides(data || []);
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  const filteredGuides =
    activeCategory === 'All'
      ? guides
      : guides.filter((guide) => guide.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Explore Korea Carousel */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Carousel
            title="Explore Guides"
            setActiveCategory={setActiveCategory}
            activeCategory={activeCategory}
            loading={loading}
            categories={categories}
          >
            {filteredGuides.map((guide) => (
              <ExploreCard key={guide.id} {...guide} />
            ))}
          </Carousel>
        </div>
      </section>
    </div>
  );
};

/* Carousel Component */
const Carousel = ({
  title,
  children,
  className = "",
  setActiveCategory,
  activeCategory,
  loading,
  categories,
}) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  // Attach scroll listener on mount
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      handleScroll(); // check arrows on mount
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Recalculate arrow visibility when guides (children) or category change
  useEffect(() => {
    handleScroll();
  }, [children, activeCategory, loading]);

  return (
    <div className={className}>
      {/* Categories filter buttons */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id || category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category.name
                ? "bg-black text-white hover:bg-gray-200"
                : "bg-primary-600 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Title + Arrows */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black md:text-3xl">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll("left")}
            disabled={!showLeftArrow}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors ${
              showLeftArrow ? "text-black hover:bg-gray-100" : "cursor-default text-gray-300"
            }`}
          >
            &#8592;
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!showRightArrow}
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors ${
              showRightArrow ? "text-black hover:bg-gray-100" : "cursor-default text-gray-300"
            }`}
          >
            &#8594;
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div
        className="flex -mx-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
        ref={scrollContainerRef}
      >
        {children}
      </div>
    </div>
  );
};

/* ExploreCard Component */
const ExploreCard = ({ id, name, description, img_url, created_by, category }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl =
    imageError || !img_url
      ? getPlaceholderImage(category)
      : img_url;

  const [author, setAuthor] = useState('');

  // Fetch author
  useEffect(() => {
    const fetchAuthor = async () => {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', created_by);

      if (userError) {
        console.error('Error fetching author:', userError.message);
      } else if (userData && userData.length > 0) {
        setAuthor(userData[0].username);
      }
    };

    fetchAuthor();
  }, [created_by]);

  return (
    <div className="snap-start px-4 flex-shrink-0 w-full sm:w-72 md:w-80">
      <div className="h-full overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1">
        <div className="relative h-48 w-full">
          <img
            src={imageUrl}
            alt={name}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-center text-sm text-gray-500">
            by {author}
          </div>
          <h3 className="mb-2 text-lg font-semibold text-black">{name}</h3>
          <p className="mb-4 text-sm text-gray-600">{description}</p>
          <Link
            to={`guide/${id}`}
            className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Read full guide &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Guides;
