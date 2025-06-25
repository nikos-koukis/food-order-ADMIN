'use client';

import { useState } from 'react';
import { useCategories } from '@/hooks/use-categories';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Category } from '@/interfaces/category';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';

type CategoryFormProps = {
  category?: Category;
  onSuccess?: () => void;
};

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const { createCategoryMutation, updateCategoryMutation } = useCategories();
  const { user } = useAuth();
  const isEditing = !!category;

  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && category) {
        await updateCategoryMutation.mutateAsync({
          id: category._id,
          ...formData,
          available: category.available !== undefined ? category.available : true,
        });
        toast.success('Category updated successfully');
      } else {
        if (!user?.storeId) {
          toast.error('Store ID is required');
          return;
        }
        await createCategoryMutation.mutateAsync({
          ...formData,
          // storeId: user.storeId
        });
        setFormData({
          name: '',
          description: ''
        });
        toast.success('Category created successfully');
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const isPending = isEditing 
    ? updateCategoryMutation.isPending 
    : createCategoryMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-md border px-3 py-2"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-md border px-3 py-2 min-h-24"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isEditing ? 'Update Category' : 'Add Category'}
      </Button>
    </form>
  );
} 