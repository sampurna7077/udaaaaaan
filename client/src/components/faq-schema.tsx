import { useEffect } from 'react';

interface FAQ {
  id: string;
  title: string;
  content: string;
  category?: string;
  isFeatured?: boolean;
}

interface FAQSchemaProps {
  faqs: FAQ[];
  companyName?: string;
  websiteUrl?: string;
}

export default function FAQSchema({ 
  faqs, 
  companyName = "Udaan Agencies",
  websiteUrl = "https://udaanagencies.com.np" 
}: FAQSchemaProps) {
  
  useEffect(() => {
    if (faqs.length === 0) return;

    // Create comprehensive structured data for FAQ
    const faqStructuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "name": `${companyName} - Frequently Asked Questions`,
      "description": `Comprehensive FAQ about ${companyName}, Nepal's premier manpower consultancy for overseas employment and local recruitment.`,
      "url": `${websiteUrl}/resources`,
      "inLanguage": "en-US",
      "publisher": {
        "@type": "Organization",
        "name": companyName,
        "url": websiteUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${websiteUrl}/logo.png`,
          "width": 200,
          "height": 60
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+977-23-XXX-XXX",
          "contactType": "customer service",
          "areaServed": "NP",
          "availableLanguage": ["en", "ne"]
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Atithi Sadan Road",
          "addressLocality": "Birtamod Municipality",
          "addressRegion": "Jhapa",
          "postalCode": "57204",
          "addressCountry": "NP"
        }
      },
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.title,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.content.replace(/<[^>]*>/g, ''), // Strip HTML tags
          "author": {
            "@type": "Organization",
            "name": companyName,
            "url": websiteUrl
          }
        },
        ...(faq.category && {
          "about": {
            "@type": "Thing",
            "name": faq.category
          }
        })
      })),
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": websiteUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Resources",
            "item": `${websiteUrl}/resources`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "FAQ",
            "item": `${websiteUrl}/resources?section=faq`
          }
        ]
      }
    };

    // Create Organization schema for local SEO
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": companyName,
      "alternateName": ["Udaan Agencies Nepal", "Udaan Manpower", "Udaan Consultancy"],
      "description": "Premier manpower consultancy in Birtamod, Nepal specializing in overseas employment and local recruitment services.",
      "url": websiteUrl,
      "logo": `${websiteUrl}/logo.png`,
      "image": `${websiteUrl}/images/office-building.jpg`,
      "telephone": "+977-23-XXX-XXX",
      "email": "info@udaanagencies.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Atithi Sadan Road",
        "addressLocality": "Birtamod Municipality",
        "addressRegion": "Jhapa",
        "postalCode": "57204",
        "addressCountry": "NP"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 26.6500,
        "longitude": 88.0333
      },
      "openingHours": "Mo-Fr 10:00-17:00",
      "priceRange": "$$",
      "currenciesAccepted": "NPR",
      "paymentAccepted": ["Cash", "Bank Transfer", "Online Payment"],
      "areaServed": [
        {
          "@type": "Country",
          "name": "Nepal"
        },
        {
          "@type": "AdministrativeArea",
          "name": "Province 1"
        },
        {
          "@type": "City",
          "name": "Birtamod"
        }
      ],
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": 26.6500,
          "longitude": 88.0333
        },
        "geoRadius": "50000"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Manpower Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Overseas Employment",
              "description": "Complete assistance for overseas job placement including visa processing"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Local Recruitment",
              "description": "Local job placement services within Nepal"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Visa Processing",
              "description": "Complete visa application and documentation support"
            }
          }
        ]
      },
      "founder": {
        "@type": "Person",
        "name": "Mausam Adhikari",
        "jobTitle": "Founder & CEO"
      },
      "foundingDate": "2082",
      "legalName": "Udaan Agencies Pvt. Ltd.",
      "taxID": "XXX-XXX-XXX",
      "vatID": "XXX-XXX-XXX",
      "sameAs": [
        "https://www.facebook.com/udaanagencies",
        "https://www.instagram.com/udaanagencies",
        "https://www.linkedin.com/company/udaanagencies",
        "https://www.tiktok.com/@udaanagencies"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "150",
        "bestRating": "5"
      }
    };

    // Service-specific schema
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "Manpower Recruitment Services",
      "provider": {
        "@type": "Organization",
        "name": companyName,
        "url": websiteUrl
      },
      "areaServed": "Nepal",
      "serviceType": "Employment Agency",
      "category": "Manpower Consultancy",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Employment Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Qatar Jobs",
              "category": "Overseas Employment",
              "areaServed": "Qatar"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "UAE Jobs",
              "category": "Overseas Employment",
              "areaServed": "United Arab Emirates"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Saudi Arabia Jobs",
              "category": "Overseas Employment",
              "areaServed": "Saudi Arabia"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Malaysia Jobs",
              "category": "Overseas Employment",
              "areaServed": "Malaysia"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Japan Jobs",
              "category": "Overseas Employment",
              "areaServed": "Japan"
            }
          }
        ]
      }
    };

    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    const schemas = [faqStructuredData, organizationSchema, serviceSchema];
    
    schemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      script.id = `structured-data-${index}`;
      document.head.appendChild(script);
    });

    // Add additional meta tags for better SEO
    const addMetaTag = (name: string, content: string, property?: string) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        if (property) {
          tag.setAttribute('property', property);
        } else {
          tag.setAttribute('name', name);
        }
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    // Enhanced meta tags
    addMetaTag('description', `Frequently Asked Questions about ${companyName} - Nepal's leading manpower consultancy for overseas employment, visa processing, and local recruitment services.`);
    addMetaTag('keywords', 'Udaan Agencies FAQ, Nepal manpower, overseas employment questions, visa processing Nepal, job placement FAQ, recruitment agency Nepal, Birtamod consultancy');
    addMetaTag('author', companyName);
    addMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    addMetaTag('googlebot', 'index, follow');
    addMetaTag('bingbot', 'index, follow');
    
    // Open Graph tags
    addMetaTag('', `${companyName} - Frequently Asked Questions`, 'og:title');
    addMetaTag('', `Get instant answers to common questions about ${companyName}, Nepal's premier manpower consultancy for overseas employment.`, 'og:description');
    addMetaTag('', 'website', 'og:type');
    addMetaTag('', `${websiteUrl}/resources`, 'og:url');
    addMetaTag('', `${websiteUrl}/images/faq-banner.jpg`, 'og:image');
    addMetaTag('', '1200', 'og:image:width');
    addMetaTag('', '630', 'og:image:height');
    addMetaTag('', 'en_US', 'og:locale');
    addMetaTag('', companyName, 'og:site_name');
    
    // Twitter Card tags
    addMetaTag('twitter:card', 'summary_large_image');
    addMetaTag('twitter:title', `${companyName} - FAQ`);
    addMetaTag('twitter:description', `Find answers to common questions about overseas employment and recruitment services in Nepal.`);
    addMetaTag('twitter:image', `${websiteUrl}/images/faq-banner.jpg`);
    
    // Additional SEO tags
    addMetaTag('geo.region', 'NP-P1');
    addMetaTag('geo.placename', 'Birtamod, Jhapa');
    addMetaTag('geo.position', '26.6500;88.0333');
    addMetaTag('ICBM', '26.6500, 88.0333');
    
    // Cleanup function
    return () => {
      schemas.forEach((_, index) => {
        const script = document.getElementById(`structured-data-${index}`);
        if (script) {
          script.remove();
        }
      });
    };
  }, [faqs, companyName, websiteUrl]);

  return null; // This component only handles SEO, no visual rendering
}
