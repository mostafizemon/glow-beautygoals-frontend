'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthToken = () => {
  if (typeof document === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('admin_token='))
    ?.split('=')[1] || '';
};

function SortableCategoryItem({
  cat,
  editId,
  editName,
  setEditName,
  handleUpdate,
  setEditId,
  handleDelete,
  deletingId,
  saving,
}: {
  cat: Category;
  editId: string | null;
  editName: string;
  setEditName: (name: string) => void;
  handleUpdate: (id: string) => void;
  setEditId: (id: string | null) => void;
  handleDelete: (id: string, name: string) => void;
  deletingId: string | null;
  saving: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center px-6 py-4 gap-4 bg-white ${isDragging ? 'rounded-lg relative' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 p-1 transition-colors"
        title="Drag to reorder"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {editId === cat.id ? (
        <>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-charcoal rounded-lg outline-none text-sm"
            autoFocus
          />
          <button
            onClick={() => handleUpdate(cat.id)}
            disabled={saving}
            className="text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditId(null);
              setEditName('');
            }}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <div className="flex-1">
            <span className="font-medium text-charcoal">{cat.name}</span>
            <span className="ml-3 text-xs text-gray-400 font-mono">/{cat.slug}</span>
          </div>
          <button
            onClick={() => {
              setEditId(cat.id);
              setEditName(cat.name);
            }}
            className="text-gray-400 hover:text-charcoal transition-colors p-1"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(cat.id, cat.name)}
            disabled={deletingId === cat.id}
            className="text-red-400 hover:text-red-600 transition-colors p-1"
            title="Delete"
          >
            {deletingId === cat.id ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </>
      )}
    </li>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ name: newName.trim(), sort_order: categories.length }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create');
      }
      setNewName('');
      await fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    setError('');
    const targetCat = categories.find(c => c.id === id);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ name: editName.trim(), sort_order: targetCat?.sort_order || 0 }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditId(null);
      setEditName('');
      await fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products using this category will retain their current value.`)) return;
    setDeletingId(id);
    try {
      await fetch(`${API_URL}/api/v1/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      await fetchCategories();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      // Update UI optimistically
      setCategories(newCategories);

      try {
        const orderedIds = newCategories.map(c => c.id);
        const res = await fetch(`${API_URL}/api/v1/admin/categories/reorder`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ orderedIds }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to save new order');
        }
      } catch (err) {
        console.error(err);
        // Revert on error
        fetchCategories();
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-charcoal mb-2">Categories</h1>
        <p className="text-gray-500">Manage the categories available for your products.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      {/* Create new category */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="font-serif text-xl mb-4">Add New Category</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Moisturizer"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-charcoal text-sm"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="btn-primary whitespace-nowrap"
          >
            {saving ? 'Saving...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Category list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            <p className="text-gray-500">No categories yet. Add one above to get started.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-gray-100">
                {categories.map(cat => (
                  <SortableCategoryItem
                    key={cat.id}
                    cat={cat}
                    editId={editId}
                    editName={editName}
                    setEditName={setEditName}
                    handleUpdate={handleUpdate}
                    setEditId={setEditId}
                    handleDelete={handleDelete}
                    deletingId={deletingId}
                    saving={saving}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
