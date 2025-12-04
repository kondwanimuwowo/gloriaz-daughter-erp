import { create } from "zustand";
import { inventoryService } from "../services/inventoryService";
import toast from "react-hot-toast";

export const useInventoryStore = create((set, get) => ({
  materials: [],
  loading: false,
  error: null,
  selectedMaterial: null,

  // Fetch all materials
  fetchMaterials: async () => {
    set({ loading: true, error: null });
    try {
      const materials = await inventoryService.getAllMaterials();
      set({ materials, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch materials");
    }
  },

  // Add material
  addMaterial: async (material) => {
    set({ loading: true });
    try {
      const newMaterial = await inventoryService.addMaterial(material);
      set((state) => ({
        materials: [newMaterial, ...state.materials],
        loading: false,
      }));
      toast.success("Material added successfully!");
      return newMaterial;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to add material");
      throw error;
    }
  },

  // Update material
  updateMaterial: async (id, updates) => {
    set({ loading: true });
    try {
      const updatedMaterial = await inventoryService.updateMaterial(
        id,
        updates
      );
      set((state) => ({
        materials: state.materials.map((m) =>
          m.id === id ? updatedMaterial : m
        ),
        loading: false,
      }));
      toast.success("Material updated successfully!");
      return updatedMaterial;
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to update material");
      throw error;
    }
  },

  // Delete material
  deleteMaterial: async (id) => {
    set({ loading: true });
    try {
      await inventoryService.deleteMaterial(id);
      set((state) => ({
        materials: state.materials.filter((m) => m.id !== id),
        loading: false,
      }));
      toast.success("Material deleted successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error("Failed to delete material");
      throw error;
    }
  },

  // Update stock
  updateStock: async (id, quantity, operation) => {
    try {
      const updatedMaterial = await inventoryService.updateStock(
        id,
        quantity,
        operation
      );
      set((state) => ({
        materials: state.materials.map((m) =>
          m.id === id ? updatedMaterial : m
        ),
      }));
      toast.success(
        `Stock ${operation === "add" ? "added" : "deducted"} successfully!`
      );
      return updatedMaterial;
    } catch (error) {
      toast.error("Failed to update stock");
      throw error;
    }
  },

  // Set selected material
  setSelectedMaterial: (material) => set({ selectedMaterial: material }),

  // Clear selected material
  clearSelectedMaterial: () => set({ selectedMaterial: null }),
}));
