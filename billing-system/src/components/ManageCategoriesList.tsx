"use client";

import { useState, useTransition } from "react";
import { renameCategory, deleteCategory } from "@/app/actions/category";
import { Edit, Trash, Save, X } from "lucide-react";

export function ManageCategoriesList({ categories }: { categories: { name: string; count: number }[] }) {
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleEdit = (name: string) => {
    setEditingCat(name);
    setNewName(name);
  };

  const handleRename = async (oldName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditingCat(null);
      return;
    }
    startTransition(async () => {
      await renameCategory(oldName, newName.trim());
      setEditingCat(null);
    });
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"? This will NOT delete the products, but they will be left without a category.`)) return;
    startTransition(async () => {
      await deleteCategory(name);
    });
  };

  if (categories.length === 0) {
    return (
      <div className="empty-state bg-card border border-border rounded-xl p-8 text-center mt-6">
        <p className="font-semibold text-muted-foreground">No categories found</p>
        <p className="text-sm mt-1">Categories are automatically created when you add them to a product.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden mt-6">
      <ul className="divide-y divide-border/50">
        {categories.map((c) => (
          <li key={c.name} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
            {editingCat === c.name ? (
              <div className="flex-1 flex items-center gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-field max-w-sm"
                  disabled={isPending}
                  autoFocus
                />
                <button
                  onClick={() => handleRename(c.name)}
                  disabled={isPending}
                  className="btn btn-primary btn-sm"
                >
                  <Save className="h-4 w-4" /> Save
                </button>
                <button
                  onClick={() => setEditingCat(null)}
                  disabled={isPending}
                  className="btn btn-ghost btn-sm text-muted-foreground"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{c.name}</span>
                  <span className="badge bg-secondary text-muted-foreground border border-border/50">{c.count} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(c.name)}
                    disabled={isPending}
                    className="btn btn-ghost btn-sm text-indigo-600 hover:bg-indigo-50"
                  >
                    <Edit className="h-4 w-4" /> Rename
                  </button>
                  <button
                    onClick={() => handleDelete(c.name)}
                    disabled={isPending}
                    className="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50"
                  >
                    <Trash className="h-4 w-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
