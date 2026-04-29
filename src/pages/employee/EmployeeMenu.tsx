import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMenuStore } from '@/store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatMenuPrice, formatMenuRating } from '@/lib/menuUtils';
import { deleteMenuItemInSupabase, upsertMenuItemInSupabase, uploadMenuImageToSupabase } from '@/lib/supabaseAdminApi';
import type { MenuCategory, MenuItem } from '@/types';

const categoryOptions: Array<{ value: MenuCategory; label: string }> = [
  { value: 'starters', label: 'Starters' },
  { value: 'mains', label: 'Mains' },
  { value: 'biryani', label: 'Biryani' },
  { value: 'bread', label: 'Bread' },
  { value: 'dessert', label: 'Dessert' },
];

type MenuFormState = {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: string;
  image: string;
  prepTime: string;
  tags: string;
  sortOrder: string;
  isVeg: boolean;
  isActive: boolean;
};

const createEmptyForm = (): MenuFormState => ({
  id: '',
  name: '',
  description: '',
  category: 'starters',
  price: '',
  image: '',
  prepTime: '15',
  tags: '',
  sortOrder: '0',
  isVeg: true,
  isActive: true,
});

const buildFormState = (item: MenuItem): MenuFormState => ({
  id: item.id,
  name: item.name ?? '',
  description: item.description ?? '',
  category: item.category,
  price: String(item.price),
  image: item.image ?? '',
  prepTime: String(item.prepTime),
  tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
  sortOrder: String(item.sortOrder),
  isVeg: item.isVeg,
  isActive: item.isActive,
});

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Failed to read image file.'));
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

