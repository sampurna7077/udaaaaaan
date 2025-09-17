import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import ScrollProgress from "@/components/scroll-progress";
import JobCard from "@/components/job-card";
import LoadingVideo from "@/components/loading-video";
import { useFirstVisit } from "@/hooks/use-first-visit";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Briefcase,
  SlidersHorizontal,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Star,
  Zap,
  X,
  RotateCcw,
  Check,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  location: string;
  country: string;
  remote_type?: string;
  remoteType?: string;
  jobType?: string;
  industry: string;
  salary_min?: number;
  salary_max?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  tags?: string;
  posted_at?: string;
  postedAt?: string;
  visa_support?: boolean;
  visaSupport?: boolean;
  category: string;
  experience_level?: string;
  experienceLevel?: string;
}

export default function Jobs() {
  const { shouldShowLoading: firstVisitLoading } = useFirstVisit("jobs", 2500);

  const [filters, setFilters] = useState({
    search: "",
    country: "all",
    category: "all",
    industry: "all",
    experienceLevel: "all",
    jobType: "all",
    remoteType: "all",
    visaSupport: "all",
    sort: "date",
    local: false,
    foreign: false,
    excludeCountry: "",
  });

  const countryOptions = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahrain",
    "Bangladesh",
    "Belarus",
    "Belgium",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Brazil",
    "Bulgaria",
    "Cambodia",
    "Canada",
    "Chile",
    "China",
    "Colombia",
    "Costa Rica",
    "Croatia",
    "Czech Republic",
    "Denmark",
    "Ecuador",
    "Egypt",
    "Estonia",
    "Finland",
    "France",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Guatemala",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kuwait",
    "Latvia",
    "Lebanon",
    "Lithuania",
    "Luxembourg",
    "Malaysia",
    "Malta",
    "Mexico",
    "Morocco",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nigeria",
    "Norway",
    "Oman",
    "Pakistan",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Saudi Arabia",
    "Serbia",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "South Africa",
    "South Korea",
    "Spain",
    "Sri Lanka",
    "Sweden",
    "Switzerland",
    "Taiwan",
    "Thailand",
    "Turkey",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Venezuela",
    "Vietnam",
    "Zimbabwe",
  ];

  const categoryOptions = [
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "engineering", label: "Engineering" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "design", label: "Design" },
    { value: "operations", label: "Operations" },
    { value: "legal", label: "Legal" },
    { value: "consulting", label: "Consulting" },
    { value: "research", label: "Research" },
  ];

  const industryOptions = [
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance & Banking" },
    { value: "education", label: "Education" },
    { value: "engineering", label: "Engineering" },
    { value: "marketing", label: "Marketing & Advertising" },
    { value: "sales", label: "Sales" },
    { value: "design", label: "Design & Creative" },
    { value: "operations", label: "Operations" },
    { value: "legal", label: "Legal" },
    { value: "consulting", label: "Consulting" },
    { value: "research", label: "Research & Development" },
    { value: "construction", label: "Construction" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "transportation", label: "Transportation & Logistics" },
    { value: "hospitality", label: "Hospitality & Tourism" },
    { value: "retail", label: "Retail & E-commerce" },
    { value: "agriculture", label: "Agriculture" },
    { value: "energy", label: "Energy & Utilities" },
    { value: "media", label: "Media & Entertainment" },
    { value: "telecommunications", label: "Telecommunications" },
    { value: "pharmaceuticals", label: "Pharmaceuticals" },
    { value: "automotive", label: "Automotive" },
    { value: "aerospace", label: "Aerospace & Defense" },
    { value: "real-estate", label: "Real Estate" },
    { value: "insurance", label: "Insurance" },
    { value: "nonprofit", label: "Non-Profit" },
    { value: "government", label: "Government & Public Sector" },
  ];

  const jobTypeOptions = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "temporary", label: "Temporary" },
    { value: "internship", label: "Internship" },
  ];

  const experienceLevelOptions = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "mid", label: "Mid Level (2-5 years)" },
    { value: "senior", label: "Senior Level (5+ years)" },
    { value: "executive", label: "Executive Level" },
  ];

  const remoteTypeOptions = [
    { value: "remote", label: "Remote" },
    { value: "onsite", label: "On-site" },
    { value: "hybrid", label: "Hybrid" },
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    document.title =
      "Global Jobs - Udaan Agencies | International Career Opportunities";
    
    // Check for URL parameters on page load
    const urlParams = new URLSearchParams(window.location.search);
    const localParam = urlParams.get('local');
    const foreignParam = urlParams.get('foreign');
    
    if (localParam === 'true') {
      setFilters(prev => ({
        ...prev,
        local: true,
        foreign: false,
        country: "Nepal",
        excludeCountry: "",
      }));
    } else if (foreignParam === 'true') {
      setFilters(prev => ({
        ...prev,
        foreign: true,
        local: false,
        country: "all",
        excludeCountry: "Nepal",
      }));
    }
  }, []);

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ["/api/jobs", filters, currentPage],
    queryFn: async () => {
      // Create a copy of filters without UI-only flags
      const { local, foreign, ...rawFilters } = filters;
      
      // Build API parameters based on local/foreign state
      const apiParams: Record<string, string> = {
        limit: itemsPerPage.toString(),
        offset: (currentPage * itemsPerPage).toString(),
      };

      // Handle local/foreign logic first
      if (local) {
        apiParams.country = "Nepal";
      } else if (foreign) {
        apiParams.excludeCountry = "Nepal";
      }

      // Add other filters (but only if not conflicting with local/foreign)
      Object.entries(rawFilters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          // Skip country if we're in foreign mode (already set excludeCountry)
          if (key === "country" && foreign) {
            return;
          }
          // Skip excludeCountry if we're in local mode (already set country)
          if (key === "excludeCountry" && local) {
            return;
          }
          apiParams[key] = value.toString();
        }
      });
      
      const params = new URLSearchParams(apiParams);
      const url = `/api/jobs?${params}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const result = await response.json();
      return result;
    },
  });

  const jobs = jobsData?.jobs || [];
  const totalJobs = jobsData?.total || 0;
  const totalPages = Math.ceil(totalJobs / itemsPerPage);

  const handleFilterChange = (key: string, value: string | boolean) => {
    if (key === "local") {
      setFilters((prev) => ({
        ...prev,
        local: value as boolean,
        foreign: value ? false : prev.foreign,
        country: value ? "Nepal" : "all",
        excludeCountry: value ? "" : prev.excludeCountry,
      }));
      
      // Update URL to reflect local jobs selection
      const url = new URL(window.location.href);
      if (value) {
        url.searchParams.set('local', 'true');
        url.searchParams.delete('foreign');
      } else {
        url.searchParams.delete('local');
      }
      window.history.replaceState({}, '', url.toString());
      
    } else if (key === "foreign") {
      setFilters((prev) => ({
        ...prev,
        foreign: value as boolean,
        local: value ? false : prev.local,
        country: value ? "all" : prev.country,
        excludeCountry: value ? "Nepal" : "",
      }));
      
      // Update URL to reflect foreign jobs selection
      const url = new URL(window.location.href);
      if (value) {
        url.searchParams.set('foreign', 'true');
        url.searchParams.delete('local');
      } else {
        url.searchParams.delete('foreign');
      }
      window.history.replaceState({}, '', url.toString());
      
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
    setCurrentPage(0); // Reset to first page
  };

  const applyFilters = () => {
    // Filters are applied automatically via React Query
    console.log("Filters applied:", filters);
  };

  return (
    <SidebarLayout>
      <div className="mobile-app-container">
        <Navigation />
        <ScrollProgress />

        {/* Enhanced Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -z-10" />

        {/* Clean Mobile Header */}
        <div className="md:hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">Find Your Dream Job</h1>
            <p className="text-blue-100 text-lg font-medium">
              {totalJobs.toLocaleString()} opportunities worldwide
            </p>
          </div>
        </div>

        {/* Clean Mobile Search Bar */}
        <div className="mobile-search md:hidden bg-white border-b border-gray-100 sticky top-[64px] z-40">
          <div className="p-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search jobs or companies..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-14 pr-16 py-5 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-white shadow-sm transition-all text-base"
                data-testid="input-mobile-search"
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-xl transition-all"
                style={{
                  background: showMobileFilters
                    ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                    : "transparent",
                }}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal
                  className={`h-5 w-5 ${showMobileFilters ? "text-white" : "text-gray-600"}`}
                />
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Filters Dropdown */}
          {showMobileFilters && (
            <div className="bg-white border-t border-gray-100 shadow-lg animate-in slide-in-from-top duration-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Filter Jobs
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Find your perfect opportunity with advanced filters
                </p>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-5">
                  <div>
                    <Select
                      value={filters.country}
                      onValueChange={(value) =>
                        handleFilterChange("country", value)
                      }
                    >
                      <SelectTrigger className="rounded-2xl border-gray-200 h-14 text-base">
                        <SelectValue placeholder="All Countries" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="all">All Countries</SelectItem>
                        {countryOptions.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={filters.category}
                      onValueChange={(value) =>
                        handleFilterChange("category", value)
                      }
                    >
                      <SelectTrigger className="rounded-2xl border-gray-200 h-14 text-base">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categoryOptions.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={filters.industry}
                      onValueChange={(value) =>
                        handleFilterChange("industry", value)
                      }
                    >
                      <SelectTrigger className="rounded-2xl border-gray-200 h-14 text-base">
                        <SelectValue placeholder="All Industries" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="all">All Industries</SelectItem>
                        {industryOptions.map((industry) => (
                          <SelectItem
                            key={industry.value}
                            value={industry.value}
                          >
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={filters.jobType}
                      onValueChange={(value) =>
                        handleFilterChange("jobType", value)
                      }
                    >
                      <SelectTrigger className="rounded-2xl border-gray-200 h-14 text-base">
                        <SelectValue placeholder="All Job Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Job Types</SelectItem>
                        {jobTypeOptions.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={filters.experienceLevel}
                      onValueChange={(value) =>
                        handleFilterChange("experienceLevel", value)
                      }
                    >
                      <SelectTrigger className="rounded-2xl border-gray-200 h-14 text-base">
                        <SelectValue placeholder="All Experience Levels" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="all">
                          All Experience Levels
                        </SelectItem>
                        {experienceLevelOptions.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={filters.remoteType}
                      onValueChange={(value) =>
                        handleFilterChange("remoteType", value)
                      }
                    >
                      <SelectTrigger className="rounded-2xl border-gray-200 h-14 text-base">
                        <SelectValue placeholder="All Remote Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Remote Types</SelectItem>
                        {remoteTypeOptions.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <input
                      type="checkbox"
                      id="local-filter"
                      checked={filters.local}
                      onChange={(e) =>
                        handleFilterChange("local", e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label
                      htmlFor="local-filter"
                      className="text-base font-medium text-blue-900 cursor-pointer"
                    >
                      Local Jobs (Nepal)
                    </label>
                    
                  </div>
                  {/* Foreign toggle (mobile filters) */}
                  <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-2xl border border-purple-200">
                    <input
                      type="checkbox"
                      id="foreign-filter"
                      checked={filters.foreign}
                      onChange={(e) =>
                        handleFilterChange("foreign", e.target.checked)
                      }
                      className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label
                      htmlFor="foreign-filter"
                      className="text-base font-medium text-purple-900 cursor-pointer"
                    >
                      Foreign Jobs (Exclude Nepal)
                    </label>
                  </div>

                </div>
              </div>

              <div className="border-t border-gray-100 p-6 bg-gray-50">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        search: "",
                        country: "all",
                        category: "all",
                        industry: "all",
                        experienceLevel: "all",
                        jobType: "all",
                        remoteType: "all",
                        visaSupport: "all",
                        sort: "date",
                        local: false,
                        foreign: false,
                        excludeCountry: "",
                      });
                      setCurrentPage(0);
                      
                      // Clear URL parameters
                      const url = new URL(window.location.href);
                      url.searchParams.delete('local');
                      url.searchParams.delete('foreign');
                      window.history.replaceState({}, '', url.toString());
                    }}
                    className="flex-1 rounded-2xl h-12 text-base font-medium border-gray-300 hover:bg-gray-100"
                    data-testid="button-clear-filters-mobile"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                  <Button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 rounded-2xl h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    data-testid="button-apply-filters-mobile"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Desktop Header */}
        <div className="hidden md:block pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div
              className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 lg:p-12 text-white"
              data-testid="jobs-header"
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                      Global Job{" "}
                      <span className="text-yellow-300">Opportunities</span>
                    </h1>
                    <p className="text-xl text-blue-100 mb-6">
                      Discover your next career move from thousands of
                      international opportunities across {countryOptions.length}
                      + countries
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <Button
                        className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl"
                        onClick={() =>
                          window.scrollTo({ top: 600, behavior: "smooth" })
                        }
                        data-testid="button-quick-apply"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Quick Apply
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-xl bg-transparent"
                        onClick={() => window.open("/resources", "_blank")}
                        data-testid="button-career-guide"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Career Guide
                      </Button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-300" />
                      <div className="text-2xl font-bold">
                        {totalJobs.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-200">Active Jobs</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-3 text-yellow-300" />
                      <div className="text-2xl font-bold">95+</div>
                      <div className="text-sm text-blue-200">Countries</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                      <Star className="h-8 w-8 mx-auto mb-3 text-purple-300" />
                      <div className="text-2xl font-bold">94%</div>
                      <div className="text-sm text-blue-200">Success Rate</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-3 text-orange-300" />
                      <div className="text-2xl font-bold">24h</div>
                      <div className="text-sm text-blue-200">Avg Response</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
            </div>

            {/* Enhanced Desktop Filters */}
            <div
              className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30 mb-8 hover:shadow-3xl transition-all duration-500"
              data-testid="job-filters"
            >
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Find Your Perfect Job
                </h2>
                <p className="text-base text-gray-600 leading-relaxed">
                  Use advanced filters to discover opportunities tailored to
                  your skills and preferences
                </p>
              </div>

              {/* Main Search */}
              <div className="mb-6">
                <div className="relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by job title, company, skills, or location..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pl-14 pr-4 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                    data-testid="input-search"
                  />
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>

              {/* Filter Grid - 4x2 layout for desktop, responsive for mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <Select
                    value={filters.country}
                    onValueChange={(value) =>
                      handleFilterChange("country", value)
                    }
                    data-testid="select-country"
                  >
                    <SelectTrigger className="py-4 px-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white hover:bg-blue-50">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Countries</SelectItem>
                      {countryOptions.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      handleFilterChange("category", value)
                    }
                    data-testid="select-category"
                  >
                    <SelectTrigger className="py-4 px-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white hover:bg-blue-50">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filters.industry}
                    onValueChange={(value) =>
                      handleFilterChange("industry", value)
                    }
                    data-testid="select-industry"
                  >
                    <SelectTrigger className="py-4 px-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white hover:bg-blue-50">
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">All Industries</SelectItem>
                      {industryOptions.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filters.jobType}
                    onValueChange={(value) =>
                      handleFilterChange("jobType", value)
                    }
                    data-testid="select-job-type"
                  >
                    <SelectTrigger className="py-4 px-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white hover:bg-blue-50">
                      <SelectValue placeholder="All Job Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Job Types</SelectItem>
                      {jobTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filters.experienceLevel}
                    onValueChange={(value) =>
                      handleFilterChange("experienceLevel", value)
                    }
                    data-testid="select-experience"
                  >
                    <SelectTrigger className="py-4 px-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white hover:bg-blue-50">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {experienceLevelOptions.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={filters.remoteType}
                    onValueChange={(value) =>
                      handleFilterChange("remoteType", value)
                    }
                    data-testid="select-remote-type"
                  >
                    <SelectTrigger className="py-4 px-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white hover:bg-blue-50">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {remoteTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
 

                <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors">
                  <input
                    type="checkbox"
                    id="desktop-local-filter"
                    checked={filters.local}
                    onChange={(e) =>
                      handleFilterChange("local", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label
                    htmlFor="desktop-local-filter"
                    className="text-sm font-medium text-blue-900 cursor-pointer select-none"
                  >
                    Local Jobs ( in Nepal)
                  </label>
                </div>

                {/* Foreign toggle (desktop filters) */}
                <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
                  <input
                    type="checkbox"
                    id="desktop-foreign-filter"
                    checked={filters.foreign}
                    onChange={(e) =>
                      handleFilterChange("foreign", e.target.checked)
                    }
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <label
                    htmlFor="desktop-foreign-filter"
                    className="text-sm font-medium text-purple-900 cursor-pointer select-none"
                  >
                    Foreign Jobs
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={applyFilters}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] transform"
                  data-testid="button-apply-filters"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search {totalJobs.toLocaleString()} Jobs
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      search: "",
                      country: "all",
                      category: "all",
                      industry: "all",
                      experienceLevel: "all",
                      jobType: "all",
                      remoteType: "all",
                      visaSupport: "all",
                      sort: "date",
                      local: false,
                      foreign: false,
                      excludeCountry: "",
                    });
                    setCurrentPage(0);
                    
                    // Clear URL parameters
                    const url = new URL(window.location.href);
                    url.searchParams.delete('local');
                    url.searchParams.delete('foreign');
                    window.history.replaceState({}, '', url.toString());
                  }}
                  className="px-6 py-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium transition-all duration-300 hover:scale-[1.02] transform"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Enhanced Results Header */}
            <div
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
              data-testid="results-header"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    <span data-testid="job-count">
                      {totalJobs.toLocaleString()}
                    </span>{" "}
                    Jobs Found
                  </h2>
                  <p className="text-gray-600">
                    Perfect opportunities waiting for your application
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Sort by:
                    </span>
                    <Select
                      value={filters.sort}
                      onValueChange={(value) =>
                        handleFilterChange("sort", value)
                      }
                      data-testid="select-sort"
                    >
                      <SelectTrigger className="w-40 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="date">Latest First</SelectItem>
                        <SelectItem value="salary">Highest Salary</SelectItem>
                        <SelectItem value="company">Company Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Updated {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Mobile Results Header */}
        <div className="md:hidden bg-white border-b border-gray-100 sticky top-[64px] z-30">
          <div className="px-6 py-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {totalJobs.toLocaleString()} Jobs
                </h2>
                <button
                  onClick={() => handleFilterChange("local", !filters.local)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    filters.local
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-testid="button-mobile-local-jobs"
                >
                  🇳🇵 Local Jobs
                </button>
                <button
                  onClick={() => handleFilterChange("foreign", !filters.foreign)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    filters.foreign
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-testid="button-mobile-foreign-jobs"
                >
                  Foreign Jobs
                </button>
              </div>
              <Select
                value={filters.sort}
                onValueChange={(value) => handleFilterChange("sort", value)}
              >
                <SelectTrigger className="w-36 h-11 border-2 border-gray-200 rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Recent</SelectItem>
                  <SelectItem value="relevance">Relevant</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Clean Job Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
          <div
            className="grid grid-cols-1 gap-6 sm:gap-6 md:gap-6"
            data-testid="job-listings"
          >
            {isLoading || firstVisitLoading ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-3xl p-12 shadow-lg mx-auto max-w-md">
                  <LoadingVideo width={120} height={120} />
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Finding Perfect Jobs
                    </h3>
                    <p className="text-gray-600">
                      Searching through thousands of opportunities...
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job: any, index: number) => (
                <div
                  key={job.id}
                  className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <JobCard job={job} showFullDetails />
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="bg-white rounded-3xl p-12 shadow-lg mx-auto max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Jobs Found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    We couldn't find any jobs matching your criteria. Try
                    adjusting your filters or search terms.
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        setFilters({
                          search: "",
                          country: "all",
                          category: "all",
                          industry: "all",
                          experienceLevel: "all",
                          jobType: "all",
                          remoteType: "all",
                          visaSupport: "all",
                          sort: "date",
                          local: false,
                          foreign: false,
                          excludeCountry: "",
                        });
                        setCurrentPage(0);
                        
                        // Clear URL parameters
                        const url = new URL(window.location.href);
                        url.searchParams.delete('local');
                        url.searchParams.delete('foreign');
                        window.history.replaceState({}, '', url.toString());
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                      data-testid="button-clear-filters"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Show All Jobs
                    </Button>

                    <div className="text-sm text-gray-500">
                      <p>
                        💡 Try searching for broader terms or different
                        locations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Load More Button for Mobile */}
        {totalPages > 1 && (
          <div className="md:hidden p-4">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  {Math.min((currentPage + 1) * itemsPerPage, totalJobs)} of{" "}
                  {totalJobs.toLocaleString()} jobs
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(((currentPage + 1) * itemsPerPage) / totalJobs) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <Button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= totalPages - 1}
                className="w-full py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300"
              >
                {currentPage >= totalPages - 1 ? (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    All Jobs Loaded!
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Load{" "}
                    {Math.min(
                      itemsPerPage,
                      totalJobs - (currentPage + 1) * itemsPerPage,
                    )}{" "}
                    More Jobs
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Desktop Pagination */}
        {totalPages > 1 && (
          <div
            className="hidden md:flex justify-center pb-8"
            data-testid="pagination"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Page {currentPage + 1} of {totalPages} • Showing{" "}
                  {Math.min((currentPage + 1) * itemsPerPage, totalJobs)} of{" "}
                  {totalJobs.toLocaleString()} jobs
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 0}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  className="px-6 py-2 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 font-medium transition-all"
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 7 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        currentPage === pageNum
                          ? "text-white shadow-lg"
                          : "border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                      style={
                        currentPage === pageNum
                          ? {
                              background:
                                "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                            }
                          : {}
                      }
                      data-testid={`button-page-${pageNum + 1}`}
                    >
                      {pageNum + 1}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                  }
                  className="px-6 py-2 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 font-medium transition-all"
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        <MobileBottomNav />
      </div>
    </SidebarLayout>
  );
}
