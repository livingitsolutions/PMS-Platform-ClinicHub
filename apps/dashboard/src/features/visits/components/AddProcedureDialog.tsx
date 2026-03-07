import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateVisitProcedure } from '../hooks/useVisitProcedures';
import { useProcedures } from '../hooks/useProcedures';

interface AddProcedureDialogProps {
  visitId: string;
  clinicId: string;
}

export function AddProcedureDialog({ visitId, clinicId }: AddProcedureDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<string>('');

  const { data: procedures = [], isLoading } = useProcedures(clinicId);
  const createMutation = useCreateVisitProcedure();

  const selectedProcedure = procedures.find((p) => p.id === selectedProcedureId);
  const displayPrice = customPrice
    ? parseFloat(customPrice)
    : selectedProcedure?.base_cost || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProcedureId) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        visit_id: visitId,
        procedure_id: selectedProcedureId,
        quantity,
        price: customPrice ? parseFloat(customPrice) : null,
      });

      setOpen(false);
      setSelectedProcedureId('');
      setQuantity(1);
      setCustomPrice('');
    } catch (error) {
      console.error('Failed to add procedure:', error);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setSelectedProcedureId('');
    setQuantity(1);
    setCustomPrice('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4 mr-2" />
          Add Procedure
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Procedure to Visit</DialogTitle>
            <DialogDescription>
              Select a procedure and specify the quantity. Price defaults to the
              procedure's base cost but can be overridden.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="procedure">Procedure</Label>
              <Select
                value={selectedProcedureId}
                onValueChange={setSelectedProcedureId}
              >
                <SelectTrigger id="procedure" className="w-full">
                  <SelectValue placeholder="Select a procedure" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Loading procedures...
                    </div>
                  ) : procedures.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No procedures available
                    </div>
                  ) : (
                    procedures.map((procedure) => (
                      <SelectItem key={procedure.id} value={procedure.id}>
                        {procedure.name} - ${procedure.base_cost.toFixed(2)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">
                Price Override (Optional)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder={
                  selectedProcedure
                    ? `Default: $${selectedProcedure.base_cost.toFixed(2)}`
                    : 'Select a procedure first'
                }
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
              {selectedProcedure && (
                <p className="text-sm text-muted-foreground">
                  Base cost: ${selectedProcedure.base_cost.toFixed(2)}
                </p>
              )}
            </div>

            {selectedProcedure && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <div className="text-sm font-medium mb-1">Total</div>
                <div className="text-2xl font-bold">
                  ${(displayPrice * quantity).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {quantity} × ${displayPrice.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedProcedureId || createMutation.isPending}
            >
              {createMutation.isPending ? 'Adding...' : 'Add Procedure'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
