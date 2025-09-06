'use client';

import { useEffect } from 'react';

export default function StructuredData() {
  useEffect(() => {
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "APIFlow",
      "description": "The modern API documentation and testing tool that developers love. Build, test, and document your APIs with ease.",
      "url": "https://apiflow.com",
      "logo": "https://apiflow.com/logo.png",
      "foundingDate": "2022",
      "founders": [
        {
          "@type": "Person",
          "name": "Alex Johnson"
        },
        {
          "@type": "Person", 
          "name": "Sarah Chen"
        }
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4567",
        "contactType": "customer service",
        "email": "support@apiflow.com",
        "availableLanguage": "English"
      },
      "sameAs": [
        "https://twitter.com/apiflow",
        "https://github.com/apiflow",
        "https://linkedin.com/company/apiflow"
      ]
    };

    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "APIFlow",
      "description": "Modern API documentation and testing tool. A powerful alternative to Postman and Apifox for developers.",
      "url": "https://apiflow.com",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web, Windows, macOS, Linux",
      "offers": [
        {
          "@type": "Offer",
          "name": "Free Plan",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Perfect for individual developers and small projects"
        },
        {
          "@type": "Offer",
          "name": "Pro Plan",
          "price": "29",
          "priceCurrency": "USD",
          "billingIncrement": "P1M",
          "description": "Ideal for growing teams and professional projects"
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1250",
        "bestRating": "5",
        "worstRating": "1"
      },
      "featureList": [
        "API Testing & Documentation",
        "Real-time Collaboration", 
        "Advanced Mock Servers",
        "Automated Testing Workflows",
        "GraphQL Support",
        "Enterprise Security"
      ]
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "APIFlow",
      "url": "https://apiflow.com",
      "description": "The modern API documentation and testing tool that developers love.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://apiflow.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does APIFlow compare to Postman?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "APIFlow offers 3x faster API testing workflows, better real-time collaboration, and enterprise-ready features at a more affordable price point compared to Postman."
          }
        },
        {
          "@type": "Question",
          "name": "Can I import my existing Postman collections?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! We provide easy import tools to migrate your collections from Postman, Insomnia, and other popular API tools seamlessly."
          }
        },
        {
          "@type": "Question",
          "name": "Is there a free plan available?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we offer a generous free plan that includes up to 5 API collections, basic testing & documentation, and community support."
          }
        }
      ]
    };

    const schemas = [organizationSchema, softwareSchema, websiteSchema, faqSchema];
    
    // Add structured data scripts to head
    schemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // Cleanup function to remove scripts when component unmounts
    return () => {
      const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return null; // This component doesn't render anything visible
}
