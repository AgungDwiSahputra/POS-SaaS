import React, { forwardRef } from "react";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../../shared/sharedMethod";

const SaleReportReceipt = forwardRef(({ sales = [], currency, cashierName, customerName, dateRange, allConfigData }, ref) => {
    const saleList = Array.isArray(sales) ? sales : [];
    const totalGrand = saleList.reduce((sum, sale) => sum + (parseFloat(sale?.attributes?.grand_total) || 0), 0);
    const totalPaid = saleList.reduce((sum, sale) => sum + (parseFloat(sale?.attributes?.paid_amount) || 0), 0);

    return (
        <div
            ref={ref}
            style={{
                width: "70mm",
                padding: "12px",
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#000",
            }}
        >
            <h4 style={{ textAlign: "center", marginBottom: "8px" }}>
                {getFormattedMessage("sale-report.receipt.title")}
            </h4>
            <div style={{ marginBottom: "8px" }}>
                <div>{getFormattedMessage("sale-report.receipt.cashier")}: {cashierName || getFormattedMessage("unit.filter.all.label")}</div>
                {customerName ? (
                    <div>
                        {getFormattedMessage("sale-report.receipt.customer")}: {customerName}
                    </div>
                ) : null}
                <div>{getFormattedMessage("sale-report.receipt.date-range")}: {dateRange}</div>
                <div>{getFormattedMessage("sale-report.receipt.total-sales")}: {currencySymbolHandling(allConfigData, currency, totalGrand)}</div>
                <div>{getFormattedMessage("sale-report.receipt.total-paid")}: {currencySymbolHandling(allConfigData, currency, totalPaid)}</div>
            </div>
            <div style={{ borderTop: "1px dashed #000", borderBottom: "1px dashed #000", padding: "8px 0", marginBottom: "8px" }}>
                {saleList.length === 0 ? (
                    <div style={{ textAlign: "center" }}>
                        {getFormattedMessage("react-data-table.no-record-found.label")}
                    </div>
                ) : (
                    saleList.map((sale) => (
                        <div key={sale.id} style={{ marginBottom: "8px" }}>
                            <div>{getFormattedMessage("sale-report.receipt.reference")}: {sale.attributes?.reference_code}</div>
                            <div>{getFormattedMessage("sale-report.receipt.customer")}: {sale.attributes?.customer_name}</div>
                            <div>
                                {getFormattedMessage("sale-report.receipt.amount")}: {currencySymbolHandling(allConfigData, currency, sale.attributes?.grand_total)}
                            </div>
                            <div>
                                {getFormattedMessage("sale-report.receipt.paid")}: {currencySymbolHandling(allConfigData, currency, sale.attributes?.paid_amount)}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div style={{ textAlign: "center" }}>
                {getFormattedMessage("sale-report.receipt.footer-thanks")}
            </div>
        </div>
    );
});

export default SaleReportReceipt;
