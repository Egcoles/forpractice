// src/components/PdfView.js
import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import MyDocument from './MyDocument'; // Import your PDF layout component
import { useLocation } from "react-router-dom";

const PdfView = () => {
  const location = useLocation();
  const { pdfUrl } = location.state || {}; // Access the PDF URL from state

  // NOTE: If you need to fetch data to pass to MyDocument, do that here
  const data = []; // Replace this with the data based on your needs

  return (
    <div>
      {pdfUrl ? (
        <PDFViewer style={{ width: '100%', height: '100vh' }}>
          <MyDocument data={data} />
        </PDFViewer>
      ) : (
        <p>No PDF available</p>
      )}
    </div>
  );
};

export default PdfView;
