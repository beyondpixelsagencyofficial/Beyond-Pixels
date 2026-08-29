import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Supabase Backend Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ixxqqtlvgoqvrlvhdkhy.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4eHFxdGx2Z29xdnJsdmhka2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4ODY4MzUsImV4cCI6MjEwMzQ2MjgzNX0.6kRdJrC3QYkW9JQ37VNnkn4-QwJ9tAxBeBKQjuLCo8o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Body parser with high limit for brief files/deliveries base64
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initial default CMS Data in BDT (৳)
const DEFAULT_CMS = {
  heroBadge: "CREATIVE & DIGITAL GROWTH AGENCY",
  heroTitle: "Crafting High-Converting Digital Presence",
  heroHighlight: "Beyond Limits & Boundaries",
  heroSubtitle: "We transform visionary brands with world-class Graphic Design, Cinematic Video Editing, Hyper-targeted Digital Marketing, and Next-Gen Web Development.",
  ctaPrimaryText: "Place Order / Get Started",
  ctaSecondaryText: "Explore Core Services",
  bannerNotice: "🔥 Now accepting bookings. 30% advance secures your dedicated production slot with Beyond Pixels!",
  showBannerNotice: true,
  agencyEmail: "beyondpixelsagency.official@gmail.com",
  agencyPhone: "+8801613253301",
  agencyWhatsApp: "+8801613253301",
  agencyFacebook: "https://www.facebook.com/beyondpixels.offical",
  paymentNumber: "01965407715",
  advancePercentage: 30,
  adDollarRateBDT: 148, // 145-150 BDT per dollar boost budget
  stats: [
    { label: "Projects Delivered", value: "250+", description: "Global & domestic campaigns" },
    { label: "Client Satisfaction", value: "99.4%", description: "Verified reviews & retention" },
    { label: "Average ROI Boost", value: "3.8X", description: "Across digital marketing funnels" },
    { label: "Turnaround Speed", value: "24-48h", description: "For rush & express deliveries" }
  ],
  services: [
    {
      id: "srv_graphic_design",
      key: "Graphic Design",
      title: "Graphic Design",
      tagline: "Visual Identity & High-Converting Brand Assets",
      shortDesc: "Pixel-perfect visual identities, advertising creatives, social media banners, logos, packaging, and UI design tailored to convert viewers.",
      fullDesc: "Our design team crafts immaculate vector branding, social media ad bundles, typography systems, vector illustrations, packaging mockups, and corporate pitch decks designed for undeniable brand authority.",
      icon: "Palette",
      basePriceBDT: 3500,
      popularBadge: true,
      features: [
        "Brand Identity & Logo Systems",
        "High-CTR Social Media Ad Creatives",
        "Packaging & Merchandise Design",
        "Vector Artwork & UI/UX Wireframes"
      ],
      deliverables: ["AI, EPS, SVG vector masters", "Print-ready 300DPI PDFs", "Web-optimized PNG/WebP exports", "Complete brand guideline sheet"]
    },
    {
      id: "srv_video_editing",
      key: "Video Editing",
      title: "Video Editing",
      tagline: "Cinematic Storytelling & Viral Short-Form Content",
      shortDesc: "Engaging TikToks, Reels, YouTube long-forms, and high-impact commercial ads with dynamic pacing, motion graphics, and audio mastering.",
      fullDesc: "From viral 9:16 vertical short-form retention edits to full 4K commercial productions with sound design, color grading, subtitles, and kinetic typography that capture viewer attention immediately.",
      icon: "Film",
      basePriceBDT: 5500,
      popularBadge: true,
      features: [
        "Viral Short-Form (Reels, TikTok, Shorts)",
        "YouTube Documentary & Long-Form Editing",
        "Commercial & E-commerce Product Ads",
        "Pro Sound Design, Foley & Color Grading"
      ],
      deliverables: ["4K & 1080p MP4 Masters", "Multiple aspect ratio cuts (9:16, 16:9, 1:1)", "Dynamic caption SRT/Burn-in", "Custom thumbnail"]
    },
    {
      id: "srv_digital_marketing",
      key: "Digital Marketing",
      title: "Digital Marketing",
      tagline: "Data-Driven ROI & Omnichannel Growth Engines",
      shortDesc: "Meta Ads, Google Performance Max, SEO optimization, and conversion funnels engineered to scale sales and qualified leads.",
      fullDesc: "We build scalable customer acquisition engines combining audience segmentation, A/B creative testing, retargeting funnels, pixel tracking, and search engine dominance for modern brands.",
      icon: "TrendingUp",
      basePriceBDT: 8000,
      popularBadge: false,
      features: [
        "Meta (Facebook/Instagram) Paid Ads Scaling",
        "Google Ads & Performance Max Setup",
        "Full-Funnel CRO & Copywriting",
        "Local & Organic Technical SEO"
      ],
      deliverables: ["Ad campaign architecture setup", "Pixel/CAPI tracking integration", "Live performance analytics dashboard", "Weekly ROI report"]
    },
    {
      id: "srv_web_development",
      key: "Web Development",
      title: "Web Development",
      tagline: "High-Performance Modern Web Apps & Portals",
      shortDesc: "Lightning-fast custom web applications, responsive landing pages, and headless CMS integrations built for speed, SEO, and conversions.",
      fullDesc: "Full-stack web architecture using React, Next.js, Tailwind, Node.js, and Cloud Infrastructure with sub-second page loads, intuitive CMS controls, dynamic payment integrations, and responsive UX.",
      icon: "Code2",
      basePriceBDT: 15000,
      popularBadge: true,
      features: [
        "High-Converting Landing Pages",
        "Full-Stack Web Applications & Portals",
        "E-Commerce & Payment Gateway Setup",
        "Blazing Fast 100/100 Core Web Vitals"
      ],
      deliverables: ["Full source code repository", "Production deployment & SSL setup", "Responsive tablet & mobile views", "Admin CMS control documentation"]
    }
  ],
  packages: [
    {
      id: "pkg_15_days",
      name: "15-Day Growth Package",
      duration: "15 Days",
      tagline: "Ideal for regular brand presence and steady engagement",
      priceBDT: 8500,
      designsCount: 8,
      videosCount: 2,
      pageManagementFree: true,
      features: [
        "8 Premium Social Media Graphic Designs",
        "2 High-Retention Viral Reels / Video Edits",
        "FREE Complete Facebook/Instagram Page Management",
        "Strategic Content Calendar & Copywriting",
        "Priority Revisions & 24/7 WhatsApp Support"
      ],
      popularBadge: false
    },
    {
      id: "pkg_30_days",
      name: "30-Day Pro Scale Package",
      duration: "30 Days (Full Month)",
      tagline: "Complete month-long domination & viral brand growth",
      priceBDT: 16500,
      designsCount: 20,
      videosCount: 3,
      pageManagementFree: true,
      features: [
        "20 High-Converting Graphic Designs / Carousel Ads",
        "3 Cinematic Viral Reels / Product Video Edits",
        "FREE Complete Page Management & Post Scheduling",
        "Dedicated Creative Lead & Growth Manager",
        "Hashtag & Audience Research + Bi-Weekly Performance Report"
      ],
      popularBadge: true
    }
  ],
  reasonsToChoose: [
    {
      id: "rtc_1",
      title: "Dedicated Creative Squad",
      description: "You work directly with senior designers, editors, and engineers focused on your specific business growth goals.",
      icon: "Users"
    },
    {
      id: "rtc_2",
      title: "30% Advance Transparent Policy",
      description: "Start risk-free with an upfront 30% commitment via secure bKash or Nagad. Pay the rest upon final satisfactory signoff.",
      icon: "ShieldCheck"
    },
    {
      id: "rtc_3",
      title: "Direct WhatsApp Production Line",
      description: "Instant real-time communications without ticketing bottlenecks. Direct line at +8801613253301.",
      icon: "MessageSquare"
    },
    {
      id: "rtc_4",
      title: "Rapid Turnaround Guarantee",
      description: "Swift milestone deliveries with structured revision rounds to keep your marketing momentum always moving forward.",
      icon: "Zap"
    }
  ]
};

