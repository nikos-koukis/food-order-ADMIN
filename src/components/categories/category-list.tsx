'use client';

import { useCategories } from '@/hooks/use-categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { Category } from '@/interfaces/category';

export function CategoryList() {
  const { useAllCategories, deleteCategoryMutation } = useCategories();
  const { data, isLoading, error } = useAllCategories();

  console.log(data);

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>Error loading categories</div>;
  }

  // Data is expected to be an array of categories
  const categories = data || [];
  
  if (categories.length === 0) {
    return <div>No categories found</div>;
  }

  const handleDelete = (id: string) => {
    deleteCategoryMutation.mutate(id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category: Category) => (
        <Card key={category._id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{category.name}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(category._id)}
                  disabled={deleteCategoryMutation.isPending}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">{category.description || 'No description'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 