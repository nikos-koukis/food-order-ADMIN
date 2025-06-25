"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import { EditMenuItemModal } from "@/components/menu/edit-menu-item-modal";
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useMenuItems } from "@/hooks/use-menu-items";
import { MenuItem, MenuItemStatus } from "@/interfaces/menu-item";
import { Category } from "@/interfaces/category";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { EditMenuItemForm } from "@/interfaces/edit-menu-item-form";
import { AddMenuItemForm } from "@/interfaces/add-menu-item-form";
import { AddMenuItemModal } from "@/components/menu/add-menu-item-modal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MenuPage() {
    const { useAllMenuItems, deleteMenuItemMutation, updateMenuItemMutation, createMenuItemMutation } = useMenuItems();
    const { useAllCategories } = useCategories();
    const { data: menuItems, isLoading: menuItemsLoading, error: menuItemsError } = useAllMenuItems();
    const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useAllCategories();
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<MenuItemStatus | 'all'>('all');
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const getImageUrl = (imageUrl: string | undefined) => {
        if (!imageUrl) return '';
        const cleanImageUrl = imageUrl.replace(/^\/+/, '');
        return `${process.env.NEXT_PUBLIC_API_URL}/${cleanImageUrl}`;
    };

    const filteredItems = menuItems?.filter((item: MenuItem) => {
        if (activeCategory === "all") return true;
        return item.categoryId._id === activeCategory;
    }) || [];

    const handleEdit = (menuItem: MenuItem) => {
        setEditItem(menuItem);
    };

    const handleUpdate = async (id: string, data: FormData) => {
        try {
            data.append('id', id);
            await updateMenuItemMutation.mutateAsync(data);
        } catch (error) {
            throw error;
        }
    };

    const handleDelete = async () => {
        if (!deleteItemId) return;
        
        try {
            await deleteMenuItemMutation.mutateAsync(deleteItemId);
            toast.success('Menu item deleted successfully');
            setDeleteItemId(null);
        } catch (error) {
            toast.error('Failed to delete menu item');
        }
    };

    const handleCreate = async (data: FormData) => {
        try {
            await createMenuItemMutation.mutateAsync(data);
        } catch (error) {
            throw error;
        }
    };

    if (menuItemsError || categoriesError) {
        return (
            <div className="flex-1 space-y-6 p-8 pt-6">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
                    </div>
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Menu Item
                    </Button>
                </div>
                <div className="text-red-500">Error loading data. Please try again later.</div>
            </div>
        );
    }

    const isLoading = menuItemsLoading || categoriesLoading;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Menu Management</h1>
                </div>
                <Button className="cursor-pointer" onClick={() => setIsAddModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Menu Item
                </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Available Items</CardTitle>
                        <CardDescription>Currently available menu items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {menuItemsLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-3xl font-bold">
                                {menuItems?.filter((menuItem: MenuItem) => menuItem.isAvailable).length || 0}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                        <CardDescription>Menu item categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoriesLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-3xl font-bold">{categories?.length || 0}</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Items</CardTitle>
                        <CardDescription>All menu items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {menuItemsLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-3xl font-bold">{menuItems?.length || 0}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mb-8">
                <Card>
                    <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Menu Items</CardTitle>
                            <CardDescription>Manage your menu items by category</CardDescription>
                        </div>
                        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
                            <Select value={activeCategory} onValueChange={setActiveCategory}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Select catecory" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories?.map((category: Category) => (
                                        <SelectItem key={category._id} value={category._id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as MenuItemStatus)}>
                                <TabsList className="w-full inline-flex items-center justify-start overflow-x-auto space-x-1">
                                    <TabsTrigger 
                                        value="all"
                                        className="data-[state=active]:text-foreground dark:data-[state=active]:text-foreground"
                                    >
                                        All
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="Available"
                                        className="text-green-600 dark:text-green-400 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400"
                                    >
                                        Available
                                    </TabsTrigger>
                                    <TabsTrigger 
                                    value="Unavailable"
                                    className="text-red-600 dark:text-red-400 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400"
                                    >
                                        Unavailable
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {filteredItems
                                    .filter((menuItem: MenuItem) =>
                                        (statusFilter === 'all' ? true : menuItem.isAvailable === (statusFilter === 'available'))
                                    )
                                    ?.map((menuItem: MenuItem) => (
                                    <Card 
                                        key={menuItem._id}
                                        className="overflow-hidden hover:shadow-md transition-shadow py-0 gap-1"
                                    >
                                        <div className="aspect-square relative overflow-hidden bg-gray-500">
                                            {menuItem.imageUrl ? (
                                                <Image
                                                    src={getImageUrl(menuItem.imageUrl)}
                                                    alt={menuItem.name}
                                                    className="object-cover w-full h-full"
                                                    width={400}
                                                    height={400}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    No image available
                                                </div>
                                            )}
                                        </div>

                                        <CardContent className="p-4 space-y-3 flex-1">
                                            <h3 className="font-bold text-lg line-clamp-1">{menuItem.name}</h3>

                                            <div className="flex items-center gap-2 w-full h-fit">
                                                <Badge
                                                    variant="soft"
                                                    color={menuItem.isAvailable ? 'success' : 'destructive'}
                                                    className="flex-1 items-center gap-2 px-2 py-1 text-center justify-center"
                                                >
                                                    {menuItem.isAvailable ?
                                                        <CheckCircle2 className="h-4 w-4" /> :
                                                        <XCircle className="h-4 w-4" />
                                                    }
                                                    {menuItem.isAvailable ? 'Available' : 'Unavailable'}
                                                </Badge>
                                                <Badge
                                                    variant="soft"
                                                    color="primary"
                                                    className="flex-1 items-center gap-2 px-2 py-1 text-center justify-center"
                                                >
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                    {categories?.find(cat => cat._id === menuItem.categoryId._id)?.name || "Uncategorized"}
                                                </Badge>
                                            </div>

                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {menuItem.description || 'No description available'}
                                            </p>
                                        </CardContent>
                                        
                                        <CardFooter className="flex justify-between p-4 pt-0">
                                            <span className="font-bold text-lg">€{menuItem.price.toFixed(2)}</span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="cursor-pointer"
                                                    size="sm"
                                                    onClick={() => handleEdit(menuItem)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="cursor-pointer"
                                                    size="sm"
                                                    onClick={() => setDeleteItemId(menuItem._id)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Menu Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this menu item? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button className="cursor-pointer" variant="outline" onClick={() => setDeleteItemId(null)}>
                            Cancel
                        </Button>
                        <Button className="cursor-pointer" variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Menu Item Modal */}
            <AddMenuItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                categories={categories || []}
                storeId="your-store-id"
                onCreate={handleCreate}
            />

            {/* Edit Menu Item Modal */}
            <EditMenuItemModal
                isOpen={!!editItem}
                onClose={() => setEditItem(null)}
                menuItem={editItem}
                categories={categories || []}
                onUpdate={handleUpdate}
            />
        </div>
    );
}
