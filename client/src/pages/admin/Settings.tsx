import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
              Settings
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your admin preferences and store settings
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Profile</CardTitle>
                <CardDescription>Update your admin account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    defaultValue="admin@ramanifashion.com"
                    disabled
                    data-testid="input-admin-email"
                  />
                </div>
                <div>
                  <Label htmlFor="adminRole">Role</Label>
                  <Input
                    id="adminRole"
                    defaultValue="Administrator"
                    disabled
                    data-testid="input-admin-role"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
                <CardDescription>Configure your store's basic settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    defaultValue="Ramani Fashion"
                    data-testid="input-store-name"
                  />
                </div>
                <div>
                  <Label htmlFor="storeEmail">Contact Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    defaultValue="contact@ramanifashion.com"
                    data-testid="input-store-email"
                  />
                </div>
                <div>
                  <Label htmlFor="storePhone">Contact Phone</Label>
                  <Input
                    id="storePhone"
                    defaultValue="+91 5555555555"
                    data-testid="input-store-phone"
                  />
                </div>
                <Button data-testid="button-save-settings">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lowStockAlert">Low Stock Alerts</Label>
                  <input type="checkbox" id="lowStockAlert" defaultChecked className="h-4 w-4" data-testid="checkbox-low-stock" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="newOrderAlert">New Order Notifications</Label>
                  <input type="checkbox" id="newOrderAlert" defaultChecked className="h-4 w-4" data-testid="checkbox-new-order" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="customerAlert">New Customer Alerts</Label>
                  <input type="checkbox" id="customerAlert" className="h-4 w-4" data-testid="checkbox-new-customer" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
