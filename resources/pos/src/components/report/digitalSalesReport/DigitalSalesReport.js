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
import { fetchDigitalSales } from "../../../store/action/digitalSaleAction";
import { totalDigitalSaleReportExcel } from "../../../store/action/totalDigitalSaleReportExcel";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import moment from "moment";
import { Button } from "react-bootstrap-v5";
import { fetchUsers } from "../../../store/action/userAction";
import { fetchProviders } from "../../../store/action/providerAction";
import { useReactToPrint } from "react-to-print";
import DigitalSalesReportReceipt from "./DigitalSalesReportReceipt";
import DigitalSalesReportSummaryReceipt from "./DigitalSalesReportSummaryReceipt";

const DigitalSalesReport = (props) => {
    const {
        isLoading,
        totalRecord,
        fetchDigitalSales,
        digitalSales,
        frontSetting,
        dates,
        totalDigitalSaleReportExcel,
        allConfigData,
        fetchUsers,
        fetchProviders,
        users,
        providers,
    } = props;
    const allLabelText = placeholderText("unit.filter.all.label");
    const defaultDateRangeLabel = placeholderText(
        "digital-sale-report.receipt.date-range.default"
    );
    const [isWarehouseValue, setIsWarehouseValue] = useState(false);
    const [selectedUser, setSelectedUser] = useState({
        value: "0",
        label: allLabelText,
    });
    const [selectedProvider, setSelectedProvider] = useState({
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
        fetchProviders({}, true, "?page[size]=0&returnAll=true");
    }, [fetchProviders]);

    const userOptions = useMemo(() => {
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

    const activeUserId =
        selectedUser && selectedUser.value !== "0"
            ? selectedUser.value
            : null;

    const providerOptions = useMemo(() => {
        if (!providers) {
            return [];
        }

        return providers.map((provider) => ({
            value: provider.id,
            label: provider.attributes?.name || provider.attributes?.email,
        }));
    }, [providers]);

    const activeProviderId =
        selectedProvider && selectedProvider.value !== "0"
            ? selectedProvider.value
            : null;

    const extraFilters = useMemo(() => {
        const filters = {};
        if (activeUserId) {
            filters.user_id = activeUserId;
        }
        if (activeProviderId) {
            filters.provider_id = activeProviderId;
        }

        return filters;
    }, [activeUserId, activeProviderId]);

    useEffect(() => {
        if (isWarehouseValue === true) {
            totalDigitalSaleReportExcel(dates, setIsWarehouseValue, extraFilters);
        }
    }, [isWarehouseValue, extraFilters, dates, totalDigitalSaleReportExcel]);

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
            digitalSales,
            currency: currencySymbol,
            userName: activeUserId ? selectedUser?.label : allLabelText,
            providerName: activeProviderId ? selectedProvider?.label : null,
            dateRange: dateRangeLabel,
        }),
        [
            digitalSales,
            currencySymbol,
            activeUserId,
            selectedUser,
            activeProviderId,
            selectedProvider,
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

    const digitalSaleSummary = useMemo(() => {
        const summary = {
            totalCost: 0,
            totalPrice: 0,
            totalMargin: 0,
            orderCount: 0,
            completedCount: 0,
            pendingCount: 0,
            cancelledCount: 0,
        };

        if (!Array.isArray(digitalSales) || digitalSales.length === 0) {
            return summary;
        }

        digitalSales.forEach((sale) => {
            const attributes = sale?.attributes ?? sale ?? {};
            const status = Number(attributes?.status);
            const cost = parseAmount(attributes?.cost);
            const price = parseAmount(attributes?.price);
            const margin = parseAmount(attributes?.margin);

            summary.orderCount += 1;
            summary.totalCost += cost;
            summary.totalPrice += price;
            summary.totalMargin += margin;

            if (status === 1) {
                summary.completedCount += 1;
            } else if (status === 2) {
                summary.pendingCount += 1;
            } else if (status === 3) {
                summary.cancelledCount += 1;
            }
        });

        return summary;
    }, [digitalSales]);

    const summaryPrintData = useMemo(
        () => ({
            totals: digitalSaleSummary,
            currency: currencySymbol,
            dateRange: dateRangeLabel,
        }),
        [digitalSaleSummary, currencySymbol, dateRangeLabel]
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
                    prev.userName === next.userName &&
                    prev.providerName === next.providerName &&
                    prev.dateRange === next.dateRange &&
                    prev.digitalSales === next.digitalSales;

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

    const handlePrintTotals = () => {
        triggerSummaryPrint({
            ...summaryPrintData,
            printedAt: moment().format("LLL"),
        });
    };

    const handlePrintSingle = (saleId) => {
        const saleRecord = digitalSales.find((sale) => sale.id === saleId);
        if (!saleRecord) {
            return;
        }

        const saleDate = getFormattedDate(
            saleRecord.attributes?.created_at,
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
            digitalSales: [saleRecord],
            userName:
                saleRecord.attributes?.user_name || baseReceiptData.userName,
            providerName:
                saleRecord.attributes?.provider_name ??
                baseReceiptData.providerName,
            dateRange: singleDateRange,
            printedAt: moment().format("LLL"),
        });
    };

    const itemsValue =
        currencySymbol &&
        digitalSales.length >= 0 &&
        digitalSales.map((sale) => {
            const attributes = sale.attributes || {};
            const cost = parseAmount(attributes.cost);
            const price = parseAmount(attributes.price);
            const margin = parseAmount(attributes.margin);

            return {
                date: getFormattedDate(attributes.created_at, allConfigData),
                time: moment(attributes.created_at).format("LT"),
                reference_code: attributes.reference_code,
                provider_name: attributes.provider_name,
                user_name: attributes.user_name,
                status: attributes.status,
                cost: cost,
                price: price,
                margin: margin,
                currency: currencySymbol,
                sortable_date: attributes.created_at,
                id: sale.id,
            };
        });

    const summaryRow = useMemo(
        () => ({
            id: 'digital-sales-summary-row',
            isSummary: true,
            reference_code: 'Total',
            date: '',
            time: '',
            user_name: '',
            provider_name: '',
            status: '',
            cost: digitalSaleSummary.totalCost,
            price: digitalSaleSummary.totalPrice,
            margin: digitalSaleSummary.totalMargin,
            currency: currencySymbol,
            sortable_date: '',
        }),
        [digitalSaleSummary, currencySymbol]
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
            name: getFormattedMessage("digital-sale.provider.label"),
            selector: (row) => row.provider_name,
            sortField: "provider_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("digital-sale.cost.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.cost
                ),
            sortField: "cost",
            sortable: true,
            sortFunction: sortSummaryLast((row) => parseAmount(row.cost)),
            cell: (row) => {
                const value = currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.cost
                );

                return row.isSummary ? (
                    <span className="fw-semibold">{value}</span>
                ) : (
                    value
                );
            },
        },
        {
            name: getFormattedMessage("digital-sale.price.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.price
                ),
            sortField: "price",
            sortable: true,
            sortFunction: sortSummaryLast((row) => parseAmount(row.price)),
            cell: (row) => {
                const value = currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.price
                );

                return row.isSummary ? (
                    <span className="fw-semibold">{value}</span>
                ) : (
                    value
                );
            },
        },
        {
            name: getFormattedMessage("digital-sale.margin.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.margin
                ),
            sortField: "margin",
            sortable: true,
            sortFunction: sortSummaryLast((row) => parseAmount(row.margin)),
            cell: (row) => {
                const value = currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.margin
                );
                const marginClass = row.margin >= 0 ? "text-success" : "text-danger";

                if (row.isSummary) {
                    return <span className={`fw-semibold ${marginClass}`}>{value}</span>;
                }

                return <span className={marginClass}>{value}</span>;
            },
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
                        <span className="badge bg-light-danger">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.cancelled.label"
                                )}
                            </span>
                        </span>
                    ))
                );
            },
        },
        {
            name: getFormattedMessage("digital-sale-report.column.user"),
            selector: (row) => row.user_name,
            sortField: "user_name",
            sortable: false,
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
                        {getFormattedMessage("digital-sale-report.print.single.button")}
                    </Button>
                )
            ),
        },
    ];

    const onChange = (filter) => {
        fetchDigitalSales(filter, true);
    };

    const onExcelClick = () => {
        setIsWarehouseValue(true);
    };

    const handleUserFilter = (option) => {
        if (!option || option.value === "0") {
            setSelectedUser({
                value: "0",
                label: allLabelText,
            });
        } else {
            setSelectedUser(option);
        }
    };

    const handleProviderFilter = (option) => {
        if (!option || option.value === "0") {
            setSelectedProvider({
                value: "0",
                label: allLabelText,
            });
        } else {
            setSelectedProvider(option);
        }
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("digital-sale.reports.title")} />
            <div className="d-flex justify-content-end gap-2 mb-3">
                <Button
                    variant="outline-primary"
                    className="btn btn-outline-primary"
                    onClick={handlePrintTotals}
                    disabled={!digitalSales || digitalSales.length === 0}
                >
                    {getFormattedMessage("digital-sale-report.print-total.button")}
                </Button>
                <Button
                    variant="primary"
                    className="btn btn-primary"
                    onClick={handlePrintAll}
                    disabled={!digitalSales || digitalSales.length === 0}
                >
                    {getFormattedMessage("digital-sale-report.print-receipt.button")}
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
                onExcelClick={onExcelClick}
                extraFilters={extraFilters}
                isUserFilter={true}
                userOptions={userOptions}
                userValue={selectedUser}
                onUserChange={handleUserFilter}
                userLabel={getFormattedMessage("digital-sale-report.input.user.label")}
                isProviderFilter={true}
                providerOptions={providerOptions}
                providerValue={selectedProvider}
                onProviderChange={handleProviderFilter}
                providerLabel={getFormattedMessage("digital-sale-report.input.provider.label")}
                conditionalRowStyles={summaryRowStyles}
            />
            <div style={{ display: "none" }}>
                <DigitalSalesReportReceipt
                    ref={receiptRef}
                    digitalSales={printBundle.digitalSales}
                    currency={printBundle.currency}
                    userName={printBundle.userName}
                    providerName={printBundle.providerName}
                    dateRange={printBundle.dateRange}
                    printedAt={printBundle.printedAt}
                    allConfigData={allConfigData}
                />
                <DigitalSalesReportSummaryReceipt
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
        digitalSales,
        frontSetting,
        isLoading,
        totalRecord,
        dates,
        allConfigData,
        users,
        providers,
    } = state;
    return {
        digitalSales,
        frontSetting,
        isLoading,
        totalRecord,
        dates,
        allConfigData,
        users,
        providers,
    };
};

export default connect(mapStateToProps, {
    fetchDigitalSales,
    totalDigitalSaleReportExcel,
    fetchUsers,
    fetchProviders,
})(DigitalSalesReport);
