import React, { useEffect, useMemo, useState } from "react";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { connect } from "react-redux";
import ReactSelect from "../../../shared/select/reactSelect";
import { fetchAllWarehouses } from "../../../store/action/warehouseAction";
import { stockReportAction } from "../../../store/action/stockReportAction";
import { totalStockReportExcel } from "../../../store/action/totalStockReportExcel";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

const StockReport = (props) => {
    const {
        isLoading,
        totalRecord,
        stockReports,
        fetchAllWarehouses,
        totalStockReportExcel,
        frontSetting,
        warehouses,
        stockReportAction,
        allConfigData,
    } = props;
    const [warehouseValue, setWarehouseValue] = useState({
        label: "All",
        value: frontSetting?.value?.default_warehouse,
    });
    const [isWarehouseValue, setIsWarehouseValue] = useState(false);
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;
    const array = warehouses && warehouses;
    const selectWarehouseArray =
        frontSetting &&
        array.filter(
            (item) => item.id === Number(frontSetting?.value?.default_warehouse)
        );

    useEffect(() => {
        stockReportAction(
            warehouseValue.value
                ? warehouseValue.value
                : frontSetting?.value?.default_warehouse
        );
    }, [frontSetting, warehouseValue]);

    useEffect(() => {
        fetchAllWarehouses();
    }, []);

    useEffect(() => {
        if (isWarehouseValue === true) {
            totalStockReportExcel(
                warehouseValue.value
                    ? warehouseValue.value
                    : frontSetting?.value?.default_warehouse,
                setIsWarehouseValue
            );
            setIsWarehouseValue(false);
        }
    }, [isWarehouseValue]);

    const itemsValue =
        currencySymbol &&
        stockReports.length >= 0 &&
        stockReports.map((stockReport) => ({
            code: stockReport.attributes.product.code,
            name: stockReport.attributes.product.name,
            product_category_name: stockReport.attributes.product_category_name,
            product_cost: stockReport.attributes.product.product_cost,
            product_price: stockReport.attributes.product.product_price,
            hpp: stockReport.attributes.product.hpp,
            product_unit: stockReport.attributes.product_unit_name,
            current_stock: stockReport.attributes.quantity,
            total_hpp:
                (stockReport.attributes.product.hpp || 0) *
                (stockReport.attributes.quantity || 0),
            total_assets:
                (stockReport.attributes.product.hpp || 0) *
                (stockReport.attributes.quantity || 0),
            id: stockReport.attributes.product_id,
            currency: currencySymbol,
        }));

    const totalAssetsValue = useMemo(() => {
        if (!Array.isArray(stockReports) || stockReports.length === 0) {
            return 0;
        }

        return stockReports.reduce((sum, stockReport) => {
            const quantity = parseFloat(stockReport.attributes?.quantity) || 0;
            const hpp =
                parseFloat(stockReport.attributes?.product?.hpp) || 0;

            return sum + quantity * hpp;
        }, 0);
    }, [stockReports]);

    const summaryRow = useMemo(
        () => ({
            id: 'stock-summary-row',
            isSummary: true,
            code: 'Total',
            time: '',
            date: '',
            name: '',
            product_category_name: '',
            product_cost: 0,
            product_price: 0,
            hpp: 0,
            total_hpp: totalAssetsValue,
            total_assets: totalAssetsValue,
            current_stock: '',
            product_unit: '',
            currency: currencySymbol,
        }),
        [totalAssetsValue, currencySymbol]
    );

    const itemsWithSummary = useMemo(() => {
        if (!itemsValue || itemsValue.length === 0) {
            return itemsValue;
        }

        return [...itemsValue, summaryRow];
    }, [itemsValue, summaryRow]);

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

    const onChange = (filter) => {
        stockReportAction(
            warehouseValue.value
                ? warehouseValue.value
                : frontSetting?.value?.default_warehouse,
            filter
        );
    };

    const onWarehouseChange = (obj) => {
        setWarehouseValue(obj);
    };

    const onExcelClick = () => {
        setIsWarehouseValue(true);
    };

    const onReportsClick = (item) => {
        const id = item.id;
        window.location.href = "#/user/report/report-detail-stock/" + id;
    };

    const columns = [
        {
            name: getFormattedMessage("globally.code.label"),
            sortField: "code",
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
                        <span>{row.code}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row.name,
            sortField: "name",
            sortable: false,
            cell: (row) => (row.isSummary ? <span className="fw-semibold">-</span> : row.name),
        },
        {
            name: getFormattedMessage("product.product-details.category.label"),
            selector: (row) => row.product_category_name,
            sortField: "product_category_name",
            sortable: false,
            cell: (row) => (row.isSummary ? <span className="fw-semibold">-</span> : row.product_category_name),
        },
        {
            name: getFormattedMessage("product.product-details.cost.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.product_cost
                ),
            sortField: "product_cost",
            sortable: false,
            cell: (row) =>
                row.isSummary
                    ? <span className="fw-semibold">-</span>
                    : currencySymbolHandling(
                          allConfigData,
                          row.currency,
                          row.product_cost
                      ),
        },
        {
            name: getFormattedMessage("price.title"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.product_price
                ),
            sortField: "product_price",
            sortable: false,
            cell: (row) =>
                row.isSummary
                    ? <span className="fw-semibold">-</span>
                    : currencySymbolHandling(
                          allConfigData,
                          row.currency,
                          row.product_price
                      ),
        },
        {
            name: getFormattedMessage("globally.input.hpp.label", "HPP"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.hpp
                ),
            sortField: "hpp",
            sortable: false,
            cell: (row) =>
                row.isSummary
                    ? <span className="fw-semibold">-</span>
                    : currencySymbolHandling(
                          allConfigData,
                          row.currency,
                          row.hpp
                      ),
        },
        {
            name: getFormattedMessage("globally.total.hpp.label", "Total HPP"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_hpp
                ),
            sortField: "total_hpp",
            sortable: false,
            cell: (row) => {
                const value = currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_hpp
                );

                return row.isSummary ? (
                    <span className="fw-semibold">{value}</span>
                ) : (
                    value
                );
            },
        },
        {
            name: getFormattedMessage("current.stock.label"),
            sortField: "current_stock",
            sortable: false,
            cell: (row) => {
                if (row.isSummary) {
                    return <span className="fw-semibold">-</span>;
                }
                return (
                    <div>
                        <div className="badge bg-light-info me-2">
                            <span>{row.current_stock}</span>
                        </div>

                        <span className="badge bg-light-success me-2">
                            <span>{row.product_unit}</span>
                        </span>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "115px",
            cell: (row) => (
                row.isSummary ? null : (
                    <button
                        className="btn btn-sm btn-primary"
                        variant="primary"
                        onClick={() => onReportsClick(row)}
                    >
                        {getFormattedMessage("reports.title")}
                    </button>
                )
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("stock.reports.title")} />
            <div className="mx-auto mb-md-5 col-12 col-md-4">
                {selectWarehouseArray[0] ? (
                    <ReactSelect
                        data={array}
                        onChange={onWarehouseChange}
                        defaultValue={
                            selectWarehouseArray[0]
                                ? {
                                      label: selectWarehouseArray[0].attributes
                                          .name,
                                      value: selectWarehouseArray[0].id,
                                  }
                                : ""
                        }
                        title={getFormattedMessage("warehouse.title")}
                        errors={""}
                        isRequired
                        placeholder={placeholderText(
                            "product.input.warehouse.placeholder.label"
                        )}
                    />
                ) : null}
            </div>
            <div className="pt-md-7">
                <ReactDataTable
                    columns={columns}
                    items={itemsWithSummary}
                    onChange={onChange}
                    isLoading={isLoading}
                    totalRows={totalRecord}
                    isEXCEL={itemsValue && itemsValue.length > 0}
                    onExcelClick={onExcelClick}
                    conditionalRowStyles={summaryRowStyles}
                />
            </div>
        </MasterLayout>
    );
};
const mapStateToProps = (state) => {
    const {
        isLoading,
        totalRecord,
        warehouses,
        frontSetting,
        stockReports,
        allConfigData,
    } = state;
    return {
        isLoading,
        totalRecord,
        warehouses,
        frontSetting,
        stockReports,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchAllWarehouses,
    totalStockReportExcel,
    stockReportAction,
})(StockReport);
