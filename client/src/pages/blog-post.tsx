import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import ScrollProgress from "@/components/scroll-progress";
import Footer from "@/components/footer";
import LoadingVideo from "@/components/loading-video";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Tag, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  type: string;
  category?: string;
  tags?: string;
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
  authorUser?: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export default function BlogPost() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();

  const { data: blogPost, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/resources", slug],
    queryFn: async () => {
      const response = await fetch(`/api/resources/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Blog post not found');
        }
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 1,
  });

  useEffect(() => {
    if (blogPost) {
      document.title = `${blogPost.title} - Udaan Agencies Blog`;
    }
  }, [blogPost]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = blogPost?.title || 'Blog Post';
    
     
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="pt-20 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <LoadingVideo width={120} height={120} />
              <p className="mt-6 text-slate-600 text-lg">Loading blog post...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="pt-20 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold text-slate-800 mb-4">Blog Post Not Found</h1>
              <p className="text-slate-600 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
              <Button 
                onClick={() => setLocation('/resources')}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <ScrollProgress />
      
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/resources')}
            className="mb-6 text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources
          </Button>

          {/* Blog Post Header */}
          <div className="mb-8">
            {blogPost.featuredImage && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img 
                  src={blogPost.featuredImage} 
                  alt={blogPost.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
            )}

            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {blogPost.category && (
                  <Badge className="bg-primary-100 text-primary-800">
                    {blogPost.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                )}
                {blogPost.isFeatured && (
                  <Badge className="bg-orange-100 text-orange-800">
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight">
                {blogPost.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {blogPost.publishedAt 
                      ? formatDistanceToNow(new Date(blogPost.publishedAt), { addSuffix: true })
                      : formatDistanceToNow(new Date(blogPost.createdAt), { addSuffix: true })
                    }
                  </span>
                </div>
                
                {blogPost.authorUser && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>
                      {blogPost.authorUser.firstName && blogPost.authorUser.lastName 
                        ? `${blogPost.authorUser.firstName} ${blogPost.authorUser.lastName}`
                        : blogPost.authorUser.email
                      }
                    </span>
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleShare}
                  className="text-slate-600 hover:text-slate-800 p-1"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>

              {blogPost.excerpt && (
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  {blogPost.excerpt}
                </p>
              )}
            </div>
          </div>

          {/* Blog Post Content */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div 
                className="prose prose-slate max-w-none prose-lg prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-primary-600 prose-strong:text-slate-800"
                dangerouslySetInnerHTML={{ __html: blogPost.content }}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          {blogPost.tags && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center">
            <Button 
              onClick={() => setLocation('/resources')}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Resources
            </Button>
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
