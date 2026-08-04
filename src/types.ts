export interface Property {
  id: string;
  slug: string;
  name: string;
  description: string;
  bannerUrl: string;
  heroImage?: string;
  currency?: string;
  propertyType: 'HOTEL' | 'HOMESTAY' | 'RESORT' | 'RETREAT';
  wifiNetwork?: string;
  wifiPassword?: string;
  hostInfo?: string;
  hotelRules?: any;
  houseRules?: string;
  experiences?: string;
  receptionPhone?: string;
  housekeepingPhone?: string;
  emergencyPhone?: string;
  roomServicePhone?: string;
}

export interface MenuCategory {
  id: string;
  propertyId: string;
  name: string;
  displayOrder: number;
}

export interface Dish {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  dietaryCategory?: string;
  allergens: string; // JSON string
  healthTips?: string;
  isPopular: boolean;
  isChefRec: boolean;
  isOutOfStock: boolean;
}

export interface Amenity {
  id: string;
  propertyId: string;
  name: string;
  description?: string;
  icon?: string;
  openTime?: string;
  closeTime?: string;
  requiresReservation: boolean;
}

export interface PropertyData {
  property: Property;
  categories: MenuCategory[];
  dishes: Dish[];
  amenities: Amenity[];
}

