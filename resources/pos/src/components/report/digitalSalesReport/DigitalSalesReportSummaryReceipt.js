import React, { forwardRef } from "react";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../../shared/sharedMethod";

const DigitalSalesReportSummaryReceipt = forwardRef(
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
            totalCost: {
                label: getFormattedMessage("digital-sale-report.summary.total-cost"),
                formatter: formatCurrency,
            },
            totalPrice: {
                label: getFormattedMessage("digital-sale-report.summary.total-price"),
                formatter: formatCurrency,
            },
            totalMargin: {
                label: getFormattedMessage("digital-sale-report.summary.total-margin"),
                formatter: formatCurrency,
            },
            orderCount: {
                label: getFormattedMessage("digital-sale-report.summary.order-count"),
                formatter: formatNumber,
            },
            completedCount: {
                label: getFormattedMessage(
                    "digital-sale-report.summary.completed-count"
                ),
                formatter: formatNumber,
            },
            pendingCount: {
                label: getFormattedMessage(
                    "digital-sale-report.summary.pending-count"
                ),
                formatter: formatNumber,
            },
            cancelledCount: {
                label: getFormattedMessage(
                    "digital-sale-report.summary.cancelled-count"
                ),
                formatter: formatNumber,
            },
        };

        const sections = [
            {
                title: getFormattedMessage(
                    "digital-sale-report.summary.section.sales"
                ),
                keys: ["totalCost", "totalPrice", "totalMargin"],
            },
            {
                title: getFormattedMessage(
                    "digital-sale-report.summary.section.orders"
                ),
                keys: [
                    "orderCount",
                    "completedCount",
                    "pendingCount",
                    "cancelledCount",
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
                    {getFormattedMessage("digital-sale-report.summary.print-title")}
                </h4>
                <div style={{ marginBottom: "8px" }}>
                    <div>
                        {getFormattedMessage("digital-sale-report.receipt.date-range")}: {dateRange}
                    </div>
                    {printedAt ? (
                        <div>
                            {getFormattedMessage(
                                "digital-sale-report.receipt.printed-at"
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
                    {getFormattedMessage("digital-sale-report.receipt.footer-thanks")}
                </div>
            </div>
        );
    }
);

export default DigitalSalesReportSummaryReceipt;
