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

        const metricDefinitions = {
            totalSalesGross: {
                label: getFormattedMessage("sale-report.summary.total-sales"),
                formatter: formatCurrency,
            },
            totalRefunds: {
                label: getFormattedMessage("sale-report.summary.total-refunds"),
                formatter: formatCurrency,
            },
            netSales: {
                label: getFormattedMessage("sale-report.summary.net-sales"),
                formatter: formatCurrency,
            },
            totalPayments: {
                label: getFormattedMessage("sale-report.summary.total-payments"),
                formatter: formatCurrency,
            },
            totalReceived: {
                label: getFormattedMessage("sale-report.summary.total-received"),
                formatter: formatCurrency,
            },
            totalDue: {
                label: getFormattedMessage("sale-report.summary.total-due"),
                formatter: formatCurrency,
            },
            totalDiscount: {
                label: getFormattedMessage("sale-report.summary.total-discount"),
                formatter: formatCurrency,
            },
            totalTax: {
                label: getFormattedMessage("sale-report.summary.total-tax"),
                formatter: formatCurrency,
            },
            totalShipping: {
                label: getFormattedMessage("sale-report.summary.total-shipping"),
                formatter: formatCurrency,
            },
            orderCount: {
                label: getFormattedMessage("sale-report.summary.order-count"),
                formatter: formatNumber,
            },
            completedCount: {
                label: getFormattedMessage(
                    "sale-report.summary.completed-count"
                ),
                formatter: formatNumber,
            },
            pendingCount: {
                label: getFormattedMessage(
                    "sale-report.summary.pending-count"
                ),
                formatter: formatNumber,
            },
            orderedCount: {
                label: getFormattedMessage(
                    "sale-report.summary.ordered-count"
                ),
                formatter: formatNumber,
            },
            returnCount: {
                label: getFormattedMessage("sale-report.summary.return-count"),
                formatter: formatNumber,
            },
        };

        const sections = [
            {
                title: getFormattedMessage(
                    "sale-report.summary.section.sales"
                ),
                keys: ["totalSalesGross", "totalRefunds", "netSales"],
            },
            {
                title: getFormattedMessage(
                    "sale-report.summary.section.payments"
                ),
                keys: ["totalPayments", "totalReceived", "totalDue"],
            },
            {
                title: getFormattedMessage(
                    "sale-report.summary.section.adjustments"
                ),
                keys: ["totalDiscount", "totalTax", "totalShipping"],
            },
            {
                title: getFormattedMessage(
                    "sale-report.summary.section.orders"
                ),
                keys: [
                    "orderCount",
                    "completedCount",
                    "pendingCount",
                    "orderedCount",
                    "returnCount",
                ],
            },
        ];

        const getMetricValue = (key) => {
            const raw = totals?.[key];
            const parsed = Number(raw);

            if (!Number.isFinite(parsed)) {
                return 0;
            }

            return parsed;
        };

        const renderMetricLine = (key) => {
            const definition = metricDefinitions[key];
            if (!definition) {
                return null;
            }

            const value = getMetricValue(key);

            return (
                <div
                    key={key}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                    }}
                >
                    <span>{definition.label}</span>
                    <span>{definition.formatter(value)}</span>
                </div>
            );
        };

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
                    {sections.map(({ title, keys }) => (
                        <div key={title} style={{ marginBottom: "8px" }}>
                            <div
                                style={{
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    marginBottom: "4px",
                                }}
                            >
                                {title}
                            </div>
                            {keys.map((key) => renderMetricLine(key))}
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