// Initial Seed Orders (Clean Slate - starts with 0 orders)
const INITIAL_ORDERS: any[] = [];

// Data Directory and File Paths for persistence
const DATA_DIR = path.join(__dirname, 'data');
const CMS_FILE = path.join(DATA_DIR, 'cms.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData<T>(filePath: string, defaultData: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}, falling back to default:`, err);
  }
  return defaultData;
}

function saveData<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

interface ServerUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  company?: string;
  role: 'admin' | 'client';
  createdAt: string;
  lastLoginAt: string;
}

const INITIAL_USERS: ServerUser[] = [
  {
    id: "usr_admin",
    name: "Beyond Pixels Admin",
    email: "beyondpixelsagency.official@gmail.com",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BP&backgroundColor=e11d48",
    phone: "+8801613253301",
    company: "Beyond Pixels Agency",
    role: "admin",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastLoginAt: new Date().toISOString()
  },
  {
    id: "usr_client_1",
    name: "Tanvir Rahman",
    email: "tanvir.digital@gmail.com",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Tanvir+Rahman&backgroundColor=0ea5e9",
    phone: "+8801712345678",
    company: "Fashion Hub BD",
    role: "client",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastLoginAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "usr_client_2",
    name: "Sabbir Ahmed",
    email: "sabbir.creatives@gmail.com",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sabbir+Ahmed&backgroundColor=6366f1",
    phone: "+8801898765432",
    company: "NextGen Electronics",
    role: "client",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastLoginAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

// In-Memory state synced to disk and Supabase
let cmsData = loadData(CMS_FILE, DEFAULT_CMS);
let ordersData = loadData(ORDERS_FILE, INITIAL_ORDERS);
let usersData: ServerUser[] = loadData(USERS_FILE, INITIAL_USERS);
let messagesData = loadData(MESSAGES_FILE, [
  {
    id: "msg_1",
    name: "Arif Hossain",
    email: "arif.tech@outlook.com",
    phone: "+8801755112233",
    subject: "Custom Enterprise Portal + Video Production",
    message: "Hi Beyond Pixels team, we are planning a major brand revamp and would love a custom quotation for 10 videos + Web portal.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    read: false
  }
]);

// Supabase Async Synchronization Helpers
async function syncFromSupabase() {
  try {
    // 1. Sync CMS
    const { data: remoteCms, error: cmsErr } = await supabase
      .from('cms')
      .select('data')
      .eq('id', 'main_cms')
      .maybeSingle();

    if (!cmsErr && remoteCms?.data) {
      cmsData = { ...DEFAULT_CMS, ...remoteCms.data };
      saveData(CMS_FILE, cmsData);
      console.log('✅ Supabase: CMS Content synchronized');
    }

    // 2. Sync Orders
    const { data: remoteOrders, error: ordersErr } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!ordersErr && remoteOrders && remoteOrders.length > 0) {
      // Filter out any previous dummy seed orders (BP-9281 / tahmid.creative@gmail.com)
      const mappedOrders = remoteOrders
        .map((row: any) => {
          if (row.data && typeof row.data === 'object') {
            return { ...row.data, id: row.id || row.data.id };
          }
          return {
            id: row.id,
            clientName: row.client_name || row.clientName,
            clientEmail: row.client_email || row.clientEmail,
            clientPhone: row.client_phone || row.clientPhone,
            services: row.services || [],
            packageSelected: row.package_selected || row.packageSelected,
            adDollarBudget: row.ad_dollar_budget || row.adDollarBudget,
            deliveryTimeframe: row.delivery_timeframe || row.deliveryTimeframe || 'standard',
            projectDescription: row.project_description || row.projectDescription || '',
            briefFiles: row.brief_files || row.briefFiles || [],
            estimatedTotalBDT: row.estimated_total_bdt || row.estimatedTotalBDT || row.estimated_total || 0,
            advanceAmountBDT: row.advance_amount_bdt || row.advanceAmountBDT || row.advance_amount || 0,
            paymentMethod: row.payment_method || row.paymentMethod || 'bKash',
            paymentNumber: row.payment_number || row.paymentNumber || '01965407715',
            transactionId: row.transaction_id || row.transactionId || '',
            status: row.status || 'Pending Verification',
            adminNotes: row.admin_notes || row.adminNotes || '',
            deliveries: row.deliveries || [],
            createdAt: row.created_at || row.createdAt || new Date().toISOString(),
            updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
          };
        })
        .filter(o => o.id !== 'BP-9281' && o.clientEmail !== 'tahmid.creative@gmail.com');

      ordersData = mappedOrders;
      saveData(ORDERS_FILE, ordersData);
      console.log(`✅ Supabase: ${ordersData.length} Orders synchronized`);
    }

    // 3. Sync Messages
    const { data: remoteMessages, error: msgErr } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!msgErr && remoteMessages && remoteMessages.length > 0) {
      const mappedMessages = remoteMessages.map((r: any) => r.data || {
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone || '',
        subject: r.subject || '',
        message: r.message,
        createdAt: r.created_at || new Date().toISOString(),
        read: !!r.read
      });
      messagesData = mappedMessages;
      saveData(MESSAGES_FILE, messagesData);
      console.log(`✅ Supabase: ${messagesData.length} Contact Messages synchronized`);
    }

    // 4. Sync Users / Clients
    const { data: remoteUsers, error: usersErr } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!usersErr && remoteUsers && remoteUsers.length > 0) {
      const mappedUsers = remoteUsers.map((r: any) => {
        if (r.data && typeof r.data === 'object') {
          return { ...r.data, id: r.id || r.data.id };
        }
        return {
          id: r.id,
          email: r.email,
          name: r.name || r.email.split('@')[0],
          phone: r.phone || '',
          avatar: r.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name || r.email)}&backgroundColor=0ea5e9,6366f1,10b981`,
          company: r.company || '',
          role: r.role || (r.email === 'beyondpixelsagency.official@gmail.com' ? 'admin' : 'client'),
          createdAt: r.created_at || r.createdAt || new Date().toISOString(),
          lastLoginAt: r.last_login_at || r.lastLoginAt || new Date().toISOString()
        };
      });
      usersData = mappedUsers;
      saveData(USERS_FILE, usersData);
      console.log(`✅ Supabase: ${usersData.length} Users synchronized`);
    }
  } catch (err) {
    console.warn('⚠️ Supabase initial sync notice (falling back gracefully to local persistence):', err);
  }
}

// Push User to Supabase
async function pushUserToSupabase(user: any) {
  try {
    const payload = {
      id: user.id,
      email: user.email.toLowerCase().trim(),
      name: user.name,
      phone: user.phone || '',
      avatar: user.avatar || '',
      company: user.company || '',
      role: user.role || 'client',
      created_at: user.createdAt,
      last_login_at: user.lastLoginAt || new Date().toISOString(),
      data: user
    };

    const { error } = await supabase.from('users').upsert(payload, { onConflict: 'email' });
    if (error) {
      await supabase.from('users').upsert({ id: user.id, email: user.email, data: user });
    }
  } catch (e) {
    console.warn('Supabase user push notice:', e);
  }
}

// Delete User from Supabase
async function deleteUserFromSupabase(id: string) {
  try {
    await supabase.from('users').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete user notice:', e);
  }
}

// Push an order to Supabase
async function pushOrderToSupabase(order: any) {
  try {
    const payload = {
      id: order.id,
      client_name: order.clientName,
      client_email: order.clientEmail,
      client_phone: order.clientPhone,
      services: order.services,
      package_selected: order.packageSelected || null,
      ad_dollar_budget: order.adDollarBudget || null,
      delivery_timeframe: order.deliveryTimeframe,
      project_description: order.projectDescription,
      estimated_total_bdt: order.estimatedTotalBDT,
      advance_amount_bdt: order.advanceAmountBDT,
      payment_method: order.paymentMethod,
      payment_number: order.paymentNumber,
      transaction_id: order.transactionId,
      status: order.status,
      admin_notes: order.adminNotes,
      deliveries: order.deliveries,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
      data: order
    };

    const { error } = await supabase.from('orders').upsert(payload);
    if (error) {
      // If table has simpler schema, try upserting with id & data json
      await supabase.from('orders').upsert({ id: order.id, data: order });
    }
  } catch (e) {
    console.warn('Supabase order push notice:', e);
  }
}

// Push CMS to Supabase
async function pushCmsToSupabase(cms: any) {
  try {
    await supabase.from('cms').upsert({
      id: 'main_cms',
      data: cms,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase CMS push notice:', e);
  }
}

// Push Contact Message to Supabase
async function pushMessageToSupabase(msg: any) {
  try {
    await supabase.from('messages').insert({
      id: msg.id,
      name: msg.name,
      email: msg.email,
      phone: msg.phone || '',
      subject: msg.subject || '',
      message: msg.message,
      created_at: msg.createdAt,
      read: msg.read,
      data: msg
    });
  } catch (e) {
    console.warn('Supabase message push notice:', e);
  }
}

// Delete Order from Supabase
async function deleteOrderFromSupabase(id: string) {
  try {
    await supabase.from('orders').delete().eq('id', id);
  } catch (e) {
    console.warn('Supabase delete order notice:', e);
  }
}

// ---------------- API ROUTES ----------------

// Health & Supabase Status check
app.get('/api/health', async (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    agency: 'Beyond Pixels',
    database: 'Supabase (ixxqqtlvgoqvrlvhdkhy)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/supabase/status', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('orders').select('id').limit(1);
    res.json({
      connected: !error,
      projectId: 'ixxqqtlvgoqvrlvhdkhy',
      url: 'https://ixxqqtlvgoqvrlvhdkhy.supabase.co',
      tablesAccessible: !error,
      error: error ? error.message : null
    });
  } catch (err: any) {
    res.json({
      connected: false,
      projectId: 'ixxqqtlvgoqvrlvhdkhy',
      error: err.message
    });
  }
});

// GET CMS Content
app.get('/api/cms', (req: Request, res: Response) => {
  res.json(cmsData);
});

// UPDATE CMS Content (Admin only)
app.put('/api/cms', async (req: Request, res: Response) => {
  const userEmail = req.headers['x-user-email'] as string;
  // Allow admin email
  if (userEmail && userEmail.toLowerCase() !== 'beyondpixelsagency.official@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  }

  cmsData = { ...cmsData, ...req.body };
  saveData(CMS_FILE, cmsData);
  await pushCmsToSupabase(cmsData);
  res.json({ success: true, cms: cmsData });
});

// GET Orders (Admin gets all; Client gets their own by email)
app.get('/api/orders', (req: Request, res: Response) => {
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase();
  
  if (userEmail === 'beyondpixelsagency.official@gmail.com') {
    return res.json(ordersData);
  }

  if (userEmail) {
    const userOrders = ordersData.filter(o => o.clientEmail.toLowerCase() === userEmail);
    return res.json(userOrders);
  }

  res.json([]);
});

// GET Track Order (Public - search by Order ID, TrxID, or Phone Number)
app.get('/api/orders/track', (req: Request, res: Response) => {
  const query = ((req.query.query as string) || '').trim().toLowerCase();
  if (!query) {
    return res.status(400).json({ error: 'Please enter an Order ID, Transaction ID, or Phone number.' });
  }

  const found = ordersData.filter(o => 
    o.id.toLowerCase() === query ||
    (o.transactionId && o.transactionId.toLowerCase() === query) ||
    (o.clientPhone && o.clientPhone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''))) ||
    (o.clientEmail && o.clientEmail.toLowerCase() === query)
  );

  if (found.length === 0) {
    return res.status(404).json({ error: 'No order found matching this tracking code or phone number.' });
  }

  // Sanitize slightly for public view if needed, but return status, advance, deliveries
  res.json({ success: true, results: found });
});

// GET Single Order by ID
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = ordersData.find(o => o.id.toLowerCase() === id.toLowerCase());
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// POST Create New Order
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      services,
      subServices = [],
      packageSelected,
      adDollarBudget,
      adDollarRateBDT,
      deliveryTimeframe,
      projectDescription,
      briefFiles = [],
      estimatedTotalBDT,
      advanceAmountBDT,
      estimatedTotal,
      advanceAmount,
      paymentMethod,
      paymentNumber,
      transactionId
    } = req.body;

    const hasServiceSelected = (Array.isArray(services) && services.length > 0) || 
      Boolean(packageSelected) || 
      (Array.isArray(subServices) && subServices.length > 0) || 
      (Number(adDollarBudget) > 0);

    if (!clientName || !clientEmail || !clientPhone || !hasServiceSelected) {
      return res.status(400).json({ error: 'Missing required client or service details' });
    }

    if (!transactionId || transactionId.trim() === '') {
      return res.status(400).json({ error: 'Transaction ID is required to verify 30% advance payment' });
    }

    const finalTotalBDT = Number(estimatedTotalBDT || estimatedTotal) || 3500;
    const finalAdvanceBDT = Number(advanceAmountBDT || advanceAmount) || Math.round(finalTotalBDT * 0.3);

    const newId = `BP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: newId,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone.trim(),
      services: services && services.length > 0 ? services : ['Graphic Design'],
      subServices: Array.isArray(subServices) ? subServices : [],
      packageSelected: packageSelected || undefined,
      adDollarBudget: adDollarBudget ? Number(adDollarBudget) : undefined,
      adDollarRateBDT: adDollarRateBDT ? Number(adDollarRateBDT) : undefined,
      deliveryTimeframe: deliveryTimeframe || 'standard',
      projectDescription: projectDescription || '',
      briefFiles: Array.isArray(briefFiles) ? briefFiles : [],
      estimatedTotalBDT: finalTotalBDT,
      advanceAmountBDT: finalAdvanceBDT,
      paymentMethod: paymentMethod || 'bKash',
      paymentNumber: paymentNumber || '01965407715',
      transactionId: transactionId.trim().toUpperCase(),
      status: 'Pending Verification',
      adminNotes: 'Order submitted. Payment TrxID recorded. Awaiting admin approval.',
      deliveries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    ordersData.unshift(newOrder);
    saveData(ORDERS_FILE, ordersData);

    // Sync to Supabase in background
    pushOrderToSupabase(newOrder).catch(err => console.warn('Supabase sync background error:', err));

    // Auto-sync or register client in users table
    try {
      const clientEmailNorm = newOrder.clientEmail.toLowerCase().trim();
      const existingUserIndex = usersData.findIndex(u => u.email.toLowerCase() === clientEmailNorm);
      const now = new Date().toISOString();
      
      if (existingUserIndex >= 0) {
        const updatedUser: ServerUser = {
          ...usersData[existingUserIndex],
          phone: newOrder.clientPhone || usersData[existingUserIndex].phone,
          lastLoginAt: now
        };
        usersData[existingUserIndex] = updatedUser;
        saveData(USERS_FILE, usersData);
        pushUserToSupabase(updatedUser);
      } else {
        const newUser: ServerUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: newOrder.clientName,
          email: clientEmailNorm,
          phone: newOrder.clientPhone,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newOrder.clientName)}&backgroundColor=0ea5e9,6366f1,10b981`,
          role: clientEmailNorm === 'beyondpixelsagency.official@gmail.com' ? 'admin' : 'client',
          createdAt: now,
          lastLoginAt: now
        };
        usersData.unshift(newUser);
        saveData(USERS_FILE, usersData);
        pushUserToSupabase(newUser);
      }
    } catch (userErr) {
      console.warn('Auto user register notice on order placement:', userErr);
    }

    return res.status(201).json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error('Unhandled error in POST /api/orders:', error);
    return res.status(500).json({ error: error.message || 'An unexpected error occurred while saving your order' });
  }
});

// ---------------- USER & CLIENT AUTH SYNC ROUTES ----------------

// GET All Registered Users / Clients (Admin / Supervisor)
app.get('/api/users', (req: Request, res: Response) => {
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase();
  // Allow admin email
  if (userEmail && userEmail !== 'beyondpixelsagency.official@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized: Supervisor access required' });
  }

  // Enrich users with live orders count & lifetime spend in BDT
  const enrichedUsers = usersData.map(u => {
    const userOrders = ordersData.filter(o => o.clientEmail.toLowerCase() === u.email.toLowerCase());
    const totalSpent = userOrders
      .filter(o => o.status !== 'Rejected')
      .reduce((sum, o) => sum + (o.estimatedTotalBDT || (o as any).estimatedTotal || 0), 0);

    return {
      ...u,
      ordersCount: userOrders.length,
      totalSpentBDT: totalSpent
    };
  });

  res.json(enrichedUsers);
});

// POST Auth Sync (User Login or Register)
app.post('/api/auth/sync', async (req: Request, res: Response) => {
  const { email, name, avatar, phone, company } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isAdmin = normalizedEmail === 'beyondpixelsagency.official@gmail.com';
  const role: 'admin' | 'client' = isAdmin ? 'admin' : 'client';
  const now = new Date().toISOString();

  let existingIndex = usersData.findIndex(u => u.email.toLowerCase() === normalizedEmail);

  let userObj: ServerUser;
  if (existingIndex >= 0) {
    // Update existing user
    userObj = {
      ...usersData[existingIndex],
      name: name?.trim() || usersData[existingIndex].name,
      avatar: avatar || usersData[existingIndex].avatar,
      phone: phone !== undefined && phone !== '' ? phone : usersData[existingIndex].phone,
      company: company !== undefined && company !== '' ? company : usersData[existingIndex].company,
      role: isAdmin ? 'admin' : usersData[existingIndex].role || 'client',
      lastLoginAt: now
    };
    usersData[existingIndex] = userObj;
  } else {
    // New registration
    const displayName = name?.trim() || (isAdmin ? 'Beyond Pixels Admin' : normalizedEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()));
    const userAvatar = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0ea5e9,6366f1,10b981`;

    userObj = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: displayName,
      email: normalizedEmail,
      avatar: userAvatar,
      phone: phone || '',
      company: company || '',
      role,
      createdAt: now,
      lastLoginAt: now
    };
    usersData.unshift(userObj);
  }

  saveData(USERS_FILE, usersData);
  await pushUserToSupabase(userObj);

  // Compute live orders info
  const userOrders = ordersData.filter(o => o.clientEmail.toLowerCase() === normalizedEmail);
  const totalSpent = userOrders
    .filter(o => o.status !== 'Rejected')
    .reduce((sum, o) => sum + (o.estimatedTotalBDT || (o as any).estimatedTotal || 0), 0);

  res.json({
    success: true,
    user: {
      ...userObj,
      ordersCount: userOrders.length,
      totalSpentBDT: totalSpent
    }
  });
});

