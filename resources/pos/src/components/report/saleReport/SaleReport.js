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

    const handlePrintAll = () => {
        triggerPrint({
            ...baseReceiptData,
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
            id: sale.id,
        }));

    const columns = [
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: true,
            cell: (row) => {
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
        },
        {
            name: getFormattedMessage(
                "globally.detail.payment.status"
            ),
            sortField: "payment_status",
            sortable: false,
            cell: (row) => {
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
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePrintSingle(row.id)}
                    disabled={!row?.id}
                >
                    {getFormattedMessage("sale-report.print.single.button")}
                </Button>
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
            <div className="d-flex justify-content-end mb-3">
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
                items={itemsValue}
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
