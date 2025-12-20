import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  TrendingUp,
  AlertCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Eye
} from "lucide-react";

import { useInventoryStore } from "../store/useInventoryStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import AddMaterialForm from "../components/inventory/AddMaterialForm";
import StockUpdateModal from "../components/inventory/StockUpdateModal";
import StatsCard from "../components/dashboard/StatsCard";

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
  const [viewingMaterial, setViewingMaterial] = useState(null); // For read-only view
  const [editingMaterial, setEditingMaterial] = useState(null); // For edit mode
  const [stockUpdateModal, setStockUpdateModal] = useState({
    isOpen: false,
    material: null,
    operation: null,
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Handle deep linking for specific material
  useEffect(() => {
    if (location.state?.openMaterialId && materials.length > 0) {
      const materialToView = materials.find(m => m.id === location.state.openMaterialId);
      if (materialToView) {
        setViewingMaterial(materialToView); // Open in view mode, not edit
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, materials]);

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

  const handleAddMaterial = async (data) => {
    await addMaterial(data);
    setShowAddModal(false);
  };

  const handleUpdateMaterial = async (data) => {
    await updateMaterial(editingMaterial.id, data);
    setEditingMaterial(null);
    setViewingMaterial(null); // Close view modal too
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      await deleteMaterial(id);
      setViewingMaterial(null); // Close view modal if open
    }
  };

  const handleStockUpdate = async (id, quantity, operation) => {
    await updateStock(id, quantity, operation);
    setStockUpdateModal({ isOpen: false, material: null, operation: null });
    setViewingMaterial(null); // Close view modal
  };

  const openStockUpdateModal = (material, operation) => {
    setViewingMaterial(null); // Close view modal first
    setStockUpdateModal({ isOpen: true, material, operation });
  };

  const openEditFromView = () => {
    setEditingMaterial(viewingMaterial);
    setViewingMaterial(null);
  };

  const columns = useMemo(() => [
     {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div>
               <div className="font-medium">{row.getValue("name")}</div>
               {row.original.supplier && <div className="text-xs text-muted-foreground">{row.original.supplier}</div>}
            </div>
        )
     },
     {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.getValue("category")}</Badge>
     },
     {
        accessorKey: "stock_quantity",
        header: "Stock",
        cell: ({ row }) => {
            const stock = parseFloat(row.getValue("stock_quantity"));
            const minStock = parseFloat(row.original.min_stock_level);
            return (
                <div className="flex items-center gap-2">
                    <span className={`font-semibold ${stock <= minStock ? "text-red-500" : ""}`}>
                        {stock} {row.original.unit}
                    </span>
                    {stock <= minStock && <AlertCircle className="h-4 w-4 text-red-500" />}
                </div>
            )
        }
     },
     {
        accessorKey: "cost_per_unit",
        header: "Cost/Unit",
        cell: ({ row }) => {
             const cost = parseFloat(row.getValue("cost_per_unit"));
             return new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(cost);
        }
     },
     {
        id: "value",
        header: "Total Value",
        cell: ({ row }) => {
             const cost = parseFloat(row.original.cost_per_unit);
             const stock = parseFloat(row.original.stock_quantity);
             return new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(cost * stock);
        }
     },
     {
        id: "actions",
        cell: ({ row }) => {
             const material = row.original;
             return (
                 <DropdownMenu>
                     <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                         <Button variant="ghost" className="h-8 w-8 p-0">
                             <MoreHorizontal className="h-4 w-4" />
                         </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewingMaterial(material); }}>
                             <Eye className="mr-2 h-4 w-4" /> View Details
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openStockUpdateModal(material, 'add'); }}>
                             <ArrowUpCircle className="mr-2 h-4 w-4 text-green-500" /> Restock
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openStockUpdateModal(material, 'deduct'); }}>
                             <ArrowDownCircle className="mr-2 h-4 w-4 text-orange-500" /> Use Stock
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingMaterial(material); }}>
                             <Pencil className="mr-2 h-4 w-4" /> Edit Details
                         </DropdownMenuItem>
                         <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteMaterial(material.id); }}>
                             <Trash2 className="mr-2 h-4 w-4" /> Delete
                         </DropdownMenuItem>
                     </DropdownMenuContent>
                 </DropdownMenu>
             )
        }
     }
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your materials and track stock levels
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Materials"
          value={totalMaterials}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Total Value"
          value={`K${totalValue.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockItems.length}
          subtitle={`${lowStockItems.length} items below minimum`}
          icon={AlertCircle}
          color={lowStockItems.length > 0 ? "red" : "yellow"}
        />
      </div>

      <Card className="overflow-hidden border-border/60">
          <DataTable 
            columns={columns} 
            data={materials} 
            filterColumn="name" 
            searchPlaceholder="Search materials..." 
            onRowClick={(material) => setViewingMaterial(material)}
          />
      </Card>

      {/* View Material Dialog (Read-Only) */}
      <Dialog open={!!viewingMaterial} onOpenChange={(open) => !open && setViewingMaterial(null)}>
          <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {viewingMaterial?.name}
                  </DialogTitle>
              </DialogHeader>
              
              {viewingMaterial && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p>
                      <p className="font-medium capitalize">{viewingMaterial.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Unit</p>
                      <p className="font-medium">{viewingMaterial.unit}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Stock</p>
                      <p className={`text-xl font-bold ${parseFloat(viewingMaterial.stock_quantity) <= parseFloat(viewingMaterial.min_stock_level) ? 'text-red-500' : 'text-green-600'}`}>
                        {viewingMaterial.stock_quantity} {viewingMaterial.unit}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Min. Stock Level</p>
                      <p className="text-xl font-bold">{viewingMaterial.min_stock_level} {viewingMaterial.unit}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Cost per Unit</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(viewingMaterial.cost_per_unit)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Value</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(viewingMaterial.stock_quantity * viewingMaterial.cost_per_unit)}
                      </p>
                    </div>
                  </div>
                  
                  {viewingMaterial.supplier && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier</p>
                        <p className="font-medium">{viewingMaterial.supplier}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={() => openStockUpdateModal(viewingMaterial, 'add')}>
                  <ArrowUpCircle className="mr-2 h-4 w-4 text-green-500" /> Restock
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => openStockUpdateModal(viewingMaterial, 'deduct')}>
                  <ArrowDownCircle className="mr-2 h-4 w-4 text-orange-500" /> Use Stock
                </Button>
                <Button className="flex-1" onClick={openEditFromView}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Details
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteMaterial(viewingMaterial?.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingMaterial} onOpenChange={(open) => !open && setEditingMaterial(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Edit Material</DialogTitle>
              </DialogHeader>
              <AddMaterialForm 
                 material={editingMaterial}
                 onSubmit={handleUpdateMaterial}
                 onCancel={() => setEditingMaterial(null)}
              />
          </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
               <DialogHeader>
                  <DialogTitle>Add New Material</DialogTitle>
              </DialogHeader>
              <AddMaterialForm 
                 onSubmit={handleAddMaterial}
                 onCancel={() => setShowAddModal(false)}
              />
          </DialogContent>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={stockUpdateModal.isOpen} onOpenChange={(open) => !open && setStockUpdateModal(prev => ({ ...prev, isOpen: false }))}>
          <DialogContent>
               <DialogHeader>
                  <DialogTitle>{stockUpdateModal.operation === 'add' ? 'Restock' : 'Use Stock'}: {stockUpdateModal.material?.name}</DialogTitle>
              </DialogHeader>
               <StockUpdateForm 
                  material={stockUpdateModal.material}
                  operation={stockUpdateModal.operation}
                  onUpdate={handleStockUpdate}
                  onCancel={() => setStockUpdateModal({ ...stockUpdateModal, isOpen: false })}
               />
          </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple wrapper for the stock update form
function StockUpdateForm({ material, operation, onUpdate, onCancel }) {
    const [quantity, setQuantity] = useState("");
    
    return (
        <div className="space-y-4">
             <div className="space-y-2">
                 <label className="text-sm font-medium">Quantity to {operation === 'add' ? 'Add' : 'Deduct'}</label>
                 <input 
                    type="number" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    min="0"
                    step="0.1"
                 />
             </div>
             <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={onCancel}>Cancel</Button>
                 <Button onClick={() => onUpdate(material.id, parseFloat(quantity), operation)}>Confirm</Button>
             </div>
        </div>
    )
}


