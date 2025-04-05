// // import React from 'react';
// // import { useLocation, useNavigate } from 'react-router-dom';
// // import jsPDF from 'jspdf';
// // import autoTable from 'jspdf-autotable'; // Explicitly import autoTable
// // import '../styles/BillGenerator.css';

// // const BillGenerator = () => {
// //     const location = useLocation();
// //     const navigate = useNavigate();
// //     const products = location.state?.products || [];

// //     const generateBill = () => {
// //         const doc = new jsPDF();

// //         // Title
// //         doc.setFontSize(22);
// //         doc.text('GOVIGYAAN', 105, 15, { align: 'center' });
// //         doc.setFontSize(16);
// //         doc.text('BILL SUMMARY', 105, 30, { align: 'center' });

// //         // Table Data
// //         const tableColumn = ['Item Name', 'Price', 'Quantity', 'Subtotal'];
// //         const tableRows = products.map(product => [
// //             product.name,
// //             `₹${product.price}`,
// //             product.quantity,
// //             `₹${product.price * product.quantity}`
// //         ]);

// //         // Generate Table
// //         autoTable(doc, {
// //             head: [tableColumn],
// //             body: tableRows,
// //             startY: 40,
// //             theme: 'grid',
// //             styles: { halign: 'center' },
// //             headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 255] },
// //         });

// //         // Position after the table
// //         let finalY = doc.lastAutoTable.finalY || 50; // Ensure it's correctly positioned
// //         finalY += 10;

// //         // Grand Total
// //         doc.setFontSize(14);
// //         doc.text(`Grand Total: ₹${products.reduce((acc, item) => acc + item.price * item.quantity, 0)}`, 105, finalY, { align: 'center' });

// //         // Thank You Message
// //         doc.setFontSize(12);
// //         doc.text('THANK YOU FOR VISITING', 105, finalY + 15, { align: 'center' });

// //         // Save PDF
// //         doc.save('bill.pdf');
// //     };

// //     return (
// //         <div className="bill-page">
// //             <h1>BILL SUMMARY</h1>
// //             <table border="1">
// //                 <thead>
// //                     <tr>
// //                         <th>Item Name</th>
// //                         <th>Price</th>
// //                         <th>Quantity</th>
// //                         <th>Subtotal</th>
// //                     </tr>
// //                 </thead>
// //                 <tbody>
// //                     {products.map((product, index) => (
// //                         <tr key={index}>
// //                             <td>{product.name}</td>
// //                             <td>₹{product.price}</td>
// //                             <td>{product.quantity}</td>
// //                             <td>₹{product.price * product.quantity}</td>
// //                         </tr>
// //                     ))}
// //                 </tbody>
// //             </table>
// //             <h2>Grand Total: ₹{products.reduce((acc, item) => acc + item.price * item.quantity, 0)}</h2>
// //             <div className="button-container">
// //              <button className="bill-button pay-btn" style={{ backgroundColor: 'seagreen'}} onClick={generateBill} >Download PDF</button>
// //              <button className="bill-button pay-btn" onClick={() => navigate('/payment')}>Proceed to Pay</button>
// //              <button className="bill-button home-btn" onClick={() => navigate('/')}>Go to Front Page</button>
// //             </div>
      
// //         </div>
// //     );
// // };

// // export default BillGenerator;






// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { db } from '../firebaseConfig';
// import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import '../styles/BillGenerator.css';

// const BillGenerator = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const products = location.state?.products || [];
//     const userName = localStorage.getItem('userName') || 'Customer';

//     const [sgst, setSgst] = useState(9);  // default 9%
//     const [cgst, setCgst] = useState(9);  // default 9%
//     const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);


//     const grandTotal = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
//     const gstRate = (sgst + cgst) / 100;
//     const gstAmount = grandTotal * gstRate;
//     const totalWithGST = grandTotal + gstAmount;

//     const updateInventory = async () => {
//         for (const item of products) {
//             const productRef = doc(db, 'products', item.id);
//             const productSnap = await getDoc(productRef);

//             if (productSnap.exists()) {
//                 const currentStock = productSnap.data().stock;
//                 const newStock = Math.max(0, parseInt(currentStock) - item.quantity);
//                 await updateDoc(productRef, { stock: newStock });
//             }
//         }
//     };

