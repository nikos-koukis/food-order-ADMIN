'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCategories } from '@/hooks/use-categories';
import { CategoryForm } from '@/components/categories/add-category';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Category } from '@/interfaces/category';
import { CheckCircle2, Edit, Trash, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoriesPage() {
  const { useAllCategories, deleteCategoryMutation } = useCategories();
  const { data, isLoading, error } = useAllCategories();
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | boolean>('all');

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <Button className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
            Add Category
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Categories</CardTitle>
              <CardDescription>All menu categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Menu Categories</CardTitle>
            <CardDescription>Manage your menu categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div>Error loading categories</div>;
  }

  const categories = data || [];
  
  if (categories.length === 0) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <Button className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
            Add Category
          </Button>
        </div>        <div className="text-center py-10">
          <p className="text-muted-foreground">No categories found</p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4"
          >
            Create your first category
          </Button>
        </div>
        <CategoryForm
          isOpen={isModalOpen}
          onCloseAction={() => {
            setIsModalOpen(false);
            setSelectedCategory(undefined);
          }}
          onSuccessAction={() => {
            setIsModalOpen(false);
            setSelectedCategory(undefined);
          }}
        />
      </div>
    );
  }

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      const categoryToDeleteName = categories.find((cat: Category) => cat._id === categoryToDelete)?.name || 'Unknown Category';
      deleteCategoryMutation.mutate(categoryToDelete, {
        onSuccess: () => {
          toast.success(`Category "${categoryToDeleteName}" deleted successfully`);
        },
        onError: () => {
          toast.error(`Failed to delete category "${categoryToDeleteName}"`);
        }
      });
      setConfirmDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Categories</h2>
        <Button className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
          Add Category
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Categories</CardTitle>
            <CardDescription>All menu categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Menu Categories</CardTitle>
            <CardDescription>Manage your menu categories</CardDescription>
          </div>
          <Tabs 
            value={availabilityFilter === 'all' ? 'all' : availabilityFilter.toString()} 
            onValueChange={(value) => setAvailabilityFilter(value === 'all' ? 'all' : value === 'true')}
          >
            <TabsList className="w-full inline-flex items-center justify-start overflow-x-auto space-x-1">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:text-foreground dark:data-[state=active]:text-foreground"
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="true"
                className="text-green-600 dark:text-green-400 data-[state=active]:text-green-600 dark:data-[state=active]:text-green-400"
              >
                Available
              </TabsTrigger>
              <TabsTrigger 
                value="false"
                className="text-red-600 dark:text-red-400 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400"
              >
                Unavailable
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories
                .filter(category => availabilityFilter === 'all' ? true : category.available === availabilityFilter)
                .map((category: Category) => (
                <div
                  key={category._id}
                  className="bg-card rounded-lg shadow-sm p-4 border"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          {category.description || 'No description'}
                        </p>
                        <div className="mt-2">
                          <Badge
                            variant="soft"
                            color={category.available ? 'success' : 'destructive'}
                            className="flex items-center gap-2 px-2 py-1 w-fit"
                          >
                            {category.available ?
                              <CheckCircle2 className="h-4 w-4" /> :
                              <XCircle className="h-4 w-4" />
                            }
                            {category.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleEditClick(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleDeleteClick(category._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end space-x-2 pt-4">
            <Button className="cursor-pointer" variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="cursor-pointer" variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>      {/* Category Form Dialog */}
      <CategoryForm
        isOpen={isModalOpen}
        onCloseAction={() => {
          setIsModalOpen(false);
          setSelectedCategory(undefined);
        }}
        onSuccessAction={() => {
          setIsModalOpen(false);
          setSelectedCategory(undefined);
        }}
        category={selectedCategory}
      />
    </div>
  );
}