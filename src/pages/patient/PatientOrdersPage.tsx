import React from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatCurrency } from '@/lib/utils/formatters';

interface MockOrder {
  id: string;
  pharmacy: string;
  items: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED';
  date: string;
}

const mockOrders: MockOrder[] = [
  {
    id: 'ord-802',
    pharmacy: 'Apollo MedCare Pharmacy',
    items: 4,
    total: 840,
    status: 'DISPATCHED',
    date: '2026-09-09',
  },
  {
    id: 'ord-750',
    pharmacy: 'Guardian Health Pharma',
    items: 2,
    total: 320,
    status: 'DELIVERED',
    date: '2026-08-25',
  },
];

export const PatientOrdersPage: React.FC = () => {
  return (
    <PageContainer
      title="Medicine Orders"
      description="Track pharmacy order fulfilment, delivery statuses, and payment histories."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Fulfilling Pharmacy</TableHead>
            <TableHead>Medicines</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Delivery Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockOrders.map((ord) => (
            <TableRow key={ord.id}>
              <TableCell className="font-mono text-xs font-semibold text-slate-700">
                {ord.id.toUpperCase()}
              </TableCell>
              <TableCell className="font-medium text-slate-900">{ord.pharmacy}</TableCell>
              <TableCell className="text-slate-600">{ord.items} items</TableCell>
              <TableCell className="font-semibold text-slate-800">{formatCurrency(ord.total)}</TableCell>
              <TableCell className="text-slate-600">{ord.date}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    ord.status === 'DELIVERED'
                      ? 'success'
                      : ord.status === 'DISPATCHED'
                      ? 'info'
                      : 'warning'
                  }
                  dot
                >
                  {ord.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Truck className="h-3.5 w-3.5" />}
                  onClick={() => alert(`Tracking package delivery for order #${ord.id}`)}
                >
                  Track
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageContainer>
  );
};
