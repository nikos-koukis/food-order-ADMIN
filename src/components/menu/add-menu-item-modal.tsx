import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/interfaces/category";
import { AddMenuItemForm } from "@/interfaces/add-menu-item-form";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";

interface AddMenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    storeId: string;
    onCreate: (data: FormData) => Promise<void>;
}

export function AddMenuItemModal({
    isOpen,
    onClose,
    categories,
    storeId,
    onCreate,
}: AddMenuItemModalProps) {
    const [formData, setFormData] = useState<Omit<AddMenuItemForm, 'imageUrl'> & { allergensText: string }>({
        name: '',
        description: '',
        price: 0,
        tax: 0,
        categoryId: '',
        storeId,
        allergens: [],
        allergensText: '',
        isAvailable: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price.toString());
            formDataToSend.append('tax', formData.tax.toString());
            formDataToSend.append('categoryId', formData.categoryId);
            formDataToSend.append('storeId', formData.storeId);
            formDataToSend.append('isAvailable', formData.isAvailable.toString());
            
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const allergens = formData.allergensText.split(',')
                .map(item => item.trim())
                .filter(Boolean)
                .map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
            
            formDataToSend.append('allergens', JSON.stringify(allergens));

            await onCreate(formDataToSend);
            toast.success('Menu item created successfully');
            onClose();
            // Reset form
            setFormData({
                name: '',
                description: '',
                price: 0,
                tax: 0,
                categoryId: '',
                storeId,
                allergens: [],
                allergensText: '',
                isAvailable: true,
            });
            setImageFile(null);
            setImagePreview(null);
        } catch (error) {
            toast.error('Failed to create menu item');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto sm:w-full">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl sm:text-2xl">Add New Menu Item</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Fill in the details below to create a new menu item.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="text-sm sm:text-base"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price" className="text-sm font-medium">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                required
                                min="0"
                                step="0.01"
                                className="text-sm sm:text-base"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tax" className="text-sm font-medium">Tax (%)</Label>
                            <select
                                id="tax"
                                value={formData.tax}
                                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Select tax rate</option>
                                <option value="24">24%</option>
                                <option value="13">13%</option>
                                <option value="6">6%</option>
                                <option value="17">17%</option>
                                <option value="9">9%</option>
                                <option value="4">4%</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                        <select
                            id="category"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image" className="text-sm font-medium">Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer text-sm sm:text-base"
                        />
                        {imagePreview && (
                            <div className="relative w-full h-32 sm:h-48 mt-2">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-contain rounded-md"
                                />
                            </div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="allergens" className="text-sm font-medium">Allergens (comma separated)</Label>
                        <Textarea
                            id="allergens"
                            value={formData.allergensText}
                            onChange={(e) => setFormData({ ...formData, allergensText: e.target.value })}
                            placeholder="e.g. milk, nuts, eggs"
                            className="text-sm sm:text-base min-h-[60px] sm:min-h-[80px]"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isAvailable"
                            checked={formData.isAvailable}
                            onCheckedChange={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <Label htmlFor="isAvailable" className="cursor-pointer text-sm sm:text-base">Available</Label>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button 
                            className="cursor-pointer w-full sm:w-auto" 
                            variant="outline" 
                            type="button" 
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="cursor-pointer w-full sm:w-auto" 
                            type="submit"
                        >
                            Create Item
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}