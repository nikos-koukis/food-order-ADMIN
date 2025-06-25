export interface AddMenuItemForm {
    name: string;
    description: string;
    price: number;
    tax: number;
    categoryId: string;
    storeId: string;
    imageUrl: string;
    allergens?: string[];
    isAvailable: boolean;
}