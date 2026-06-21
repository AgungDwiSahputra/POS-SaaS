import React, { forwardRef } from "react";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../../shared/sharedMethod";

const DigitalSalesReportReceipt = forwardRef(({
    digitalSales = [],
    currency,
    userName,
    providerName,
    dateRange,
    printedAt,
    allConfigData,
}, ref) => {
    const saleList = Array.isArray(digitalSales) ? digitalSales : [];

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

    const totalCost = saleList.reduce(
        (sum, sale) => sum + parseAmount(sale, "cost"),
        0
    );
    const totalPrice = saleList.reduce(
        (sum, sale) => sum + parseAmount(sale, "price"),
        0
    );
    const totalMargin = saleList.reduce(
        (sum, sale) => sum + parseAmount(sale, "margin"),
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
                {getFormattedMessage("digital-sale-report.receipt.title")}
            </h4>
            <div style={{ marginBottom: "8px" }}>
                <div>
                    {getFormattedMessage("digital-sale-report.receipt.user")}: {userName || getFormattedMessage("unit.filter.all.label")}
                </div>
                {providerName ? (
                    <div>
                        {getFormattedMessage("digital-sale-report.receipt.provider")}: {providerName}
                    </div>
                ) : null}
                <div>
                    {getFormattedMessage("digital-sale-report.receipt.date-range")}: {dateRange}
                </div>
                {printedAt ? (
                    <div>
                        {getFormattedMessage("digital-sale-report.receipt.printed-at")}: {printedAt}
                    </div>
                ) : null}
                <div>
                    {getFormattedMessage("digital-sale-report.receipt.total-cost")}: {currencySymbolHandling(allConfigData, currency, totalCost)}
                </div>
                <div>
                    {getFormattedMessage("digital-sale-report.receipt.total-price")}: {currencySymbolHandling(allConfigData, currency, totalPrice)}
                </div>
                <div>
                    {getFormattedMessage("digital-sale-report.receipt.total-margin")}: {currencySymbolHandling(allConfigData, currency, totalMargin)}
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
                        const provider = extractAttribute(
                            sale,
                            "provider_name"
                        );
                        const cost = parseAmount(sale, "cost");
                        const price = parseAmount(sale, "price");
                        const margin = parseAmount(sale, "margin");

                        return (
                            <div
                                key={sale?.id || `${referenceCode}-${index}`}
                                style={{ marginBottom: "8px" }}
                            >
                                <div>
                                    {getFormattedMessage(
                                        "digital-sale-report.receipt.reference"
                                    )}: {referenceCode}
                                </div>
                                <div>
                                    {getFormattedMessage(
                                        "digital-sale-report.receipt.provider"
                                    )}: {provider}
                                </div>
                                <div>
                                    {getFormattedMessage(
                                        "digital-sale-report.receipt.cost"
                                    )}: {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        cost
                                    )}
                                </div>
                                <div>
                                    {getFormattedMessage(
                                        "digital-sale-report.receipt.price"
                                    )}: {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        price
                                    )}
                                </div>
                                <div>
                                    {getFormattedMessage(
                                        "digital-sale-report.receipt.margin"
                                    )}: {currencySymbolHandling(
                                        allConfigData,
                                        currency,
                                        margin
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div style={{ textAlign: "center" }}>
                {getFormattedMessage("digital-sale-report.receipt.footer-thanks")}
            </div>
        </div>
    );
});

export default DigitalSalesReportReceipt;