//     const confirmPayment = async () => {
//         try {
//             await updateInventory();
//             await storeBill();
//             setIsPaymentConfirmed(true);
//             alert("Payment confirmed! You can now download the PDF.");
//         } catch (err) {
//             console.error("Error during payment confirmation:", err);
//             alert("Payment failed. Try again.");
//         }
//     };
    

//     const storeBill = async () => {
//         const billRef = collection(db, 'bills');
//         await addDoc(billRef, {
//             userName,
//             date: new Date().toISOString(),
//             products,
//             sgst,
//             cgst,
//             grandTotal,
//             gstAmount,
//             totalWithGST
//         });
//     };

//     const downloadPDF = () => {
//         const docPdf = new jsPDF();
    
//         docPdf.setFontSize(22);
//         docPdf.text('GOVIGYAAN', 105, 15, { align: 'center' });
//         docPdf.setFontSize(16);
//         docPdf.text('BILL SUMMARY', 105, 30, { align: 'center' });
    
//         autoTable(docPdf, {
//             head: [['Item Name', 'Price', 'Quantity', 'Subtotal']],
//             body: products.map(item => [
//                 item.name,
//                 `₹${item.price}`,
//                 item.quantity,
//                 `₹${item.price * item.quantity}`
//             ]),
//             startY: 40,
//             theme: 'grid',
//             styles: { halign: 'center' },
//             headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 255] },
//         });
    
//         let y = docPdf.lastAutoTable.finalY + 10;
    
//         docPdf.setFontSize(12);
//         docPdf.text(`Customer: ${userName}`, 14, y);
//         y += 8;
//         docPdf.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 14, y);
//         y += 8;
//         docPdf.text(`SGST (${sgst}%): ₹${(grandTotal * (sgst / 100)).toFixed(2)}`, 14, y);
//         y += 8;
//         docPdf.text(`CGST (${cgst}%): ₹${(grandTotal * (cgst / 100)).toFixed(2)}`, 14, y);
//         y += 8;
//         docPdf.text(`Total with GST: ₹${totalWithGST.toFixed(2)}`, 14, y);
    
//         docPdf.setFontSize(12);
//         docPdf.text('THANK YOU FOR VISITING', 105, y + 15, { align: 'center' });
    
//         docPdf.save('bill.pdf');
//     };
    
//     return (
//         <div className="bill-page">
//             <h1>BILL SUMMARY</h1>
//             <h3>Customer: {userName}</h3>

//             <div className="gst-inputs">
//                 <label>SGST (%): <input type="number" value={sgst} onChange={(e) => setSgst(Number(e.target.value))} /></label>
//                 <label>CGST (%): <input type="number" value={cgst} onChange={(e) => setCgst(Number(e.target.value))} /></label>
//             </div>

//             <table border="1">
//                 <thead>
//                     <tr>
//                         <th>Item Name</th>
//                         <th>Price</th>
//                         <th>Quantity</th>
//                         <th>Subtotal</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {products.map((item, index) => (
//                         <tr key={index}>
//                             <td>{item.name}</td>
//                             <td>₹{item.price}</td>
//                             <td>{item.quantity}</td>
//                             <td>₹{item.price * item.quantity}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             <h3>Grand Total: ₹{grandTotal.toFixed(2)}</h3>
//             <h3>SGST ({sgst}%): ₹{(grandTotal * (sgst / 100)).toFixed(2)}</h3>
//             <h3>CGST ({cgst}%): ₹{(grandTotal * (cgst / 100)).toFixed(2)}</h3>
//             <h2>Total with GST: ₹{totalWithGST.toFixed(2)}</h2>

//             <div className="button-container">
//     {!isPaymentConfirmed ? (
//         <button className="bill-button" onClick={confirmPayment}>Confirm Payment</button>
//     ) : (
//         <button className="bill-button" onClick={downloadPDF}>Download PDF</button>
//     )}
//     <button className="bill-button" onClick={() => navigate('/')}>Go to Front Page</button>
// </div>

//         </div>
//     );
// };

// export default BillGenerator;



import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../styles/BillGenerator.css';

