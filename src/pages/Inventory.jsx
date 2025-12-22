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
import { inventoryService } from "../services/inventoryService";
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

  // Fetch history when viewing a material
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (viewingMaterial) {
      setLoadingHistory(true);
      inventoryService
        .getMaterialHistory(viewingMaterial.id)
        .then(data => setTransactions(data || []))
        .catch(console.error)
        .finally(() => setLoadingHistory(false));
    } else {
      setTransactions([]);
    }
  }, [viewingMaterial]);

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

  const handleStockUpdate = async (id, quantity, operation, notes, orderId, unitCost) => {
    await updateStock(id, quantity, operation, notes, orderId, unitCost);
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
                <div className="space-y-6 py-4">
                  {/* Actions Toolbar - Moved to Top */}
                  <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg border">
                     <Button className="flex-1 sm:flex-none" onClick={() => openStockUpdateModal(viewingMaterial, 'add')}>
                        <ArrowUpCircle className="mr-2 h-4 w-4" /> Restock
                      </Button>
                      <Button className="flex-1 sm:flex-none" variant="secondary" onClick={() => openStockUpdateModal(viewingMaterial, 'deduct')}>
                        <ArrowDownCircle className="mr-2 h-4 w-4" /> Use Stock
                      </Button>
                      <div className="mx-auto sm:mx-0 flex-1"></div>
                      <Button variant="outline" size="sm" onClick={openEditFromView}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMaterial(viewingMaterial?.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                  </div>

                  {/* Material Details */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p>
                      <p className="font-medium capitalize">{viewingMaterial.category}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Stock</p>
                      <p className={`text-lg font-bold ${parseFloat(viewingMaterial.stock_quantity) <= parseFloat(viewingMaterial.min_stock_level) ? 'text-red-500' : 'text-green-600'}`}>
                        {viewingMaterial.stock_quantity} {viewingMaterial.unit}
                      </p>
                    </div>
                     <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Min Level</p>
                      <p className="font-medium">{viewingMaterial.min_stock_level} {viewingMaterial.unit}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Cost/Unit</p>
                      <p className="font-medium">
                        {new Intl.NumberFormat("en-ZM", { style: "currency", currency: "ZMW" }).format(viewingMaterial.cost_per_unit)}
                      </p>
                    </div>
                  </div>

                  {viewingMaterial.supplier && (
                    <div className="text-sm bg-blue-50 text-blue-800 px-3 py-1.5 rounded border border-blue-100">
                      <span className="font-semibold">Supplier:</span> {viewingMaterial.supplier}
                    </div>
                  )}
                  
                  <Separator />

                  {/* Transaction History Table */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                       <TrendingUp className="h-4 w-4" /> Inventory History
                    </h3>
                    
                    <div className="border rounded-md overflow-hidden max-h-[200px] overflow-y-auto bg-background">
                       <table className="w-full text-sm">
                          <thead className="bg-muted sticky top-0">
                            <tr>
                              <th className="h-9 px-3 text-left font-medium text-muted-foreground">Date</th>
                              <th className="h-9 px-3 text-left font-medium text-muted-foreground">Type</th>
                              <th className="h-9 px-3 text-right font-medium text-muted-foreground">Qty</th>
                              <th className="h-9 px-3 text-left font-medium text-muted-foreground">Order</th>
                              <th className="h-9 px-3 text-left font-medium text-muted-foreground">Reason/Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loadingHistory ? (
                               <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Loading history...</td></tr>
                            ) : transactions.length === 0 ? (
                               <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No history found.</td></tr>
                            ) : (
                               transactions.map((tx) => (
                                 <tr key={tx.id} className="border-t hover:bg-muted/50">
                                   <td className="p-2 whitespace-nowrap">
                                      {new Date(tx.created_at).toLocaleDateString()} <br/>
                                      <span className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                   </td>
                                   <td className="p-2">
                                     <Badge variant="outline" className={`
                                        uppercase text-[10px] px-1 py-0
                                        ${tx.operation_type === 'restock' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                                     `}>
                                       {tx.operation_type}
                                     </Badge>
                                   </td>
                                   <td className={`p-2 text-right font-medium ${tx.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                     {tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change}
                                   </td>
                                   <td className="p-2 text-xs">
                                     {tx.order_id ? (
                                       <span className="text-blue-600 font-mono">{tx.order_id}</span>
                                     ) : (
                                       <span className="text-muted-foreground">-</span>
                                     )}
                                   </td>
                                   <td className="p-2 max-w-[150px] truncate text-muted-foreground" title={tx.notes}>
                                     {tx.notes || "-"}
                                   </td>
                                 </tr>
                               ))
                            )}
                          </tbody>
                       </table>
                    </div>
                  </div>
                </div>
              )}
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
      <StockUpdateModal
        isOpen={stockUpdateModal.isOpen}
        onClose={() => setStockUpdateModal((prev) => ({ ...prev, isOpen: false }))}
        material={stockUpdateModal.material}
        operation={stockUpdateModal.operation}
        onUpdate={handleStockUpdate}
      />
    </div>
  );
}




