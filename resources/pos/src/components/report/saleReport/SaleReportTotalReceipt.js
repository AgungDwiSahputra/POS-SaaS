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
    const currencySymbol = currencySymbolHandling(allConfigData, currency) || 'Rp ';
    
    // Helper function to safely format numbers and handle NaN
    const formatCurrency = (value) => {
        if (value === null || value === undefined || value === '') return '0.00';
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return '0.00';
        return numValue.toFixed(2);
    };
    
    const formatCount = (value) => {
        if (value === null || value === undefined || value === '') return 0;
        const numValue = parseInt(value);
        if (isNaN(numValue)) return 0;
        return numValue;
    };

    return (
        <div ref={ref} className="receipt-print-area">
            <div className="receipt-header text-center mb-4">
                <h3>{getFormattedMessage("sale-report.total.title") || "Sales Report Total"}</h3>
                <p>{warehouseName || getFormattedMessage("unit.filter.all.label") || 'All Warehouses'}</p>
                <p>{dateRange || getFormattedMessage("sale-report.receipt.date-range.default") || 'All Dates'}</p>
                <p>{getFormattedMessage("sale-report.printed-at.label") || "Printed at"}: {printedAt}</p>
            </div>

            <div className="receipt-body">
                <table className="table table-borderless">
                    <tbody>
                        <tr>
                            <td><strong>{getFormattedMessage("sale-report.total.sales.label") || "Total Sales"}:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{formatCurrency(totalData?.total_sales)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>{getFormattedMessage("sale-report.total.sales-count.label") || "Sales Count"}:</td>
                            <td className="text-end">{formatCount(totalData?.total_sales_count)} {getFormattedMessage("sale-report.total.transactions.label") || "transactions"}</td>
                        </tr>
                        <tr>
                            <td><strong>{getFormattedMessage("sale-report.total.returns.label") || "Total Returns"}:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{formatCurrency(totalData?.total_sale_returns)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>{getFormattedMessage("sale-report.total.returns-count.label") || "Returns Count"}:</td>
                            <td className="text-end">{formatCount(totalData?.total_sale_returns_count)} {getFormattedMessage("sale-report.total.transactions.label") || "transactions"}</td>
                        </tr>
                        <tr>
                            <td><strong>{getFormattedMessage("sale-report.total.payments.label") || "Total Payments"}:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{formatCurrency(totalData?.total_payments)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>{getFormattedMessage("sale-report.total.payments-count.label") || "Payments Count"}:</td>
                            <td className="text-end">{formatCount(totalData?.total_payments_count)} {getFormattedMessage("sale-report.total.transactions.label") || "transactions"}</td>
                        </tr>
                        <tr className="border-top">
                            <td><strong>{getFormattedMessage("sale-report.total.net-sales.label") || "Net Sales"}:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{formatCurrency(totalData?.net_sales)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>{getFormattedMessage("sale-report.total.outstanding.label") || "Outstanding Amount"}:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{formatCurrency(totalData?.outstanding_amount)}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="receipt-footer text-center mt-4">
                <p>{getFormattedMessage("sale-report.total.footer.label") || "--- End of Report ---"}</p>
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
