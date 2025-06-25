export interface EditMenuItemForm {
    name: string;
    description: string;
    price: number;
    tax?: number;
    categoryId: string;
    imageUrl: string;
    allergens?: string[];
    isAvailable?: boolean;
}