import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Trash2, Plus, FileText, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ResourceFileUploader } from "./resource-file-uploader";

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["blog", "faq", "guide", "download"]),
  category: z.string().optional(),
  tags: z.string().optional(),
  featuredImage: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

interface Resource {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  type: string;
  category?: string;
  tags?: string;
  featuredImage?: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorUser?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export default function ResourceManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/admin/resources", filterType],
    queryFn: async () => {
      const params = filterType !== "all" ? `?type=${filterType}` : "";
      const response = await apiRequest("GET", `/api/admin/resources${params}`);
      return response.json();
    },
  });

  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      type: "faq",
      category: "",
      tags: "",
      featuredImage: "",
      isPublished: false,
      isFeatured: false,
    },
  });

  // Auto-generate slug from title
  const watchedTitle = form.watch("title");
  
  useEffect(() => {
    if (watchedTitle && !editingResource) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue("slug", slug);
    }
  }, [watchedTitle, editingResource, form]);

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof resourceSchema>) => {
      const response = await apiRequest("POST", "/api/admin/resources", data);
      return response.json();
    },
    onMutate: async (newResource) => {
      await queryClient.cancelQueries({ queryKey: ["/api/admin/resources", filterType] });
      const previous = queryClient.getQueryData<Resource[]>(["/api/admin/resources", filterType]) || [];
      const optimistic: Resource = {
        id: `temp-${Date.now()}`,
        title: newResource.title,
        slug: newResource.slug || newResource.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        excerpt: newResource.excerpt,
        content: newResource.content,
        type: newResource.type,
        category: newResource.category || '',
        tags: newResource.tags || '',
        featuredImage: newResource.featuredImage || '',
        isPublished: !!newResource.isPublished,
        isFeatured: !!newResource.isFeatured,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Resource;
      queryClient.setQueryData<Resource[]>(["/api/admin/resources", filterType], [...previous, optimistic]);
      return { previous };
    },
    onError: (error: any, _variables, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/admin/resources", filterType], context.previous);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create resource",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({ title: `${data.type.toUpperCase()} created`, description: `The ${data.type} has been created successfully.` });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof resourceSchema>> }) => {
      const response = await apiRequest("PUT", `/api/admin/resources/${id}`, data);
      return response.json();
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/admin/resources", filterType] });
      const previous = queryClient.getQueryData<Resource[]>(["/api/admin/resources", filterType]) || [];
      const updated = previous.map((r) => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } as any : r);
      queryClient.setQueryData(["/api/admin/resources", filterType], updated);
      return { previous };
    },
    onError: (error: any, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/admin/resources", filterType], context.previous);
      }
      toast({ title: "Error", description: error.message || "Failed to update resource", variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Resource updated", description: "The resource has been updated successfully." });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
      setIsDialogOpen(false);
      setEditingResource(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/resources/${id}`);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/admin/resources", filterType] });
      const previous = queryClient.getQueryData<Resource[]>(["/api/admin/resources", filterType]) || [];
      queryClient.setQueryData(["/api/admin/resources", filterType], previous.filter((r) => r.id !== id));
      return { previous };
    },
    onError: (error: any, _id, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/admin/resources", filterType], context.previous);
      }
      toast({ title: "Error", description: error.message || "Failed to delete resource", variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Resource deleted", description: "The resource has been deleted successfully." });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/resources"] });
    },
  });

  const onSubmit = (data: z.infer<typeof resourceSchema>) => {
    // Generate slug from title if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    form.reset({
      title: resource.title,
      slug: resource.slug,
      excerpt: resource.excerpt,
      content: resource.content,
      type: resource.type as any,
      category: resource.category || "",
      tags: resource.tags || "",
      featuredImage: resource.featuredImage || "",
      isPublished: resource.isPublished,
      isFeatured: resource.isFeatured,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreateNew = () => {
    setEditingResource(null);
    form.reset({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      type: filterType !== "all" ? filterType as any : "faq",
      category: "",
      tags: "",
      featuredImage: "",
      isPublished: false,
      isFeatured: false,
    });
    setIsDialogOpen(true);
  };

  return (
    <div data-testid="resource-manager">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resource Management</h2>
          <p className="text-slate-600">Create and manage all resources including FAQs, blogs, and guides</p>
        </div>
        <div className="flex gap-4 items-center">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="faq">FAQs</SelectItem>
              <SelectItem value="blog">Blog Posts</SelectItem>
              <SelectItem value="guide">Guides</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCreateNew} data-testid="create-resource-btn">
            <Plus className="h-4 w-4 mr-2" />
            Create Resource
          </Button>
        </div>
      </div>

      {/* Resources List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No blog posts found. Create your first blog post!</p>
            </CardContent>
          </Card>
        ) : (
          resources.map((resource) => (
            <Card key={resource.id} data-testid={`resource-item-${resource.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      <Badge className={`${
                        resource.type === 'faq' ? 'bg-blue-100 text-blue-800' :
                        resource.type === 'blog' ? 'bg-green-100 text-green-800' :
                        resource.type === 'guide' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {resource.type.toUpperCase()}
                      </Badge>
                      {resource.isPublished ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Eye className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                      {resource.isFeatured && (
                        <Badge className="bg-orange-100 text-orange-800">Featured</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{resource.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>/{resource.slug}</span>
                      {resource.category && <span>Category: {resource.category}</span>}
                      <span>Created {formatDistanceToNow(new Date(resource.createdAt))} ago</span>
                      {resource.authorUser && (
                        <span>by {resource.authorUser.firstName} {resource.authorUser.lastName}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(resource)}
                      data-testid={`edit-resource-${resource.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(resource.id)}
                      data-testid={`delete-resource-${resource.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? `Edit ${editingResource.type.toUpperCase()}` : `Create New ${form.watch("type").toUpperCase()}`}
            </DialogTitle>
            <DialogDescription>
              {editingResource 
                ? `Make changes to this ${editingResource.type}. Click save when you're done.`
                : `Create a new ${form.watch("type")} for your platform. Fill in the details below.`
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter resource title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <FormControl>
                        <select 
                          {...field}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="faq">FAQ</option>
                          <option value="blog">Blog Post</option>
                          <option value="guide">Guide</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="auto-generated-from-title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the blog post..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the full blog post content (HTML and Markdown supported)..."
                        className="resize-none min-h-[250px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select 
                          {...field}
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select category</option>
                          {form.watch("type") === "faq" ? (
                            <>
                              <option value="About Us">About Us</option>
                              <option value="Services">Services</option>
                              <option value="Job Placement">Job Placement</option>
                              <option value="Fees & Payments">Fees & Payments</option>
                              <option value="Support & Aftercare">Support & Aftercare</option>
                              <option value="Communication & Contact">Communication & Contact</option>
                              <option value="Trust & Verification">Trust & Verification</option>
                              <option value="Career & Future">Career & Future</option>
                              <option value="Miscellaneous">Miscellaneous</option>
                            </>
                          ) : form.watch("type") === "blog" ? (
                            <>
                              <option value="news">News & Updates</option>
                              <option value="career-tips">Career Tips</option>
                              <option value="success-stories">Success Stories</option>
                              <option value="industry-insights">Industry Insights</option>
                            </>
                          ) : (
                            <>
                              <option value="visa-guide">Visa Guide</option>
                              <option value="country-guide">Country Guide</option>
                              <option value="career-guide">Career Guide</option>
                            </>
                          )}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="career, visa, immigration (comma-separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <ResourceFileUploader
                  onUploadSuccess={(filePath, fileName, fileSize, type) => {
                    form.setValue('featuredImage', filePath);
                  }}
                  currentFile={form.watch('featuredImage')}
                  uploadType="image"
                />
                {form.watch('featuredImage') && (
                  <div className="text-sm text-muted-foreground">
                    Current image: {form.watch('featuredImage')?.split('/').pop()}
                  </div>
                )}
              </FormItem>

              <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Publish immediately</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Featured resource</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="submit-resource-btn"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editingResource ? `Update ${editingResource.type.toUpperCase()}` : `Create ${form.watch("type").toUpperCase()}`)}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}