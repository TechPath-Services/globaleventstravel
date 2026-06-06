"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogPostSchema, type BlogPostFormData } from "@/lib/validations";
import { slugify, calculateReadingTime } from "@/lib/utils";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { MarkdownEditor } from "@/components/editors/MarkdownEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { FormField } from "@/components/ui/FormField";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { categoryService } from "@/services/category.service";
import { tagService } from "@/services/tag.service";
import { blogService } from "@/services/blog.service";
import type { BlogCategory, BlogTag, BlogAuthor, BlogPost } from "@/types/api";
import { cn } from "@/lib/utils";
import { isLikelyMarkdown } from "@/lib/markdown";

interface BlogPostFormProps {
  post?: BlogPost;
  onSubmit: (data: BlogPostFormData) => Promise<void>;
  isLoading?: boolean;
}

export function BlogPostForm({ post, onSubmit, isLoading }: BlogPostFormProps) {
  const initialEditorType =
    post?.contentType === "markdown" || isLikelyMarkdown(post?.content || "")
      ? "markdown"
      : "html";
  const [editorType, setEditorType] = useState<"html" | "markdown">(
    initialEditorType
  );
  const [categories, setCategories] = useState<
    Array<BlogCategory & { level: number; fullPath: string }>
  >([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>(
    post?.tagsList?.map((t) => t.id) || []
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      content_type: initialEditorType,
      status: post?.status || "draft",
      category_id: post?.categoryId || undefined,
      featured: post?.featured || false,
      featured_image: post?.featuredImage || "",
      meta_title: post?.metaTitle || "",
      meta_description: post?.metaDescription || "",
      meta_keywords: post?.metaKeywords?.join(", ") || "",
      author_id: post?.author?.id || 1,
      tag_ids: post?.tagsList?.map((t) => t.id) || [],
    },
  });

  const title = watch("title");
  const content = watch("content");

  // Auto-generate slug from title
  useEffect(() => {
    if (!post && title) {
      setValue("slug", slugify(title));
    }
  }, [title, post, setValue]);

  // Calculate reading time
  useEffect(() => {
    if (content) {
      setValue("reading_time", calculateReadingTime(content));
    }
  }, [content, setValue]);

  // Load categories, tags, and authors
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryTree, tagsList, authorsList] = await Promise.all([
          categoryService.getTree(),
          tagService.list(),
          blogService.getAuthors(),
        ]);

        setCategories(categoryService.flattenTree(categoryTree));
        setTags(tagsList);
        setAuthors(authorsList);

        // Set default author if not set
        if (!post && authorsList.length > 0) {
          setValue("author_id", authorsList[0].id);
        }
      } catch (error) {
        console.error("Failed to load form data:", error);
      }
    };

    loadData();
  }, [post, setValue]);

  const handleTagToggle = (tagId: number) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newTags);
    setValue("tag_ids", newTags);
  };

  const handleFormSubmit = (data: BlogPostFormData) => {
    data.content_type = editorType;
    data.tag_ids = selectedTags;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Details */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Post Details
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Title"
                error={errors.title?.message}
                required
              >
                <Input
                  placeholder="Enter post title"
                  error={!!errors.title}
                  {...register("title")}
                />
              </FormField>

              <FormField
                label="Slug"
                error={errors.slug?.message}
                required
                hint="URL-friendly identifier"
              >
                <Input
                  placeholder="post-url-slug"
                  error={!!errors.slug}
                  {...register("slug")}
                />
              </FormField>

              <FormField label="Category" error={errors.category_id?.message}>
                <Select {...register("category_id", { valueAsNumber: true })}>
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.fullPath}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Excerpt" hint="Short summary (max 500 chars)">
                <Textarea
                  placeholder="Brief description of the post..."
                  rows={3}
                  maxLength={500}
                  {...register("excerpt")}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Content</h2>
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setEditorType("html")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      editorType === "html"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Rich Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorType("markdown")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      editorType === "markdown"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    Markdown
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Controller
                name="content"
                control={control}
                render={({ field }) =>
                  editorType === "html" ? (
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                      error={!!errors.content}
                    />
                  ) : (
                    <MarkdownEditor
                      content={field.value}
                      onChange={field.onChange}
                      error={!!errors.content}
                    />
                  )
                }
              />
              {errors.content && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.content.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Publish</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Status" required>
                <Select {...register("status")}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </FormField>

              <FormField label="Author" required>
                <Select {...register("author_id", { valueAsNumber: true })}>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Featured Post
                </span>
                <Controller
                  name="featured"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                >
                  {post ? "Update Post" : "Create Post"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Featured Image
              </h2>
            </CardHeader>
            <CardContent>
              <Controller
                name="featured_image"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder="blog"
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm transition-colors",
                      selectedTags.includes(tag.id)
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-gray-500">No tags available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                SEO Settings
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label="Meta Title"
                hint={`${watch("meta_title")?.length || 0}/70 characters`}
              >
                <Input
                  placeholder="SEO title"
                  maxLength={70}
                  {...register("meta_title")}
                />
              </FormField>

              <FormField
                label="Meta Description"
                hint={`${watch("meta_description")?.length || 0}/160 characters`}
              >
                <Textarea
                  placeholder="SEO description"
                  rows={3}
                  maxLength={160}
                  {...register("meta_description")}
                />
              </FormField>

              <FormField
                label="Meta Keywords"
                hint="Comma-separated keywords for SEO"
              >
                <Input
                  placeholder="trekking, himalayas, adventure, travel"
                  {...register("meta_keywords")}
                />
              </FormField>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}


