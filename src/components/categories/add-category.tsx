"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/providers/auth-provider";
import { Category } from "@/interfaces/category";

interface CategoryFormProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction?: () => void;
  category?: Category;
}

export function CategoryForm({
  isOpen,
  onCloseAction,
  onSuccessAction,
  category
}: CategoryFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const { createCategoryMutation, updateCategoryMutation } = useCategories();
  const { user } = useAuth();

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      setName(category?.name || '');
      setDescription(category?.description || '');
      setIsAvailable(category?.available ?? true);
      setIsLoading(false);
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    
    if (!user?.userId) {
      toast.error('You must be logged in to manage categories');
      return;
    }

    setIsLoading(true);

    try {
      if (category) {
        // Update existing category
        await updateCategoryMutation.mutateAsync({
          id: category._id,
          name,
          description,
          available: isAvailable
        });
        toast.success('Category updated successfully');
      } else {
        // Create new category
        await createCategoryMutation.mutateAsync({
          name,
          description,
          available: isAvailable,
        });
        toast.success('Category created successfully');
      }
      
      onSuccessAction?.();
      onCloseAction();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${category ? 'update' : 'create'} category`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {category ? 'Update category details' : 'Create a new category for menu items'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-cat-name">Name</Label>
            <Input
              id="add-cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-cat-description">Description</Label>
            <Textarea
              id="add-cat-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category description (optional)"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="add-cat-available"
              checked={isAvailable}
              onCheckedChange={() => setIsAvailable(!isAvailable)}
              disabled={isLoading}
              className="cursor-pointer"
            />
            <Label
              htmlFor="add-cat-available"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Available
            </Label>
          </div>
          <DialogFooter>
            <Button className="cursor-pointer" type="button" variant="outline" onClick={onCloseAction} disabled={isLoading}>
              Cancel
            </Button>
            <Button className="cursor-pointer" type="submit" disabled={isLoading}>
              {isLoading ? (category ? 'Updating...' : 'Adding...') : (category ? 'Update Category' : 'Add Category')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}