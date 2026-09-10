import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Truck, Eye } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatCurrency } from '@/lib/utils/formatters';

interface PharmacyOrder {
  id: string;
  patientName: string;
  deliveryAddress: string;
  itemsCount: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED';
  date: string;
}

const mockOrdersList: PharmacyOrder[] = [
  {
    id: 'ord-901',
    patientName: 'Rahul Patel',
    deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru',
    itemsCount: 3,
    total: 840,
    status: 'PENDING',
    date: '2026-09-10',
  },
  {
    id: 'ord-899',
    patientName: 'Ananya Roy',
    deliveryAddress: '12B Palm Meadows, Whitefield, Bengaluru',
    itemsCount: 2,
    total: 320,
    status: 'CONFIRMED',
    date: '2026-09-10',
  },
  {
    id: 'ord-890',
    patientName: 'Vikram Singh',
    deliveryAddress: '88 Koramangala 4th Block, Bengaluru',
    itemsCount: 5,
    total: 1250,
    status: 'DISPATCHED',
    date: '2026-09-09',
  },
];

export const PharmacyOrdersPage: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  const filtered = mockOrdersList.filter((o) => filter === 'ALL' || o.status === filter);

  return (
    <PageContainer
      title="Fulfillment Order Queue"
      description="Review prescription items, confirm dispensary stock, and dispatch delivery partners."
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === st
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs font-semibold text-slate-800">
                {order.id.toUpperCase()}
              </TableCell>
              <TableCell className="font-semibold text-slate-900">{order.patientName}</TableCell>
              <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                {order.deliveryAddress}
              </TableCell>
              <TableCell className="font-semibold text-slate-800">
                {formatCurrency(order.total)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.status === 'DELIVERED'
                      ? 'success'
                      : order.status === 'DISPATCHED'
                      ? 'info'
                      : order.status === 'CONFIRMED'
                      ? 'default'
                      : 'warning'
                  }
                  dot
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="h-3.5 w-3.5" />}
                    onClick={() => alert(`Reviewing prescription items for #${order.id}`)}
                  >
                    Details
                  </Button>
                  {order.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      onClick={() => alert(`Confirmed order #${order.id}`)}
                    >
                      Confirm
                    </Button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Truck className="h-3.5 w-3.5" />}
                      onClick={() => alert(`Dispatched order #${order.id}`)}
                    >
                      Dispatch
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageContainer>
  );
};
