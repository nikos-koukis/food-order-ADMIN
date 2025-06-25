import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MenuItem } from "@/interfaces/menu-item";
import { Category } from "@/interfaces/category";
import { EditMenuItemForm } from "@/interfaces/edit-menu-item-form";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";

interface EditMenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItem: MenuItem | null;
    categories: Category[];
    onUpdate: (id: string, data: FormData) => Promise<void>;
}

export function EditMenuItemModal({
    isOpen,
    onClose,
    menuItem,
    categories,
    onUpdate,
}: EditMenuItemModalProps) {
    const [formData, setFormData] = useState<Omit<EditMenuItemForm, 'imageUrl'> & { allergensText: string }>({
        name: '',
        description: '',
        price: 0,
        tax: 0,
        categoryId: '',
        allergens: [],
        allergensText: '',
        isAvailable: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Update form data when menuItem changes
    useEffect(() => {
        if (menuItem) {
            setFormData({
                name: menuItem.name,
                description: menuItem.description || '',
                price: menuItem.price,
                tax: menuItem.tax || 0,
                categoryId: menuItem.categoryId._id,
                allergens: menuItem.allergens || [],
                allergensText: (menuItem.allergens || []).join(', '),
                isAvailable: menuItem.isAvailable ?? true,
            });
            if (menuItem.imageUrl) {
                setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}${menuItem.imageUrl}`);
            }
        }
    }, [menuItem]);

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
        if (!menuItem) return;
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price.toString());
            formDataToSend.append('tax', (formData.tax || 0).toString());
            formDataToSend.append('categoryId', formData.categoryId);
            formDataToSend.append('isAvailable', (formData.isAvailable ?? true).toString());
            
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const allergens = formData.allergensText.split(',')
                .map(item => item.trim())
                .filter(Boolean)
                .map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
            
            formDataToSend.append('allergens', JSON.stringify(allergens));

            await onUpdate(menuItem._id, formDataToSend);
            toast.success('Menu item updated successfully');
            onClose();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to update menu item');
            }
        }
    };

    if (!menuItem) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Menu Item</DialogTitle>
                    <DialogDescription>
                        Update the menu item details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tax">Tax (%)</Label>
                        <select
                            id="tax"
                            value={formData.tax}
                            onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                            id="category"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                        <Label htmlFor="image">Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                        />
                        {imagePreview && (
                            <div className="relative w-full h-48 mt-2">
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
                        <Label htmlFor="allergens">Allergens (comma separated)</Label>
                        <Textarea
                            id="allergens"
                            value={formData.allergensText}
                            onChange={(e) => setFormData({ ...formData, allergensText: e.target.value })}
                            placeholder="e.g. milk, nuts, eggs"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="isAvailable"
                            checked={formData.isAvailable}
                            onCheckedChange={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <Label htmlFor="isAvailable" className="cursor-pointer">Available</Label>
                    </div>
                    <DialogFooter>
                        <Button className="cursor-pointer" variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button className="cursor-pointer" type="submit">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}