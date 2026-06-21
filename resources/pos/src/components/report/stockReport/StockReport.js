import React, { useEffect, useMemo, useState, useRef } from "react";
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
        grandTotalAsset,
        filteredTotalAsset,
    } = props;
    const [warehouseValue, setWarehouseValue] = useState({
        label: "All",
        value: frontSetting?.value?.default_warehouse,
    });
    const [isWarehouseValue, setIsWarehouseValue] = useState(false);
    const [activeWarehouseId, setActiveWarehouseId] = useState(null);
    const prevWarehouseRef = useRef(null);
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;
    const array = warehouses && warehouses;
    const selectWarehouseArray =
        frontSetting && array
            ? array.filter(
                  (item) => item.id === Number(frontSetting?.value?.default_warehouse)
              )
            : [];

    useEffect(() => {
        fetchAllWarehouses();
    }, []);

    // Combined useEffect: Set warehouse value and fetch initial data
    useEffect(() => {
        if (!warehouses || warehouses.length === 0) return;

        const defaultId = Number(frontSetting?.value?.default_warehouse);
        const defaultWh = warehouses.find((w) => w.id === defaultId);
        const targetWh = defaultWh || warehouses[0];

        if (!targetWh) return;

        const newValue = {
            label: targetWh.attributes.name,
            value: targetWh.id,
        };

        // Only set and fetch if this is a new warehouse
        if (prevWarehouseRef.current !== targetWh.id) {
            prevWarehouseRef.current = targetWh.id;
            setWarehouseValue(newValue);
            setActiveWarehouseId(targetWh.id);
            stockReportAction(targetWh.id);
        }
    }, [warehouses, frontSetting?.value?.default_warehouse]);

    // useEffect for manual warehouse change by user
    useEffect(() => {
        if (!warehouseValue.value) return;
        if (warehouseValue.value === activeWarehouseId) return;

        prevWarehouseRef.current = warehouseValue.value;
        setActiveWarehouseId(warehouseValue.value);
        stockReportAction(warehouseValue.value);
    }, [warehouseValue.value]);

    useEffect(() => {
        if (isWarehouseValue === true) {
            const warehouseId = warehouseValue.value || frontSetting?.value?.default_warehouse;
            if (warehouseId) {
                totalStockReportExcel(warehouseId, {}, true, setIsWarehouseValue);
            } else {
                setIsWarehouseValue(false);
            }
        }
    }, [isWarehouseValue, warehouseValue.value, frontSetting?.value?.default_warehouse, totalStockReportExcel]);

    const itemsValue = useMemo(() => {
        if (!currencySymbol || !Array.isArray(stockReports) || stockReports.length === 0) {
            return [];
        }

        return stockReports.map((stockReport) => ({
            code: stockReport.code || '',
            name: stockReport.name || '',
            product_category_name: stockReport.product_category_name || '',
            product_cost: stockReport.product_cost || 0,
            product_price: stockReport.product_price || 0,
            hpp: stockReport.hpp || stockReport.product_cost || 0,
            product_unit: stockReport.product_unit_name || 'Pcs',
            current_stock: stockReport.qty || 0,
            total_hpp:
                (stockReport.hpp || stockReport.product_cost || 0) *
                (stockReport.qty || 0),
            total_assets:
                stockReport.asset_value || 0,
            id: stockReport.id || '',
            currency: currencySymbol,
            product_image: stockReport.image_url || null,
        }));
    }, [currencySymbol, stockReports]);

    // Fixed: Only use filteredTotalAsset from backend, handle 0 correctly
    const totalAssetsValue = useMemo(() => {
        if (filteredTotalAsset !== undefined && filteredTotalAsset !== null) {
            return filteredTotalAsset;
        }
        return 0;
    }, [filteredTotalAsset]);

    // Grand total asset (non-filter) untuk informasi
    const grandTotalAssetValue = useMemo(() => {
        return grandTotalAsset || 0;
    }, [grandTotalAsset]);

    const summaryRow = useMemo(
        () => ({
            id: 'stock-summary-row',
            isSummary: true,
            code: 'total-asset-summary',
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
            grandTotalAsset: grandTotalAssetValue,
            filteredTotalAsset: totalAssetsValue,
        }),
        [totalAssetsValue, grandTotalAssetValue, currencySymbol]
    );

    const itemsWithSummary = useMemo(() => {
        if (!itemsValue || itemsValue.length === 0) {
            return [];
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
        if (warehouseValue.value) {
            stockReportAction(warehouseValue.value, filter);
        }
    };

    const onWarehouseChange = (obj) => {
        if (obj.value === warehouseValue.value) return;
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
                            {getFormattedMessage('stock-report.summary.total-asset')}
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
            cell: (row) => (row.isSummary ? <span className="fw-semibold">{' '}</span> : row.name),
        },
        {
            name: getFormattedMessage("product.product-details.category.label"),
            selector: (row) => row.product_category_name,
            sortField: "product_category_name",
            sortable: false,
            cell: (row) => (row.isSummary ? <span className="fw-semibold">{' '}</span> : row.product_category_name),
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
                    ? <span className="fw-semibold">{' '}</span>
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
                    ? <span className="fw-semibold">{' '}</span>
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
                    ? <span className="fw-semibold">{' '}</span>
                    : currencySymbolHandling(
                          allConfigData,
                          row.currency,
                          row.hpp
                      ),
        },
        {
            name: getFormattedMessage("stock-report.column.total-asset"),
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
                    return <span className="fw-semibold">{' '}</span>;
                }
                return (
                    <div>
                        <div className="badge bg-light-info me-2">
                            <span>{row.current_stock}</span>
                        </div>

                        <span className="badge bg-light-success me-2">
                            <span>{row.product_unit || 'Pcs'}</span>
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
                {array && array.length > 0 && (
                    <ReactSelect
                        data={array}
                        onChange={onWarehouseChange}
                        defaultValue={
                            selectWarehouseArray && selectWarehouseArray[0]
                                ? {
                                      label: selectWarehouseArray[0].attributes
                                          .name,
                                      value: selectWarehouseArray[0].id,
                                  }
                                : array[0]
                                ? {
                                      label: array[0].attributes.name,
                                      value: array[0].id,
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
                )}
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
        stockReports: stockReports?.data || stockReports || [],
        grandTotalAsset: stockReports?.grandTotalAsset || 0,
        filteredTotalAsset: stockReports?.filteredTotalAsset || 0,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchAllWarehouses,
    totalStockReportExcel,
    stockReportAction,
})(StockReport);