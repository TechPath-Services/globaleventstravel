"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { BlogPostForm } from "@/components/forms/BlogPostForm";
import { blogService } from "@/services/blog.service";
import { useUIStore } from "@/store/ui.store";
import type { BlogPost } from "@/types/api";
import type { BlogPostFormData } from "@/lib/validations";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useUIStore();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const id = parseInt(params.id as string);
        const data = await blogService.getById(id);
        setPost(data);
      } catch (error) {
        addToast({ type: "error", message: "Failed to load post" });
        router.push("/dashboard/blog");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPost();
  }, [params.id, router, addToast]);

  const handleSubmit = async (data: BlogPostFormData) => {
    if (!post) return;

    setIsLoading(true);
    try {
      const metaKeywords = data.meta_keywords
        ? data.meta_keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
        : undefined;

      await blogService.update(post.id, {
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

      addToast({ type: "success", message: "Post updated successfully" });
      router.push("/dashboard/blog");
    } catch (error: any) {
      addToast({
        type: "error",
        message: error.message || "Failed to update post",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Edit Post"
        description={post.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Blog Posts", href: "/dashboard/blog" },
          { label: "Edit" },
        ]}
      />

      <BlogPostForm post={post} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}


