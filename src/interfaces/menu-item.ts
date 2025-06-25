import { Category } from "./category";

export enum MenuItemStatus {
  AVAILABLE = "available",
  UNAVAILABLE = "unavailable",
}

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  tax: number;
  categoryId: Category;
  storeId: string;  
  imageUrl?: string;
  allergens?: string[];
  isAvailable?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemResponse {
  data: MenuItem[];
  total: number;
  page: number;
  limit: number;
}