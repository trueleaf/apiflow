export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Apiflow",
    "description": "An open-source API documentation and testing tool developers love.",
    "url": "https://apiflow.cn",
    "logo": "https://apiflow.cn/logo.png",
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
      "email": "support@apiflow.cn",
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
    "name": "Apiflow",
    "description": "A modern, open-source API documentation and testing tool—an alternative to Postman and Apifox.",
    "url": "https://apiflow.cn",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web, Windows, macOS, Linux",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free (Open Source)",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free forever. Self-host or use the web app."
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
      "Security & self-hosting"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Apiflow",
    "url": "https://apiflow.cn",
    "description": "The modern API documentation and testing tool that developers love.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://apiflow.cn/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does Apiflow compare to Postman?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Apiflow is open source and free forever, with API testing, documentation, and collaboration built in."
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
        "name": "Is Apiflow really free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Apiflow is open source, and all core features are free to use—forever."
        }
      }
    ]
  };

  const schemas = [organizationSchema, softwareSchema, websiteSchema, faqSchema];
  
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
