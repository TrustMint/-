import React from 'react';
import { 
  ShoppingCart, Car, Home, Coffee, Briefcase, Laptop, 
  Plus, Minus, TrendingUp, TrendingDown, DollarSign,
  LayoutDashboard, List, PieChart, Settings, Search, Filter,
  Trash2, X, Calendar, MapPin, Tag, ChevronRight, ChevronLeft, LogOut, ArrowUpDown,
  Bell, Shield, Info, Download, Upload, CreditCard, Gift,
  Smartphone, Music, ShoppingBag,
  User, FileText, Star, MessageCircle, Navigation, RefreshCw, Camera, Check,
  Image as ImageIcon
} from 'lucide-react';

export const IconMap: Record<string, React.FC<any>> = {
  'shopping-cart': ShoppingCart,
  'car': Car,
  'home': Home,
  'coffee': Coffee,
  'briefcase': Briefcase,
  'laptop': Laptop,
  'plus': Plus,
  'minus': Minus,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'dollar': DollarSign,
  'dashboard': LayoutDashboard,
  'list': List,
  'chart': PieChart,
  'settings': Settings,
  'search': Search,
  'filter': Filter,
  'trash': Trash2,
  'close': X,
  'calendar': Calendar,
  'map': MapPin,
  'tag': Tag,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'sort-lines': ArrowUpDown,
  'logout': LogOut,
  'bell': Bell,
  'shield': Shield,
  'info': Info,
  'download': Download,
  'upload': Upload,
  'credit-card': CreditCard,
  'gift': Gift,
  'smartphone': Smartphone,
  'music': Music,
  'shopping-bag': ShoppingBag,
  'user': User,
  'file-text': FileText,
  'star': Star,
  'message': MessageCircle,
  'navigation': Navigation,
  'refresh-cw': RefreshCw,
  'camera': Camera,
  'check': Check,
  'image': ImageIcon
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', color, strokeWidth }) => {
  const IconComponent = IconMap[name] || DollarSign;
  return <IconComponent size={size} className={className} color={color} strokeWidth={strokeWidth} />;
};