// PATCH Update User Profile
app.patch('/api/users/:idOrEmail', async (req: Request, res: Response) => {
  const { idOrEmail } = req.params;
  const { name, phone, company, avatar } = req.body;

  const index = usersData.findIndex(
    u => u.id.toLowerCase() === idOrEmail.toLowerCase() || u.email.toLowerCase() === idOrEmail.toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  const updated: ServerUser = {
    ...usersData[index],
    name: name !== undefined ? name : usersData[index].name,
    phone: phone !== undefined ? phone : usersData[index].phone,
    company: company !== undefined ? company : usersData[index].company,
    avatar: avatar !== undefined ? avatar : usersData[index].avatar
  };

  usersData[index] = updated;
  saveData(USERS_FILE, usersData);
  await pushUserToSupabase(updated);

  res.json({ success: true, user: updated });
});

// DELETE User (Admin only)
app.delete('/api/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase();
  if (userEmail !== 'beyondpixelsagency.official@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  usersData = usersData.filter(u => u.id.toLowerCase() !== id.toLowerCase());
  saveData(USERS_FILE, usersData);
  await deleteUserFromSupabase(id);

  res.json({ success: true, message: 'User deleted from system & Supabase' });
});

// PATCH Update Order (Status, Admin notes, etc.)
app.patch('/api/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase();

  const index = ordersData.findIndex(o => o.id.toLowerCase() === id.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Admin permission
  if (userEmail && userEmail !== 'beyondpixelsagency.official@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const existing = ordersData[index];
  const updated = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  ordersData[index] = updated;
  saveData(ORDERS_FILE, ordersData);

  // Sync update to Supabase
  pushOrderToSupabase(updated);

  res.json({ success: true, order: updated });
});

// POST Add Delivery / Final File Link to Order (Admin)
app.post('/api/orders/:id/deliveries', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, notes, linkOrData, type = 'link' } = req.body;

  const orderIndex = ordersData.findIndex(o => o.id.toLowerCase() === id.toLowerCase());
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const newDelivery = {
    id: `del_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    title: title || 'Project Delivery Milestone',
    notes: notes || '',
    linkOrData: linkOrData || '',
    type: type as 'file' | 'link',
    addedAt: new Date().toISOString()
  };

  ordersData[orderIndex].deliveries.push(newDelivery);
  // Auto update status to In Review or Completed if delivery added
  if (ordersData[orderIndex].status === 'In Progress') {
    ordersData[orderIndex].status = 'In Review';
  }
  ordersData[orderIndex].updatedAt = new Date().toISOString();

  saveData(ORDERS_FILE, ordersData);

  // Sync updated order with deliveries to Supabase
  pushOrderToSupabase(ordersData[orderIndex]);

  res.json({ success: true, delivery: newDelivery, order: ordersData[orderIndex] });
});

// DELETE Order (Admin)
app.delete('/api/orders/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase();
  if (userEmail !== 'beyondpixelsagency.official@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  ordersData = ordersData.filter(o => o.id.toLowerCase() !== id.toLowerCase());
  saveData(ORDERS_FILE, ordersData);

  // Delete from Supabase
  deleteOrderFromSupabase(id);

  res.json({ success: true, message: 'Order deleted' });
});

// Contact Messages API
app.post('/api/contact', async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide your name, email, and message.' });
  }

  const newMessage = {
    id: `msg_${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : '',
    subject: subject ? subject.trim() : 'Project Inquiry',
    message: message.trim(),
    createdAt: new Date().toISOString(),
    read: false
  };

  messagesData.unshift(newMessage);
  saveData(MESSAGES_FILE, messagesData);

  // Sync to Supabase
  pushMessageToSupabase(newMessage);

  res.status(201).json({ success: true, message: 'Your message has been received! Our team will reach out promptly.' });
});

app.get('/api/contact', (req: Request, res: Response) => {
  const userEmail = (req.headers['x-user-email'] as string || '').toLowerCase();
  if (userEmail !== 'beyondpixelsagency.official@gmail.com') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.json(messagesData);
});

// Admin Analytics Stats
app.get('/api/stats', (req: Request, res: Response) => {
  const totalOrders = ordersData.length;
  const pendingOrders = ordersData.filter(o => o.status === 'Pending Verification').length;
  const inProgressOrders = ordersData.filter(o => o.status === 'In Progress' || o.status === 'In Review').length;
  const completedOrders = ordersData.filter(o => o.status === 'Completed').length;
  const totalRevenue = ordersData
    .filter(o => o.status !== 'Rejected')
    .reduce((sum, o) => sum + (o.estimatedTotalBDT || (o as any).estimatedTotal || 0), 0);
  const totalAdvanceCollected = ordersData
    .filter(o => o.status !== 'Pending Verification' && o.status !== 'Rejected')
    .reduce((sum, o) => sum + (o.advanceAmountBDT || (o as any).advanceAmount || 0), 0);

  res.json({
    totalOrders,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    totalRevenue,
    totalAdvanceCollected,
    totalMessages: messagesData.length,
    unreadMessages: messagesData.filter(m => !m.read).length
  });
});

// ---------------- SERVER BOOTSTRAP ----------------
async function startServer() {
  // Sync with Supabase on startup non-blockingly
  syncFromSupabase().catch(err => {
    console.warn('⚠️ Supabase background sync notice:', err);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Beyond Pixels Agency server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
