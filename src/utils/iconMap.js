import { LayoutDashboard, Search, Users, User, Map, Building2, Package, Calendar, LineChart, BarChart, BarChart2, BarChart3, Tag, Heart, Sun, Percent, UserMinus, FileText, DollarSign, Trophy, Activity, TrendingUp, Target, Clock, AlertTriangle, Zap, HelpCircle, Settings, Truck, Wrench, Gift, LifeBuoy, PieChart, MapPin, Shield, Database, Phone, ClipboardCheck, List, PenTool, Calculator, ScrollText, Sliders, Briefcase, Contact2, BookOpen, MessageSquare, Video, Info, Bell, MessageCircle, Ticket, Users2, Key, Webhook, CreditCard, Wallet, Landmark, Receipt, UserPlus, UserCheck, UserX, UserCog, Factory, Warehouse, Container, Forklift as Pallet, ShoppingBag, ShoppingCart, Truck as TruckIcon, Navigation, Route, History, BarChart4, PieChart as PieChartIcon, PlusCircle } from 'lucide-react';

/**
 * Maps string identifiers to Lucide React components.
 * Used to hydrate JSON configurations with actual icons.
 */
export const iconMap = {
  LayoutDashboard,
  Search,
  Users,
  User,
  Map,
  Building2,
  Package,
  Calendar,
  LineChart,
  BarChart,
  BarChart2,
  BarChart3,
  Tag, 
  Heart, 
  Sun, 
  Percent, 
  UserMinus, 
  FileText, 
  DollarSign, 
  Trophy, 
  Activity, 
  TrendingUp, 
  Target, 
  Clock,
  AlertTriangle,
  Zap,
  HelpCircle,
  Settings,
  Truck,
  Wrench,
  Gift,
  LifeBuoy,
  PieChart,
  MapPin,
  Shield,
  Database,
  Phone,
  ClipboardCheck,
  List,
  PenTool,
  Calculator,
  ScrollText,
  Sliders,
  Briefcase,
  Contact2,
  BookOpen,
  MessageSquare,
  Video,
  Info,
  Bell,
  MessageCircle,
  Ticket,
  Users2,
  Key,
  Webhook,
  CreditCard,
  Wallet,
  Landmark,
  Receipt,
  UserPlus,
  UserCheck,
  UserX,
  UserCog,
  Factory,
  Warehouse,
  Container,
  Pallet,
  ShoppingBag,
  ShoppingCart,
  TruckIcon,
  Navigation,
  Route,
  History,
  BarChart4,
  PieChartIcon,
  PlusCircle
};

/**
 * Safely resolves an icon.
 * @param {string|object} icon - The icon identifier (string) or the component itself.
 * @returns {object} The Lucide Icon component.
 */
export const getIcon = (icon) => {
  // 1. If undefined/null, return default
  if (!icon) return LayoutDashboard;
  
  // 2. If it's a string, look it up in the map
  if (typeof icon === 'string') {
    const IconComponent = iconMap[icon];
    if (IconComponent) return IconComponent;
    
    // Fallback if string not found (warn in dev)
    console.warn(`[IconMap] Icon "${icon}" not found in map. Using default.`);
    return LayoutDashboard;
  }
  
  // 3. If it's already a component/object (legacy structure), return as is
  return icon;
};