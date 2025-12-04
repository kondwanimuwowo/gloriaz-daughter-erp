import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Package,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useInventoryStore } from "../store/useInventoryStore";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import MaterialCard from "../components/inventory/MaterialCard";
import AddMaterialForm from "../components/inventory/AddMaterialForm";
import StockUpdateModal from "../components/inventory/StockUpdateModal";
import LowStockAlert from "../components/inventory/LowStockAlert";

export default function Inventory() {
  const {
    materials,
    loading,
    fetchMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    updateStock,
  } = useInventoryStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [stockUpdateModal, setStockUpdateModal] = useState({
    isOpen: false,
    material: null,
    operation: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Calculate stats
  const totalMaterials = materials.length;
  const totalValue = materials.reduce(
    (sum, m) =>
      sum + parseFloat(m.stock_quantity) * parseFloat(m.cost_per_unit),
    0
  );
  const lowStockItems = materials.filter(
    (m) => parseFloat(m.stock_quantity) <= parseFloat(m.min_stock_level)
  );

  // Filter materials
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || material.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["all", ...new Set(materials.map((m) => m.category))];

  const handleAddMaterial = async (data) => {
    await addMaterial(data);
    setShowAddModal(false);
  };

  const handleUpdateMaterial = async (data) => {
    await updateMaterial(editingMaterial.id, data);
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      await deleteMaterial(id);
    }
  };

  const handleStockUpdate = async (id, quantity, operation) => {
    await updateStock(id, quantity, operation);
  };

  const openStockUpdateModal = (material, operation) => {
    setStockUpdateModal({ isOpen: true, material, operation });
  };

  if (loading && materials.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inventory Management
          </h1>
          <p className="text-gray-600">
            Manage your materials and track stock levels
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={Plus}>
          Add Material
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Materials</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalMaterials}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Total Inventory Value
              </p>
              <p className="text-3xl font-bold text-gray-900">
                K{totalValue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
              <p className="text-3xl font-bold text-red-600">
                {lowStockItems.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <LowStockAlert
          materials={lowStockItems}
          onViewMaterial={(material) => setEditingMaterial(material)}
        />
      )}

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="search"
              placeholder="Search materials by name, category, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all"
                    ? "All Categories"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No materials found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first material"}
          </p>
          {!searchTerm && filterCategory === "all" && (
            <Button onClick={() => setShowAddModal(true)} icon={Plus}>
              Add Your First Material
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onEdit={setEditingMaterial}
              onDelete={handleDeleteMaterial}
              onUpdateStock={openStockUpdateModal}
            />
          ))}
        </div>
      )}

      {/* Add Material Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Material"
      >
        <AddMaterialForm
          onSubmit={handleAddMaterial}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Material Modal */}
      <Modal
        isOpen={!!editingMaterial}
        onClose={() => setEditingMaterial(null)}
        title="Edit Material"
      >
        <AddMaterialForm
          material={editingMaterial}
          onSubmit={handleUpdateMaterial}
          onCancel={() => setEditingMaterial(null)}
        />
      </Modal>

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={stockUpdateModal.isOpen}
        onClose={() =>
          setStockUpdateModal({
            isOpen: false,
            material: null,
            operation: null,
          })
        }
        material={stockUpdateModal.material}
        operation={stockUpdateModal.operation}
        onUpdate={handleStockUpdate}
      />
    </div>
  );
}
