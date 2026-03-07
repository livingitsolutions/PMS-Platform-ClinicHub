import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToCSV } from '@/lib/csvExport';

interface ExportCSVButtonProps {
  label: string;
  filename: string;
  data: Record<string, unknown>[];
}

export function ExportCSVButton({ label, filename, data }: ExportCSVButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => exportToCSV(filename, data)}
      disabled={data.length === 0}
    >
      <Download className="size-4 mr-2" />
      {label}
    </Button>
  );
}
