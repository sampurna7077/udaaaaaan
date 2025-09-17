import { useState, useEffect } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import ScrollProgress from "@/components/scroll-progress";
import Footer from "@/components/footer";
import LoadingVideo from "@/components/loading-video";
import { useFirstVisit } from "@/hooks/use-first-visit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  ArrowRight,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  TrendingUp,
  Filter,
  Search,
  Users,
  CreditCard,
  HeadphonesIcon,
  Shield,
  MessageCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import FAQSchema from "@/components/faq-schema";

interface Resource {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  type: string;
  category?: string;
  country?: string;
  tags?: string;
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  isFeatured?: boolean;
}

export default function Resources() {
  const { shouldShowLoading: firstVisitLoading } = useFirstVisit('resources', 2500);
  
  // Check URL parameters for direct navigation
  const urlParams = new URLSearchParams(window.location.search);
  const sectionParam = urlParams.get('section');
  
  const [activeSection, setActiveSection] = useState(sectionParam === 'faq' ? 'faq' : "guides");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>("all");
  const [faqSearchTerm, setFaqSearchTerm] = useState("");

  useEffect(() => {
    // Enhanced SEO meta tags
    document.title = "Resources & Guides - Udaan Agencies | Country Guides & Career Tips";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Comprehensive resources and guides for overseas employment in Nepal. Get expert advice on visa processing, job placement, and career opportunities abroad with Udaan Agencies.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Comprehensive resources and guides for overseas employment in Nepal. Get expert advice on visa processing, job placement, and career opportunities abroad with Udaan Agencies.';
      document.head.appendChild(meta);
    }

    // Add keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'Udaan Agencies, Nepal manpower, overseas employment, visa processing, job placement, FAQ, career guidance, international jobs, recruitment Nepal');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'Udaan Agencies, Nepal manpower, overseas employment, visa processing, job placement, FAQ, career guidance, international jobs, recruitment Nepal';
      document.head.appendChild(meta);
    }

    // Add Open Graph tags for social media
    const addOpenGraphTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    addOpenGraphTag('og:title', 'Resources & Guides - Udaan Agencies');
    addOpenGraphTag('og:description', 'Comprehensive resources and guides for overseas employment in Nepal');
    addOpenGraphTag('og:type', 'website');
    addOpenGraphTag('og:url', window.location.href);
    
    // Add structured data for FAQ
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": []
    };
    
    let existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, []);

  const resourcesQuery = useQuery<Resource[]>({
    queryKey: ["/api/resources", activeSection],
    queryFn: async () => {
      // Normalize client section to API types
      const apiType = activeSection === "guides" ? "guide" : activeSection === "downloads" ? "download" : activeSection;
      const params = activeSection !== "all" ? `?type=${apiType}` : "";
      let response = await fetch(`/api/resources${params}`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      let data: Resource[] = await response.json();

      // Fallback: if typed query returns empty, fetch all and filter client-side
      if ((data?.length ?? 0) === 0 && (activeSection === "guides" || activeSection === "downloads" || activeSection === "blog")) {
        response = await fetch(`/api/resources`);
        if (!response.ok) throw new Error('Failed to fetch resources');
        data = await response.json();
      }

      return data as Resource[];
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const resources: Resource[] = resourcesQuery.data ?? [];
  const isLoading = resourcesQuery.isLoading;

  const { data: faqs = [], isLoading: faqsLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources", "faq"],
    queryFn: async () => {
      const response = await fetch("/api/resources?type=faq");
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      return response.json();
    },
  });

  const sections = [
    { id: "guides", label: "Country Guides", icon: Globe },
    { id: "blog", label: "Blog & News", icon: FileText },
    { id: "faq", label: "Frequently Asked Questions", icon: HelpCircle },
  ];

  // FAQ categories with icons
  const faqCategories = [
    { id: "all", label: "All Questions", icon: HelpCircle, count: faqs.length },
    { id: "About Us", label: "About Us", icon: Users, count: faqs.filter(f => f.category === "About Us").length },
    { id: "Services", label: "Services", icon: Globe, count: faqs.filter(f => f.category === "Services").length },
    { id: "Job Placement", label: "Job Placement", icon: TrendingUp, count: faqs.filter(f => f.category === "Job Placement").length },
    { id: "Fees & Payments", label: "Fees & Payments", icon: CreditCard, count: faqs.filter(f => f.category === "Fees & Payments").length },
    { id: "Support & Aftercare", label: "Support & Aftercare", icon: HeadphonesIcon, count: faqs.filter(f => f.category === "Support & Aftercare").length },
    { id: "Communication & Contact", label: "Contact", icon: MessageCircle, count: faqs.filter(f => f.category === "Communication & Contact").length },
    { id: "Trust & Verification", label: "Trust & Verification", icon: Shield, count: faqs.filter(f => f.category === "Trust & Verification").length },
  ];

  // Filter FAQs based on category and search
  const displayFaqs = faqs.filter(faq => {
    const matchesCategory = selectedFaqCategory === "all" || faq.category === selectedFaqCategory;
    const matchesSearch = faqSearchTerm === "" || 
      faq.title.toLowerCase().includes(faqSearchTerm.toLowerCase()) ||
      faq.content.toLowerCase().includes(faqSearchTerm.toLowerCase()) ||
      (faq.tags && faq.tags.toLowerCase().includes(faqSearchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  // Update structured data when FAQs are loaded
  useEffect(() => {
    if (faqs.length > 0) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.filter(faq => faq.isFeatured).map(faq => ({
          "@type": "Question",
          "name": faq.title,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.content.replace(/<[^>]*>/g, '') // Strip HTML tags
          }
        }))
      };
      
      let existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [faqs]);

  const renderGuides = () => {
    const guideResources = resources.filter(resource => resource.type === 'guide' || resource.type === 'guides');
    const featuredGuide = guideResources.find(guide => guide.isFeatured);
    
    return (
      <div data-testid="country-guides">
        <h2 className="font-display text-2xl font-bold text-slate-800 mb-8">Popular Destination Guides</h2>
        
        {/* Featured Guide */}
        {featuredGuide && (
          <Card className="bg-gradient-to-br from-primary-50 to-coral-50 mb-12" data-testid="featured-report">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="font-display text-2xl font-bold text-slate-800 mb-4">{featuredGuide.title}</h3>
                  <p className="text-slate-600 mb-6">{featuredGuide.excerpt || featuredGuide.content.substring(0, 200) + '...'}</p>
                  <Link href={`/resources/${featuredGuide.slug}`}>
                    <Button 
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300"
                      data-testid="button-download-report"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Read Guide
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-center">
                  {featuredGuide.featuredImage ? (
                    <img 
                      src={featuredGuide.featuredImage} 
                      alt={featuredGuide.title}
                      className="w-64 h-48 object-cover rounded-xl shadow-lg"
                    />
                  ) : (
                    <div className="w-64 h-48 bg-white rounded-xl shadow-lg flex items-center justify-center">
                      <TrendingUp className="h-16 w-16 text-primary-600" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Country Guides Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guideResources.filter(guide => !guide.isFeatured).map((guide) => (
            <Card key={guide.id} className="shadow-lg card-hover" data-testid={`guide-${guide.slug}`}>
              {guide.featuredImage ? (
                <img 
                  src={guide.featuredImage} 
                  alt={guide.title}
                  className="h-48 w-full object-cover rounded-t-2xl"
                />
              ) : (
                <div className="h-48 bg-slate-200 rounded-t-2xl flex items-center justify-center">
                  <Globe className="h-16 w-16 text-slate-400" />
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-bold text-slate-800 mb-3">{guide.title}</h3>
                <p className="text-slate-600 mb-4">{guide.excerpt || guide.content.substring(0, 150) + '...'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {guide.tags && guide.tags.split(',').slice(0, 2).map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                    {guide.country && (
                      <Badge variant="secondary" className="text-xs">
                        {guide.country}
                      </Badge>
                    )}
                  </div>
                  <Link href={`/resources/${guide.slug}`}>
                    <Button 
                      variant="ghost" 
                      className="text-primary-600 hover:text-primary-700 font-medium p-0"
                      data-testid={`button-view-guide-${guide.slug}`}
                    >
                      Read Guide <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {guideResources.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No guides available yet. Check back soon!</p>
          </div>
        )}
      </div>
    );
  };

  const renderBlog = () => {
    const blogResources = resources.filter(resource => resource.type === 'blog');
    
    return (
      <div data-testid="blog-section">
        <h2 className="font-display text-2xl font-bold text-slate-800 mb-8">Latest Blog Posts</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {blogResources.map((post) => (
            <Card key={post.id} className="shadow-lg card-hover overflow-hidden" data-testid={`blog-post-${post.slug}`}>
              {post.featuredImage ? (
                <img 
                  src={post.featuredImage} 
                  alt={post.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="h-48 bg-slate-200 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-slate-400" />
                </div>
              )}
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center text-sm text-slate-500 mb-3 flex-wrap">
                  {post.category && <span className="truncate">{post.category}</span>}
                  {post.category && <span className="mx-2">•</span>}
                  <span className="whitespace-nowrap">{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-slate-800 mb-3 line-clamp-2 break-words">
                  {post.title}
                </h3>
                <p className="text-slate-600 mb-4 line-clamp-3 break-words leading-relaxed flex-grow">
                  {post.excerpt || (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content)}
                </p>
                <div className="mt-auto">
                  <Link href={`/resources/${post.slug}`}>
                    <Button 
                      variant="ghost" 
                      className="text-primary-600 hover:text-primary-700 font-medium p-0 w-full justify-center"
                      data-testid={`button-read-article-${post.slug}`}
                    >
                      Read More <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {blogResources.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No blog posts available yet. Check back soon!</p>
          </div>
        )}
      </div>
    );
  };

   

  const renderFaq = () => (
    <div data-testid="faq-section">
      {/* FAQ Header with Search */}
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-800 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
          Get instant answers to common questions about Udaan Agencies, our services, and overseas employment opportunities
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search frequently asked questions..."
            value={faqSearchTerm}
            onChange={(e) => setFaqSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 text-center"
          />
        </div>
      </div>

      {faqsLoading ? (
        <div className="max-w-6xl mx-auto">
          {/* Loading skeleton for categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-200 rounded-lg"></div>
              </div>
            ))}
          </div>
          {/* Loading skeleton for FAQs */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-lg overflow-hidden">
                <div className="px-6 py-4 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Category Filter Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
            {faqCategories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedFaqCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSelectedFaqCategory(category.id)}
                  className={`p-4 h-auto flex flex-col items-center gap-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg scale-105"
                      : "border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-primary-300"
                  }`}
                  data-testid={`faq-category-${category.id}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {category.label}
                  </span>
                  {category.count > 0 && (
                    <Badge 
                      variant={isActive ? "secondary" : "outline"} 
                      className={`text-xs ${isActive ? "bg-white/20 text-white" : ""}`}
                    >
                      {category.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Search Results Info */}
          {(faqSearchTerm || selectedFaqCategory !== "all") && (
            <div className="mb-6 text-center">
              <p className="text-slate-600">
                {displayFaqs.length > 0 ? (
                  <>
                    Showing <span className="font-semibold text-primary-600">{displayFaqs.length}</span> 
                    {faqSearchTerm && <> results for "<span className="font-semibold">{faqSearchTerm}</span>"</>}
                    {selectedFaqCategory !== "all" && (
                      <> in <span className="font-semibold">{selectedFaqCategory}</span></>
                    )}
                  </>
                ) : (
                  <>No questions found. Try different keywords or select another category.</>
                )}
              </p>
              {(faqSearchTerm || selectedFaqCategory !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFaqSearchTerm("");
                    setSelectedFaqCategory("all");
                  }}
                  className="mt-2 text-primary-600 hover:text-primary-700"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* FAQ Items */}
          <div className="space-y-4">
            {displayFaqs.map((faq, index) => (
              <Card 
                key={faq.id} 
                className={`shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  faq.isFeatured ? "ring-2 ring-primary-200 bg-gradient-to-r from-primary-50 to-blue-50" : ""
                }`}
                data-testid={`faq-${faq.id}`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  data-testid={`faq-question-${faq.id}`}
                  aria-expanded={expandedFaq === faq.id ? "true" : "false"}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-lg leading-tight pr-4">
                        {faq.title}
                      </h3>
                      {faq.category && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {faq.category}
                        </Badge>
                      )}
                      {faq.isFeatured && (
                        <Badge className="mt-2 ml-2 text-xs bg-orange-100 text-orange-800">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </button>
                {expandedFaq === faq.id && (
                  <div 
                    id={`faq-answer-${faq.id}`}
                    className="px-6 pb-6 text-slate-700 animate-in slide-in-from-top-2 duration-300" 
                    data-testid={`faq-answer-${faq.id}`}
                  >
                    <div className="ml-12 border-l-4 border-primary-200 pl-6">
                      <div 
                        className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-800 prose-ul:text-slate-700 prose-li:text-slate-700"
                        dangerouslySetInnerHTML={{ __html: faq.content }}
                      />
                      {faq.tags && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-xs text-slate-500 mb-2">Related topics:</p>
                          <div className="flex flex-wrap gap-1">
                            {faq.tags.split(',').slice(0, 5).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {displayFaqs.length === 0 && !faqsLoading && (
            <div className="text-center py-16">
              <HelpCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No questions found</h3>
              <p className="text-slate-600 mb-6">
                Try adjusting your search terms or browse different categories
              </p>
              <Button
                onClick={() => {
                  setFaqSearchTerm("");
                  setSelectedFaqCategory("all");
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                View All Questions
              </Button>
            </div>
          )}
          
          {/* Contact CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Still have questions?</h3>
            <p className="text-slate-600 mb-6">
              Can't find what you're looking for? Our expert consultants are here to help you with personalized guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/forms?type=contact'}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl hover:scale-105 transition-transform"
                data-testid="button-contact-team"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Our Team
              </Button>
              <Button 
                onClick={() => window.location.href = '/forms?type=consultation'}
                variant="outline" 
                className="border-2 border-primary-200 text-primary-700 hover:bg-primary-50 px-8 py-3 rounded-xl hover:scale-105 transition-transform"
                data-testid="button-schedule-consultation"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "guides":
        return renderGuides();
      case "blog":
        return renderBlog();      
      case "faq":
        return renderFaq();
      default:
        return renderGuides();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="app-like-header">
        <Navigation />
      </div>
      <ScrollProgress />
      
      {/* Mobile Header */}
      <div className="md:hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-6 py-8 mt-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">Resources & Guides</h1>
          <p className="text-blue-100 text-lg font-medium">Everything you need to know about studying and working abroad</p>
        </div>
      </div>

      {/* Mobile Section Navigation */}
      <div className="md:hidden bg-white border-b border-gray-100 sticky top-[64px] z-40">
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 w-fit mx-auto place-items-center">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "outline"}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                    activeSection === section.id
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                  data-testid={`mobile-section-button-${section.id}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden pb-24">
        <div className="px-4 sm:px-6 pt-6">
          <div className="min-h-[400px]" data-testid="mobile-active-section-content">
            {(isLoading || firstVisitLoading) ? (
              <div className="text-center py-16">
                <LoadingVideo width={120} height={120} />
                <p className="mt-6 text-slate-600 text-lg">Loading resources...</p>
              </div>
            ) : (
              renderActiveSection()
            )}
          </div>
        </div>
      </div>
      
      {/* Desktop Content */}
      <div className="hidden md:block pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12" data-testid="resources-header">
            <h1 className="font-display text-4xl font-bold text-slate-800 mb-4">Resources & Guides</h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Everything you need to know about studying and working abroad</p>
          </div>

          {/* Quick Navigation */}
          <div className="grid grid-cols-3 gap-4 mb-12 w-fit mx-auto place-items-center" data-testid="section-navigation">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "outline"}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                    activeSection === section.id
                      ? "bg-primary-600 hover:bg-primary-700 text-white"
                      : "border-2 border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                  data-testid={`section-button-${section.id}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>

          {/* Active Section Content */}
          <div className="min-h-[600px]" data-testid="active-section-content">
            {(isLoading || firstVisitLoading) ? (
              <div className="text-center py-16">
                <LoadingVideo width={120} height={120} />
                <p className="mt-6 text-slate-600 text-lg">Loading resources...</p>
              </div>
            ) : (
              renderActiveSection()
            )}
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
      
      {/* SEO Schema Component */}
      {activeSection === "faq" && <FAQSchema faqs={faqs} />}
    </div>
  );
}
