import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import ScrollProgress from "@/components/scroll-progress";
import Footer from "@/components/footer";
import LoadingVideo from "@/components/loading-video";
import { useFirstVisit } from "@/hooks/use-first-visit";
import HeroAnimations from "@/components/hero-animations";
import JobCard from "@/components/job-card";
import TestimonialCard from "@/components/testimonial-card";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Globe, Plane, Briefcase, Users, Building2, Award, TrendingUp, FileText, ArrowRight, HelpCircle, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeaturedJob {
  id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  location: string;
  country: string;
  remoteType: string;
  remote_type: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  tags?: string;
  postedAt: string;
  posted_at: string;
  visaSupport: boolean;
  visa_support: boolean;
  isFeatured?: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  position?: string;
  company?: string;
  photo?: string;
  rating: number;
  review: string;
  serviceType: string;
  createdAt: string;
  created_at: string;
}

interface Stats {
  successfulPlacements: number;
  partnerCountries: number;
  partnerCompanies: number;
  clientSatisfaction: number;
}

interface Resource {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  type: string;
  category?: string;
  tags?: string;
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  isFeatured?: boolean;
}

export default function Landing() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  const { data: featuredJobs = [], isLoading: jobsLoading, error: jobsError } = useQuery<FeaturedJob[]>({
    queryKey: ["/api/jobs/featured"],
    queryFn: async () => {
      const response = await fetch("/api/jobs/featured");
      if (!response.ok) {
        throw new Error(`Failed to fetch featured jobs: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Extract jobs array from response object
      return data.jobs || data;
    },
    staleTime: 10 * 1000, // 10 seconds for instant updates
    retry: 1,
    refetchInterval: 15 * 1000, // Auto-refresh every 15 seconds
  });

  const { data: testimonials = [], isLoading: testimonialsLoading, error: testimonialsError } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    retry: 1,
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    staleTime: 5 * 60 * 1000, // 5 minutes cache (stats change rarely)
    retry: 1,
  });

  const { data: featuredBlogs = [], isLoading: blogsLoading, error: blogsError } = useQuery<Resource[]>({
    queryKey: ["/api/resources/featured"],
    queryFn: async () => {
      const response = await fetch("/api/resources?isFeatured=true&limit=10");
      if (!response.ok) throw new Error('Failed to fetch featured resources');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    retry: 1,
  });

  useEffect(() => {
    document.title = "Udaan Agencies - Global Career Opportunities | Abroad Consultancy";
    
    // Enhanced Scroll Animation Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe scroll animation elements
    const scrollElements = document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale');
    scrollElements.forEach(el => observer.observe(el));


    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToJobs = () => {
    window.location.href = '/jobs';
  };

  const bookConsultation = () => {
    window.location.href = '/forms';
  };

  // Log any errors for debugging (don't block rendering)
  if (jobsError) console.warn('Jobs loading error:', jobsError);
  if (testimonialsError) console.warn('Testimonials loading error:', testimonialsError);
  if (blogsError) console.warn('Blogs loading error:', blogsError);
  if (statsError) console.warn('Stats loading error:', statsError);

  return (
    <div className="mobile-app-container">
      <Navigation />
      <ScrollProgress />
      
      {/* Mobile Hero Section */}
      <section className="pt-6 pb-12 md:min-h-screen md:flex md:items-center relative overflow-hidden" 
               style={{background: 'linear-gradient(135deg, #e0f2fe 0%, #cffafe 50%, #f0f9ff 100%)'}} 
               data-testid="hero-content">
        <div className="mobile-content md:container relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
            {/* Mobile-First Content */}
            <div className="text-center lg:text-left">
            <h1 className="mb-4 md:mb-6 animate-fade-in-up text-center lg:text-left">
    <span className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-heading text-gray-600 tracking-tight leading-tight">

    Your Career, Your World
  </span>
  <br />
  <span className="text-2xl md:text-3xl font-medium font-body text-gray-500 mt-2 block">
    Start in Nepal Shine in Abroad
  </span>
</h1>

<p className="text-lg md:text-xl mb-8 md:mb-10 animate-fade-in-up animate-delay-100 mx-auto lg:mx-0 max-w-md text-center lg:text-left text-gray-600 leading-relaxed">
  Why limit your potential? At <span className="font-semibold text-gray-800">Udaan Agencies</span>, we connect you with the best of both worlds exciting career opportunities in Nepal and transformative roles across the globe. 
</p>

              {/* Primary Action - Enhanced with interactive elements */}
              <div className="mb-4 animate-fade-in-up animate-delay-200 flex justify-center lg:justify-start">
              <Link href="/jobs?local=true">
  <button
    className="
      relative 
      flex items-center justify-center 
      px-10 py-4 
      bg-gradient-to-r from-green-400 to-green-600 
      hover:from-green-500 hover:to-green-700
      text-white 
      text-lg md:text-xl 
      font-semibold 
      rounded-xl 
      shadow-lg 
      hover:scale-105 
      hover:shadow-2xl 
      transform transition-all
      duration-300
      overflow-hidden
      group
      border-2 border-transparent hover:border-green-300
    "
    data-testid="button-local-jobs-nepal"
  >
    <span className="relative z-10 flex items-center gap-2 group-hover:scale-110 transition-transform">
      🇳🇵 Local Jobs Nepal
      <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
    </span>

    {/* Animated gradient glow */}
    <span
      className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/50 to-green-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    ></span>
    
    {/* Shimmer effect */}
    <span
      className="absolute inset-0 -top-full bg-gradient-to-b from-transparent via-white/20 to-transparent skew-y-12 group-hover:top-full transition-all duration-700 transform"
    ></span>
  </button>
</Link>

               
              </div>

              {/* Secondary Actions - Enhanced with interactive elements */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8 animate-fade-in-up animate-delay-300 justify-center lg:justify-start">
              <Link href="/jobs?foreign=true">
              <button
                  className="btn btn-lg hover-lift-large group relative overflow-hidden"
                  data-testid="button-search-jobs"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: 'white',
                    padding: '18px 40px',
                    borderRadius: '16px',
                    fontWeight: '600',
                    fontSize: '18px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    border: '2px solid transparent'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Globe className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    Search Global Jobs
                    <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                  
                  {/* Hover overlay */}
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[14px]"></span>
                </button>
             </Link>
                <button
                  onClick={bookConsultation}
                  className="btn btn-md hover-lift-large group relative overflow-hidden"
                  data-testid="button-book-consultation"
                  style={{
                    background: 'transparent',
                    color: 'var(--primary)',
                    border: '2px solid var(--primary)',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                    <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Free Consultation
                  </span>
                  
                  {/* Fill effect on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-[10px]"></span>
                </button>
              </div>
              
              <p className="text-sm animate-fade-in-up animate-delay-300 text-center lg:text-left" 
                 style={{color: 'var(--gray-500)'}}>
                Free consultation for 30 minutes. No commitment required.
              </p>
            </div>

            {/* Right Visual */}
            <div className="relative lg:pl-8 animate-fade-in-right animate-delay-400">
              <div className="relative w-full max-w-lg mx-auto" style={{height: '500px'}}>
                {/* Central Globe */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full flex items-center justify-center animate-float"
                     style={{background: 'linear-gradient(135deg, var(--primary), var(--accent))'}}>
                  <Globe className="w-24 h-24 text-white" />
                </div>

                {/* Floating Elements */}
                {/* Airplane */}
                <div className="absolute top-16 right-8 w-16 h-16 rounded-2xl flex items-center justify-center animate-float hover-rotate"
                     style={{background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-yellow))', animationDelay: '0.5s'}}>
                  <Plane className="w-8 h-8 text-white" />
                </div>

                {/* Briefcase */}
                <div className="absolute top-32 left-4 w-14 h-14 rounded-xl flex items-center justify-center animate-float hover-rotate"
                     style={{background: 'linear-gradient(135deg, var(--secondary), var(--accent-teal))', animationDelay: '1s'}}>
                  <Briefcase className="w-7 h-7 text-white" />
                </div>

                {/* Users */}
                <div className="absolute bottom-24 right-12 w-12 h-12 rounded-lg flex items-center justify-center animate-float hover-rotate"
                     style={{background: 'linear-gradient(135deg, var(--accent-pink), var(--primary))', animationDelay: '1.5s'}}>
                  <Users className="w-6 h-6 text-white" />
                </div>

                {/* Award */}
                <div className="absolute bottom-16 left-8 w-14 h-14 rounded-xl flex items-center justify-center animate-float hover-rotate"
                     style={{background: 'linear-gradient(135deg, var(--accent-yellow), var(--accent-orange))', animationDelay: '2s'}}>
                  <Award className="w-7 h-7 text-white" />
                </div>

                {/* TrendingUp */}
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-lg flex items-center justify-center animate-float hover-rotate"
                     style={{background: 'linear-gradient(135deg, var(--accent-teal), var(--secondary))', animationDelay: '2.5s'}}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>

                {/* Building2 */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-lg flex items-center justify-center animate-float hover-rotate"
                     style={{background: 'linear-gradient(135deg, var(--accent), var(--primary))', animationDelay: '3s'}}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 animate-pulse"
             style={{background: 'linear-gradient(135deg, var(--primary), var(--accent))'}}></div>
        <div className="absolute bottom-20 right-16 w-24 h-24 rounded-full opacity-20 animate-pulse"
             style={{background: 'linear-gradient(135deg, var(--secondary), var(--accent-teal))', animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-8 w-16 h-16 rounded-full opacity-20 animate-pulse"
             style={{background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-yellow))', animationDelay: '2s'}}></div>
      </section>

      {/* Mobile-Optimized Stats Section */}
      <section className="py-8 md:py-16 bg-white">
        <div className="mobile-content md:container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 scroll-animate-scale">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 touch-target" data-testid="stat-placements">
              <div className="text-2xl md:text-4xl font-bold mb-2" style={{color: 'var(--primary)'}}>
                {stats?.successfulPlacements ? `${stats.successfulPlacements.toLocaleString()}+` : '2.5K+'}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Success Stories</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 touch-target" data-testid="stat-countries">
              <div className="text-2xl md:text-4xl font-bold mb-2" style={{color: 'var(--accent)'}}>
                {stats?.partnerCountries ? `${stats.partnerCountries}+` : '45+'}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Countries</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 touch-target" data-testid="stat-companies">
              <div className="text-2xl md:text-4xl font-bold mb-2" style={{color: 'var(--secondary)'}}>
                {stats?.partnerCompanies ? `${stats.partnerCompanies.toLocaleString()}+` : '800+'}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Companies</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-red-50 touch-target" data-testid="stat-satisfaction">
              <div className="text-2xl md:text-4xl font-bold mb-2" style={{color: 'var(--accent-orange)'}}>
                {stats?.clientSatisfaction ? `${stats.clientSatisfaction}%` : '98%'}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-gradient-soft section-feather curved-divider-top curved-divider-bottom scroll-animate" data-testid="how-it-works">
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-h1 mb-6 scroll-animate-left bg-gradient-rainbow bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-large text-body max-w-2xl mx-auto scroll-animate-right">
              Three simple steps to launch your international career with our proven process
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-item scroll-animate animate-delay-100" data-testid="step-consult">
              <div className="feature-icon hover-rotate animate-float" style={{background: 'linear-gradient(135deg, var(--primary), var(--accent))'}}>
                <Users className="w-7 h-7" style={{color: 'white'}} />
              </div>
              <h3 className="feature-title" style={{color: 'var(--primary)'}}>1. Consult</h3>
              <p className="feature-description">Book a free consultation with our expert advisors to understand your goals and create a personalized roadmap for your international career journey.</p>
            </div>
            
            <div className="feature-item scroll-animate animate-delay-300" data-testid="step-apply">
              <div className="feature-icon hover-rotate animate-float" style={{background: 'linear-gradient(135deg, var(--secondary), var(--accent-teal))', animationDelay: '1s'}}>
                <Plane className="w-7 h-7" style={{color: 'white'}} />
              </div>
              <h3 className="feature-title" style={{color: 'var(--secondary)'}}>2. Apply</h3>
              <p className="feature-description">Apply to curated job opportunities and study programs with our comprehensive guidance, document preparation, and application support throughout the process.</p>
            </div>
            
            <div className="feature-item scroll-animate animate-delay-500" data-testid="step-land">
              <div className="feature-icon hover-rotate animate-float" style={{background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-yellow))', animationDelay: '2s'}}>
                <Award className="w-7 h-7" style={{color: 'white'}} />
              </div>
              <h3 className="feature-title" style={{color: 'var(--accent-orange)'}}>3. Land</h3>
              <p className="feature-description">Secure your dream job or study placement with our continued support for visa processing, relocation assistance, and settlement guidance in your new country.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Carousel */}
      <section className="section scroll-animate" data-testid="featured-jobs">
        <div className="container">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-12">
            <div className="mb-6 md:mb-0">
              <h2 className="text-h1 mb-4 scroll-animate-left">Featured Opportunities</h2>
              <p className="text-large text-body scroll-animate-left animate-delay-200">Handpicked jobs from top global companies worldwide</p>
            </div>
            <Link href="/jobs">
              <button 
                className="btn btn-primary btn-md scroll-animate-right hover-lift-large hover-glow"
                data-testid="button-view-all-jobs"
              >
                View All Jobs <TrendingUp className="w-4 h-4 animate-pulse" />
              </button>
            </Link>
          </div>

          {jobsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading featured jobs...</p>
            </div>
          ) : featuredJobs && featuredJobs.length > 0 ? (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 p-6">
              {/* Carousel Info */}
              <div className="mb-4 text-center">
                <Badge className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-3 py-1">
                   {featuredJobs.length} Featured Jobs 
                </Badge>
              </div>
              
              {/* Auto-scrolling container */}
              <div 
                className="featured-jobs-carousel"
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = 'paused';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = 'running';
                }}
                style={{
                  //@ts-ignore
                  '--carousel-duration': `${Math.max(60, featuredJobs.length * 8)}s` // Dynamic duration based on job count
                }}
              >
                {/* First set of jobs */}
                <div className="featured-jobs-track">
                  {featuredJobs.map(job => (
                    <div key={`first-${job.id}`} className="featured-job-item">
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
                
                {/* Duplicate set for seamless loop */}
                <div className="featured-jobs-track">
                  {featuredJobs.map(job => (
                    <div key={`second-${job.id}`} className="featured-job-item">
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Carousel controls hint */}
              <div className="mt-4 text-center text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Featured Jobs Available</h3>
              <p className="text-slate-500">Check back soon for new opportunities or browse all jobs.</p>
              {jobsError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">Error loading jobs: {jobsError.message}</p>
                </div>
              )}
              <Link href="/jobs">
                <Button 
                  variant="outline" 
                  className="mt-4"
                  data-testid="button-browse-all-jobs"
                >
                  Browse All Jobs
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Blog Posts */}
      <section className="section bg-gradient-soft section-feather curved-divider-top scroll-animate" data-testid="featured-blogs">
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-12">
            <div className="mb-6 md:mb-0">
              <h2 className="text-h1 mb-4 scroll-animate-left bg-gradient-rainbow bg-clip-text text-transparent">Featured Articles</h2>
              <p className="text-large text-body scroll-animate-left animate-delay-200">Latest insights and tips for your international career journey</p>
            </div>
            <Link href="/resources">
              <button 
                className="btn btn-primary btn-md scroll-animate-right hover-lift-large hover-glow"
                data-testid="button-view-all-blogs"
              >
                View All Articles <FileText className="w-4 h-4 animate-pulse" />
              </button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBlogs.filter(item => item.type === 'blog').length > 0 ? (
              featuredBlogs.filter(item => item.type === 'blog').map((blog, index) => (
                <Link key={blog.id} href={`/resources/${blog.slug}`}>
                  <Card className={`card card-hover scroll-animate hover-lift-large animate-delay-${100 + index * 100} cursor-pointer h-full`}>
                    <CardContent className="p-6">
                      {blog.featuredImage && (
                        <div className="mb-4 overflow-hidden rounded-lg">
                          <img 
                            src={blog.featuredImage} 
                            alt={blog.title}
                            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          BLOG POST
                        </Badge>
                        {blog.category && (
                          <Badge variant="outline" className="text-xs">
                            {blog.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-slate-800 hover:text-primary transition-colors">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {blog.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {blog.publishedAt 
                            ? new Date(blog.publishedAt).toLocaleDateString()
                            : new Date(blog.createdAt).toLocaleDateString()
                          }
                        </span>
                        <span className="flex items-center gap-1 text-primary hover:underline">
                          Read More <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-16 scroll-animate-scale animate-delay-400">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-float hover-rotate" style={{background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 'var(--radius-xl)'}}>
                  <FileText className="w-8 h-8 animate-pulse" style={{color: 'white'}} />
                </div>
                <h3 className="text-h3 mb-4" style={{color: 'var(--primary)'}}>Featured Articles Coming Soon</h3>
                <p className="text-body">We're working on bringing you the latest insights and career tips.</p>
                <Link href="/resources">
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    data-testid="button-browse-all-articles"
                  >
                    Browse All Articles
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured FAQs */}
      <section className="section bg-gradient-soft section-feather curved-divider-top scroll-animate" data-testid="featured-faqs">
        <div className="container relative z-10">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-h1 mb-4 scroll-animate-left bg-gradient-rainbow bg-clip-text text-transparent">Frequently Asked Questions</h2>
              <p className="text-large text-body scroll-animate-left animate-delay-200">Get quick answers to the most popular questions about our services</p>
            </div>
            <button 
              onClick={() => window.location.href = '/resources?section=faq'}
              className="btn btn-primary btn-md scroll-animate-right hover-lift-large hover-glow"
              data-testid="button-view-all-faqs"
            >
              View All FAQs <HelpCircle className="w-4 h-4 animate-pulse" />
            </button>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {featuredBlogs.filter(item => item.type === 'faq' && item.isFeatured).length > 0 ? (
              featuredBlogs
                .filter(item => item.type === 'faq' && item.isFeatured)
                .slice(0, 6)
                .map((faq, index) => (
                  <Card 
                    key={faq.id} 
                    className={`shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl scroll-animate animate-delay-${100 + index * 100} bg-gradient-to-r from-primary-50 to-blue-50`}
                    data-testid={`featured-faq-${faq.id}`}
                  >
                    <button
                      onClick={() => {
                        const expanded = document.getElementById(`featured-faq-${faq.id}`);
                        if (expanded?.style.display === 'block') {
                          expanded.style.display = 'none';
                        } else if (expanded) {
                          expanded.style.display = 'block';
                        }
                      }}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                      data-testid={`featured-faq-question-${faq.id}`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 text-lg leading-tight pr-4">
                            {faq.title}
                          </h3>
                          <Badge variant="secondary" className="mt-2 text-xs bg-orange-100 text-orange-800">
                            Popular
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      </div>
                    </button>
                    <div 
                      id={`featured-faq-${faq.id}`}
                      className="px-6 pb-6 text-slate-700 hidden" 
                      data-testid={`featured-faq-answer-${faq.id}`}
                    >
                      <div className="ml-12 border-l-4 border-primary-200 pl-6">
                        <div 
                          className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-800"
                          dangerouslySetInnerHTML={{ __html: faq.content }}
                        />
                      </div>
                    </div>
                  </Card>
                ))
            ) : (
              <div className="text-center py-16 scroll-animate-scale animate-delay-400">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center animate-float hover-rotate" style={{background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 'var(--radius-xl)'}}>
                  <HelpCircle className="w-8 h-8 animate-pulse" style={{color: 'white'}} />
                </div>
                <h3 className="text-h3 mb-4" style={{color: 'var(--primary)'}}>Featured FAQs Coming Soon</h3>
                <p className="text-body">We're working on bringing you the most helpful answers to common questions.</p>
                                 <Button 
                   onClick={() => window.location.href = '/resources?section=faq'}
                   variant="outline" 
                   className="mt-4"
                   data-testid="button-browse-all-faqs"
                 >
                   Browse All FAQs
                 </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
