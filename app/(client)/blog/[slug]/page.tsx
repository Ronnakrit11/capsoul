import Container from "@/components/Container";
import { urlFor } from "@/sanity/lib/image";
import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText } from "@portabletext/react";

async function getBlogBySlug(slug: string) {
  try {
    const query = `*[_type == "blog" && slug.current == $slug][0]`;
    const blog = await client.fetch(query, { slug });
    return blog;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: Params) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <Container className="py-10">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">{blog.title}</h1>
        <div className="relative h-[400px] w-full mb-8 rounded-lg overflow-hidden">
          {blog.image && (
            <Image
              src={urlFor(blog.image).url()}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
        <div className="prose prose-lg max-w-none">
          <PortableText value={blog.content} />
        </div>
        <div className="mt-6 text-gray-500 text-sm">
          Published on {new Date(blog.publishedAt).toLocaleDateString()}
        </div>
      </article>
    </Container>
  );
}