import React, { forwardRef } from "react";
import { currencySymbolHandling, getFormattedMessage } from "../../../shared/sharedMethod";

const SaleReportTotalReceipt = forwardRef(({
    totalData,
    currency,
    dateRange,
    printedAt,
    allConfigData,
    warehouseName
}, ref) => {
    const currencySymbol = currencySymbolHandling(allConfigData, currency);
    
    // Helper function to safely format numbers and handle NaN
    const formatCurrency = (value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '0.00';
        return numValue.toFixed(2);
    };
    
    const formatCount = (value) => {
        const numValue = parseInt(value);
        if (isNaN(numValue)) return 0;
        return numValue;
    };

    return (
        <div ref={ref} className="receipt-print-area">
            <div className="receipt-header text-center mb-4">
                <h3>Sales Report Total</h3>
                <p>{warehouseName || 'All Warehouses'}</p>
                <p>{dateRange || 'All Dates'}</p>
                <p>Printed at: {printedAt}</p>
            </div>

            <div className="receipt-body">
                <table className="table table-borderless">
                    <tbody>
                        <tr>
                            <td><strong>Total Sales:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{formatCurrency(totalData?.total_sales)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>Sales Count:</td>
                            <td className="text-end">{formatCount(totalData?.total_sales_count)} transactions</td>
                        </tr>
                        <tr>
                            <td><strong>Total Returns:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{formatCurrency(totalData?.total_sale_returns)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>Returns Count:</td>
                            <td className="text-end">{formatCount(totalData?.total_sale_returns_count)} transactions</td>
                        </tr>
                        <tr>
                            <td><strong>Total Payments:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{formatCurrency(totalData?.total_payments)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>Payments Count:</td>
                            <td className="text-end">{formatCount(totalData?.total_payments_count)} transactions</td>
                        </tr>
                        <tr className="border-top">
                            <td><strong>Net Sales:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{formatCurrency(totalData?.net_sales)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Outstanding Amount:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{formatCurrency(totalData?.outstanding_amount)}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="receipt-footer text-center mt-4">
                <p>--- End of Report ---</p>
            </div>

            <style jsx>{`
                .receipt-print-area {
                    width: 100%;
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.4;
                }
                
                .receipt-header h3 {
                    margin-bottom: 10px;
                    font-size: 16px;
                    font-weight: bold;
                }
                
                .receipt-header p {
                    margin: 2px 0;
                    font-size: 11px;
                }
                
                .table {
                    width: 100%;
                    margin-bottom: 0;
                }
                
                .table td {
                    padding: 3px 0;
                    border: none;
                    font-size: 11px;
                }
                
                .border-top {
                    border-top: 1px solid #000 !important;
                }
                
                .receipt-footer p {
                    font-size: 10px;
                    margin: 0;
                }
                
                @media print {
                    .receipt-print-area {
                        max-width: none;
                        padding: 10px;
                    }
                }
            `}</style>
        </div>
    );
});

SaleReportTotalReceipt.displayName = 'SaleReportTotalReceipt';

export default SaleReportTotalReceipt;
