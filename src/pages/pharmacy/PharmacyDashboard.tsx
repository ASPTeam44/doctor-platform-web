import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatters';

interface IncomingOrder {
  id: string;
  patientName: string;
  itemsCount: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED';
  time: string;
}

const recentOrders: IncomingOrder[] = [
  {
    id: 'ord-901',
    patientName: 'Rahul Patel',
    itemsCount: 3,
    total: 840,
    status: 'PENDING',
    time: '12 mins ago',
  },
  {
    id: 'ord-899',
    patientName: 'Ananya Roy',
    itemsCount: 2,
    total: 320,
    status: 'CONFIRMED',
    time: '45 mins ago',
  },
  {
    id: 'ord-890',
    patientName: 'Vikram Singh',
    itemsCount: 5,
    total: 1250,
    status: 'DISPATCHED',
    time: '2 hours ago',
  },
];

export const PharmacyDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <PageContainer
      title={`${user?.name || 'Pharmacy'} Operations Console`}
      description="Process incoming prescription medicine orders, monitor fulfillment pipelines, and track inventory."
      action={
        <Link to="/pharmacy/inventory">
          <Button variant="primary" size="md" leftIcon={<Boxes className="h-4 w-4" />}>
            Manage Inventory
          </Button>
        </Link>
      }
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Orders
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">4</h3>
              <p className="text-xs text-amber-600 font-medium mt-1">Requires dispensing</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-brand-600">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                In Transit
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">6</h3>
              <p className="text-xs text-slate-500 mt-1">Out for delivery</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Gross Sales
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">{formatCurrency(48200)}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">This month</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Low Stock Alerts
              </p>
              <h3 className="text-2xl font-bold text-navy-900 mt-1">3</h3>
              <p className="text-xs text-rose-600 font-medium mt-1">Below minimum threshold</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Recent Customer Orders</CardTitle>
            <CardDescription>Prescription-backed orders ready for packing and dispatch</CardDescription>
          </div>
          <Link to="/pharmacy/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            All Orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-700">
                      {order.id.toUpperCase()}
                    </span>
                    <Badge
                      variant={
                        order.status === 'PENDING'
                          ? 'warning'
                          : order.status === 'CONFIRMED'
                          ? 'info'
                          : 'success'
                      }
                      size="sm"
                      dot
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {order.patientName} • {order.itemsCount} medicines
                  </p>
                  <p className="text-xs text-slate-500">{order.time}</p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="font-bold text-slate-800 text-sm">
                    {formatCurrency(order.total)}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => alert(`Processing order #${order.id}`)}
                  >
                    Process Order
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
