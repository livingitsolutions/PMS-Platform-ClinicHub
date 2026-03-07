import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #000',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBlock: {
    width: '48%',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 10,
    marginBottom: 3,
    color: '#333',
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontWeight: 'bold',
    borderBottom: '2px solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
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
  summarySection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  summaryBox: {
    width: '40%',
    borderTop: '2px solid #000',
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 5,
    borderTop: '2px solid #000',
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    marginTop: 15,
    padding: 8,
    textAlign: 'center',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusPaid: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusPartial: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusUnpaid: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    paddingTop: 10,
    borderTop: '1px solid #e0e0e0',
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
});

interface Procedure {
  id: string;
  quantity: number;
  price: number;
  procedures: {
    name: string;
  };
}

interface InvoiceData {
  invoiceNumber: string;
  clinicName: string;
  patientName: string;
  visitDate: string;
  procedures: Procedure[];
  totalAmount: number;
  amountPaid: number;
  status: 'unpaid' | 'partial' | 'paid' | 'void';
}

interface InvoicePDFProps {
  data: InvoiceData;
}

export function InvoicePDF({ data }: InvoicePDFProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const balance = data.totalAmount - data.amountPaid;

  const getStatusStyle = () => {
    switch (data.status) {
      case 'paid':
        return styles.statusPaid;
      case 'partial':
        return styles.statusPartial;
      case 'unpaid':
        return styles.statusUnpaid;
      default:
        return styles.statusUnpaid;
    }
  };

  const getStatusText = () => {
    switch (data.status) {
      case 'paid':
        return 'PAID IN FULL';
      case 'partial':
        return 'PARTIALLY PAID';
      case 'unpaid':
        return 'UNPAID';
      case 'void':
        return 'VOID';
      default:
        return 'UNPAID';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.subtitle}>{data.clinicName}</Text>
        </View>

        <View style={styles.invoiceInfo}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Invoice To:</Text>
            <Text style={styles.infoText}>{data.patientName}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Invoice Details:</Text>
            <Text style={styles.infoText}>Invoice #: {data.invoiceNumber}</Text>
            <Text style={styles.infoText}>Date: {data.visitDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services & Procedures</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Description</Text>
              <Text style={styles.col2}>Quantity</Text>
              <Text style={styles.col3}>Unit Price</Text>
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
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(data.totalAmount)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount Paid:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(data.amountPaid)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Balance Due:</Text>
              <Text style={styles.totalValue}>{formatCurrency(balance)}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statusBadge, getStatusStyle()]}>
          <Text>{getStatusText()}</Text>
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
          <Text style={{ marginTop: 5 }}>
            Thank you for your business
          </Text>
        </View>
      </Page>
    </Document>
  );
}
