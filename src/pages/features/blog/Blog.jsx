import React, { useState } from "react";

const Blog = () => {
  const posts = [
    {
      id: 1,
      title: 'Getting Your Alien Registration Card (ARC) in Korea',
      excerpt: 'A step-by-step guide to obtaining your ARC, including required documents and what to expect during the process.',
      date: 'May 15, 2023',
      author: 'Sarah Kim',
      tags: ['Documentation', 'Visa', 'Immigration'],
      readTime: '8 min read',
    },
    {
      id: 2,
      title: 'Top 10 Korean Phrases Every Expat Should Know',
      excerpt: 'Essential Korean phrases that will help you navigate daily life in Korea, from ordering food to asking for directions.',
      date: 'May 10, 2023',
      author: 'David Park',
      tags: ['Language', 'Korean', 'Communication'],
      readTime: '6 min read',
    },
    {
      id: 3,
      title: 'Navigating the Korean Healthcare System',
      excerpt: 'Everything you need to know about health insurance, finding English-speaking doctors, and getting medical care in Korea.',
      date: 'May 5, 2023',
      author: 'Emma Lee',
      tags: ['Healthcare', 'Insurance', 'Medical'],
      readTime: '10 min read',
    },
    {
      id: 4,
      title: 'Expat-Friendly Neighborhoods in Seoul',
      excerpt: 'A comprehensive guide to Seoul\'s most popular neighborhoods for foreigners, including housing prices, amenities, and community.',
      date: 'April 28, 2023',
      author: 'Michael Cho',
      tags: ['Housing', 'Seoul', 'Neighborhoods'],
      readTime: '12 min read',
    },
    {
      id: 5,
      title: 'Korean Work Culture: What to Expect',
      excerpt: 'Understanding Korean workplace norms, hierarchy, communication styles, and social expectations.',
      date: 'April 20, 2023',
      author: 'Jennifer Yoon',
      tags: ['Work', 'Culture', 'Employment'],
      readTime: '9 min read',
    },
  ];

  const allTags = ['All', 'Documentation', 'Language', 'Healthcare', 'Housing', 'Work', 'Culture', 'Food', 'Travel'];
  const [activeTag, setActiveTag] = useState("All");

  // Filter posts based on active tag
  const filteredPosts =
    activeTag === "All"
      ? posts
      : posts.filter((post) => post.tags.includes(activeTag));

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">Blog</h1>
      <p className="mb-8 text-xl text-gray-700 dark:text-gray-300">
        Helpful articles and resources for foreigners living in or visiting South Korea.
      </p>

      {/* Tags Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`rounded-full px-4 py-2 text-sm font-medium 
                        ${activeTag === tag 
                            ? "bg-black text-white dark:bg-white dark:text-black" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        }`}
            >
            {tag}
            </button>

        ))}
      </div>

      {/* Blog Posts */}
      <div className="space-y-10">
        {filteredPosts.map((post) => (
          <article key={post.id} className="border-b border-gray-200 pb-10 dark:border-gray-700">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
              <span>•</span>
              <span>By {post.author}</span>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">{post.title}</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">{post.excerpt}</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              Read more &rarr;
            </button>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-10 flex justify-center">
        <nav className="inline-flex">
          <button className="rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            Previous
          </button>
          <button className="border-t border-b border-r border-gray-300 bg-white px-4 py-2 text-sm font-medium text-primary-600 dark:border-gray-600 dark:bg-gray-800 dark:text-primary-400">
            1
          </button>
          <button className="border-t border-b border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            2
          </button>
          <button className="border-t border-b border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            3
          </button>
          <button className="rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            Next
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Blog;
