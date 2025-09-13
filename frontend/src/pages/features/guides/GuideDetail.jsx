import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../api/supabase-client";
import { FaL } from "react-icons/fa6";
import { BiLogoPlayStore } from "react-icons/bi";
import { FaAppStoreIos } from "react-icons/fa";
import { MdOutlinePlace } from "react-icons/md";
import { MdOutlineTipsAndUpdates } from "react-icons/md";

export default function GuideDetail() {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');

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

  useEffect(() => {
    const fetchAuthor = async () => {
      setLoading(true);
      const { data:userData, error:userError } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", guide.created_by)
        .single();

      if(userError){
        console.error("Error fetching author:", userError.message);
        setLoading(false);
      } else {
        setAuthor(userData.username);
        setLoading(false);
      }
    }
    if(guide?.created_by) fetchAuthor();
  }, [guide?.created_by]);

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
        <div className="mb-8 flex justify-center text-center">
          <p key={index} className="py-15 text-lg text-gray-700 ">
              {section.body}
            </p>
          </div>
        );
      case "image":
        return (
          <div
            key={index}
            className="mb-8 flex justify-center"
          >
            <div className="overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg bg-gray-50  w-full max-w-3xl">
              <img
                src={section.url}
                alt={section.caption || "Guide image"}
                className="w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {/* {section.caption && (
                <p className="mt-2 px-4 py-2 text-center text-sm text-gray-500 ">
                  {section.caption}
                </p>
              )} */}
            </div>
          </div>
        );
      case "links":
        return (
          <div>
            <h3 className="mb-4 text-2xl font-semibold text-gray-900 text-center">Click below for Address</h3>
            <ul key={index} className="mb-8 flex justify-center gap-5 flex-wrap">
              {section.items.map((link, idx) => (
                <li key={idx} className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black shadow-md hover:bg-gray-100">
                  <Link
                    to={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black flex hover:bg-gray-100 min-w-35 text-center"
                  >
                    <MdOutlinePlace size={30} className="" />
                    <span className="px-3 font-bold">{link.name}</span>
                  </Link>
                </li>
              ))}
          </ul>
          </div>
        );
      case "app_links":
      return (
        <div>
          <h4 className="mb-4 text-2xl font-semibold text-gray-900 text-center">Get the App on </h4>
          <br/>
          <ul key={index} className="mb-8 flex justify-center gap-4">
            {section.items.map((link, idx) => (
              <li key={idx} className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-black shadow-md hover:bg-gray-100" >
                {link.label === "Play Store" && (
                 
                  <div className=" items-center text-blue-500 hover:bg-gray-100 min-w-35">
                    <Link 
                      to={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#34A853] flex items-center flex-nowrap">
                        <BiLogoPlayStore size={50} className="" />
                        <span className="px-3 font-bold">{link.label}</span>
                      </Link>
                  </div>
                )}
                {link.label === "App Store" && (
                  <div className=" items-center text-blue-500 hover:bg-gray-100 min-w-35">
                    <Link 
                      to={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 flex items-center flex-nowrap">
                        <FaAppStoreIos size={50} className=""/>
                        <span className="px-3 font-bold">{link.label}</span>
                      </Link>
                  </div>
                )}
                {/* <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:underline"
                >
                  {link.label}
                </a> */}
              </li>
            ))}
          </ul>
        </div>
      );
      case "tip":
        return (
          <div key={index} className="mb-8 rounded-lg border-l-4 border-r-4 border-gray-800 bg-gold-50 p-4">
            <div className="mb-4 flex gap-3 items-center">
              <MdOutlineTipsAndUpdates size={35} className="mb-2 text-gray-800" />
              <h1 className="mb-2 text-2xl font-bold text-gray-800">Tip</h1>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-800">{section.body}</h3>
          </div>
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
        className="mb-6 inline-block text-sm font-medium text-black hover:underline px-3 py-1 dark:text-black"
      >
        ← Back to Guides
      </Link>

      {/* Title + Author */}
      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        {guide.name}
      </h1>
      <div className="mb-6 text-sm text-gray-500 ">
        <span>By {author}</span>
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

      {/* Content sections */}
      {guide.content?.sections?.length > 0 && (guide.content?.sections || [])?.map((section, idx) => renderSection(section, idx))}
      {guide.content?.sections?.length === 0 && (
        <p className="text-gray-600 dark:text-gray-300">No content available for this guide.</p>
      )}
      
      {/* Description */}
      {/* <p className="mb-6 text-lg text-gray-700">
        {guide.description}
      </p> */}


      {/* Tags */}
      {Array.isArray(guide.content?.tags) && guide.content.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 justify-center text-center">
          {guide.content.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 text-sm text-black"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}