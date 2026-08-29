import { SubServiceItem } from '../types';

export const ALL_SUB_SERVICES: SubServiceItem[] = [
  // ==================== 1. GRAPHIC DESIGN ====================
  {
    id: 'gd_logo',
    category: 'Graphic Design',
    title: 'Logo Design & Brand Identity',
    titleBn: 'লোগো ডিজাইন ও ব্র্যান্ড আইডেন্টিটি',
    priceBDT: 1500,
    description: 'Unique vector logo concepts, color palette, typography guidelines, and complete source files (AI, EPS, SVG, PNG).',
    unit: 'Per Concept System',
    popular: true
  },
  {
    id: 'gd_social_banner',
    category: 'Graphic Design',
    title: 'Social Media Banner / Ad Creatives',
    titleBn: 'সোশ্যাল মিডিয়া ব্যানার ও অ্যাড ডিজাইন',
    priceBDT: 800,
    description: 'High-CTR ad creatives for Facebook, Instagram, LinkedIn, and Twitter optimized for conversions.',
    unit: 'Per Design'
  },
  {
    id: 'gd_thumbnail',
    category: 'Graphic Design',
    title: 'YouTube / Video Thumbnail',
    titleBn: 'ইউটিউব ও ভিডিও থাম্বনেইল ডিজাইন',
    priceBDT: 500,
    description: 'High-contrast, click-worthy custom YouTube thumbnails with expressive typography and visual hooks.',
    unit: 'Per Thumbnail',
    popular: true
  },
  {
    id: 'gd_poster_flyer',
    category: 'Graphic Design',
    title: 'Poster, Flyer & Brochure Design',
    titleBn: 'পোস্টার, ফ্লায়ার ও ব্রোশার ডিজাইন',
    priceBDT: 800,
    description: 'Print-ready 300 DPI promotional flyers, event posters, bi-fold/tri-fold corporate brochures.',
    unit: 'Per Design'
  },
  {
    id: 'gd_packaging',
    category: 'Graphic Design',
    title: 'Product Packaging & Box Label Design',
    titleBn: 'প্রোডাক্ট প্যাকেজিং ও লেবেল ডিজাইন',
    priceBDT: 2500,
    description: 'Custom die-cut packaging, pouch labels, box layouts with realistic 3D photorealistic mockups.',
    unit: 'Per Product Box/Pouch'
  },
  {
    id: 'gd_tshirt',
    category: 'Graphic Design',
    title: 'T-Shirt & Merchandise Apparel Design',
    titleBn: 'টি-শার্ট ও মার্চেন্ডাইজ ডিজাইন',
    priceBDT: 1200,
    description: 'Trendy vector streetwear, vintage typography, typography apparel artwork ready for screen printing.',
    unit: 'Per Artwork'
  },
  {
    id: 'gd_vector_art',
    category: 'Graphic Design',
    title: 'Vector Artwork & Custom Illustration',
    titleBn: 'ভেক্টর আর্ট ও কাস্টম ইলাস্ট্রেশন',
    priceBDT: 1500,
    description: 'Handcrafted vector characters, isometric graphics, custom icons, and mascot illustrations.',
    unit: 'Per Illustration'
  },
  {
    id: 'gd_ui_ux',
    category: 'Graphic Design',
    title: 'UI/UX Web & Mobile App Interface',
    titleBn: 'UI/UX মোবাইল ও ওয়েব অ্যাপ ডিজাইন',
    priceBDT: 3500,
    description: 'Modern Figma UI/UX screens, interactive wireframes, component design systems for web and mobile.',
    unit: 'Per 3 Screen Flow'
  },

  // ==================== 2. VIDEO EDITING ====================
  {
    id: 've_reels_shorts',
    category: 'Video Editing',
    title: 'TikTok / Reels / YouTube Shorts (9:16)',
    titleBn: 'ভাইরাল শর্ট-ফর্ম ভিডিও (রিলস / টিকটক)',
    priceBDT: 1200,
    description: 'High-retention vertical editing with kinetic captions, sound effects, B-rolls, zooms, and hook pacing.',
    unit: 'Per 30-60s Reel',
    popular: true
  },
  {
    id: 've_youtube_long',
    category: 'Video Editing',
    title: 'YouTube Long-Form / Documentary Video',
    titleBn: 'ইউটিউব লং ভিডিও ও ডকুমেন্টারি এডিটিং',
    priceBDT: 2500,
    description: 'Narrative storytelling, documentary pacing, multi-track audio mixing, engaging B-roll overlays.',
    unit: 'Per 5-10 Min Video',
    popular: true
  },
  {
    id: 've_commercial_ad',
    category: 'Video Editing',
    title: 'Commercial & Product Promo Ad Video',
    titleBn: 'প্রোডাক্ট প্রমোশনাল কমার্শিয়াল অ্যাড ভিডিও',
    priceBDT: 4000,
    description: 'Cinematic e-commerce product video, promotional brand launch trailer with motion graphics & sound mastering.',
    unit: 'Per 30-60s Promo'
  },
  {
    id: 've_motion_graphics',
    category: 'Video Editing',
    title: 'Motion Graphics & 2D Animation',
    titleBn: 'মোশন গ্রাফিক্স ও ২ডি অ্যানিমেশন',
    priceBDT: 3000,
    description: 'After Effects kinetic typography, logo intro/outro animation, explainer vector motion scenes.',
    unit: 'Per 30s Animation'
  },
  {
    id: 've_podcast_interview',
    category: 'Video Editing',
    title: 'Podcast & Multi-Cam Interview Editing',
    titleBn: 'পডকাস্ট ও মাল্টি-ক্যাম ইন্টারভিউ এডিটিং',
    priceBDT: 2500,
    description: 'Seamless multi-camera switching, audio de-noising & mastering, lower thirds, chapter markers.',
    unit: 'Per Episode'
  },
  {
    id: 've_subtitles_sound',
    category: 'Video Editing',
    title: 'Dynamic Subtitles, Captions & Sound Foley',
    titleBn: 'ডাইনামিক ক্যাপশন ও সাউন্ড ডিজাইন',
    priceBDT: 800,
    description: 'Alex Hormozi style animated subtitles, sound effects (whooshes, pops, risers), background soundtrack.',
    unit: 'Per Video'
  },
  {
    id: 've_color_grading',
    category: 'Video Editing',
    title: 'Cinematic Color Grading & Audio Mastering',
    titleBn: 'কালার গ্রেডিং ও অডিও মাস্টারিং',
    priceBDT: 1200,
    description: 'DaVinci Resolve film look color grading, skin tone correction, LUT styling, loudness normalization.',
    unit: 'Per Project'
  },

  // ==================== 3. DIGITAL MARKETING ====================
  {
    id: 'dm_meta_ads',
    category: 'Digital Marketing',
    title: 'Meta Ads (Facebook & Instagram Campaign)',
    titleBn: 'মেটা ফেসবুক ও ইনস্টাগ্রাম অ্যাড ক্যাম্পেইন সেটআপ',
    priceBDT: 3000,
    description: 'Complete Ad Account setup, audience research, custom retargeting funnels, A/B creative testing.',
    unit: 'Per Campaign Setup',
    popular: true
  },
  {
    id: 'dm_google_ads',
    category: 'Digital Marketing',
    title: 'Google Ads & Performance Max Campaign',
    titleBn: 'গুগল সার্চ ও পারফরম্যান্স ম্যাক্স অ্যাড ক্যাম্পেইন',
    priceBDT: 4000,
    description: 'High-intent search keyword bidding, negative keywords, Google Display Network, YouTube ad campaigns.',
    unit: 'Per Campaign Setup'
  },
  {
    id: 'dm_page_management',
    category: 'Digital Marketing',
    title: 'Complete Social Page Management & Scheduling',
    titleBn: 'ফেসবুক ও ইনস্টাগ্রাম পেজ ম্যানেজমেন্ট ও শিডিউলিং',
    priceBDT: 4500,
    description: 'Monthly content calendar, scheduled daily posting, caption copywriting, hashtag strategy, inbox response.',
    unit: 'Per Month'
  },
  {
    id: 'dm_pixel_capi',
    category: 'Digital Marketing',
    title: 'Meta Pixel & Conversions API (CAPI) Tracking',
    titleBn: 'মেটা পিক্সেল ও কনভার্সন ট্র্যাকিং সেটআপ',
    priceBDT: 2000,
    description: 'Server-side CAPI tracking, iOS 14+ event deduplication, custom conversion events, catalog sync.',
    unit: 'One-time Setup'
  },
  {
    id: 'dm_seo',
    category: 'Digital Marketing',
    title: 'Technical & On-Page SEO Ranking Optimization',
    titleBn: 'টেকনিক্যাল ও অন-পেজ এসইও র‍্যাংকিং অপটিমাইজেশন',
    priceBDT: 3500,
    description: 'Comprehensive keyword audit, meta tags, schema markup, Core Web Vitals fix, Google Search Console sync.',
    unit: 'Per Website'
  },
  {
    id: 'dm_copywriting',
    category: 'Digital Marketing',
    title: 'High-Converting Ad Copywriting & Sales Scripts',
    titleBn: 'হাই-কনভার্টিং অ্যাড কপিরাইটিং ও সেলস স্ক্রিপ্ট',
    priceBDT: 1000,
    description: 'Persuasive direct-response marketing copy, video hooks, email sequences, and landing page headlines.',
    unit: 'Per 5 Ad Copies'
  },

  // ==================== 4. WEB DESIGN & DEVELOPMENT ====================
  {
    id: 'wd_landing_page',
    category: 'Web Development',
    title: 'High-Converting Single Landing Page',
    titleBn: 'হাই-কনভার্টিং সেলস ল্যান্ডিং পেজ',
    priceBDT: 6000,
    description: 'Ultra-fast modern landing page built with React/Tailwind, mobile responsive, sub-second load times.',
    unit: 'Full Page',
    popular: true
  },
  {
    id: 'wd_ecommerce',
    category: 'Web Development',
    title: 'Full E-Commerce Website with bKash/Nagad/SSL',
    titleBn: 'ফুল ই-কমার্স ওয়েবসাইট ও পেমেন্ট গেটওয়ে',
    priceBDT: 18000,
    description: 'Complete online store with product catalog, cart, checkout, bKash/Nagad automatic payment, order tracking.',
    unit: 'Complete Store',
    popular: true
  },
  {
    id: 'wd_business_portfolio',
    category: 'Web Development',
    title: 'Corporate / Business Portfolio Website',
    titleBn: 'কর্পোরেট / বিজনেস পোর্টফোলিও ওয়েবসাইট',
    priceBDT: 12000,
    description: '5-8 pages modern corporate website with service listings, contact inquiries, client reviews, and CMS.',
    unit: '5-8 Pages'
  },
  {
    id: 'wd_custom_webapp',
    category: 'Web Development',
    title: 'Custom Full-Stack Web App & Dashboard',
    titleBn: 'কাস্টম ওয়েব অ্যাপ্লিকেশন ও ড্যাশবোর্ড',
    priceBDT: 25000,
    description: 'Bespoke web platform with user authentication, role permissions, real-time database, and APIs.',
    unit: 'Full-Stack Solution'
  },
  {
    id: 'wd_speed_fix',
    category: 'Web Development',
    title: 'Speed Optimization & Bug Fixing',
    titleBn: 'ওয়েবসাইট স্পিড অপটিমাইজেশন ও বাগ ফিক্সিং',
    priceBDT: 3000,
    description: '90+ Google PageSpeed score, image WebP compression, caching, JavaScript/CSS minification, bug fixes.',
    unit: 'Per Website'
  },
  {
    id: 'wd_domain_hosting',
    category: 'Web Development',
    title: 'Domain, Cloud Hosting & SSL Security Setup',
    titleBn: 'ডোমেইন, ক্লাউড হোস্টিং ও এসএসএল সিকিউরিটি সেটআপ',
    priceBDT: 2500,
    description: 'DNS configuration, Cloudflare CDN integration, SSL certificate installation, automated backups.',
    unit: 'Setup Service'
  }
];
