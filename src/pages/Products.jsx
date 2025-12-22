import { useState, useEffect, useMemo } from "react";
import { Plus, MoreHorizontal, Package, Tag, Layers } from "lucide-react";
import { productService } from "../services/productService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import StatsCard from "../components/dashboard/StatsCard";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProductFormDialog from "@/components/products/ProductFormDialog";
import toast from "react-hot-toast";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
        setLoading(true);
        const data = await productService.getAdminProducts();
        setProducts(data || []);
    } catch (error) {
        console.error(error);
        toast.error("Failed to load products");
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            await productService.deleteProduct(id);
            toast.success("Product deleted");
            loadProducts();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete product");
        }
    }
  };

  const columns = useMemo(() => [
    {
        accessorKey: "image_url",
        header: "Image",
        cell: ({ row }) => (
            <div className="h-10 w-10 rounded overflow-hidden bg-gray-100 border">
                {row.original.image_url ? (
                    <img src={row.original.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200 text-xs text-gray-500">No Img</div>
                )}
            </div>
        )
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "base_price",
        header: "Price",
        cell: ({ row }) => `K${row.getValue("base_price")}`
    },
    {
        accessorKey: "stock_status",
        header: "Stock",
        cell: ({ row }) => {
            const status = row.getValue("stock_status");
            let color = "default";
            if (status === 'out_of_stock') color = "destructive";
            if (status === 'low_stock') color = "secondary"; // Using secondary (yellow-ish/gray) or potentially warning if available
            return <Badge variant={color} className="capitalize whitespace-nowrap">{status ? status.replace(/_/g, ' ') : 'N/A'}</Badge>
        }
    },
    {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.getValue("active") ? "default" : "secondary"}>
                {row.getValue("active") ? "Active" : "Hidden"}
            </Badge>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                        setProductToEdit(row.original);
                        setShowCreateDialog(true);
                    }}>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(row.original.id)}>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  ], []);

  const stats = {
    total: products.length,
    active: products.filter(p => p.active).length,
    outOfStock: products.filter(p => p.stock_status === 'out_of_stock').length
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="text-muted-foreground">Manage catalog products and inventory.</p>
            </div>
            <Button onClick={() => {
                setProductToEdit(null);
                setShowCreateDialog(true);
            }} className="bg-[#8B4513] hover:bg-[#A0522D]">
                <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <StatsCard title="Total Products" value={stats.total} icon={Package} color="blue" />
            <StatsCard title="Active Catalog" value={stats.active} icon={Layers} color="green" />
            <StatsCard title="Out of Stock" value={stats.outOfStock} icon={Tag} color="orange" />
        </div>

        <Card className="overflow-hidden border-border/60">
            <DataTable 
                columns={columns} 
                data={products} 
                filterColumn="name" 
                searchPlaceholder="Search products..." 
            />
        </Card>

        <ProductFormDialog 
            open={showCreateDialog} 
            onOpenChange={setShowCreateDialog}
            productToEdit={productToEdit}
            onSuccess={loadProducts}
        />
    </div>
  );
}