const BillGenerator = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const products = location.state?.products || [];
    const userName = localStorage.getItem('userName') || 'Customer';

    const [sgst, setSgst] = useState(9);
    const [cgst, setCgst] = useState(9);
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
    const [businessInfo, setBusinessInfo] = useState({});

    useEffect(() => {
        const fetchBusinessInfo = async () => {
            const snapshot = await getDocs(collection(db, 'businessInfo'));
            if (!snapshot.empty) {
                setBusinessInfo(snapshot.docs[0].data());
            }
        };
        fetchBusinessInfo();
    }, []);

    const grandTotal = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const gstRate = (sgst + cgst) / 100;
    const gstAmount = grandTotal * gstRate;
    const totalWithGST = grandTotal + gstAmount;

    const updateInventory = async () => {
        for (const item of products) {
            const productRef = doc(db, 'products', item.id);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
                const currentStock = productSnap.data().stock;
                const newStock = Math.max(0, parseInt(currentStock) - item.quantity);
                await updateDoc(productRef, { stock: newStock });
            }
        }
    };

    const confirmPayment = async () => {
        try {
            await updateInventory();
            await storeBill();
            setIsPaymentConfirmed(true);
            alert("Payment confirmed! You can now download the PDF.");
        } catch (err) {
            console.error("Error during payment confirmation:", err);
            alert("Payment failed. Try again.");
        }
    };

    const storeBill = async () => {
        const billRef = collection(db, 'bills');
        await addDoc(billRef, {
            userName,
            date: new Date().toISOString(),
            products,
            sgst,
            cgst,
            grandTotal,
            gstAmount,
            totalWithGST,
            businessInfo,
        });
    };

    const downloadPDF = () => {
        const docPdf = new jsPDF();

        docPdf.setFontSize(14);
        if (businessInfo.name) docPdf.text(businessInfo.name, 105, 10, { align: 'center' });
        if (businessInfo.address) docPdf.text(businessInfo.address, 105, 18, { align: 'center' });
        if (businessInfo.gstin) docPdf.text(`GSTIN: ${businessInfo.gstin}`, 105, 26, { align: 'center' });

        docPdf.setFontSize(16);
        docPdf.text('BILL SUMMARY', 105, 38, { align: 'center' });

        autoTable(docPdf, {
            head: [['Item Name', 'Price', 'Quantity', 'Subtotal']],
            body: products.map(item => [
                item.name,
                `₹${item.price}`,
                item.quantity,
                `₹${item.price * item.quantity}`
            ]),
            startY: 45,
            theme: 'grid',
            styles: { halign: 'center' },
            headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 255] },
        });

        let y = docPdf.lastAutoTable.finalY + 10;

        docPdf.setFontSize(12);
        docPdf.text(`Cashier: ${userName}`, 14, y);
        y += 8;
        docPdf.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 14, y);
        y += 8;
        docPdf.text(`SGST (${sgst}%): ₹${(grandTotal * (sgst / 100)).toFixed(2)}`, 14, y);
        y += 8;
        docPdf.text(`CGST (${cgst}%): ₹${(grandTotal * (cgst / 100)).toFixed(2)}`, 14, y);
        y += 8;
        docPdf.text(`Total with GST: ₹${totalWithGST.toFixed(2)}`, 14, y);

        docPdf.text('THANK YOU FOR VISITING', 105, y + 15, { align: 'center' });

        docPdf.save('bill.pdf');
    };

    return (
        <div className="bill-page">
            <h1>BILL SUMMARY</h1>
            <h3>Cashier: {userName}</h3>

            <div className="gst-inputs">
                <label>SGST (%): <input type="number" value={sgst} onChange={(e) => setSgst(Number(e.target.value))} /></label>
                <label>CGST (%): <input type="number" value={cgst} onChange={(e) => setCgst(Number(e.target.value))} /></label>
            </div>

            <table border="1">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((item, index) => (
                        <tr key={index}>
                            <td>{item.name}</td>
                            <td>₹{item.price}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price * item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Grand Total: ₹{grandTotal.toFixed(2)}</h3>
            <h3>SGST ({sgst}%): ₹{(grandTotal * (sgst / 100)).toFixed(2)}</h3>
            <h3>CGST ({cgst}%): ₹{(grandTotal * (cgst / 100)).toFixed(2)}</h3>
            <h2>Total with GST: ₹{totalWithGST.toFixed(2)}</h2>

            <div className="button-container">
                {!isPaymentConfirmed ? (
                    <button className="bill-button" id="download" onClick={confirmPayment}>Confirm Payment</button>
                ) : (
                    <button className="bill-button" id="download" onClick={downloadPDF}>Download PDF</button>
                )}
                <button className="bill-button" onClick={() => navigate('/payment')}>Proceed to Pay</button>
                <button className="bill-button" id="cancel" onClick={() => navigate('/')}>Cancel Payment</button>
            </div>
        </div>
    );
};

export default BillGenerator;