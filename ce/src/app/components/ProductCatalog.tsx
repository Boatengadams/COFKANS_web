import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Grid3x3, List, ShoppingCart, Star, TrendingUp, Zap, Sun, Lightbulb, Home, Building2, Fan, ChevronRight, Heart, Eye, X, ZoomIn, Package, CheckCircle, AlertCircle, Minus, Plus, BarChart3, GitCompare, SlidersHorizontal, Film } from 'lucide-react';
import { ProductConfiguratorPage } from './ProductConfiguratorPage';
import { ProductCompare } from './ProductCompare';
import { useHover } from '../contexts/HoverContext';
import { useCartStore } from '@/stores/cart-store';
import toast from 'react-hot-toast';
import { AdvancedSearch, type SearchFilters } from './AdvancedSearch';
import { ProductDetailModal } from './ProductDetailModal';
import { trackSearch, trackProductView, trackWishlistAdd, trackWishlistRemove } from '@/services/recommendation-service';
import type { FirestoreUser } from '@/types/firestore';
import { csvProducts } from '../data/csvProducts';
import { usePriceOverrides } from '../hooks/usePriceOverrides';
import { useProducts } from '../hooks/useProducts';
import type { FirestoreProduct } from '@/lib/firestore-schema';

// Luxury chandelier images
import highEndPendantLight from '../../imports/High-End_Pendant_Light.jpg';
import luxuryCrystalChandelier from '../../imports/Luxury_Crystal_Chandelier.jpeg';
import luxuryCrystalChandelier500W from '../../imports/Luxury_Crystal_Chandelier_500W_Gold.jpg';
import premium8LightChandelier from '../../imports/Premium_8-Light_Chandelier_Gold.jpeg';
import designerPendantLight from '../../imports/Designer_Pendant_Light__Statement_.jpeg';

// Bulb images
import energySavingBulb5W from '../../imports/Energy_Saving_Bulb_5W.png';
import energySavingBulb40W from '../../imports/Energy_Saving_Bulb_40W.png';
import ledG45ColorBulb3W from '../../imports/LED_G45_Color_Bulb_3W.png';
import emergencyBulb30W from '../../imports/Emergency_Bulb_30W.png';
import kansLED5WB22 from '../../imports/Kans_LED_5W_B22__T-Type_.png';
import kansLED7WE27 from '../../imports/Kans_LED_7W_B27__T-Type_.png';
import kansLED9WB22 from '../../imports/Kans_LED_9W_B22__T-Type_.png';
import kansLED15WB22 from '../../imports/Kans_LED_15W_B22__T-Type_.png';
import kansLED30WB22 from '../../imports/Kans_LED_30W_B22__T-Type_.png';
import kansLED50WE27 from '../../imports/Kans_LED_50W_E27__Blue_Box_.png';

// LED Panel images
import ledPanel60x6060W from '../../imports/LED_Panel_60x60_60W.png';
import ledSurfacePanel18WRound from '../../imports/LED_Surface_Panel_18W_Round_Warm_White.png';
import kansLED18_6WRGB from '../../imports/Kans_LED_18_6W_Surface_Panel_RGB.png';
import kansLED18_6WBlueWhite from '../../imports/Kans_LED_18_6W_Surface_Panel_Blue_White.png';

interface ProductCatalogProps {
  user: FirestoreUser | null;
  onRequireAuth: () => void;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  tradePrice?: number;
  category: string;
  subcategory: string;
  image: string;
  videoUrl?: string;
  featured?: boolean;
  badge?: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  description?: string;
  specs?: string[];
}

function mapFirestoreToProduct(p: FirestoreProduct): Product {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku || '',
    price: p.price ?? 0,
    tradePrice: p.tradePrice ?? undefined,
    category: p.categoryId || 'luxury',
    subcategory: p.subcategory || '',
    image: p.images?.[0]?.url || '',
    videoUrl: p.videos?.[0],
    featured: !!p.isFeatured,
    badge: p.badges?.[0],
    rating: p.rating ?? undefined,
    reviews: p.reviewCount ?? undefined,
    stock: p.totalStock ?? 0,
    description: p.description || undefined,
  };
}

