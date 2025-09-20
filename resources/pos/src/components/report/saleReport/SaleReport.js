import React, { useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { fetchSales } from "../../../store/action/salesAction";
import { totalSaleReportExcel } from "../../../store/action/totalSaleReportExcel";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import moment from "moment";
import { Button } from "react-bootstrap-v5";
import { fetchUsers } from "../../../store/action/userAction";
import { fetchAllCustomer } from "../../../store/action/customerAction";
import { useReactToPrint } from "react-to-print";
import SaleReportReceipt from "./SaleReportReceipt";
import SaleReportSummaryReceipt from "./SaleReportSummaryReceipt";

const SaleReport = (props) => {
    const {
        isLoading,
        totalRecord,
        fetchSales,
        sales,
        frontSetting,
        dates,
        totalSaleReportExcel,
        allConfigData,
        fetchUsers,
        fetchAllCustomer,
        users,
        customers,
    } = props;
    const allLabelText = placeholderText("unit.filter.all.label");
    const defaultDateRangeLabel = placeholderText(
        "sale-report.receipt.date-range.default"
    );
    const [isWarehouseValue, setIsWarehouseValue] = useState(false);
    const [selectedCashier, setSelectedCashier] = useState({
        value: "0",
        label: allLabelText,
    });
    const [selectedCustomer, setSelectedCustomer] = useState({
        value: "0",
        label: allLabelText,
    });
    const receiptRef = useRef();
    const pendingPrintRef = useRef(null);
    const isCustomPrintingRef = useRef(false);
    const summaryReceiptRef = useRef();
    const summaryPendingPrintRef = useRef(null);
    const isSummaryCustomPrintingRef = useRef(false);
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    useEffect(() => {
        fetchUsers({}, true, "?page[size]=0&returnAll=true");
    }, [fetchUsers]);

    useEffect(() => {
        fetchAllCustomer();
    }, [fetchAllCustomer]);

    const cashierOptions = useMemo(() => {
        if (!users) {
            return [];
        }

        return users.map((user) => ({
            value: user.id,
            label: `${user.attributes?.first_name || ""} ${
                user.attributes?.last_name || ""
            }`.trim() || user.attributes?.email,
        }));
    }, [users]);

    const activeCashierId =
        selectedCashier && selectedCashier.value !== "0"
            ? selectedCashier.value
            : null;

    const customerOptions = useMemo(() => {
        if (!customers) {
            return [];
        }

        return customers.map((customer) => ({
            value: customer.id,
            label: customer.attributes?.name || customer.attributes?.email,
        }));
    }, [customers]);

    const activeCustomerId =
        selectedCustomer && selectedCustomer.value !== "0"
            ? selectedCustomer.value
            : null;

    const extraFilters = useMemo(() => {
        const filters = {};
        if (activeCashierId) {
            filters.user_id = activeCashierId;
        }
        if (activeCustomerId) {
            filters.customer_id = activeCustomerId;
        }

        return filters;
    }, [activeCashierId, activeCustomerId]);

    useEffect(() => {
        if (isWarehouseValue === true) {
            totalSaleReportExcel(dates, setIsWarehouseValue, extraFilters);
        }
    }, [isWarehouseValue, extraFilters, dates, totalSaleReportExcel]);

    const dateRangeLabel = useMemo(() => {
        if (dates?.start_date && dates?.end_date) {
            return `${moment(dates.start_date).format("DD/MM/YYYY")} - ${moment(
                dates.end_date
            ).format("DD/MM/YYYY")}`;
        }

        return defaultDateRangeLabel;
    }, [dates, defaultDateRangeLabel]);

    const baseReceiptData = useMemo(
        () => ({
            sales,
            currency: currencySymbol,
            cashierName: activeCashierId ? selectedCashier?.label : allLabelText,
            customerName: activeCustomerId ? selectedCustomer?.label : null,
            dateRange: dateRangeLabel,
        }),
        [
            sales,
            currencySymbol,
            activeCashierId,
            selectedCashier,
            activeCustomerId,
            selectedCustomer,
            dateRangeLabel,
            allLabelText,
        ]
    );

    const [printBundle, setPrintBundle] = useState(() => ({
        ...baseReceiptData,
        printedAt: moment().format("LLL"),
    }));

    const parseAmount = (value) => {
        const numeric = parseFloat(value);

        return Number.isFinite(numeric) ? numeric : 0;
    };

    const saleSummary = useMemo(() => {
        const summary = {
            totalSalesGross: 0,
            totalRefunds: 0,
            netSales: 0,
            totalPayments: 0,
            totalReceived: 0,
            totalDue: 0,
            totalDiscount: 0,
            totalTax: 0,
            totalShipping: 0,
            orderCount: 0,
            completedCount: 0,
            pendingCount: 0,
            orderedCount: 0,
            returnCount: 0,
        };

        if (!Array.isArray(sales) || sales.length === 0) {
            return summary;
        }

        sales.forEach((sale) => {
            const attributes = sale?.attributes ?? sale ?? {};
            const isReturn = Number(attributes?.is_return) === 1;
            const status = Number(attributes?.status);
            const grandTotal = Math.max(parseAmount(attributes?.grand_total), 0);
            const paidAmount = parseAmount(attributes?.paid_amount);
            const receivedAmount = parseAmount(attributes?.received_amount);
            const dueAmount = Math.max(parseAmount(attributes?.due_amount), 0);
            const discount = parseAmount(attributes?.discount);
            const taxAmount = parseAmount(attributes?.tax_amount);
            const shipping = parseAmount(attributes?.shipping);

            summary.orderCount += 1;
            summary.totalPayments += paidAmount;
            summary.totalReceived += receivedAmount;
            summary.totalDue += dueAmount;
            summary.totalDiscount += discount;
            summary.totalTax += taxAmount;
            summary.totalShipping += shipping;

            if (status === 1) {
                summary.completedCount += 1;
            } else if (status === 2) {
                summary.pendingCount += 1;
            } else if (status === 3) {
                summary.orderedCount += 1;
            }

            if (isReturn) {
                summary.returnCount += 1;
                summary.totalRefunds += grandTotal;
            } else {
                summary.totalSalesGross += grandTotal;
            }
        });

        summary.netSales = summary.totalSalesGross - summary.totalRefunds;

        return summary;
    }, [sales]);

    const summaryPrintData = useMemo(
        () => ({
            totals: saleSummary,
            currency: currencySymbol,
            dateRange: dateRangeLabel,
        }),
        [saleSummary, currencySymbol, dateRangeLabel]
    );

    const [summaryPrintBundle, setSummaryPrintBundle] = useState(() => ({
        ...summaryPrintData,
        printedAt: moment().format("LLL"),
    }));

    useEffect(() => {
        if (!isCustomPrintingRef.current) {
            setPrintBundle((prev) => {
                const next = {
                    ...baseReceiptData,
                    printedAt: prev.printedAt,
                };

                const isSame =
                    prev.printedAt === next.printedAt &&
                    prev.currency === next.currency &&
                    prev.cashierName === next.cashierName &&
                    prev.customerName === next.customerName &&
                    prev.dateRange === next.dateRange &&
                    prev.sales === next.sales;

                return isSame ? prev : next;
            });
        }
    }, [baseReceiptData]);

    useEffect(() => {
        if (!isSummaryCustomPrintingRef.current) {
            setSummaryPrintBundle((prev) => ({
                ...summaryPrintData,
                printedAt: prev.printedAt,
            }));
        }
    }, [summaryPrintData]);

    const handleReactPrint = useReactToPrint({
        content: () => receiptRef.current,
        onBeforeGetContent: () =>
            new Promise((resolve) => {
                if (pendingPrintRef.current) {
                    setPrintBundle(pendingPrintRef.current);
                    pendingPrintRef.current = null;
                    setTimeout(resolve, 0);
                } else {
                    resolve();
                }
            }),
        onAfterPrint: () => {
            isCustomPrintingRef.current = false;
            setPrintBundle({
                ...baseReceiptData,
                printedAt: moment().format("LLL"),
            });
        },
    });

    const triggerPrint = (bundle) => {
        isCustomPrintingRef.current = true;
        pendingPrintRef.current = bundle;
        handleReactPrint();
    };

    const handleSummaryReactPrint = useReactToPrint({
        content: () => summaryReceiptRef.current,
        onBeforeGetContent: () =>
            new Promise((resolve) => {
                if (summaryPendingPrintRef.current) {
                    setSummaryPrintBundle(summaryPendingPrintRef.current);
                    summaryPendingPrintRef.current = null;
                    setTimeout(resolve, 0);
                } else {
                    resolve();
                }
            }),
        onAfterPrint: () => {
            isSummaryCustomPrintingRef.current = false;
            setSummaryPrintBundle({
                ...summaryPrintData,
                printedAt: moment().format("LLL"),
            });
        },
    });

    const triggerSummaryPrint = (bundle) => {
        isSummaryCustomPrintingRef.current = true;
        summaryPendingPrintRef.current = bundle;
        handleSummaryReactPrint();
    };

    const handlePrintAll = () => {
        triggerPrint({
            ...baseReceiptData,
            printedAt: moment().format("LLL"),
        });
    };

    const handlePrintSummary = () => {
        triggerSummaryPrint({
            ...summaryPrintData,
            printedAt: moment().format("LLL"),
        });
    };

    const handlePrintSingle = (saleId) => {
        const saleRecord = sales.find((sale) => sale.id === saleId);
        if (!saleRecord) {
            return;
        }

        const saleDate = getFormattedDate(
            saleRecord.attributes?.date,
            allConfigData
        );
        const saleTime = saleRecord.attributes?.created_at
            ? moment(saleRecord.attributes.created_at).format("LT")
            : "";

        const singleDateRange = saleDate
            ? saleTime
                ? `${saleDate} (${saleTime})`
                : saleDate
            : baseReceiptData.dateRange;

        triggerPrint({
            ...baseReceiptData,
            sales: [saleRecord],
            cashierName:
                saleRecord.attributes?.user_name || baseReceiptData.cashierName,
            customerName:
                saleRecord.attributes?.customer_name ??
                baseReceiptData.customerName,
            dateRange: singleDateRange,
            printedAt: moment().format("LLL"),
        });
    };

    const itemsValue =
        currencySymbol &&
        sales.length >= 0 &&
        sales.map((sale) => ({
            date: getFormattedDate(sale.attributes.date, allConfigData),
            time: moment(sale.attributes.created_at).format("LT"),
            reference_code: sale.attributes.reference_code,
            customer_name: sale.attributes.customer_name,
            warehouse_name: sale.attributes.warehouse_name,
            user_name: sale.attributes.user_name,
            status: sale.attributes.status,
            payment_status: sale.attributes.payment_status,
            grand_total: sale.attributes.grand_total,
            paid_amount: sale.attributes.paid_amount
                ? sale.attributes.paid_amount
                : (0.0).toFixed(2),
            currency: currencySymbol,
            sortable_date: sale.attributes.created_at,
            id: sale.id,
        }));

    const summaryRow = useMemo(
        () => ({
            id: 'sales-summary-row',
            isSummary: true,
            reference_code: 'Total',
            date: '',
            time: '',
            user_name: '',
            customer_name: '',
            warehouse_name: '',
            status: '',
            payment_status: '',
            grand_total: saleSummary.totalSalesGross,
            paid_amount: saleSummary.totalPayments,
            currency: currencySymbol,
            sortable_date: '',
        }),
        [saleSummary, currencySymbol]
    );

    const itemsWithSummary = useMemo(() => {
        if (!itemsValue || itemsValue.length === 0) {
            return itemsValue;
        }

        return [...itemsValue, summaryRow];
    }, [itemsValue, summaryRow]);

    const sortSummaryLast = (selector) => (rowA, rowB) => {
        const aSummary = rowA?.isSummary;
        const bSummary = rowB?.isSummary;
        if (aSummary && !bSummary) {
            return 1;
        }
        if (!aSummary && bSummary) {
            return -1;
        }
        if (aSummary && bSummary) {
            return 0;
        }

        const aValue = selector(rowA);
        const bValue = selector(rowB);

        if (aValue > bValue) {
            return 1;
        }
        if (aValue < bValue) {
            return -1;
        }

        return 0;
    };

    const summaryRowStyles = useMemo(
        () => [
            {
                when: (row) => row?.isSummary,
                style: {
                    fontWeight: 600,
                },
            },
        ],
        []
    );

    const columns = [
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: true,
            sortFunction: sortSummaryLast((row) =>
                row?.sortable_date ? new Date(row.sortable_date).getTime() : 0
            ),
            cell: (row) => {
                if (row.isSummary) {
                    return <span className="fw-semibold">{' '}</span>;
                }
                return (
                    <span className="badge bg-light-primary">
                        <div className="mb-1">{row.time}</div>
                        <div>{row.date}</div>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("globally.detail.reference"),
            sortField: "reference_code",
            sortable: false,
            cell: (row) => {
                if (row.isSummary) {
                    return (
                        <span className="fw-semibold">
                            {getFormattedMessage('react-data-table.total-row.label')}
                        </span>
                    );
                }
                return (
                    <span className="badge bg-light-danger">
                        <span>{row.reference_code}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("customer.title"),
            selector: (row) => row.customer_name,
            sortField: "customer_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            sortField: "status",
            sortable: false,
            cell: (row) => {
                if (row.isSummary) {
                    return <span className="fw-semibold">{' '}</span>;
                }
                return (
                    (row.status === 1 && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.complated.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status === 2 && (
                        <span className="badge bg-light-primary">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.pending.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status === 3 && (
                        <span className="badge bg-light-warning">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.ordered.label"
                                )}
                            </span>
                        </span>
                    ))
                );
            },
        },
        {
            name: getFormattedMessage("sale-report.column.cashier"),
            selector: (row) => row.user_name,
            sortField: "user_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.detail.grand.total"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.grand_total
                ),
            sortField: "grand_total",
            sortable: true,
            sortFunction: sortSummaryLast((row) => parseAmount(row.grand_total)),
            cell: (row) => {
                const value = currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.grand_total
                );

                return row.isSummary ? (
                    <span className="fw-semibold">{value}</span>
                ) : (
                    value
                );
            },
        },
        {
            name: getFormattedMessage("globally.detail.paid"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.paid_amount
                ),
            sortField: "paid_amount",
            sortable: true,
            sortFunction: sortSummaryLast((row) => parseAmount(row.paid_amount)),
            cell: (row) => {
                const value = currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.paid_amount
                );

                return row.isSummary ? (
                    <span className="fw-semibold">{value}</span>
                ) : (
                    value
                );
            },
        },
        {
            name: getFormattedMessage(
                "globally.detail.payment.status"
            ),
            sortField: "payment_status",
            sortable: false,
            cell: (row) => {
                if (row.isSummary) {
                    return <span className="fw-semibold">{' '}</span>;
                }
                return (
                    (row.payment_status === 1 && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "globally.detail.paid"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.payment_status === 2 && (
                        <span className="badge bg-light-danger">
                            <span>
                                {getFormattedMessage(
                                    "payment-status.filter.unpaid.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.payment_status === 3 && (
                        <span className="badge bg-light-warning">
                            <span>
                                {getFormattedMessage(
                                    "payment-status.filter.partial.label"
                                )}
                            </span>
                        </span>
                    ))
                );
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) => (
                row.isSummary ? null : (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePrintSingle(row.id)}
                        disabled={!row?.id}
                    >
                        {getFormattedMessage("sale-report.print.single.button")}
                    </Button>
                )
            ),
        },
    ];

    const onChange = (filter) => {
        fetchSales(filter, true);
    };

    const onExcelClick = () => {
        setIsWarehouseValue(true);
    };

    const handleCashierFilter = (option) => {
        if (!option || option.value === "0") {
            setSelectedCashier({
                value: "0",
                label: allLabelText,
            });
        } else {
            setSelectedCashier(option);
        }
    };

    const handleCustomerFilter = (option) => {
        if (!option || option.value === "0") {
            setSelectedCustomer({
                value: "0",
                label: allLabelText,
            });
        } else {
            setSelectedCustomer(option);
        }
    };
    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("sale.reports.title")} />
            <div className="d-flex justify-content-end gap-2 mb-3">
                <Button
                    variant="outline-primary"
                    className="btn btn-outline-primary"
                    onClick={handlePrintSummary}
                    disabled={!sales || sales.length === 0}
                >
                    {getFormattedMessage("sale-report.print-summary.button")}
                </Button>
                <Button
                    variant="primary"
                    className="btn btn-primary"
                    onClick={handlePrintAll}
                    disabled={!sales || sales.length === 0}
                >
                    {getFormattedMessage("sale-report.print-receipt.button")}
                </Button>
            </div>
            <ReactDataTable
                columns={columns}
                items={itemsWithSummary}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                isShowDateRangeField
                isEXCEL={itemsValue && itemsValue.length > 0}
                isShowFilterField
                isStatus
                isPaymentStatus
                onExcelClick={onExcelClick}
                extraFilters={extraFilters}
                isCashierFilter={true}
                cashierOptions={cashierOptions}
                cashierValue={selectedCashier}
                onCashierChange={handleCashierFilter}
                cashierLabel={getFormattedMessage("sale-report.input.cashier.label")}
                isCustomerFilter={true}
                customerOptions={customerOptions}
                customerValue={selectedCustomer}
                onCustomerChange={handleCustomerFilter}
                customerLabel={getFormattedMessage("sale-report.input.customer.label")}
                conditionalRowStyles={summaryRowStyles}
            />
            <div style={{ display: "none" }}>
                <SaleReportReceipt
                    ref={receiptRef}
                    sales={printBundle.sales}
                    currency={printBundle.currency}
                    cashierName={printBundle.cashierName}
                    customerName={printBundle.customerName}
                    dateRange={printBundle.dateRange}
                    printedAt={printBundle.printedAt}
                    allConfigData={allConfigData}
                />
                <SaleReportSummaryReceipt
                    ref={summaryReceiptRef}
                    totals={summaryPrintBundle.totals}
                    currency={summaryPrintBundle.currency}
                    dateRange={summaryPrintBundle.dateRange}
                    printedAt={summaryPrintBundle.printedAt}
                    allConfigData={allConfigData}
                />
            </div>
        </MasterLayout>
    );
};
const mapStateToProps = (state) => {
    const {
        sales,
        frontSetting,
        isLoading,
        totalRecord,
        dates,
        allConfigData,
        users,
        customers,
    } = state;
    return {
        sales,
        frontSetting,
        isLoading,
        totalRecord,
        dates,
        allConfigData,
        users,
        customers,
    };
};

export default connect(mapStateToProps, {
    fetchSales,
    totalSaleReportExcel,
    fetchUsers,
    fetchAllCustomer,
})(SaleReport);
