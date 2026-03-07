import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useVisitProcedures,
  useUpdateVisitProcedure,
  useDeleteVisitProcedure,
} from '../hooks/useVisitProcedures';
import { useProcedures } from '../hooks/useProcedures';

interface VisitProceduresTableProps {
  visitId: string;
  clinicId: string;
}

export function VisitProceduresTable({ visitId, clinicId }: VisitProceduresTableProps) {
  const { data: visitProcedures = [], isLoading } = useVisitProcedures(visitId);
  const { data: allProcedures = [] } = useProcedures(clinicId);
  const updateMutation = useUpdateVisitProcedure();
  const deleteMutation = useDeleteVisitProcedure();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);

  const procedureMap = new Map(allProcedures.map((p) => [p.id, p]));

  const handleStartEdit = (id: string, currentQuantity: number) => {
    setEditingId(id);
    setEditQuantity(currentQuantity);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        payload: { quantity: editQuantity },
      });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity(1);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this procedure?')) {
      try {
        await deleteMutation.mutateAsync({ id, visitId });
      } catch (error) {
        console.error('Failed to delete procedure:', error);
      }
    }
  };

  const calculateSubtotal = (quantity: number, price: number) => {
    return quantity * price;
  };

  const totalCost = visitProcedures.reduce(
    (sum, vp) => sum + calculateSubtotal(vp.quantity, vp.price),
    0
  );

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading procedures...</div>;
  }

  if (visitProcedures.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No procedures added yet
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Procedure</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visitProcedures.map((vp) => {
          const procedure = procedureMap.get(vp.procedure_id);
          const isEditing = editingId === vp.id;
          const subtotal = calculateSubtotal(vp.quantity, vp.price);

          return (
            <TableRow key={vp.id}>
              <TableCell className="font-medium">
                {procedure?.name || 'Unknown Procedure'}
              </TableCell>
              <TableCell className="text-right">
                {isEditing ? (
                  <div className="flex items-center justify-end gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                      className="w-20 text-right"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(vp.id)}
                      disabled={updateMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={updateMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  vp.quantity
                )}
              </TableCell>
              <TableCell className="text-right">
                ${vp.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-medium">
                ${subtotal.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {!isEditing && (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(vp.id, vp.quantity)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(vp.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="text-right font-semibold">
            Total Cost
          </TableCell>
          <TableCell className="text-right font-bold text-lg">
            ${totalCost.toFixed(2)}
          </TableCell>
          <TableCell />
        </TableRow>
      </TableFooter>
    </Table>
  );
}
