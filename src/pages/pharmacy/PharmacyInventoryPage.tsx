import React from 'react';
import { Boxes, Plus, AlertTriangle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatCurrency } from '@/lib/utils/formatters';

interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  category: string;
  stock: number;
  unitPrice: number;
}

const mockInventory: MedicineItem[] = [
  { id: 'm-1', name: 'Amoxicillin & Clavulanate', dosage: '625mg', category: 'Antibiotic', stock: 120, unitPrice: 185 },
  { id: 'm-2', name: 'Telmisartan Tablets', dosage: '40mg', category: 'Cardiovascular', stock: 240, unitPrice: 120 },
  { id: 'm-3', name: 'Atorvastatin', dosage: '10mg', category: 'Lipid-Lowering', stock: 15, unitPrice: 95 },
  { id: 'm-4', name: 'Metformin Hydrochloride', dosage: '500mg', category: 'Antidiabetic', stock: 300, unitPrice: 65 },
  { id: 'm-5', name: 'Montelukast & Levocetirizine', dosage: '10mg/5mg', category: 'Antiallergic', stock: 8, unitPrice: 140 },
];

export const PharmacyInventoryPage: React.FC = () => {
  return (
    <PageContainer
      title="Pharmaceutical Inventory Catalog"
      description="Monitor dispensary stocks, configure pricing, and maintain replenishment thresholds."
      action={
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => alert('Add new medicine dialog opened')}
        >
          Add Medicine
        </Button>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine Name</TableHead>
            <TableHead>Dosage</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Units in Stock</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockInventory.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold text-slate-900">{item.name}</TableCell>
              <TableCell className="text-slate-600 font-mono text-xs">{item.dosage}</TableCell>
              <TableCell className="text-slate-600">{item.category}</TableCell>
              <TableCell className="font-medium text-slate-800">{item.stock} units</TableCell>
              <TableCell className="font-semibold text-slate-900">{formatCurrency(item.unitPrice)}</TableCell>
              <TableCell>
                <Badge
                  variant={item.stock > 30 ? 'success' : item.stock > 10 ? 'warning' : 'danger'}
                  dot
                >
                  {item.stock > 30 ? 'In Stock' : item.stock > 10 ? 'Low Stock' : 'Critical Low'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Editing stock for ${item.name}`)}
                >
                  Edit Stock
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PageContainer>
  );
};
