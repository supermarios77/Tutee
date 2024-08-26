// config/site.ts

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Tutee",
  description: "Connect with expert English tutors online at Tutee.co.uk. Enjoy personalized lessons, flexible scheduling, and guaranteed results. Boost your English skills today!",
  url: "https://tutee.co.uk",
  ogImage: "https://tutee.co.uk/og-image.jpg",
  links: {
    twitter: "https://twitter.com/tutee_uk",
    github: "https://github.com/tutee-uk",
  },
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "#about",
    },
    {
      label: "Pricing",
      href: "#pricing",
    },
    {
      label: "Contact",
      href: "#contact",
    },
    {
      label: "Testimonials",
      href: "#testimonials",
    },
    {
      label: "Booking",
      href: "/booking",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "About",
      href: "#about",
    },
    {
      label: "Pricing",
      href: "#pricing",
    },
    {
      label: "Contact",
      href: "#contact",
    },
    {
      label: "Testimonials",
      href: "#testimonials",
    },
    {
      label: "Booking",
      href: "/booking",
    },
  ],
  seo: {
    title: "Expert English Tutors Online | Learn English with Personalized Sessions",
    titleTemplate: "%s | Tutee.co.uk",
    description: "Connect with top-rated English tutors online at Tutee.co.uk. Enjoy personalized lessons, flexible scheduling, and guaranteed results. Boost your English skills today!",
    keywords: [
      "English Tutors Online",
      "online English lessons",
      "ESL tutoring",
      "IELTS preparation",
      "business English",
      "conversation practice",
      "Tutee",
      "English learning",
      "language skills"
    ],
    openGraph: {
      type: "website",
      locale: "en_GB",
      url: "https://tutee.co.uk",
      siteName: "Tutee.co.uk",
      images: [
        {
          url: "https://tutee.co.uk/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Tutee.co.uk - English Tutoring Platform"
        }
      ]
    },
    twitter: {
      handle: "@tutee_uk",
      site: "@tutee_uk",
      cardType: "summary_large_image"
    },
    robots: "index, follow",
    canonical: "https://tutee.co.uk"
  }
};