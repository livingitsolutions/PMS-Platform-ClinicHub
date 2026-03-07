import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottom: '1px solid #e0e0e0',
  },
  col1: {
    width: '50%',
  },
  col2: {
    width: '15%',
    textAlign: 'right',
  },
  col3: {
    width: '20%',
    textAlign: 'right',
  },
  col4: {
    width: '15%',
    textAlign: 'right',
  },
  total: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2px solid #000',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 20,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1px solid #e0e0e0',
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
});

interface Procedure {
  id: string;
  procedure_id: string;
  quantity: number;
  price: number;
  notes: string | null;
  procedures: {
    name: string;
  };
}

interface VisitSummaryData {
  clinicName: string;
  patientName: string;
  providerName: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis: string;
  notes: string;
  procedures: Procedure[];
  totalAmount: number;
}

interface VisitSummaryPDFProps {
  data: VisitSummaryData;
}

export function VisitSummaryPDF({ data }: VisitSummaryPDFProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Visit Summary</Text>
          <Text style={styles.subtitle}>{data.clinicName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Patient:</Text>
            <Text style={styles.value}>{data.patientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Provider:</Text>
            <Text style={styles.value}>{data.providerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Visit Date:</Text>
            <Text style={styles.value}>{data.visitDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Chief Complaint:</Text>
            <Text style={styles.value}>{data.chiefComplaint || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Diagnosis:</Text>
            <Text style={styles.value}>{data.diagnosis || 'N/A'}</Text>
          </View>
          {data.notes && (
            <View style={styles.row}>
              <Text style={styles.label}>Notes:</Text>
              <Text style={styles.value}>{data.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Procedures Performed</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Procedure</Text>
              <Text style={styles.col2}>Qty</Text>
              <Text style={styles.col3}>Price</Text>
              <Text style={styles.col4}>Total</Text>
            </View>
            {data.procedures.map((proc) => (
              <View key={proc.id} style={styles.tableRow}>
                <Text style={styles.col1}>{proc.procedures.name}</Text>
                <Text style={styles.col2}>{proc.quantity}</Text>
                <Text style={styles.col3}>{formatCurrency(proc.price)}</Text>
                <Text style={styles.col4}>
                  {formatCurrency(proc.quantity * proc.price)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.totalAmount)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