const fallbackProducts: Product[] = [
  // Luxury & Lifestyle Lighting
  { id: 'lux001', name: 'High-End Pendant Light', sku: '81792/1AWL', price: 3500, category: 'luxury', subcategory: 'Chandeliers', image: highEndPendantLight, featured: true, badge: 'Premium', rating: 4.9, reviews: 127, stock: 24, description: 'Elegant pendant light with premium gold finish and modern design perfect for luxury interiors', specs: ['Gold finish', '1-light design', 'Height adjustable', 'E27 bulb base'] },
  { id: 'lux002', name: 'Luxury Crystal Chandelier', sku: '72877/400GD', price: 1700, category: 'luxury', subcategory: 'Chandeliers', image: luxuryCrystalChandelier, featured: true, rating: 4.8, reviews: 89, stock: 12, description: 'Stunning crystal chandelier with 400W capacity and gold accents', specs: ['Crystal design', '400W max', 'Gold accents', 'Multiple arms'] },
  { id: 'lux003', name: 'Designer Floor Lamp', sku: '2511-1 140W 3C', price: 2500, category: 'luxury', subcategory: 'Lamps', image: 'https://melcom.com/media/catalog/product/cache/d0e1b0d5c74d14bfa9f7dd43ec52d082/1/6/167542a.png', rating: 4.7, reviews: 54, stock: 18, description: 'Contemporary designer floor lamp with 3-color temperature control', specs: ['140W power', '3-color temps', 'Premium build', 'Modern design'] },
  { id: 'lux004', name: 'Plato Ceiling Light', sku: 'M822 46W 3C', price: 2000, category: 'luxury', subcategory: 'Ceiling Lights', image: 'https://img-1.kwcdn.com/product/fancy/05ba9300-1020-4ad6-995b-6a66c7c751f0.jpg?imageView2/2/w/800/q/70/format/avif', rating: 4.6, reviews: 41, stock: 31, description: 'Sophisticated ceiling light with color temperature adjustment', specs: ['46W LED', '3-color modes', 'Flush mount', 'Energy efficient'] },
  { id: 'lux005', name: 'LED Strip Light Warm/Pink', sku: '400W Strip', price: 2200, category: 'luxury', subcategory: 'Architectural', image: 'https://chronoslights.com/cdn/shop/products/flexible-pink-led-strip-light.jpg?v=1739440865&width=5000', badge: 'Trending', rating: 4.8, reviews: 103, stock: 67, description: 'Flexible LED strip with warm white and pink color options', specs: ['400W capacity', 'Dual colors', '5m length', 'Dimmable'] },
  { id: 'lux006', name: 'RGB LED Strip Light', sku: '400W RGB', price: 2500, category: 'luxury', subcategory: 'Architectural', image: 'https://m.media-amazon.com/images/I/714kos1LkBL._AC_SX679_.jpg', featured: true, rating: 4.9, reviews: 215, stock: 89, description: 'Premium RGB LED strip with full color spectrum and smart control', specs: ['RGB colors', '400W max', 'App control', 'Music sync'] },
  { id: 'lux007', name: 'Silicon Strip 220CV', sku: 'Flex Strip', price: 2200, category: 'luxury', subcategory: 'Architectural', image: 'https://i.ebayimg.com/images/g/Y5kAAOSwS6NmclR0/s-l960.webp', rating: 4.5, reviews: 78, stock: 45, description: 'Waterproof silicon LED strip for indoor and outdoor use', specs: ['220V AC', 'IP65 rated', 'Flexible', 'Easy install'] },
  { id: 'lux008', name: 'Integrated Step Light 6W', sku: 'Step Light', price: 200, category: 'luxury', subcategory: 'Architectural', image: 'https://www.vonn.ae/wp-content/uploads/VOS39613BL_IMAGE_1-600x600.jpg', rating: 4.7, reviews: 92, stock: 156, description: 'Recessed step light for stairs and pathways', specs: ['6W LED', 'Recessed mount', 'Warm white', 'Low profile'] },
  { id: 'lux009', name: 'Wall Light Black+Gold', sku: '6023/6516 BK+GD', price: 250, category: 'luxury', subcategory: 'Wall Lights', image: 'https://fandomlights.com/cdn/shop/files/O1CN01a6sZeK1ONRMtXIzT4__2213310341693-0-cib_720x.jpg?v=1758060557', rating: 4.6, reviews: 63, stock: 38, description: 'Modern wall sconce with black and gold finish', specs: ['Dual finish', 'Up/down light', 'E27 base', 'Metal body'] },
  { id: 'lux010', name: 'Designer Desk Lamp', sku: 'Desk Lamp BK', price: 300, category: 'luxury', subcategory: 'Lamps', image: 'https://m.media-amazon.com/images/I/611vtCsb6BL._AC_SX679_.jpg', rating: 4.8, reviews: 134, stock: 72, description: 'Adjustable desk lamp with touch controls and USB charging', specs: ['Touch control', 'USB port', 'Adjustable arm', 'LED bulb'] },

  // Solar & Infrastructure
  { id: 'sol001', name: '50W Solar Flood Light', sku: '50W Solar WT', price: 1000, category: 'solar', subcategory: 'Floodlights', image: 'https://99rands.co.za/wp-content/uploads/2023/03/50w-Led-Solar-Flood-Lamp-With-Solar-Panel-and-Smart-Remote-3.jpg', badge: 'Eco', rating: 4.7, reviews: 156, stock: 94, description: 'Energy-efficient solar floodlight with automatic dusk-to-dawn operation', specs: ['50W solar', 'Auto sensor', 'IP65 rated', '8hrs runtime'] },
  { id: 'sol002', name: 'Solar Outdoor Lamp Pair', sku: 'BT25 Pair', price: 1500, category: 'solar', subcategory: 'Outdoor', image: 'https://gh.jumia.is/unsafe/fit-in/680x680/filters:fill(white)/product/07/3871082/1.jpg?5915', featured: true, rating: 4.9, reviews: 243, stock: 56, description: 'Premium solar outdoor lamp set with motion sensor and dual brightness', specs: ['2-pack set', 'Motion sensor', 'Dual modes', '10hrs battery'] },
  { id: 'sol003', name: 'Solar Fan 300W 16\'', sku: '300/16\' WT', price: 1000, category: 'solar', subcategory: 'Fans', image: 'https://d2j6dbq0eux0bg.cloudfront.net/images/40373910/products/626862288/4124715650.png', rating: 4.6, reviews: 98, stock: 42, description: '16-inch solar-powered fan with 300W motor for off-grid cooling', specs: ['16-inch blade', '300W motor', 'Solar panel', '3-speed control'] },
  { id: 'sol004', name: 'Orange Solar Fan', sku: '8516 Orange', price: 800, category: 'solar', subcategory: 'Fans', image: 'https://www.emsolargroup.com/wp-content/uploads/2026/04/solar-fan-complete-unit.png', rating: 4.5, reviews: 71, stock: 38, description: 'Compact solar fan with vibrant orange design', specs: ['Solar powered', 'Portable', 'Rechargeable', 'Quiet operation'] },
  { id: 'sol005', name: 'Solar Table Fan', sku: 'Solar Table', price: 500, category: 'solar', subcategory: 'Fans', image: 'https://3.imimg.com/data3/PY/AJ/GLADMIN-101827/rechargeable-fan-250x250.jpg', rating: 4.4, reviews: 82, stock: 127, description: 'Portable solar table fan ideal for camping and outdoor use', specs: ['Table mount', 'USB charge', 'Solar panel', 'Adjustable tilt'] },
  { id: 'sol006', name: '300W Industrial Floodlight', sku: '300W Flood', price: 1500, category: 'solar', subcategory: 'Commercial', image: 'https://m.media-amazon.com/images/I/61t1a4GPybL._AC_SY300_SX300_QL70_ML2_.jpg', badge: 'Commercial', rating: 4.8, reviews: 187, stock: 63, description: 'Heavy-duty industrial floodlight for large area illumination', specs: ['300W LED', 'Die-cast body', 'Wide beam', 'IP66 rated'] },
  { id: 'sol007', name: '200W High Bay with Bracket', sku: '200W HiBay', price: 800, tradePrice: 650, category: 'solar', subcategory: 'Commercial', image: 'https://images-cdn.ubuy.co.in/633cb42d269f756fa62c11dc-adiding-led-high-bay-light-170lm-w-ultra.jpg', rating: 4.7, reviews: 124, stock: 51, description: 'Professional high-bay lighting with mounting bracket included', specs: ['200W output', 'Bracket mount', 'High lumen', 'Warehouse grade'] },
  { id: 'sol008', name: '200W Streetlight', sku: '200W Street', price: 450, tradePrice: 380, category: 'solar', subcategory: 'Commercial', image: 'https://www.yahualighting.com/uploads/202310151/200w-solar-led-street-light70402b78-0b00-412c-a91f-a378efa0ce3c.jpg', featured: true, rating: 4.9, reviews: 312, stock: 78, description: 'Commercial-grade solar streetlight with photocell sensor', specs: ['200W solar', 'Auto on/off', 'All-weather', '12hrs runtime'] },
  { id: 'sol009', name: '50W LED Flood Light', sku: '50W LED', price: 550, category: 'solar', subcategory: 'Floodlights', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOIifptWV60bzkSQXo7TAySx2URSOBijCgXw&s', rating: 4.6, reviews: 145, stock: 103, description: 'Versatile LED floodlight for security and accent lighting', specs: ['50W LED', 'Adjustable', 'IP65 rated', 'Cool white'] },

  // Elite Wiring & Smart Accessories
  { id: 'wire001', name: '1 Gang 1 Way Switch', sku: '1G1W', price: 10.30, tradePrice: 7.00, category: 'wiring', subcategory: 'Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYEA8sEZ4PNeH9QnxUmI8vIB_UICqojelegQ&s', rating: 4.5, reviews: 289, stock: 450, description: 'Standard single-gang switch with premium construction', specs: ['1-gang 1-way', '13A rated', 'Fire resistant', 'White finish'] },
  { id: 'wire002', name: '3 Gang 2 Way Switch', sku: '3G2W', price: 22.00, tradePrice: 16.00, category: 'wiring', subcategory: 'Switches', image: 'https://www.qlitedirect.com/wp-content/uploads/2015/09/3.1-3-Gang-2-Way-Switch-QL-3G2WS-BB-500x500.jpg', rating: 4.6, reviews: 198, stock: 340, description: 'Triple-gang 2-way switch for multi-point control', specs: ['3-gang 2-way', '13A per gang', 'Premium plate', 'Screw terminals'] },
  { id: 'wire003', name: '20A DP Switch + Neon', sku: '20A DP+N', price: 30.00, tradePrice: 21.00, category: 'wiring', subcategory: 'Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRm1T8u_BSDNe109V5UH7ZAd_VvrGkOmaTAQ&s', badge: 'Popular', rating: 4.7, reviews: 402, stock: 267, description: '20A double-pole switch with neon indicator for water heaters', specs: ['20A capacity', 'Double pole', 'Neon indicator', 'Heavy duty'] },
  { id: 'wire004', name: '45A Switch + Socket + Neon', sku: '45A Combo', price: 48.00, tradePrice: 38.00, category: 'wiring', subcategory: 'Switches', image: 'https://ess.com.mt/Content/suppliercatalogue/products/images/1053707/1.jpg', rating: 4.8, reviews: 176, stock: 154, description: 'High-capacity cooker control unit with switch, socket and indicator', specs: ['45A switch', 'Integrated socket', 'Neon light', 'Cooker control'] },
  { id: 'wire005', name: 'Door Bell Switch', sku: '1317', price: 12.00, category: 'wiring', subcategory: 'Switches', image: 'https://microless.com/cdn/products/9eaa16a39aee88011da448ed4fffbf17-hi.jpg', rating: 4.4, reviews: 312, stock: 520, description: 'Momentary doorbell switch with bell symbol marking', specs: ['Push button', 'Momentary', 'Bell marked', 'Standard size'] },
  { id: 'wire006', name: '13A Socket DP + 2USB', sku: '13A 2G USB', price: 52.00, tradePrice: 50.00, category: 'wiring', subcategory: 'Sockets', image: 'https://i.pinimg.com/1200x/f8/2c/f3/f82cf38f1c61208ddb8702f88ba33832.jpg', featured: true, badge: 'Smart', rating: 4.9, reviews: 568, stock: 189, description: 'Modern socket with dual USB ports for charging devices', specs: ['13A socket', '2x USB ports', 'Fast charging', 'Switched'] },
  { id: 'wire007', name: '13A Multi Socket + USB A+C', sku: '13A Multi', price: 35.00, category: 'wiring', subcategory: 'Sockets', image: 'https://www.tronic.co.ke/cdn/shop/files/TR-5213-UC.jpg?v=1756396646&width=700', badge: 'New', rating: 4.8, reviews: 234, stock: 298, description: 'Versatile socket with USB-A and USB-C charging ports', specs: ['Multi socket', 'USB-A & USB-C', 'Smart charging', 'Compact design'] },
  { id: 'wire008', name: 'TV Co-axial Socket', sku: 'TV Socket', price: 11.50, tradePrice: 8.00, category: 'wiring', subcategory: 'Sockets', image: 'https://i.pinimg.com/1200x/c0/5c/7c/c05c7cbd37c4a5c6889b90f2aab07905.jpg', rating: 4.3, reviews: 145, stock: 412, description: 'Coaxial socket for TV and satellite connections', specs: ['Co-axial', 'TV/SAT', 'F-type', 'Shielded'] },

  // Industrial Control
  { id: 'ind001', name: 'Sassin 4 Way 40A Main Switch', sku: 'SS-4W-40A', price: 605, category: 'industrial', subcategory: 'Breakers', image: 'https://image.made-in-china.com/2f0j00wpnkdPSlSGbV/Sassin-4-Phase-4p-32AMP-MCB-Electrical-Miniature-Circuit-Breaker-for-Overload-Protection-China-Vb514.webp', badge: 'Industrial', rating: 4.8, reviews: 87, stock: 34, description: 'Professional 4-way distribution board with 40A main switch', specs: ['4-way board', '40A main', 'MCB ready', 'Metal enclosure'] },
  { id: 'ind002', name: 'High-Capacity Breaker 100A', sku: '100A 4Pole', price: 300, category: 'industrial', subcategory: 'Breakers', image: 'https://www.plc-city.com/shop/114736-large_default/sie-5sy6206-7-nfs.jpg', rating: 4.7, reviews: 112, stock: 67, description: 'Industrial-grade 100A circuit breaker with 4-pole configuration', specs: ['100A rating', '4-pole', 'Industrial', 'DIN rail'] },
  { id: 'ind003', name: 'Sassin 8 Way 3 Phase', sku: 'SS-8W-3PH', price: 2700, category: 'industrial', subcategory: 'Breakers', image: 'https://s.alicdn.com/@sc04/kf/H6c6bad4589f8437abb2a4e0147341da34.jpg_640x640.jpg', featured: true, rating: 4.9, reviews: 145, stock: 21, description: 'Heavy-duty 8-way 3-phase distribution panel for commercial installations', specs: ['8-way', '3-phase', 'Double door', 'Wall mounted'] },
  { id: 'ind004', name: 'Sassin 12 Way Single Phase', sku: 'SS-12W-1PH', price: 1300, category: 'industrial', subcategory: 'Breakers', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNUgTAlu9REjdabH7qO3lDD95vrqUmD5_ZjQ&s', rating: 4.7, reviews: 98, stock: 45, description: '12-way single-phase consumer unit for residential and commercial', specs: ['12-way', 'Single phase', 'Main switch', 'RCBO compatible'] },
  { id: 'ind005', name: '35mm Single Metal Box', sku: '35mm Single', price: 4.00, category: 'industrial', subcategory: 'Mounting', image: 'https://m.media-amazon.com/images/I/71k+pvD-C5L._AC_UF1000,1000_QL80_.jpg', rating: 4.4, reviews: 567, stock: 890, description: 'Standard single-gang metal flush mounting box', specs: ['35mm depth', 'Single gang', 'Galvanized', 'Knock-outs'] },
  { id: 'ind006', name: '35mm Double Metal Box', sku: '35mm Double', price: 5.00, category: 'industrial', subcategory: 'Mounting', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxrZbQ1Hj1awCTB61gX_Zi3F95skgn2awihg&s', rating: 4.5, reviews: 434, stock: 720, description: 'Double-gang metal back box for switches and sockets', specs: ['35mm depth', 'Double gang', 'Steel', 'Pre-drilled'] },
  { id: 'ind007', name: '3x3 Pattress', sku: 'Pattress 3x3', price: 6.60, category: 'industrial', subcategory: 'Mounting', image: 'https://i.pinimg.com/1200x/92/86/e9/9286e90066083bb2fc6b1853d68f32ac.jpg', rating: 4.3, reviews: 198, stock: 456, description: 'Surface-mount pattress box for trunking accessories', specs: ['3x3 size', 'Surface mount', 'White finish', 'Cable entries'] },
  { id: 'ind008', name: '13A Fridge Guard', sku: 'Fridge Guard', price: 95.00, category: 'industrial', subcategory: 'Protection', image: 'https://i.pinimg.com/1200x/a9/1e/0b/a91e0b94c5e7ce2e3aaef68a8da9a31b.jpg', rating: 4.6, reviews: 234, stock: 178, description: 'Voltage protection device for refrigerators and freezers', specs: ['Surge protection', 'Delay restart', '13A socket', 'LED display'] },

  // Fans & Appliances
  { id: 'fan001', name: 'Orient CF 5611 White', sku: 'CF-5611-WT', price: 410, tradePrice: 370, category: 'appliances', subcategory: 'Ceiling Fans', image: 'https://gh.jumia.is/unsafe/fit-in/680x680/filters:fill(white)/product/85/6074192/1.jpg?8943', badge: 'Popular', rating: 4.7, reviews: 456, stock: 123, description: 'Premium Orient ceiling fan with high air delivery', specs: ['56-inch', '3-speed', 'White finish', 'Energy efficient'] },
  { id: 'fan002', name: 'Orient CF 2433 Short Blade', sku: 'CF-2433', price: 300, category: 'appliances', subcategory: 'Ceiling Fans', image: 'https://gh.jumia.is/unsafe/fit-in/680x680/filters:fill(white)/product/48/9786003/1.jpg?5562', rating: 4.5, reviews: 298, stock: 89, description: 'Compact ceiling fan ideal for small rooms', specs: ['24-inch', 'Short blade', 'Low noise', 'Durable motor'] },
  { id: 'fan003', name: 'Orient WL 20\' Wall Fan', sku: 'WL-20', price: 480, category: 'appliances', subcategory: 'Wall Fans', image: 'https://m.media-amazon.com/images/I/71a2x0UmjDL.jpg', rating: 4.6, reviews: 312, stock: 167, description: 'Wall-mounted oscillating fan with remote control', specs: ['20-inch', 'Oscillating', 'Remote control', 'Timer function'] },
  { id: 'bulb001', name: 'Energy Saving Bulb 5W', sku: 'ESB-5W', price: 7.00, category: 'appliances', subcategory: 'Bulbs', image: energySavingBulb5W, rating: 4.3, reviews: 678, stock: 945, description: 'Compact energy-saving LED bulb for general lighting', specs: ['5W LED', 'E27 base', 'Warm white', '450 lumens'] },
  { id: 'bulb002', name: 'Energy Saving Bulb 40W', sku: 'ESB-40W', price: 22.00, category: 'appliances', subcategory: 'Bulbs', image: energySavingBulb40W, rating: 4.5, reviews: 434, stock: 567, description: 'High-output LED bulb equivalent to 40W incandescent', specs: ['40W equivalent', 'E27 base', 'Cool white', '3200 lumens'] },
  { id: 'bulb003', name: 'LED G45 Color Bulb 3W', sku: 'LED-G45-3W', price: 5.00, category: 'appliances', subcategory: 'Bulbs', image: ledG45ColorBulb3W, rating: 4.2, reviews: 389, stock: 823, description: 'Decorative colored LED bulb for mood lighting', specs: ['3W LED', 'G45 shape', 'Multi-color', 'Party lighting'] },
  { id: 'bulb004', name: 'Emergency Bulb 30W', sku: 'EMG-30W-WT', price: 100, category: 'appliances', subcategory: 'Bulbs', image: emergencyBulb30W, badge: 'Emergency', rating: 4.7, reviews: 289, stock: 234, description: 'Rechargeable emergency LED bulb with backup battery', specs: ['30W output', 'Backup battery', '4hrs runtime', 'Auto switch'] },

  // ELITE ELEGANCE 91-SERIES (WHITE)
  { id: 'ee001', sku: '91302EFQ', name: '1 Gang 2 Way Switch (91-Series White)', price: 28.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYEA8sEZ4PNeH9QnxUmI8vIB_UICqojelegQ&s', stock: 420, badge: 'Elite', rating: 4.8 },
  { id: 'ee002', sku: '91304EFQ', name: '2 Gang 2 Way Switch (91-Series White)', price: 38.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYEA8sEZ4PNeH9QnxUmI8vIB_UICqojelegQ&s', stock: 350, rating: 4.7 },
  { id: 'ee003', sku: '91306EFQ', name: '3 Gang 2 Way Switch (91-Series White)', price: 48.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYEA8sEZ4PNeH9QnxUmI8vIB_UICqojelegQ&s', stock: 290 },
  { id: 'ee004', sku: '91432', name: 'TV Socket (91-Series White)', price: 24.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://assets.legrand.com/pim/PHOTOS-WEB/LG-618032-WEB-R.jpg', stock: 380 },
  { id: 'ee005', sku: '91407MQ', name: '13A Single Multi Socket (91-Series White)', price: 35.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://i.pinimg.com/1200x/71/af/0a/71af0a64dca45214ad7c7e13e561f7e3.jpg', stock: 320 },
  { id: 'ee006', sku: '91408M', name: '13A Double Multi Socket (91-Series White)', price: 45.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://i.pinimg.com/1200x/9b/06/34/9b06345f0f874ee69365dde3e64432ff.jpg', stock: 280 },
  { id: 'ee007', sku: '91324', name: '20A Single Gang Double Pole Switch (91-Series)', price: 42.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://i.pinimg.com/736x/1d/ae/10/1dae10c635f567f0089230349d871059.jpg', stock: 240 },
  { id: 'ee008', sku: '91408MB', name: '13A Double Multi Socket + USB (91-Series)', price: 62.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://www.tronic.co.ke/cdn/shop/files/TD5113-UB-GO.jpg?v=1756396253', stock: 220, featured: true },

  // ELITE ELEGANCE P-TYPE
  { id: 'ep001', sku: 'P302F', name: '1 Gang 2 Way Switch (P-Type)', price: 32.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYEA8sEZ4PNeH9QnxUmI8vIB_UICqojelegQ&s', stock: 340 },
  { id: 'ep002', sku: 'P304F', name: '2 Gang 2 Way Switch (P-Type)', price: 42.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://sharpsupplygh.com/wp-content/uploads/2025/11/2g2w-grey1.jpg', stock: 290 },
  { id: 'ep003', sku: 'P306F', name: '3 Gang 2 Way Switch (P-Type)', price: 52.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7M6begb-wmK8e_F4l7afvU0a-tHAxR-AvQg&s', stock: 230 },
  { id: 'ep004', sku: 'P324AC', name: 'Air Condition Switch (P-Type)', price: 38.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9jBMG4QwA1AnbPW9-DLbIfl9w_f2X3e_ndg&s', stock: 260 },
  { id: 'ep005', sku: 'P324WH', name: 'Water Heater Switch (P-Type)', price: 38.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeUscgcIlCqqvBzvUgD7EKL7ciBrzx1K2Qow&s', stock: 270 },
  { id: 'ep006', sku: 'P408MB', name: '13A Double Multi Socket + 2 USB (P-Type)', price: 68.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrzGpq7nNkQDRzUm9E3rMKBnb6RWgI0BS1jmr7ejD-_6QM9VUb', stock: 180, featured: true },

  // ELITE ELEGANCE VIP-TYPE (GOLD & SILVER)
  { id: 'vip001', sku: 'VP302J', name: '1 Gang 2 Way Switch (VIP Gold)', price: 55.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://assets.legrand.com/pim/PHOTOS-WEB/LEGRAND/83/832401-LEGRAND-1000.jpg', stock: 140, badge: 'Luxury' },
  { id: 'vip002', sku: 'VP304J', name: '2 Gang 2 Way Switch (VIP Gold)', price: 72.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://www.tlc-direct.co.uk/Images/Products/size_3/VLXG2D.JPG', stock: 120 },
  { id: 'vip003', sku: 'VP306J', name: '3 Gang 2 Way Switch (VIP Gold)', price: 88.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://i.etsystatic.com/6729716/r/il/982364/6073995325/il_fullxfull.6073995325_e4mk.jpg', stock: 95 },
  { id: 'vip004', sku: 'VP302Y', name: '1 Gang 2 Way Switch (VIP Silver)', price: 52.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://i.pinimg.com/736x/ae/56/0a/ae560a157a10fd0c4730ae0962ef9ae2.jpg', stock: 160 },
  { id: 'vip005', sku: 'VP352Y', name: 'Dimmer Switch (VIP Silver)', price: 75.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://i.pinimg.com/1200x/14/93/09/149309fbdffdf930483b94878af0538e.jpg', stock: 110 },
  { id: 'vip006', sku: 'VP408MBJ', name: '13A Double Multi Socket + USB (VIP Gold)', price: 95.00, category: 'wiring', subcategory: 'Elite Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaAPyMrJnkTzYWAkPl7RBLT21wvW3Mv8uNEg&s', stock: 85, featured: true },

  // TAOS NEW TYPE SERIES (WHITE, CHAMPAGNE, GREY)
  { id: 'taos001', sku: '71302', name: '1 Gang 2 Way Switch (Taos White)', price: 18.00, category: 'wiring', subcategory: 'Switches', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYEA8sEZ4PNeH9QnxUmI8vIB_UICqojelegQ&s', stock: 520 },
  { id: 'taos002', sku: '71304', name: '2 Gang 2 Way Switch (Taos White)', price: 28.00, category: 'wiring', subcategory: 'Switches', image: 'https://www.tronic.co.ke/cdn/shop/files/TS5122-WH_1.jpg?v=1756398107&width=700', stock: 460 },
  { id: 'taos003', sku: '71306', name: '3 Gang 2 Way Switch (Taos White)', price: 38.00, category: 'wiring', subcategory: 'Switches', image: 'https://www.tronic.co.ke/cdn/shop/files/TD5132-GO.png?v=1756398344&width=700', stock: 390 },
  { id: 'taos004', sku: '71456', name: '13A Single Socket + 2USB (Taos)', price: 45.00, category: 'wiring', subcategory: 'Sockets', image: 'https://image.made-in-china.com/2f0j00GHyRgmTBaIop/Stock-1-Gang-13A-UK-Socket-with-2-USB-Port-Electrical-Wall-Socket.webp', stock: 340 },
  { id: 'taos005', sku: '71306CH', name: '3 Gang 2 Way Switch (Taos Champagne)', price: 42.00, category: 'wiring', subcategory: 'Switches', image: 'https://i.pinimg.com/1200x/17/75/c0/1775c02c798b1f765c5bd95f46f9faf1.jpg', stock: 280 },
  { id: 'taos006', sku: '71304 GR', name: '2 Gang 2 Way Switch (Taos Grey)', price: 32.00, category: 'wiring', subcategory: 'Switches', image: 'https://e-motion-cdn.fra1.cdn.digitaloceanspaces.com/product/9020/1VwPVC1OyGL5Yu8b53QKC8qRUjiFuSpxefnN6AQV-315x315.jpg?v=-1', stock: 310 },

  // EXTENSION SOCKETS
  { id: 'ext001', sku: 'AWN45', name: '4 Way Extension Socket 5m Wire', price: 85.00, category: 'wiring', subcategory: 'Extension Sockets', image: 'https://m.media-amazon.com/images/I/51SZ7y3P7vL.jpg', stock: 180, rating: 4.6 },
  { id: 'ext002', sku: 'CWR43M', name: '4 Way Extension Socket 3m Wire', price: 65.00, category: 'wiring', subcategory: 'Extension Sockets', image: 'https://i.pinimg.com/1200x/9e/f6/c6/9ef6c6f0b0237e03ef9a51655d869ebb.jpg', stock: 220 },
  { id: 'ext003', sku: 'CWR43MB', name: '4 Way Extension Socket 3m Wire + USB', price: 78.00, category: 'wiring', subcategory: 'Extension Sockets', image: 'https://f.nooncdn.com/p/pzsku/Z1410A6DA90E283B4C674Z/45/1747642364/b0e8e53e-4ecd-45e5-8c0e-7aa17df6ad7b.jpg?width=800', stock: 195, badge: 'Popular' },

  // MAIN SWITCHES & DISTRIBUTION BOARDS
  { id: 'main001', sku: 'SASSIN 4WAY SP', name: 'Sassin 4-Way Single Phase Main Switch', price: 450, category: 'industrial', subcategory: 'Breakers', image: 'https://i.pinimg.com/1200x/bf/31/27/bf3127ba8d0f73bd682e22b1d77f5701.jpg', stock: 45 },
  { id: 'main002', sku: 'SASSIN 6WAY SP', name: 'Sassin 6-Way Single Phase Main Switch', price: 580, category: 'industrial', subcategory: 'Breakers', image: 'https://niolin-industrial.com/cdn/shop/files/FamilyPic.jpg?v=1706064932&width=750', stock: 38 },
  { id: 'main003', sku: 'SASSIN 8WAY SP', name: 'Sassin 8-Way Single Phase Main Switch', price: 720, category: 'industrial', subcategory: 'Breakers', image: 'https://niolin-industrial.com/cdn/shop/files/SASSINMAIN_dc96adc6-983f-4920-a1ac-669ab6d99d4b.jpg?v=1708858770&width=750', stock: 32 },
  { id: 'main004', sku: 'SASSIN 12WAY SP', name: 'Sassin 12-Way Single Phase Main Switch', price: 950, category: 'industrial', subcategory: 'Breakers', image: 'https://ikrorwxhkjplln5p.ldycdn.com/cloud/mmBpoKlmRllSprplillqk/Modular-din-rail-devices.jpg', stock: 24 },
  { id: 'main005', sku: 'SASSIN 8WAY 3PH', name: 'Sassin 8-Way 3 Phase Distribution Board', price: 1850, category: 'industrial', subcategory: 'Breakers', image: 'https://abtglobalventures.com/wp-content/uploads/2025/05/ABt-8-Way-3-Phase-Classic-Range-Distribution-Board.webp', stock: 18 },
  { id: 'main006', sku: 'ELITE 6WAY SP', name: 'Elite 6-Way Single Phase Board', price: 650, category: 'industrial', subcategory: 'Breakers', image: 'https://abtglobalventures.com/wp-content/uploads/2025/05/ABt-6-Way-Single-Phase-Consumer-Unit-Hibrid-Range-Distribution-Board-1.webp', stock: 28 },

  // CIRCUIT BREAKERS
  { id: 'brk001', sku: 'ELITE 16A 1P', name: 'Elite 16A 1-Pole Breaker', price: 25.00, category: 'industrial', subcategory: 'Breakers', image: 'https://res.cloudinary.com/rsc/image/upload/b_rgb:FFFFFF,c_pad,dpr_2.625,f_auto,h_214,q_auto,w_380/c_pad,h_214,w_380/Y2650197-01?pgw=1', stock: 320 },
  { id: 'brk002', sku: 'ELITE 32A 1P', name: 'Elite 32A 1-Pole Breaker', price: 32.00, category: 'industrial', subcategory: 'Breakers', image: 'https://www.major-tech.com/uploads/products_images/1085/V3C1P63-Web.jpg', stock: 280 },
  { id: 'brk003', sku: 'ELITE 63A 1P', name: 'Elite 63A 1-Pole Breaker', price: 58.00, category: 'industrial', subcategory: 'Breakers', image: 'https://adajusa.com/52176-large_default/mcb-circuit-breaker-1-pole-63a-1x63a-ls-electric.jpg', stock: 180 },
  { id: 'brk004', sku: 'SASSIN 32A 2P', name: 'Sassin 32A 2-Pole Breaker', price: 48.00, category: 'industrial', subcategory: 'Breakers', image: 'https://image.made-in-china.com/2f0j00PNiVqfCsfrbM/Sassin-3sb6-2p-32A-MCB-Short-Circuit-Protection.webp', stock: 210 },
  { id: 'brk005', sku: 'SASSIN 63A 4P', name: 'Sassin 63A 4-Pole Breaker', price: 125.00, category: 'industrial', subcategory: 'Breakers', image: 'https://image.made-in-china.com/2f0j00UgVkpitjsIch/Sassin-Manufacture-Price-4-Phase-4p-63AMP-MCB-Electrical-Miniature-Circuit-Breaker-for-Controlling-CE.webp', stock: 95 },

  // KANS LED BULBS
  { id: 'kled001', sku: 'KANS LED 5W B22 T', name: 'Kans LED 5W B22 (T-Type)', price: 12.00, category: 'appliances', subcategory: 'Bulbs', image: kansLED5WB22, stock: 680 },
  { id: 'kled002', sku: 'KANS LED 7W E27 T', name: 'Kans LED 7W E27 (T-Type)', price: 15.00, category: 'appliances', subcategory: 'Bulbs', image: kansLED7WE27, stock: 620 },
  { id: 'kled003', sku: 'KANS LED 9W B22 T', name: 'Kans LED 9W B22 (T-Type)', price: 18.00, category: 'appliances', subcategory: 'Bulbs', image: kansLED9WB22, stock: 580 },
  { id: 'kled004', sku: 'KANS LED 15W B22 T', name: 'Kans LED 15W B22 (T-Type)', price: 28.00, category: 'appliances', subcategory: 'Bulbs', image: kansLED15WB22, stock: 420 },
  { id: 'kled005', sku: 'KANS LED 30W B22 T', name: 'Kans LED 30W B22 (T-Type)', price: 45.00, category: 'appliances', subcategory: 'Bulbs', image: kansLED30WB22, stock: 340 },
  { id: 'kled006', sku: 'KANS LED 50W E27 BL', name: 'Kans LED 50W E27 (Blue Box)', price: 65.00, category: 'appliances', subcategory: 'Bulbs', image: kansLED50WE27, stock: 280 },

  // LED PANELS & CEILING LIGHTS
  { id: 'panel001', sku: 'KANS 18+6W BL+WT', name: 'Kans LED 18+6W Surface Panel Blue+White', price: 95.00, category: 'luxury', subcategory: 'Ceiling Lights', image: kansLED18_6WBlueWhite, stock: 180 },
  { id: 'panel002', sku: 'KANS 18+6W RGB', name: 'Kans LED 18+6W Surface Panel RGB', price: 110.00, category: 'luxury', subcategory: 'Ceiling Lights', image: kansLED18_6WRGB, stock: 160 },
  { id: 'panel003', sku: 'S1050/18W R WWT', name: 'LED Surface Panel 18W Round Warm White', price: 68.00, category: 'luxury', subcategory: 'Ceiling Lights', image: ledSurfacePanel18WRound, stock: 240 },
  { id: 'panel004', sku: 'S9030/60W', name: 'LED Panel 60x60 60W', price: 145.00, category: 'luxury', subcategory: 'Ceiling Lights', image: ledPanel60x6060W, stock: 120 },

  // ORIENT CEILING & WALL FANS
  { id: 'orient001', sku: 'CF-5639-WT', name: 'Orient CF 5639 5-Blade Ceiling Fan White', price: 480, category: 'appliances', subcategory: 'Ceiling Fans', image: 'https://gh.jumia.is/unsafe/fit-in/680x680/filters:fill(white)/product/85/6074192/1.jpg?8943', stock: 95 },
  { id: 'orient002', sku: 'CF-5639-BLUE', name: 'Orient CF 5639 5-Blade Ceiling Fan Blue', price: 480, category: 'appliances', subcategory: 'Ceiling Fans', image: 'https://5.imimg.com/data5/SELLER/Default/2022/4/XY/EW/LD/82489894/orient-electric-vandy-ceiling-fan-azure-blue-1000x1000.jpg', stock: 82 },
  { id: 'orient003', sku: 'CF-5625-WT', name: 'Orient CF 5625 Ceiling Fan White', price: 520, category: 'appliances', subcategory: 'Ceiling Fans', image: 'https://www.electromart.com.gh/wp-content/uploads/2024/06/ORIENT-56%E2%80%B3-NORWESTOR-CEILING-FAN.png', stock: 78 },
  { id: 'orient004', sku: 'WL-20', name: 'Orient WL 20 Wall Fan', price: 480, category: 'appliances', subcategory: 'Wall Fans', image: 'https://m.media-amazon.com/images/I/81hKc7wxyUL._AC_UF894,1000_QL80_.jpg', stock: 110 },

  // CABLES & WIRING
  { id: 'cable001', sku: '2.5MM EARTH', name: '2.5mm Earth Cable', price: 8.50, tradePrice: 6.50, category: 'industrial', subcategory: 'Cables', image: 'https://www.higonsolar.com/storage/uploads/images/202306/07/1686119507_uuE2A2QZ8S.jpg', stock: 950 },
  { id: 'cable002', sku: '16MM EARTH', name: '16mm Earth Cable', price: 28.00, tradePrice: 22.00, category: 'industrial', subcategory: 'Cables', image: 'https://www.mjselectricalsupplies.com.au/assets/full/BW160ELKIT.jpg?20230621173852', stock: 420 },
  { id: 'cable003', sku: 'KANS 2.5MM RED', name: 'Kans Cable 2.5mm Red', price: 9.00, category: 'industrial', subcategory: 'Cables', image: 'https://www.reinders.com/media/catalog/product/m/a/maxi-cable-red-2500.jpg?optimize=medium&bg-color=255,255,255&fit=bounds&height=728&width=728&canvas=728:728', stock: 720 },
  { id: 'cable004', sku: 'KANS 6MM EARTH', name: 'Kans Cable 6mm Earth', price: 18.00, category: 'industrial', subcategory: 'Cables', image: 'https://static.vwcable.com/wp-content/uploads/co-renmincable/Bvr-750V-PVC-Coated-Single-Core-Copper-Electric-2-5mm-Wire-Cable.jpg', stock: 480 },

  // CHANDELIERS & LUXURY FIXTURES
  { id: 'luxch001', sku: '72877/500GD', name: 'Luxury Crystal Chandelier 500W Gold', price: 2200, category: 'luxury', subcategory: 'Chandeliers', image: luxuryCrystalChandelier500W, stock: 8, featured: true, badge: 'Luxury' },
  { id: 'luxch002', sku: '72707/8GD', name: 'Premium 8-Light Chandelier Gold', price: 3200, category: 'luxury', subcategory: 'Chandeliers', image: premium8LightChandelier, stock: 6, featured: true },
  { id: 'luxch003', sku: '81792/ST', name: 'Designer Pendant Light (Statement)', price: 1850, category: 'luxury', subcategory: 'Chandeliers', image: designerPendantLight, stock: 12 },
  ...csvProducts,
];

const CATEGORY_DEFS = [
  { id: 'all', name: 'All Products', icon: Grid3x3 },
  { id: 'luxury', name: 'Luxury Lighting', icon: Lightbulb },
  { id: 'solar', name: 'Solar & Infrastructure', icon: Sun },
  { id: 'wiring', name: 'Smart Accessories', icon: Zap },
  { id: 'industrial', name: 'Industrial Control', icon: Building2 },
  { id: 'appliances', name: 'Fans & Appliances', icon: Fan },
];

function CardMedia({ imageSrc, videoSrc, alt }: { imageSrc: string; videoSrc?: string; alt: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const start = () => {
    if (!videoSrc) return;
    setActive(true);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };

  const stop = () => {
    setActive(false);
    const v = videoRef.current;
    if (v) { v.pause(); }
  };

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={start}
      onMouseLeave={stop}
      onTouchStart={start}
      onTouchEnd={stop}
    >
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
          videoSrc && active && loaded ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
            active && loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {videoSrc && (
        <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1 pointer-events-none">
          <Film className="w-3 h-3" /> VIDEO
        </div>
      )}
    </div>
  );
}

export function ProductCatalog({ user, onRequireAuth }: ProductCatalogProps) {
  const { products: firestoreProducts, loading: productsLoading } = useProducts();
  const products = useMemo<Product[]>(
    () => firestoreProducts.map(mapFirestoreToProduct),
    [firestoreProducts],
  );
  const categories = useMemo(
    () => CATEGORY_DEFS.map(c => ({
      ...c,
      count: c.id === 'all' ? products.length : products.filter(p => p.category === c.id).length,
    })),
    [products],
  );
  const { setHoveredProduct, addToViewedProducts } = useHover();
  const { cart, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItems = cart?.items || [];
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showTradePrice, setShowTradePrice] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'name' | 'rating'>('featured');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 4000]);
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'name' | 'sku' | 'category' | 'subcategory'>('none');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [configuratorProduct, setConfiguratorProduct] = useState<Product | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'all',
    priceRange: { min: 0, max: 10000 },
    minRating: 0,
    inStock: false,
  });

  const maxPrice = Math.max(...products.map(p => p.price));
  const subcategories = Array.from(new Set(products.map(p => p.subcategory)));

  // Sync with header mobile search bar
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === 'string') setSearchTerm(detail);
    };
    window.addEventListener('cofkans:search', handler);
    return () => window.removeEventListener('cofkans:search', handler);
  }, []);

  // Track search queries
  useEffect(() => {
    if (user && searchTerm && searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        trackSearch(user.uid, searchTerm, selectedCategory !== 'all' ? selectedCategory : undefined);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedCategory, user]);

  // Track advanced search filters
  useEffect(() => {
    if (user && searchFilters.searchTerm && searchFilters.searchTerm.length >= 2) {
      trackSearch(
        user.uid,
        searchFilters.searchTerm,
        searchFilters.category !== 'all' ? searchFilters.category : undefined
      );
    }
  }, [searchFilters, user]);

  // Keyboard event handlers for closing modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (quickViewProduct) {
          setQuickViewProduct(null);
        } else if (showCart) {
          setShowCart(false);
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [quickViewProduct, showCart]);

  const toggleWishlist = (productId: string) => {
    if (user) {
      const isInWishlist = wishlist.includes(productId);
      if (isInWishlist) {
        trackWishlistRemove(user.uid, productId);
      } else {
        trackWishlistAdd(user.uid, productId);
      }
    }

    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const openConfigurator = (productId: string) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
      // Track product view
      trackProductView(user.uid, product.id, product.name, product.category);
      setConfiguratorProduct(product);
      setQuickViewProduct(null);
    }
  };

  const handleQuickView = (product: Product) => {
    if (user) {
      // Track product view
      trackProductView(user.uid, product.id, product.name, product.category);
    }
    setQuickViewProduct(product);
  };

  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      onRequireAuth();
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    try {
      const price = showTradePrice && product.tradePrice ? product.tradePrice : product.price;

      await addItem(user.uid, {
        productId: product.id,
        variantId: null,
        sku: product.sku,
        name: product.name,
        image: product.image,
        price: price,
        quantity: quantity,
        customization: null,
        isAvailable: (product.stock || 0) > 0,
        stockLevel: product.stock || 0,
      });

      toast.success('Added to cart!', {
        icon: '🛒',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Unable to add item to cart');
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    if (!user) return;

    try {
      await removeItem(user.uid, productId, null);
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      toast.error('Unable to remove item');
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await handleRemoveFromCart(productId);
    } else {
      try {
        await updateQuantity(user.uid, productId, null, quantity);
      } catch (error) {
        console.error('Failed to update quantity:', error);
        toast.error('Unable to update quantity');
      }
    }
  };

  // Get cart quantity for a product
  const getCartQuantity = (productId: string) => {
    const item = cartItems.find(i => i.productId === productId && i.variantId === null);
    return item?.quantity || 0;
  };

  const toggleCompare = (productId: string) => {
    setCompareList(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : prev.length < 4 ? [...prev, productId] : prev
    );
  };

  const priceOverrides = usePriceOverrides();
  const pricedProducts = useMemo(
    () => products.map(p => (priceOverrides[p.sku] != null ? { ...p, price: priceOverrides[p.sku] } : p)),
    [priceOverrides],
  );

  const filteredProducts = useMemo(() => {
    const term = (searchFilters.searchTerm || searchTerm).toLowerCase();
    const minP = Math.max(priceRange[0], searchFilters.priceRange.min);
    const maxP = Math.min(priceRange[1], searchFilters.priceRange.max);
    const minRating = searchFilters.minRating;
    const inStockOnly = searchFilters.inStock;
    const cat = searchFilters.category === 'all' ? selectedCategory : searchFilters.category;
    const sub = searchFilters.subcategory && searchFilters.subcategory !== 'all'
      ? searchFilters.subcategory
      : selectedSubcategory;

    const tokens = term.split(/\s+/).filter(Boolean);
    const out = pricedProducts.filter(p => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (sub !== 'all' && p.subcategory !== sub) return false;
      if (p.price < minP || p.price > maxP) return false;
      if (minRating > 0 && (p.rating || 0) < minRating) return false;
      if (inStockOnly && (p.stock || 0) <= 0) return false;
      if (tokens.length) {
        const hay = `${p.name} ${p.sku} ${p.category ?? ''} ${p.subcategory ?? ''} ${p.description ?? ''} ${(p.specs ?? []).join(' ')}`.toLowerCase();
        if (!tokens.every(t => hay.includes(t))) return false;
      }
      return true;
    });

    out.sort((a, b) => {
      switch (sortBy) {
        case 'featured': return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });
    return out;
  }, [pricedProducts, selectedCategory, selectedSubcategory, searchTerm, priceRange, searchFilters, sortBy]);

  const [visibleCount, setVisibleCount] = useState(60);
  useEffect(() => { setVisibleCount(60); }, [selectedCategory, selectedSubcategory, searchTerm, sortBy, searchFilters]);
  const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  const groupedVisible = useMemo(() => {
    if (groupBy === 'none') return null;
    const map = new Map<string, typeof visibleProducts>();
    const keyFor = (p: typeof visibleProducts[number]) => {
      if (groupBy === 'name')        return (p.name?.[0] ?? '#').toUpperCase();
      if (groupBy === 'sku')         return (p.sku?.split(/[-\s/]/)[0] ?? '#').toUpperCase() || '#';
      if (groupBy === 'category')    return p.category ?? 'Other';
      if (groupBy === 'subcategory') return p.subcategory ?? 'Other';
      return 'Other';
    };
    visibleProducts.forEach(p => {
      const k = keyFor(p);
      const arr = map.get(k) ?? [];
      arr.push(p);
      map.set(k, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [groupBy, visibleProducts]);

  // Flat sequence of products with group-header markers interleaved (for the existing grid)
  const renderSequence = useMemo<Array<
    | { type: 'header'; key: string; label: string; count: number }
    | { type: 'product'; product: typeof visibleProducts[number]; index: number }
  >>(() => {
    if (!groupedVisible) {
      return visibleProducts.map((product, index) => ({ type: 'product', product, index }));
    }
    const out: Array<any> = [];
    let i = 0;
    for (const [key, items] of groupedVisible) {
      out.push({ type: 'header', key: `hdr-${key}`, label: key, count: items.length });
      for (const product of items) out.push({ type: 'product', product, index: i++ });
    }
    return out;
  }, [groupedVisible, visibleProducts]);

  const cartTotal = cartItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return sum;
    const price = showTradePrice && product.tradePrice ? product.tradePrice : product.price;
    return sum + (price * item.quantity);
  }, 0);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="w-full space-y-8 relative">
      {/* Floating Action Buttons */}
      <AnimatePresence>
        {/* Compare Button */}
        {compareList.length > 0 && (
          <motion.button
            initial={{ scale: 0, x: 100 }}
            animate={{ scale: 1, x: 0 }}
            exit={{ scale: 0, x: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCompare(true)}
            className="fixed bottom-28 right-8 z-50 bg-secondary text-white rounded-full px-6 py-4 shadow-2xl flex items-center gap-3 font-bold cursor-pointer"
          >
            <GitCompare className="w-5 h-5" strokeWidth={2.5} />
            <span>Compare ({compareList.length})</span>
          </motion.button>
        )}

        {/* Cart Button */}
        {cartItemCount > 0 && (
          <motion.button
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCart(true)}
            className="fixed bottom-8 right-8 z-50 bg-primary text-white rounded-full px-8 py-5 shadow-2xl flex items-center gap-3 font-bold cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--gradient-primary-from) 0%, var(--gradient-primary-to) 100%)'
            }}
          >
            <ShoppingCart className="w-6 h-6" strokeWidth={2.5} />
            <span>{cartItemCount} Items</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">GH₵ {cartTotal.toLocaleString()}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Stats Banner */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-6 border border-border shadow-sm"
        >
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-1 sm:gap-3 sm:mb-2">
            <div className="p-1.5 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
              <Package className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
            </div>
            <div>
              <div className="text-base sm:text-3xl font-bold text-foreground leading-tight">{products.length}</div>
              <div className="text-[10px] sm:text-sm text-muted-foreground leading-tight">Products</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-6 border border-border shadow-sm"
        >
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-1 sm:gap-3 sm:mb-2">
            <div className="p-1.5 sm:p-3 bg-secondary/10 rounded-lg sm:rounded-xl">
              <Star className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-secondary fill-secondary" strokeWidth={2} />
            </div>
            <div>
              <div className="text-base sm:text-3xl font-bold text-foreground leading-tight">{products.filter(p => p.featured).length}</div>
              <div className="text-[10px] sm:text-sm text-muted-foreground leading-tight">Featured</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-6 border border-border shadow-sm"
        >
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-1 sm:gap-3 sm:mb-2">
            <div className="p-1.5 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
              <Heart className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
            </div>
            <div>
              <div className="text-base sm:text-3xl font-bold text-foreground leading-tight">{wishlist.length}</div>
              <div className="text-[10px] sm:text-sm text-muted-foreground leading-tight">Wishlist</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-6 border border-border shadow-sm"
        >
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-1 sm:gap-3 sm:mb-2">
            <div className="p-1.5 sm:p-3 bg-secondary/10 rounded-lg sm:rounded-xl">
              <GitCompare className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-secondary" strokeWidth={2} />
            </div>
            <div>
              <div className="text-base sm:text-3xl font-bold text-foreground leading-tight">{compareList.length}/4</div>
              <div className="text-[10px] sm:text-sm text-muted-foreground leading-tight">Compare</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 sm:space-y-4">
        {/* Row 1 — Search (full width) */}
        <div className="w-full">
          <AdvancedSearch
            onSearch={(filters) => {
              setSearchFilters(filters);
              setSearchTerm(filters.searchTerm);
              setSelectedCategory(filters.category || 'all');
              setSelectedSubcategory(filters.subcategory || 'all');
            }}
            categories={categories.map(c => ({ id: c.id, label: c.name }))}
            subcategories={subcategories}
            maxPrice={maxPrice}
            localProducts={pricedProducts.map(p => ({
              id: p.id, name: p.name, sku: p.sku, price: p.price,
              category: p.category, subcategory: p.subcategory,
              image: p.image, description: p.description, specs: p.specs,
              stock: p.stock, rating: p.rating,
            }))}
          />
        </div>

        {/* Row 2 — Toolbar: Sort + Pricing + View */}
        <div className="flex items-center gap-2 sm:gap-3 bg-card border-2 border-border rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-sm">
          {/* Sort */}
          <div className="relative flex-1 min-w-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-3 pr-8 py-2.5 sm:py-3 bg-transparent rounded-lg sm:rounded-xl text-foreground text-xs sm:text-sm font-semibold focus:outline-none focus:bg-muted/50 hover:bg-muted/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="featured">⭐ Featured</option>
              <option value="rating">⭐ Top Rated</option>
              <option value="price-low">💰 Price: Low → High</option>
              <option value="price-high">💰 Price: High → Low</option>
              <option value="name">🔤 Name: A-Z</option>
            </select>
            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 rotate-90 text-muted-foreground pointer-events-none" strokeWidth={2.5} />
          </div>

          <div className="h-6 sm:h-8 w-px bg-border" />

          {/* Price Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowTradePrice(!showTradePrice)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              showTradePrice
                ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-md shadow-primary/30'
                : 'bg-muted/60 text-foreground hover:bg-muted'
            }`}
            aria-label={showTradePrice ? 'Switch to retail pricing' : 'Switch to trade pricing'}
          >
            <span>{showTradePrice ? '🔑' : '🛒'}</span>
            <span className="hidden sm:inline">{showTradePrice ? 'Trade' : 'Retail'}</span>
          </motion.button>

          {/* View Mode */}
          <div className="hidden lg:flex gap-1 border-l-2 border-border pl-2 ml-1">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === 'grid' ? 'bg-primary text-white shadow-md' : 'hover:bg-muted'
              }`}
              aria-label="Grid view"
            >
              <Grid3x3 className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === 'list' ? 'bg-primary text-white shadow-md' : 'hover:bg-muted'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-border space-y-5 sm:space-y-6 shadow-md">
                {/* Subcategory Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-foreground">Subcategory</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedSubcategory('all')}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                        selectedSubcategory === 'all'
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-muted hover:bg-muted/70'
                      }`}
                    >
                      All
                    </button>
                    {subcategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                          selectedSubcategory === sub
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-muted hover:bg-muted/70'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-foreground">
                    Price Range: GH₵ {priceRange[0].toLocaleString()} - GH₵ {priceRange[1].toLocaleString()}
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 3 — Category Tabs (with fade edges to hint scroll) */}
        <div className="relative">
          <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`snap-start flex items-center gap-1.5 sm:gap-3 px-3 sm:px-7 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-base font-bold whitespace-nowrap transition-all duration-300 shadow-sm sm:shadow-md cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/40'
                    : 'bg-card border-2 border-border hover:bg-muted hover:shadow-xl hover:border-primary/30'
                }`}
              >
                <cat.icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                <span>{cat.name}</span>
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                  selectedCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {cat.count}
                </span>
              </motion.button>
            ))}
          </div>
          {/* Scroll fade hint on the right edge (mobile) */}
          <div className="sm:hidden pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>

      {/* Results summary + Group-by */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-card border-2 border-border rounded-xl px-3 sm:px-4 py-2.5">
          <div className="text-xs sm:text-sm font-semibold text-foreground">
            <span className="font-bold text-primary">{filteredProducts.length.toLocaleString()}</span> total item{filteredProducts.length !== 1 ? 's' : ''}
            {filteredProducts.length !== pricedProducts.length && (
              <span className="text-muted-foreground font-medium"> of {pricedProducts.length.toLocaleString()}</span>
            )}
            {groupedVisible && (
              <span className="text-muted-foreground font-medium"> · {groupedVisible.length} group{groupedVisible.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">Group by</label>
            <div className="relative">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="appearance-none pl-3 pr-7 py-1.5 text-xs font-bold rounded-lg border-2 border-border bg-muted/40 hover:bg-muted focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="none">None</option>
                <option value="name">Name (A–Z)</option>
                <option value="sku">Item code</option>
                <option value="category">Category</option>
                <option value="subcategory">Subcategory</option>
              </select>
              <ChevronRight className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 text-muted-foreground pointer-events-none" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${viewMode}-${selectedSubcategory}-${groupBy}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={viewMode === 'grid'
            ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'
            : 'space-y-4'
          }
        >
          {renderSequence.map(entry => entry.type === 'header' ? (
            <div key={entry.key} className="col-span-full flex items-center gap-2 pt-2 pb-1 border-b-2 border-border sticky top-0 bg-background/95 backdrop-blur z-10">
              <span className="w-8 h-8 rounded-lg bg-foreground text-background text-xs font-bold flex items-center justify-center flex-shrink-0">
                {entry.label.slice(0, 2)}
              </span>
              <h3 className="text-sm font-bold truncate flex-1">{entry.label}</h3>
              <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {entry.count} item{entry.count !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (() => { const { product, index } = entry; return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: Math.min(index, 12) * 0.015 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onMouseEnter={() => {
                setHoveredProduct({
                  id: product.id,
                  name: product.name,
                  category: product.category,
                  price: `GH₵ ${product.price.toLocaleString()}`,
                  description: product.description,
                  specs: product.specs,
                });
                addToViewedProducts({
                  id: product.id,
                  name: product.name,
                  category: product.category,
                  price: `GH₵ ${product.price.toLocaleString()}`,
                  description: product.description,
                  specs: product.specs,
                });
              }}
              onMouseLeave={() => setHoveredProduct(null)}
              className={`group relative bg-card hover:bg-background rounded-3xl border-2 border-border overflow-hidden hover:shadow-2xl hover:border-primary transition-all duration-500 ${
                viewMode === 'list' ? 'flex gap-6' : ''
              }`}
            >
              {/* Product Image */}
              <div
                onClick={() => handleQuickView(product)}
                className={`relative overflow-hidden bg-muted cursor-pointer ${
                  viewMode === 'grid' ? 'aspect-square' : 'w-64 h-64 flex-shrink-0'
                }`}
              >
                <CardMedia
                  imageSrc={product.image}
                  videoSrc={product.videoUrl}
                  alt={product.name}
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2 max-w-[60%] z-10">
                  {product.badge && (
                    <div className="px-2 py-0.5 sm:px-4 sm:py-2 bg-primary text-white rounded-full text-[9px] sm:text-xs font-bold shadow-lg backdrop-blur-sm leading-tight truncate">
                      {product.badge}
                    </div>
                  )}
                  {product.featured && (
                    <div className="px-2 py-0.5 sm:px-4 sm:py-2 bg-secondary text-white rounded-full text-[9px] sm:text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1 leading-tight">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white flex-shrink-0" strokeWidth={2} />
                      <span className="hidden sm:inline">Featured</span>
                      <span className="sm:hidden">★</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions — always visible on mobile, hover-reveal on desktop */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div className="relative group/tooltip">
                    <motion.button
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                      className={`p-2 sm:p-3 rounded-full backdrop-blur-md shadow-lg sm:shadow-xl hover:shadow-2xl transition-all cursor-pointer ${
                        wishlist.includes(product.id)
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-white/95 dark:bg-foreground/90 text-foreground dark:text-background hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlist.includes(product.id) ? 'fill-white' : ''}`} strokeWidth={2.5} />
                    </motion.button>
                    <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg">
                      {wishlist.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </div>
                  </div>
                  <div className="relative group/tooltip">
                    <motion.button
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickView(product);
                      }}
                      aria-label="Quick view"
                      className="p-2 sm:p-3 bg-white/95 dark:bg-foreground/90 backdrop-blur-md rounded-full shadow-lg sm:shadow-xl hover:shadow-2xl hover:bg-primary hover:text-white dark:hover:text-white transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </motion.button>
                    <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg">
                      Quick View
                    </div>
                  </div>
                  <div className="relative group/tooltip">
                    <motion.button
                      whileHover={{ scale: 1.15, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompare(product.id);
                      }}
                      aria-label={compareList.includes(product.id) ? 'Remove from compare' : 'Add to compare'}
                      className={`p-2 sm:p-3 rounded-full backdrop-blur-md shadow-lg sm:shadow-xl hover:shadow-2xl transition-all cursor-pointer disabled:opacity-50 ${
                        compareList.includes(product.id)
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-white/95 dark:bg-foreground/90 text-foreground dark:text-background hover:bg-secondary hover:text-white'
                      }`}
                      disabled={!compareList.includes(product.id) && compareList.length >= 4}
                    >
                      <GitCompare className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </motion.button>
                    <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-lg">
                      {compareList.includes(product.id) ? 'Remove from Compare' : 'Add to Compare'}
                    </div>
                  </div>
                </div>

                {/* Stock Badge */}
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-10">
                  {(product.stock || 0) > 50 ? (
                    <div className="px-2 py-0.5 sm:px-3 sm:py-1.5 bg-secondary/90 text-white rounded-full text-[9px] sm:text-xs font-bold backdrop-blur-sm flex items-center gap-1 leading-tight">
                      <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" strokeWidth={2.5} />
                      <span className="hidden sm:inline">In Stock ({product.stock})</span>
                      <span className="sm:hidden">{product.stock}</span>
                    </div>
                  ) : (product.stock || 0) > 0 ? (
                    <div className="px-2 py-0.5 sm:px-3 sm:py-1.5 bg-primary/90 text-white rounded-full text-[9px] sm:text-xs font-bold backdrop-blur-sm flex items-center gap-1 leading-tight">
                      <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" strokeWidth={2.5} />
                      <span className="hidden sm:inline">Low Stock ({product.stock})</span>
                      <span className="sm:hidden">Low · {product.stock}</span>
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 sm:px-3 sm:py-1.5 bg-red-500/90 text-white rounded-full text-[9px] sm:text-xs font-bold backdrop-blur-sm leading-tight">
                      <span className="hidden sm:inline">Out of Stock</span>
                      <span className="sm:hidden">Sold Out</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className={`p-3 sm:p-5 lg:p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                <div className="space-y-3">
                  <code className="text-xs text-muted-foreground font-mono font-bold bg-muted px-2 py-1 rounded">
                    {product.sku}
                  </code>

                  <h4
                    onClick={() => handleQuickView(product)}
                    className="text-sm sm:text-base lg:text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
                  >
                    {product.name}
                  </h4>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating!)
                                ? 'fill-primary text-primary'
                                : 'text-muted'
                            }`}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-primary">
                      {product.price > 0
                        ? `GH₵ ${(showTradePrice && product.tradePrice ? product.tradePrice : product.price).toLocaleString()}`
                        : <span className="text-sm sm:text-base text-muted-foreground">Contact for Pricing</span>}
                    </div>
                    {showTradePrice && product.tradePrice && product.tradePrice < product.price && (
                      <div className="text-lg text-muted-foreground line-through">
                        GH₵ {product.price.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {showTradePrice && product.tradePrice && product.tradePrice < product.price && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-bold">
                      <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                      Save GH₵ {(product.price - product.tradePrice).toLocaleString()}
                    </div>
                  )}

                  {viewMode === 'list' && product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {getCartQuantity(product.id) === 0 ? (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(product.id, 1)}
                      className="flex-1 py-2.5 sm:py-4 text-xs sm:text-base bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:shadow-2xl hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary rounded-xl px-4 py-3">
                      <button
                        onClick={() => handleUpdateQuantity(product.id, getCartQuantity(product.id) - 1)}
                        className="p-2 hover:bg-white/20 rounded-lg transition text-white"
                      >
                        <Minus className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                      <span className="font-bold min-w-[2ch] text-center text-white text-lg">{getCartQuantity(product.id)}</span>
                      <button
                        onClick={() => handleUpdateQuantity(product.id, getCartQuantity(product.id) + 1)}
                        className="p-2 hover:bg-white/20 rounded-lg transition text-white"
                      >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ); })())}
        </motion.div>
      </AnimatePresence>

      {visibleCount < filteredProducts.length && (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-bold text-foreground">{visibleCount}</span> of {filteredProducts.length}
          </p>
          <button
            onClick={() => setVisibleCount(c => c + 60)}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Load more products
          </button>
        </div>
      )}

      {/* Empty State */}
      {productsLoading && products.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">Loading catalogue…</div>
      )}

      {!productsLoading && products.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-3xl font-bold mb-3">Catalogue coming soon</h3>
          <p className="text-muted-foreground text-lg">Products are being added. Check back shortly.</p>
        </div>
      )}

      {!productsLoading && products.length > 0 && filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-3xl font-bold mb-3">No products found</h3>
          <p className="text-muted-foreground mb-8 text-lg">Try adjusting your filters or search term</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedSubcategory('all');
              setPriceRange([0, maxPrice]);
            }}
            className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold hover:shadow-xl transition-all shadow-md"
          >
            Clear All Filters
          </button>
        </motion.div>
      )}

      {/* Quick View Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(id, qty) => { handleAddToCart(id, qty); setQuickViewProduct(null); }}
        onToggleWishlist={toggleWishlist}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        showTradePrice={showTradePrice}
      />

      {/* Shopping Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-end p-4"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl w-full max-w-md h-[90vh] overflow-auto border-2 border-border shadow-2xl"
            >
              <div className="p-6 sticky top-0 bg-card border-b-2 border-border z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">Shopping Cart</h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" strokeWidth={2} />
                  </button>
                </div>
                <p className="text-muted-foreground">{cartItemCount} items</p>
              </div>

              <div className="p-6 space-y-4">
                {cartItems.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  const price = showTradePrice && product.tradePrice ? product.tradePrice : product.price;

                  return (
                    <motion.div
                      key={item.productId}
                      layout
                      className="flex gap-4 bg-muted rounded-2xl p-4"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold line-clamp-1">{product.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">GH₵ {price.toLocaleString()}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="p-1.5 bg-background hover:bg-card rounded-lg transition"
                          >
                            <Minus className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                          <span className="font-bold min-w-[3ch] text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="p-1.5 bg-background hover:bg-card rounded-lg transition"
                          >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="ml-auto p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <X className="w-5 h-5" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          GH₵ {(price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {cartItemCount === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                )}
              </div>

              {cartItemCount > 0 && (
                <div className="p-6 sticky bottom-0 bg-card border-t-2 border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-3xl font-bold text-primary">
                      GH₵ {cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <motion.button
                    onClick={() => {
                      // Close cart and show success message
                      setShowCart(false);
                      alert(`Thank you! ${cartItemCount} item${cartItemCount > 1 ? 's' : ''} ready for checkout.\n\nTotal: GH₵ ${cartTotal.toLocaleString()}\n\nOur team will contact you shortly to complete your order.`);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold hover:shadow-xl transition-all duration-300 shadow-md cursor-pointer"
                  >
                    Proceed to Checkout
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Configurator Page */}
      {configuratorProduct && (
        <ProductConfiguratorPage
          product={configuratorProduct}
          onClose={() => setConfiguratorProduct(null)}
        />
      )}

      {/* Product Compare Modal */}
      {showCompare && compareList.length > 0 && (
        <ProductCompare
          products={products.filter(p => compareList.includes(p.id))}
          onClose={() => setShowCompare(false)}
          onRemove={(productId) => {
            setCompareList(prev => prev.filter(id => id !== productId));
            if (compareList.length <= 1) {
              setShowCompare(false);
            }
          }}
          onAddToCart={openConfigurator}
        />
      )}
    </div>
  );
}
