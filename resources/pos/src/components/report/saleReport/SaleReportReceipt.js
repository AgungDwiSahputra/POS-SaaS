import React, { forwardRef } from "react";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../../shared/sharedMethod";

const SaleReportReceipt = forwardRef(({
    sales = [],
    currency,
    cashierName,
    customerName,
    dateRange,
    printedAt,
    allConfigData,
}, ref) => {
    const saleList = Array.isArray(sales) ? sales : [];

    const extractAttribute = (sale, key) => {
        if (!sale) {
            return undefined;
        }

        if (sale.attributes) {
            return sale.attributes[key];
        }

        return sale[key];
    };

    const parseAmount = (sale, key) => {
        const value = extractAttribute(sale, key);
        const numeric = parseFloat(value);

        return Number.isNaN(numeric) ? 0 : numeric;
    };

    const totalGrand = saleList.reduce(
        (sum, sale) => sum + parseAmount(sale, "grand_total"),
        0
    );
    const totalPaid = saleList.reduce(
        (sum, sale) => sum + parseAmount(sale, "paid_amount"),
        0
    );

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
                <div>
                    {getFormattedMessage("sale-report.receipt.cashier")}: {cashierName || getFormattedMessage("unit.filter.all.label")}
                </div>
                {customerName ? (
                    <div>
                        {getFormattedMessage("sale-report.receipt.customer")}: {customerName}
                    </div>
                ) : null}
                <div>
                    {getFormattedMessage("sale-report.receipt.date-range")}: {dateRange}
                </div>
                {printedAt ? (
                    <div>
                        {getFormattedMessage("sale-report.receipt.printed-at")}: {printedAt}
                    </div>
                ) : null}
                <div>
                    {getFormattedMessage("sale-report.receipt.total-sales")}: {currencySymbolHandling(allConfigData, currency, totalGrand)}
                </div>
                <div>
                    {getFormattedMessage("sale-report.receipt.total-paid")}: {currencySymbolHandling(allConfigData, currency, totalPaid)}
                </div>
            </div>
            <div style={{ borderTop: "1px dashed #000", borderBottom: "1px dashed #000", padding: "8px 0", marginBottom: "8px" }}>
                {saleList.length === 0 ? (
                    <div style={{ textAlign: "center" }}>
                        {getFormattedMessage("react-data-table.no-record-found.label")}
                    </div>
                ) : (
                    saleList.map((sale, index) => {
                        const referenceCode = extractAttribute(
                            sale,
                            "reference_code"
                        );
                        const customer = extractAttribute(
                            sale,
                            "customer_name"
                        );
                        const amount = parseAmount(sale, "grand_total");
                        const paid = parseAmount(sale, "paid_amount");

                        return (
                            <div
                                key={sale?.id || `${referenceCode}-${index}`}
                                style={{ marginBottom: "8px" }}
                            >
                                <div>
                                    {getFormattedMessage(
                                        "sale-report.receipt.reference"
                                    )}: {referenceCode}
                                </div>
                                <div>
                                    {getFormattedMessage(
                                        "sale-report.receipt.customer"
                                    )}: {customer}
                                </div>
                                <div>
                                    {getFormattedMessage(
                                        "sale-report.receipt.amount"
                                    )}: {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        amount
                                    )}
                                </div>
                                <div>
                                    {getFormattedMessage(
                                        "sale-report.receipt.paid"
                                    )}: {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        paid
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div style={{ textAlign: "center" }}>
                {getFormattedMessage("sale-report.receipt.footer-thanks")}
            </div>
        </div>
    );
});

export default SaleReportReceipt;
