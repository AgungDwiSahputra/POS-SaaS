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
        grandTotalAsset,
        filteredTotalAsset,
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
        frontSetting && array
            ? array.filter(
                  (item) => item.id === Number(frontSetting?.value?.default_warehouse)
              )
            : [];

    useEffect(() => {
        fetchAllWarehouses();
    }, []);

    // Set warehouse value when warehouses loaded and fetch initial data
    useEffect(() => {
        if (warehouses && warehouses.length > 0) {
            // Set warehouse value if not already set
            if (!warehouseValue.value) {
                const defaultWh = warehouses.find(
                    (w) => w.id === Number(frontSetting?.value?.default_warehouse)
                );
                
                if (defaultWh) {
                    setWarehouseValue({
                        label: defaultWh.attributes.name,
                        value: defaultWh.id,
                    });
                } else {
                    // Use first warehouse if no default match
                    setWarehouseValue({
                        label: warehouses[0].attributes.name,
                        value: warehouses[0].id,
                    });
                }
            }
        }
    }, [warehouses, frontSetting?.value?.default_warehouse]);

    // Fetch stock report data when warehouse value changes
    useEffect(() => {
        if (warehouseValue.value) {
            stockReportAction(warehouseValue.value);
        }
    }, [warehouseValue.value, stockReportAction]);

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
                (stockReport.product_price || stockReport.product_cost || 0) *
                (stockReport.qty || 0),
            id: stockReport.id || '',
            currency: currencySymbol,
            // Add image handling with error prevention
            product_image: stockReport.image_url || null,
        }));
    }, [currencySymbol, stockReports]);

    // Gunakan filteredTotalAsset dari props untuk perhitungan yang akurat
    const totalAssetsValue = useMemo(() => {
        // Prioritaskan filteredTotalAsset dari props
        if (filteredTotalAsset !== undefined && filteredTotalAsset !== 0) {
            return filteredTotalAsset;
        }
        
        // Fallback: hitung manual jika data tidak tersedia
        if (!Array.isArray(stockReports) || stockReports.length === 0) {
            return 0;
        }

        return stockReports.reduce((sum, stockReport) => {
            const quantity = parseFloat(stockReport.qty) || 0;
            const productPrice = parseFloat(stockReport.product_price || stockReport.product_cost || 0);

            return sum + quantity * productPrice;
        }, 0);
    }, [stockReports, filteredTotalAsset]);

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
            // Tambahkan info untuk debugging
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
        // Only apply filter if warehouseValue is set
        if (warehouseValue.value) {
            stockReportAction(warehouseValue.value, filter);
        }
    };

    const onWarehouseChange = (obj) => {
        setWarehouseValue(obj);
        // Data will be fetched automatically by the useEffect that watches warehouseValue.value
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
                {/* Info Total Aset */}
                {/* <div className="row mb-3">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">Total Aset (Non-Filter)</h6>
                                <h4 className="text-primary">
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        grandTotalAssetValue
                                    )}
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title">Total Aset (Filter)</h6>
                                <h4 className="text-success">
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        totalAssetsValue
                                    )}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div> */}
                
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
        stockReports: stockReports?.data || stockReports || [], // Handle both old and new structure
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
