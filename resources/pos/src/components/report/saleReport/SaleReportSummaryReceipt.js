import React, { forwardRef } from "react";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../../shared/sharedMethod";

const SaleReportSummaryReceipt = forwardRef(
    (
        {
            totals = {},
            currency,
            dateRange,
            printedAt,
            allConfigData,
        },
        ref
    ) => {
        const formatCurrency = (value) =>
            currencySymbolHandling(allConfigData, currency, value || 0);

        const formatNumber = (value) => {
            const parsed = Number(value || 0);
            if (!Number.isFinite(parsed)) {
                return "0";
            }

            return parsed.toLocaleString();
        };

        const lines = [
            {
                key: "totalSalesGross",
                label: getFormattedMessage("sale-report.summary.total-sales"),
                formatter: formatCurrency,
            },
            {
                key: "totalRefunds",
                label: getFormattedMessage("sale-report.summary.total-refunds"),
                formatter: formatCurrency,
            },
            {
                key: "netSales",
                label: getFormattedMessage("sale-report.summary.net-sales"),
                formatter: formatCurrency,
            },
            {
                key: "totalPayments",
                label: getFormattedMessage("sale-report.summary.total-payments"),
                formatter: formatCurrency,
            },
            {
                key: "totalReceived",
                label: getFormattedMessage("sale-report.summary.total-received"),
                formatter: formatCurrency,
            },
            {
                key: "totalDue",
                label: getFormattedMessage("sale-report.summary.total-due"),
                formatter: formatCurrency,
            },
            {
                key: "totalDiscount",
                label: getFormattedMessage("sale-report.summary.total-discount"),
                formatter: formatCurrency,
            },
            {
                key: "totalTax",
                label: getFormattedMessage("sale-report.summary.total-tax"),
                formatter: formatCurrency,
            },
            {
                key: "totalShipping",
                label: getFormattedMessage("sale-report.summary.total-shipping"),
                formatter: formatCurrency,
            },
            {
                key: "orderCount",
                label: getFormattedMessage("sale-report.summary.order-count"),
                formatter: formatNumber,
            },
            {
                key: "completedCount",
                label: getFormattedMessage(
                    "sale-report.summary.completed-count"
                ),
                formatter: formatNumber,
            },
            {
                key: "pendingCount",
                label: getFormattedMessage("sale-report.summary.pending-count"),
                formatter: formatNumber,
            },
            {
                key: "orderedCount",
                label: getFormattedMessage("sale-report.summary.ordered-count"),
                formatter: formatNumber,
            },
            {
                key: "returnCount",
                label: getFormattedMessage("sale-report.summary.return-count"),
                formatter: formatNumber,
            },
        ];

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
                    {getFormattedMessage("sale-report.summary.print-title")}
                </h4>
                <div style={{ marginBottom: "8px" }}>
                    <div>
                        {getFormattedMessage("sale-report.receipt.date-range")}: {dateRange}
                    </div>
                    {printedAt ? (
                        <div>
                            {getFormattedMessage(
                                "sale-report.receipt.printed-at"
                            )}: {printedAt}
                        </div>
                    ) : null}
                </div>
                <div
                    style={{
                        borderTop: "1px dashed #000",
                        borderBottom: "1px dashed #000",
                        padding: "8px 0",
                        marginBottom: "8px",
                    }}
                >
                    {lines.map(({ key, label, formatter }) => (
                        <div
                            key={key}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "4px",
                            }}
                        >
                            <span>{label}</span>
                            <span>{formatter(totals?.[key])}</span>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: "center" }}>
                    {getFormattedMessage("sale-report.receipt.footer-thanks")}
                </div>
            </div>
        );
    }
);

export default SaleReportSummaryReceipt;
