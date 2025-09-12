import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../api/supabase-client";
import { FaL } from "react-icons/fa6";

export default function GuideDetail() {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("guide")
        .select("id, created_at, name, description, img_url, created_by, content")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching guide:", error.message);
      } else {
        setGuide(data);
      }
      setLoading(false);
    };

    fetchGuide();
  }, [id]);

  if (loading) {
    return <p className="p-6 text-gray-600 dark:text-gray-300">Loading guide...</p>;
  }

  if (!guide) {
    return <p className="p-6 text-red-500">Guide not found.</p>;
  }

  const createdDate = new Date(guide.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Render content sections dynamically
  const renderSection = (section, index) => {
    switch (section.type) {
      case "text":
        return (
          <p key={index} className="mb-4 text-lg text-gray-700 dark:text-gray-300">
            {section.body}
          </p>
        );
      case "image":
        return (
          <div
            key={index}
            className="mb-8 flex justify-center"
          >
            <div className="overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg bg-gray-50 dark:border-gray-700 dark:bg-gray-800 w-full max-w-3xl">
              <img
                src={section.url}
                alt={section.caption || "Guide image"}
                className="w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {section.caption && (
                <p className="mt-2 px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                  {section.caption}
                </p>
              )}
            </div>
          </div>
        );


      case "links":
        return (
          <ul key={index} className="mb-6 space-y-2">
            {section.items.map((link, idx) => (
              <li key={idx}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline dark:text-primary-400"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back button */}
      <Link
        to="/guides"
        className="mb-6 inline-block text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
      >
        ← Back to Guides
      </Link>

      {/* Title + Author */}
      <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
        {guide.name}
      </h1>
      <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <span>By {guide.created_by}</span>
        <span className="mx-2">•</span>
        <span>{createdDate}</span>
      </div>

      {/* Main image */}
      {guide.image_url && (
        <div className="mb-6">
          <img
            src={guide.image_url}
            alt={guide.name}
            className="max-h-96 w-full rounded-lg object-cover shadow-md bg-gray-100"
          />
        </div>
      )}

      {/* Description */}
      <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">
        {guide.description}
      </p>

      {/* Content sections */}
      {guide.content?.sections?.map((section, idx) => renderSection(section, idx))}

      {/* Tags */}
      {Array.isArray(guide.content?.tags) && guide.content.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {guide.content.tags.map((tag, idx) => (
            <span
              key={idx}
              className="rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
