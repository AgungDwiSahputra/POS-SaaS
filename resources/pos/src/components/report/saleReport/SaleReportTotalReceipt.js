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

    return (
        <div ref={ref} className="receipt-print-area">
            <div className="receipt-header text-center mb-4">
                <h3>{getFormattedMessage("sale-report.total.title")}</h3>
                <p>{warehouseName}</p>
                <p>{dateRange}</p>
                <p>{getFormattedMessage("sale-report.printed-at.label")}: {printedAt}</p>
            </div>

            <div className="receipt-body">
                <table className="table table-borderless">
                    <tbody>
                        <tr>
                            <td><strong>{getFormattedMessage("sale-report.total.sales.label")}:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{totalData?.total_sales?.toFixed(2) || '0.00'}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>{getFormattedMessage("sale-report.total.sales-count.label")}:</td>
                            <td className="text-end">{totalData?.total_sales_count || 0} {getFormattedMessage("sale-report.total.transactions.label")}</td>
                        </tr>
                        <tr>
                            <td><strong>{getFormattedMessage("sale-report.total.returns.label")}:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{totalData?.total_sale_returns?.toFixed(2) || '0.00'}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>{getFormattedMessage("sale-report.total.returns-count.label")}:</td>
                            <td className="text-end">{totalData?.total_sale_returns_count || 0} {getFormattedMessage("sale-report.total.transactions.label")}</td>
                        </tr>
                        <tr>
                            <td><strong>{getFormattedMessage("sale-report.total.payments.label")}:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{totalData?.total_payments?.toFixed(2) || '0.00'}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>{getFormattedMessage("sale-report.total.payments-count.label")}:</td>
                            <td className="text-end">{totalData?.total_payments_count || 0} {getFormattedMessage("sale-report.total.transactions.label")}</td>
                        </tr>
                        <tr className="border-top">
                            <td><strong>{getFormattedMessage("sale-report.total.net-sales.label")}:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{totalData?.net_sales?.toFixed(2) || '0.00'}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>{getFormattedMessage("sale-report.total.outstanding.label")}:</strong></td>
                            <td className="text-end">
                                <strong>{currencySymbol}{totalData?.outstanding_amount?.toFixed(2) || '0.00'}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="receipt-footer text-center mt-4">
                <p>{getFormattedMessage("sale-report.total.footer.label")}</p>
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
