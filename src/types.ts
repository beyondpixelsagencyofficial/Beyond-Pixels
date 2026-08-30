export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  company?: string;
  password?: string;
  role: UserRole;
  createdAt?: string;
  lastLoginAt?: string;
  ordersCount?: number;
  totalSpentBDT?: number;
}

export type ServiceType = 
  | 'Graphic Design'
  | 'Video Editing'
  | 'Digital Marketing'
  | 'Web Development'
  | '15-Day Growth Package'
  | '30-Day Pro Package'
  | 'Ad Boost Budget'
  | 'SEO Optimization';

export interface ServiceItem {
  id: string;
  key: ServiceType;
  title: string;
  tagline: string;
  shortDesc: string;
  fullDesc: string;
  icon: 'Palette' | 'Film' | 'TrendingUp' | 'Code2' | 'Sparkles' | 'Rocket';
  basePriceBDT: number;
  features: string[];
  deliverables: string[];
  popularBadge?: boolean;
}

export interface AgencyPackage {
  id: string;
  name: string;
  duration: string;
  tagline: string;
  priceBDT: number;
  designsCount: number;
  videosCount: number;
  pageManagementFree: boolean;
  features: string[];
  popularBadge?: boolean;
}

export type DeliveryTimeframe = 'standard' | 'express' | 'rush';

export interface FileAttachment {
  id: string;
  name: string;
  size?: number;
  type?: string;
  dataUrl?: string;
  downloadUrl?: string;
  uploadedAt: string;
}

export interface DeliveryRelease {
  id: string;
  title: string;
  notes?: string;
  linkOrData: string;
  type: 'file' | 'link';
  addedAt: string;
  downloadCount?: number;
}

export type OrderStatus =
  | 'Pending Verification'
  | 'Confirmed'
  | 'In Progress'
  | 'In Review'
  | 'Completed'
  | 'Rejected';

export interface SubServiceItem {
  id: string;
  category: 'Graphic Design' | 'Video Editing' | 'Digital Marketing' | 'Web Development';
  title: string;
  titleBn: string;
  priceBDT: number;
  description: string;
  unit?: string;
  popular?: boolean;
}

export interface SelectedSubService {
  id: string;
  category: string;
  title: string;
  priceBDT: number;
  quantity?: number;
}

export interface Order {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  services: ServiceType[];
  subServices?: SelectedSubService[];
  packageSelected?: string;
  adDollarBudget?: number;
  adBoostBudgetUSD?: number;
  adDollarRateBDT?: number;
  deliveryTimeframe: DeliveryTimeframe;
  projectDescription: string;
  briefFiles: FileAttachment[];
  estimatedTotalBDT: number;
  advanceAmountBDT: number;
  paymentMethod: 'bKash' | 'Nagad';
  paymentNumber: string;
  transactionId: string;
  status: OrderStatus;
  adminNotes?: string;
  deliveries: DeliveryRelease[];
  createdAt: string;
  updatedAt: string;
}

export interface CMSContent {
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  bannerNotice: string;
  showBannerNotice: boolean;
  agencyEmail: string;
  agencyPhone: string;
  agencyWhatsApp: string;
  agencyFacebook: string;
  paymentNumber: string;
  advancePercentage: number;
  adDollarRateBDT: number;
  stats: {
    label: string;
    value: string;
    description: string;
  }[];
  services: ServiceItem[];
  packages: AgencyPackage[];
  reasonsToChoose: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

