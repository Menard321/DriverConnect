import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { formatTZS } from './formatters';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
    paddingBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#b45309',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metaCol: {
    width: '48%',
  },
  metaLabel: {
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
  },
  colDesc: {
    width: '65%',
  },
  colAmount: {
    width: '35%',
    textAlign: 'right',
  },
  totalSection: {
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#0f172a',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#b45309',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 36,
    right: 36,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

interface InvoiceDocProps {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleTitle?: string;
  licensePlate?: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: number;
  paymentType: string;
  createdAt?: string;
}

const InvoiceDocument: React.FC<InvoiceDocProps> = ({
  bookingId,
  customerName,
  customerEmail,
  customerPhone,
  vehicleTitle,
  licensePlate,
  pickupDate,
  returnDate,
  totalAmount,
  paymentType,
  createdAt,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>DRIVERCONNECT TANZANIA</Text>
        <Text style={styles.subtitle}>Automotive Mobility & Commerce • Official Tax Invoice</Text>
      </View>

      <View style={styles.metaSection}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Billed To:</Text>
          <Text style={styles.metaValue}>{customerName}</Text>
          <Text style={styles.subtitle}>{customerEmail}</Text>
          <Text style={styles.subtitle}>{customerPhone}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>Invoice Number:</Text>
          <Text style={styles.metaValue}>DC-INV-{bookingId.substring(0, 8).toUpperCase()}</Text>
          <Text style={styles.metaLabel}>Invoice Date:</Text>
          <Text style={styles.metaValue}>{new Date(createdAt || Date.now()).toLocaleDateString('en-GB')}</Text>
          <Text style={styles.metaLabel}>Settlement Status:</Text>
          <Text style={[styles.metaValue, { color: '#059669' }]}>PAID IN FULL (TZS)</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colAmount}>Amount (TZS)</Text>
        </View>

        <View style={styles.tableRow}>
          <View style={styles.colDesc}>
            <Text style={{ fontWeight: 'bold' }}>{vehicleTitle || 'Automotive Booking / Service'}</Text>
            <Text style={{ color: '#64748b', fontSize: 8 }}>
              {licensePlate ? `Plate: ${licensePlate} • ` : ''}
              Period: {new Date(pickupDate).toLocaleDateString('en-GB')} to {new Date(returnDate).toLocaleDateString('en-GB')}
            </Text>
          </View>
          <Text style={styles.colAmount}>{formatTZS(totalAmount)}</Text>
        </View>

        <View style={styles.tableRow}>
          <View style={styles.colDesc}>
            <Text>Payment Settlement Method</Text>
            <Text style={{ color: '#64748b', fontSize: 8 }}>Processed via DriverConnect Secure Gateway</Text>
          </View>
          <Text style={styles.colAmount}>{paymentType.toUpperCase().replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>TOTAL AMOUNT PAID (TZS):</Text>
        <Text style={styles.totalAmount}>{formatTZS(totalAmount)}</Text>
      </View>

      <View style={styles.footer}>
        <Text>DriverConnect Ltd. • Dar es Salaam & Arusha • TIN: 104-892-741 • VAT Inclusive where applicable.</Text>
        <Text style={{ marginTop: 3 }}>Thank you for driving with DriverConnect. For support, call +255 700 000 000 or email support@driverconnect.co.tz</Text>
      </View>
    </Page>
  </Document>
);

export async function generatePdfInvoiceBuffer(data: InvoiceDocProps): Promise<Buffer> {
  const doc = React.createElement(InvoiceDocument, data);
  const buffer = await renderToBuffer(doc as any);
  return buffer as unknown as Buffer;
}