export const EmployeeMenu = () => {
  const { menuItems, upsertMenuItem, removeMenuItem } = useMenuStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<MenuFormState>(createEmptyForm());
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState('');

  useEffect(
    () => () => {
      if (selectedImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    },
    [selectedImagePreview]
  );

  useEffect(() => {
    if (!isFormOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isFormOpen]);

  const sortedMenuItems = useMemo(
    () => [...menuItems].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [menuItems]
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sortedMenuItems
      .filter((item) => selectedCategory === 'all' || item.category === selectedCategory)
      .filter((item) => {
        if (!query) {
          return true;
        }

        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.join(' ').toLowerCase().includes(query)
        );
      });
  }, [searchQuery, selectedCategory, sortedMenuItems]);

  const handleFormChange = <K extends keyof MenuFormState>(key: K, value: MenuFormState[K]) => {
    setFormState((current) => ({ ...current, [key]: value }));
    setMessage('');
  };

  const openCreateDialog = () => {
    setFormState(createEmptyForm());
    setSelectedImageFile(null);
    setSelectedImagePreview('');
    setIsFormOpen(true);
  };

  const openEditDialog = (item: MenuItem) => {
    setFormState(buildFormState(item));
    setSelectedImageFile(null);
    setSelectedImagePreview('');
    setIsFormOpen(true);
  };

  const handleImageFileChange = (file: File | null) => {
    setSelectedImageFile(file);
    setMessage('');

    if (!file) {
      setSelectedImagePreview('');
      return;
    }

    setSelectedImagePreview(URL.createObjectURL(file));
  };

  const currentImageUrl = formState.image ?? '';

  const persistItem = async () => {
    const imageUrl = currentImageUrl.trim();

    if (!formState.name.trim() || !formState.description.trim() || (!imageUrl && !selectedImageFile)) {
      setMessage('Name, description, and an image are required.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    let resolvedImage = imageUrl;

    try {
      if (selectedImageFile) {
        resolvedImage = isSupabaseConfigured ? await uploadMenuImageToSupabase(selectedImageFile) : await readFileAsDataUrl(selectedImageFile);
      }

      if (!resolvedImage) {
        throw new Error('Image could not be resolved.');
      }
    } catch (error) {
      console.warn('Failed to process menu image:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Image upload failed: ${errorMsg}`);
      setIsSaving(false);
      return;
    }

    const existing = menuItems.find((item) => item.id === formState.id);
    const now = new Date().toISOString();
    const nextItem: MenuItem = {
      id: formState.id || crypto.randomUUID(),
      name: formState.name.trim(),
      description: formState.description.trim(),
      category: formState.category,
      price: Number(formState.price),
      image: resolvedImage,
      rating: 4.5,
      prepTime: Number(formState.prepTime),
      tags: formState.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      isVeg: formState.isVeg,
      isActive: formState.isActive,
      sortOrder: Number(formState.sortOrder),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    try {
      if (isSupabaseConfigured) {
        const saved = await upsertMenuItemInSupabase(nextItem);
        upsertMenuItem(saved);
      } else {
        upsertMenuItem(nextItem);
      }

      setMessage('Menu item saved successfully.');
      setIsFormOpen(false);
      setSelectedImageFile(null);
      setSelectedImagePreview('');
    } catch (error) {
      console.warn('Failed to save menu item:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Save failed: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (item: MenuItem) => {
    const confirmed = window.confirm(`Delete ${item.name}?`);
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      if (isSupabaseConfigured) {
        await deleteMenuItemInSupabase(item.id);
      }

      removeMenuItem(item.id);
      setMessage('Menu item deleted.');
    } catch (error) {
      console.warn('Failed to delete menu item:', error);
      setMessage('Unable to delete menu item right now.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-amber-900 mb-2">Menu</h1>
          <p className="text-amber-700/60">Manage the menu cards shown to customers.</p>
        </div>
        <Button className="bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-2" onClick={openCreateDialog}>
          <Plus size={18} />
          Add Menu Item
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/60" size={18} />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search menu items"
            className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 pl-10 w-full rounded-lg"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value as MenuCategory | 'all')}
          className="border border-amber-200 bg-white text-amber-900 px-4 py-2 rounded-lg font-medium hover:bg-amber-50 transition-colors"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <span className="text-amber-700/60 text-sm lg:text-right">{filteredItems.length} items</span>
      </div>

      {message && (
        <div className="rounded-2xl border border-amber-200/60 bg-white px-4 py-3 text-sm text-amber-800 shadow-sm">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-amber-200/50 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-amber-200 bg-amber-50/30">
                <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Item</th>
                <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Category</th>
                <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Price</th>
                <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Status</th>
                <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Sort</th>
                <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-amber-100 hover:bg-amber-50/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-amber-900">{item.name}</p>
                        <p className="text-amber-700/60 text-sm">{item.isVeg ? 'Veg' : 'Non-veg'} · {formatMenuRating(item.rating)} rating</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-amber-900 capitalize">{item.category}</td>
                  <td className="py-4 px-6 text-amber-900">£{formatMenuPrice(item.price)}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {item.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-amber-900">{item.sortOrder}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => openEditDialog(item)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => deleteItem(item)} disabled={isSaving}>
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="py-16 text-center">
            <UtensilsCrossed size={32} className="mx-auto mb-3 text-amber-700/40" />
            <p className="text-amber-700/60">No menu items found.</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-amber-900">{formState.id ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
                <p className="text-sm text-amber-700/60">Keep this in sync with the customer menu layout.</p>
              </div>
              <button type="button" className="text-amber-700/60 hover:text-amber-900" onClick={() => setIsFormOpen(false)}>
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-amber-700/60">Name</label>
                <Input value={formState.name} onChange={(event) => handleFormChange('name', event.target.value)} className="border border-amber-200 bg-white text-amber-900 rounded-lg" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-amber-700/60">Category</label>
                <select value={formState.category} onChange={(event) => handleFormChange('category', event.target.value as MenuCategory)} className="border border-amber-200 bg-white text-amber-900 px-4 py-2 rounded-lg w-full">
                  {categoryOptions.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-amber-700/60">Description</label>
                <Textarea value={formState.description} onChange={(event) => handleFormChange('description', event.target.value)} className="border border-amber-200 bg-white text-amber-900 rounded-lg min-h-28" />
              </div>
              <div className="md:col-span-2 space-y-3 rounded-2xl border border-dashed border-amber-200 bg-amber-50/30 p-4">
                <div>
                  <label className="mb-2 block text-sm text-amber-700/60">Upload Image From Device</label>
                  <Input type="file" accept="image/*" onChange={(event) => handleImageFileChange(event.target.files?.[0] ?? null)} className="border border-amber-200 bg-white text-amber-900 rounded-lg file:mr-4 file:border-0 file:bg-amber-700 file:px-4 file:py-2 file:text-white hover:file:bg-amber-800" />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-amber-700/60">Image URL fallback</label>
                  <Input
                    value={formState.image}
                    onChange={(event) => handleFormChange('image', event.target.value)}
                    placeholder="Paste a public image URL if you do not upload a file"
                    className="border border-amber-200 bg-white text-amber-900 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm">
                  <div className="h-20 w-20 overflow-hidden rounded-xl bg-amber-100 shrink-0">
                    {(selectedImagePreview || currentImageUrl.trim()) ? (
                      <img
                        src={selectedImagePreview || currentImageUrl.trim()}
                        alt="Selected menu item preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-amber-700/50">Preview</div>
                    )}
                  </div>
                  <p className="text-sm text-amber-700/60">
                    Upload an image from your device for Supabase Storage or keep a direct public URL as fallback.
                  </p>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-amber-700/60">Price</label>
                <Input type="number" step="0.01" value={formState.price} onChange={(event) => handleFormChange('price', event.target.value)} className="border border-amber-200 bg-white text-amber-900 rounded-lg" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-amber-700/60">Prep Time (minutes)</label>
                <Input type="number" min="0" value={formState.prepTime} onChange={(event) => handleFormChange('prepTime', event.target.value)} className="border border-amber-200 bg-white text-amber-900 rounded-lg" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-amber-700/60">Sort Order</label>
                <Input type="number" value={formState.sortOrder} onChange={(event) => handleFormChange('sortOrder', event.target.value)} className="border border-amber-200 bg-white text-amber-900 rounded-lg" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-amber-700/60">Tags</label>
                <Input value={formState.tags} onChange={(event) => handleFormChange('tags', event.target.value)} placeholder="signature, spicy, seasonal" className="border border-amber-200 bg-white text-amber-900 rounded-lg" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm text-amber-700/60">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 rounded-2xl border border-amber-200 p-4 text-amber-900 cursor-pointer hover:bg-amber-50/30 transition-colors">
                    <input type="radio" name="vegType" checked={formState.isVeg} onChange={() => handleFormChange('isVeg', true)} />
                    Vegetarian
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-amber-200 p-4 text-amber-900 cursor-pointer hover:bg-amber-50/30 transition-colors">
                    <input type="radio" name="vegType" checked={!formState.isVeg} onChange={() => handleFormChange('isVeg', false)} />
                    Non-Vegetarian
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-amber-200 p-4 text-amber-900">
                <input type="checkbox" checked={formState.isActive} onChange={(event) => handleFormChange('isActive', event.target.checked)} />
                Visible to customers
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-amber-700 hover:bg-amber-800 text-white" onClick={() => void persistItem()} disabled={isSaving}>
                Save Menu Item
              </Button>
            </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
