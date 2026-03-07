import { supabase } from '@/lib/supabase';

export interface VisitProcedureWithDetails {
  id: string;
  procedure_id: string;
  quantity: number;
  price: number;
  notes: string | null;
  procedures: {
    name: string;
  };
}

export async function getVisitProceduresForPDF(visitId: string): Promise<VisitProcedureWithDetails[]> {
  const { data, error } = await supabase
    .from('visit_procedures')
    .select(`
      id,
      procedure_id,
      quantity,
      price,
      notes,
      procedures!inner (
        name
      )
    `)
    .eq('visit_id', visitId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    procedure_id: item.procedure_id,
    quantity: item.quantity,
    price: item.price,
    notes: item.notes,
    procedures: {
      name: item.procedures.name,
    },
  }));
}
