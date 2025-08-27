// src/components/MyDocument.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: 1,
  },
  row: {
    display: 'table-row',
  },
  cell: {
    margin: 5,
    padding: 5,
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: 1,
    textAlign: 'center',
  },
});

const MyDocument = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.cell}>Column 1</Text>
            <Text style={styles.cell}>Column 2</Text>
          </View>
          {data && data.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.cell}>{item.field1}</Text>
              <Text style={styles.cell}>{item.field2}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default MyDocument;
