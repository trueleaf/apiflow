# Apiflow Marketing Website

A modern, professional marketing website for Apiflow - an API documentation and testing tool that serves as a powerful alternative to Postman and Apifox.

## 🚀 Features

- **Modern Design**: Clean, developer-focused aesthetic with professional appearance
- **Responsive**: Mobile-first design that works perfectly on all devices
- **Performance Optimized**: Fast loading times with Next.js optimization
- **SEO Ready**: Comprehensive SEO optimization with meta tags and structured data
- **Accessibility**: Built with accessibility best practices in mind

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Styling**: Tailwind CSS 4.0
- **Language**: TypeScript
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

## 📱 Sections

- **Hero Section**: Compelling value proposition and main CTA
- **Features Comparison**: Detailed comparison with Postman and Apifox
- **Product Showcase**: Interactive demo and feature highlights
- **Pricing**: Transparent pricing plans with feature breakdown
- **About**: Company story, values, and team information
- **Contact**: Multiple contact methods and FAQ section

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to see the website.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with SEO
│   ├── page.tsx           # Home page
│   ├── loading.tsx        # Loading component
│   ├── sitemap.ts         # SEO sitemap
│   └── robots.ts          # SEO robots.txt
├── components/
│   ├── layout/            # Layout components
│   │   ├── Header.tsx     # Navigation header
│   │   └── Footer.tsx     # Site footer
│   ├── sections/          # Page sections
│   │   ├── HeroSection.tsx
│   │   ├── ComparisonSection.tsx
│   │   ├── ProductShowcase.tsx
│   │   ├── PricingSection.tsx
│   │   ├── AboutSection.tsx
│   │   └── ContactSection.tsx
│   └── seo/               # SEO components
│       └── StructuredData.tsx
```

## 🎨 Customization

### Colors
The website uses a blue and purple color scheme. Main colors:
- Primary Blue: `#2563eb` (blue-600)
- Secondary Purple: `#7c3aed` (purple-600)
- Gray scale for text and backgrounds

### Content
All content is easily customizable by editing the respective component files. Key areas to update:
- Company information in `AboutSection.tsx`
- Pricing plans in `PricingSection.tsx`
- Feature comparisons in `ComparisonSection.tsx`
- Contact details in `ContactSection.tsx`

### SEO
Update SEO information in:
- `src/app/layout.tsx` - Meta tags and Open Graph
- `src/components/seo/StructuredData.tsx` - Structured data
- `src/app/sitemap.ts` - Sitemap configuration

## 📱 Mobile Responsiveness

The website is built with mobile-first design principles:
- Responsive navigation with mobile menu
- Optimized touch targets for mobile devices
- Flexible grid layouts that adapt to screen size
- Readable typography across all devices

## 🔧 Build & Deploy

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Deploy**: The website can be deployed to any platform that supports Next.js (Vercel, Netlify, AWS, etc.)

## 📊 Performance

- Optimized images and fonts
- Minimal JavaScript bundle
- Efficient CSS with Tailwind
- Fast page loads with Next.js optimization
- SEO-friendly structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test responsiveness across devices
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
