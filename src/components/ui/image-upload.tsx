'use client';

import { useState, useCallback } from 'react';
import { Button } from '../ui/button';
  import { Icons } from '../ui/icons';
  import Image from 'next/image';
import { cn } from '../../lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled
}: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      onChange(file);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsLoading(false);
    }
  }, [disabled, onChange]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-40 h-40 flex items-center justify-center rounded-lg border border-dashed">
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={disabled || isLoading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {value ? (
          <div className="relative w-full h-full">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover rounded-lg"
            />
            <Button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full"
              disabled={disabled || isLoading}
            >
              <Icons.trash className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className={cn(
            "flex flex-col items-center justify-center text-sm text-muted-foreground",
            (disabled || isLoading) && "opacity-50"
          )}>
            <Icons.upload className="h-6 w-6 mb-2" />
            <p>Upload image</p>
          </div>
        )}
      </div>
      {isLoading && (
        <div className="flex items-center justify-center">
          <Icons.spinner className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
} 