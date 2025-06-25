export interface Category {
  _id: string;
  name: string;
  description?: string;
  storeId?: string;
  available?: boolean;
}

export type CategoryResponse = {
  categories: Category[];
};