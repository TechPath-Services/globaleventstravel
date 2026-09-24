"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { BlogPostForm } from "@/components/forms/BlogPostForm";
import { blogService } from "@/services/blog.service";
import { useUIStore } from "@/store/ui.store";
import type { BlogPostFormData } from "@/lib/validations";

export default function CreateBlogPostPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: BlogPostFormData) => {
    setIsLoading(true);
    try {
      const metaKeywords = data.meta_keywords
        ? data.meta_keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
        : undefined;

      await blogService.create({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || undefined,
        content: data.content,
        content_type: data.content_type,
        status: data.status,
        category_id: data.category_id || undefined,
        featured: data.featured,
        featured_image: data.featured_image || undefined,
        meta_title: data.meta_title || undefined,
        meta_description: data.meta_description || undefined,
        meta_keywords: metaKeywords,
        structured_data: data.structured_data?.trim()
          ? JSON.parse(data.structured_data)
          : null,
        author_id: data.author_id,
        tag_ids: data.tag_ids,
        read_time: data.reading_time,
      });

      addToast({ type: "success", message: "Post created successfully" });
      router.push("/dashboard/blog");
    } catch (error: any) {
      addToast({
        type: "error",
        message: error.message || "Failed to create post",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create New Post"
        description="Write a new blog post"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Blog Posts", href: "/dashboard/blog" },
          { label: "Create" },
        ]}
      />

      <BlogPostForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}


