"use client";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface Blog {
  _id: string;
  title?: string;
  slug?: { current?: string };
  image?: SanityImageSource;
  excerpt?: string;
  publishedAt?: string;
}

interface Props {
  blogs: Blog[];
}

const BlogSection = ({ blogs }: Props) => {
  if (!blogs?.length) return null;

  return (
    <div className="mt-20">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Latest Blog Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog) => (
          <motion.div
            key={blog._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
          >
            <Link href={`/blog/${blog.slug?.current}`}>
              <div className="relative h-48 w-full">
                {blog.image && (
                  <Image
                    src={urlFor(blog.image).url()}
                    alt={blog.title || "Blog image"}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 line-clamp-1">{blog.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{blog.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(blog.publishedAt || "").toLocaleDateString()}
                  </span>
                  <span className="text-darkColor font-medium">Read more →</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BlogSection;