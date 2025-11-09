import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Edit } from "lucide-react";

export default function InventoryManagement() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const adminToken = localStorage.getItem("adminToken");

  // Search, sort, and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("stock");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStockStatus, setFilterStockStatus] = useState("all");

  // Edit dialog state
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editStock, setEditStock] = useState("");
  const [editInStock, setEditInStock] = useState(true);

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/admin/inventory"],
    enabled: !!adminToken
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, stockQuantity, inStock }: any) => 
      apiRequest(`/api/admin/inventory/${id}`, "PATCH", { stockQuantity, inStock }, {
        Authorization: `Bearer ${adminToken}`
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Inventory updated successfully!" });
      setEditingProduct(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setEditStock(product.stockQuantity?.toString() || "0");
    setEditInStock(product.inStock !== false);
  };

  const handleUpdateStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateInventoryMutation.mutate({ 
      id: editingProduct._id, 
      stockQuantity: parseInt(editStock) || 0,
      inStock: editInStock
    });
  };

  // Filtered and sorted inventory
  const filteredInventory = useMemo(() => {
    if (!inventory) return [];

    let filtered = [...inventory];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((p: any) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((p: any) => p.category === filterCategory);
    }

    // Apply stock status filter
    if (filterStockStatus === "inStock") {
      filtered = filtered.filter((p: any) => p.inStock === true && (p.stockQuantity || 0) > 0);
    } else if (filterStockStatus === "lowStock") {
      filtered = filtered.filter((p: any) => (p.stockQuantity || 0) < 10 && (p.stockQuantity || 0) > 0 && p.inStock);
    } else if (filterStockStatus === "outOfStock") {
      filtered = filtered.filter((p: any) => !p.inStock || (p.stockQuantity || 0) === 0);
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "stock":
          return (a.stockQuantity || 0) - (b.stockQuantity || 0);
        case "stockDesc":
          return (b.stockQuantity || 0) - (a.stockQuantity || 0);
        case "price":
          return (a.price || 0) - (b.price || 0);
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [inventory, searchQuery, filterCategory, filterStockStatus, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!inventory) return [];
    const cats = new Set(inventory.map((p: any) => p.category).filter(Boolean));
    return Array.from(cats);
  }, [inventory]);

  // Calculate statistics
  const totalProducts = inventory?.length || 0;
  const lowStockProducts = inventory?.filter((p: any) => (p.stockQuantity || 0) < 10 && (p.stockQuantity || 0) > 0 && p.inStock) || [];
  const outOfStockProducts = inventory?.filter((p: any) => !p.inStock || (p.stockQuantity || 0) === 0) || [];

  if (!adminToken) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Inventory Management
        </h1>
        <p className="text-muted-foreground">
          Track and manage product stock levels
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground" data-testid="text-total-products-label">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-products">
              {totalProducts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground" data-testid="text-low-stock-label">
              Low Stock (&lt; 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-low-stock">
              {lowStockProducts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground" data-testid="text-out-of-stock-label">
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-out-of-stock">
              {outOfStockProducts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Sort, and Filter Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle data-testid="text-search-filter-title">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search" data-testid="label-search">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  className="pl-9"
                  placeholder="Search by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sort" data-testid="label-sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock" data-testid="option-sort-stock-asc">Stock (Low to High)</SelectItem>
                  <SelectItem value="stockDesc" data-testid="option-sort-stock-desc">Stock (High to Low)</SelectItem>
                  <SelectItem value="name" data-testid="option-sort-name">Name (A-Z)</SelectItem>
                  <SelectItem value="price" data-testid="option-sort-price">Price</SelectItem>
                  <SelectItem value="category" data-testid="option-sort-category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterCategory" data-testid="label-filter-category">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="filterCategory" data-testid="select-filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="option-category-all">All Categories</SelectItem>
                  {categories.map((cat: string) => (
                    <SelectItem key={cat} value={cat} data-testid={`option-category-${cat.toLowerCase().replace(/\s+/g, '-')}`}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex gap-4 flex-wrap">
            <Label data-testid="label-stock-filter">Stock Status:</Label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="all"
                  checked={filterStockStatus === "all"}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  data-testid="radio-stock-all"
                />
                <span>All</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="inStock"
                  checked={filterStockStatus === "inStock"}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  data-testid="radio-stock-in-stock"
                />
                <span>In Stock</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="lowStock"
                  checked={filterStockStatus === "lowStock"}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  data-testid="radio-stock-low-stock"
                />
                <span>Low Stock (&lt; 10)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="stockFilter"
                  value="outOfStock"
                  checked={filterStockStatus === "outOfStock"}
                  onChange={(e) => setFilterStockStatus(e.target.value)}
                  data-testid="radio-stock-out-of-stock"
                />
                <span>Out of Stock</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-inventory-title">
            Inventory ({filteredInventory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="text-loading">Loading inventory...</div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-inventory">
              No inventory items found. {searchQuery || filterCategory !== "all" || filterStockStatus !== "all" ? "Try adjusting your filters." : ""}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-product-name">Product Name</TableHead>
                    <TableHead data-testid="header-category">Category</TableHead>
                    <TableHead data-testid="header-price">Price</TableHead>
                    <TableHead data-testid="header-current-stock">Current Stock</TableHead>
                    <TableHead data-testid="header-status">Status</TableHead>
                    <TableHead data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((product: any) => {
                    const stockQuantity = product.stockQuantity || 0;
                    const isLowStock = stockQuantity < 10 && stockQuantity > 0;
                    const isOutOfStock = !product.inStock || stockQuantity === 0;

                    return (
                      <TableRow key={product._id} data-testid={`row-inventory-${product._id}`}>
                        <TableCell className="font-medium" data-testid={`cell-name-${product._id}`}>
                          {product.name}
                        </TableCell>
                        <TableCell data-testid={`cell-category-${product._id}`}>
                          {product.category}
                        </TableCell>
                        <TableCell data-testid={`cell-price-${product._id}`}>
                          ₹{product.price}
                        </TableCell>
                        <TableCell data-testid={`cell-stock-${product._id}`}>
                          <span className={
                            isOutOfStock ? 'text-red-600 font-bold' : 
                            isLowStock ? 'text-orange-600 font-semibold' : 
                            'text-green-600'
                          }>
                            {stockQuantity}
                          </span>
                        </TableCell>
                        <TableCell data-testid={`cell-status-${product._id}`}>
                          <span className={`px-2 py-1 rounded-md text-xs ${
                            isOutOfStock ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                            isLowStock ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </TableCell>
                        <TableCell data-testid={`cell-actions-${product._id}`}>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(product)}
                                data-testid={`button-edit-${product._id}`}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Update Stock
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle data-testid="text-edit-dialog-title">Update Stock</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleUpdateStock} className="space-y-4">
                                <div className="space-y-2">
                                  <Label data-testid="label-product-name-display">Product</Label>
                                  <div className="font-medium" data-testid="text-product-name-display">
                                    {editingProduct?.name}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="stockQuantity" data-testid="label-stock-quantity">
                                    Stock Quantity
                                  </Label>
                                  <Input
                                    id="stockQuantity"
                                    type="number"
                                    min="0"
                                    value={editStock}
                                    onChange={(e) => setEditStock(e.target.value)}
                                    required
                                    data-testid="input-stock-quantity"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="inStock"
                                    checked={editInStock}
                                    onChange={(e) => setEditInStock(e.target.checked)}
                                    data-testid="checkbox-in-stock"
                                  />
                                  <Label htmlFor="inStock" data-testid="label-in-stock">
                                    Product Available (In Stock)
                                  </Label>
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingProduct(null)}
                                    data-testid="button-cancel"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={updateInventoryMutation.isPending}
                                    data-testid="button-save"
                                  >
                                    {updateInventoryMutation.isPending ? "Updating..." : "Update Stock"}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
