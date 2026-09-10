import React from 'react';
import {
  FileText,
  User,
  Building2,
  Calendar,
  Pill,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Prescription } from '@/types/prescription';
import { formatDate } from '@/lib/utils/formatters';

export interface PatientPrescriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
}

export const PatientPrescriptionDetailsModal: React.FC<PatientPrescriptionDetailsModalProps> = ({
  isOpen,
  onClose,
  prescription,
}) => {
  if (!prescription) return null;

  const doctorName = prescription.doctor?.name || 'Treating Physician';
  const doctorSpecialty = prescription.doctor?.doctorProfile?.specialization || 'Clinical Specialist';
  const hospital = prescription.doctor?.doctorProfile?.hospitalName;
  const qualification = prescription.doctor?.doctorProfile?.qualification || 'MD';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Digital Prescription #${prescription.id.slice(-8).toUpperCase()}`}
      description="Signed by your verified DocTalk physician."
      size="lg"
    >
      <div className="space-y-5 py-1">
        {/* Doctor & Clinic Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-brand-200 bg-brand-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-navy-900">Dr. {doctorName}</h3>
              <Badge variant="success" size="sm" dot>
                Verified Physician
              </Badge>
            </div>
            <p className="text-xs text-brand-800 font-semibold">
              {doctorSpecialty} • {qualification}
            </p>
            {hospital && (
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-slate-400" />
                <span>{hospital}</span>
              </p>
            )}
          </div>

          <div className="text-xs text-slate-600 sm:text-right font-mono">
            <span className="block text-slate-400 text-[10px] uppercase font-semibold">
              Date Prescribed
            </span>
            <span className="font-bold text-slate-800">{formatDate(prescription.createdAt)}</span>
          </div>
        </div>

        {/* Clinical Diagnosis & Instructions */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium block">Clinical Diagnosis:</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{prescription.diagnosis}</p>
          </div>

          {prescription.instructions && (
            <div className="border-t border-slate-100 pt-2.5">
              <span className="text-slate-500 font-medium block">Doctor's Advice & Patient Instructions:</span>
              <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {prescription.instructions}
              </p>
            </div>
          )}
        </div>

        {/* Itemized Medicine Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Pill className="h-3.5 w-3.5 text-brand-600" />
            <span>Prescribed Medicines ({prescription.items.length})</span>
          </h4>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Instructions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescription.items.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-bold text-slate-900">
                      {it.medicineName} {it.strength && <span className="text-xs font-normal text-slate-500">({it.strength})</span>}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">{it.dosage}</TableCell>
                    <TableCell className="text-xs text-slate-700">{it.frequency}</TableCell>
                    <TableCell className="text-xs text-slate-700 font-medium">
                      {it.duration} {it.durationUnit?.toLowerCase() || 'days'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {it.instructions || 'As advised'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={handlePrint}
          >
            Print Prescription
          </Button>
        </div>
      </div>
    </Modal>
  );
};
