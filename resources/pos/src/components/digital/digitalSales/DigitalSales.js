import React, { useMemo, useState, useEffect } from "react";
import { connect } from "react-redux";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    getFormattedMessage,
    getPermission,
    currencySymbolHandling,
} from "../../../shared/sharedMethod";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { Permissions } from "../../../constants";
import { Badge, Button } from "react-bootstrap";
import DeleteDigitalSale from "./DeleteDigitalSale";
import { fetchDigitalSales, deleteDigitalSale } from "../../../store/action/digitalSaleAction";

const extractAttributes = (entity) => {
    if (!entity) {
        return {};
    }

    return entity.attributes ? entity.attributes : entity;
};

const toNumber = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeSaleRecord = (sale) => {
    const base = sale?.attributes ?? sale ?? {};
    const store = base.store ?? null;
    const provider = base.digital_provider ?? null;
    const product = base.digital_product ?? null;

    const storeData = extractAttributes(store);
    const providerData = extractAttributes(provider);
    const productData = extractAttributes(product);

    const costPrice = toNumber(base.cost_price);
    const sellPrice = toNumber(base.sell_price);
    const marginExplicit = base.margin !== undefined ? toNumber(base.margin) : null;

    return {
        id: sale?.id ?? base.id ?? null,
        reference_code: base.reference_code ?? "-",
        date: base.date ?? null,
        store,
        digital_provider: provider,
        digital_product: product,
        store_name: storeData?.name ?? "-",
        provider_name: providerData?.name ?? "-",
        product_name: productData?.name ?? "-",
        customer_name: base.customer_name ?? "-",
        cost_price: costPrice,
        sell_price: sellPrice,
        margin: marginExplicit !== null ? marginExplicit : toNumber(sellPrice - costPrice),
        status: base.status ?? "pending",
        reference: base,
    };
};

const DigitalSales = (props) => {
    const {
        digitalSales,
        totalRecord,
        isLoading,
        allConfigData,
        frontSetting,
        isCallFetchDataApi,
        fetchDigitalSales,
        deleteDigitalSale,
    } = props;

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);

    const currencySymbol = frontSetting?.value?.currency_symbol || "Rp";

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const normalizedSales = useMemo(() => {
        if (!Array.isArray(digitalSales)) {
            return [];
        }

        return digitalSales.map((sale) => normalizeSaleRecord(sale));
    }, [digitalSales]);

    const completedSales = useMemo(
        () => normalizedSales.filter((sale) => sale.status === "completed"),
        [normalizedSales]
    );

    const totalCompletedAmount = useMemo(
        () =>
            completedSales.reduce(
                (total, sale) => total + toNumber(sale.sell_price),
                0
            ),
        [completedSales]
    );

    const totalCompletedMargin = useMemo(
        () =>
            completedSales.reduce(
                (total, sale) => total + toNumber(sale.margin),
                0
            ),
        [completedSales]
    );

    const totalRows = totalRecord || normalizedSales.length;

    useEffect(() => {
        fetchDigitalSales({}, true);
    }, [fetchDigitalSales]);

    const onChange = (filter) => {
        // Dispatch action untuk fetch digital sales dengan filter
        // digitalSalesAction(filter, true);
    };

    const goToEdit = (item) => {
        const id = item?.id ?? item?.reference?.id;
        if (!id) {
            return;
        }
        window.location.href = "#/user/digital/digital-sales/edit/" + id;
    };

    const goToCreate = () => {
        window.location.href = "#/user/digital/digital-sales/create";
    };

    const onDelete = (sale) => {
        const id = sale?.id ?? sale?.reference?.id ?? sale?.reference?.digital_sale_id;
        if (!id) {
            return;
        }
        deleteDigitalSale(id);
        setDeleteModel(false);
        setIsDelete(null);
    };

    const formatCurrency = (amount) => {
        return currencySymbolHandling(allConfigData, currencySymbol, toNumber(amount));
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { variant: 'warning', text: 'Menunggu' },
            'completed': { variant: 'success', text: 'Selesai' },
            'failed': { variant: 'danger', text: 'Gagal' },
            'cancelled': { variant: 'secondary', text: 'Dibatalkan' },
        };

        const normalizedStatus =
            typeof status === "string" ? status.toLowerCase() : "pending";
        const config = statusConfig[normalizedStatus] || statusConfig.pending;
        const label =
            config.text ||
            (typeof status === "string" ? status : statusConfig.pending.text);

        return <Badge bg={config.variant}>{label}</Badge>;
    };

    const columns = [
        {
            name: getFormattedMessage("globally.detail.reference-code"),
            selector: (row) => row.reference_code,
            sortField: "reference_code",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-primary">
                    {row.reference_code}
                </span>
            ),
        },
        {
            name: getFormattedMessage("globally.detail.date"),
            selector: (row) => row.date,
            sortField: "date",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-info">
                    {row.date
                        ? new Date(row.date).toLocaleDateString("id-ID")
                        : "-"}
                </span>
            ),
        },
        {
            name: getFormattedMessage("store.title"),
            selector: (row) => row.store_name,
            sortField: "store_name",
            sortable: true,
        },
        {
            name: getFormattedMessage("digital-provider.title"),
            selector: (row) => row.provider_name,
            sortField: "provider_name",
            sortable: true,
        },
        {
            name: getFormattedMessage("product.title"),
            selector: (row) => row.product_name,
            sortField: "product_name",
            sortable: true,
        },
        {
            name: getFormattedMessage("customer.name"),
            selector: (row) => row.customer_name,
            sortField: "customer_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("product.product-details.cost.label"),
            selector: (row) => row.cost_price,
            sortField: "cost_price",
            sortable: true,
            cell: (row) => (
                <span className="text-danger">
                    {formatCurrency(row.cost_price)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("price.title"),
            selector: (row) => row.sell_price,
            sortField: "sell_price",
            sortable: true,
            cell: (row) => (
                <span className="text-success fw-bold">
                    {formatCurrency(row.sell_price)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("globally.detail.margin"),
            selector: (row) => row.margin,
            sortField: "margin",
            sortable: true,
            cell: (row) => (
                <span className="text-primary fw-bold">
                    {formatCurrency(row.margin)}
                </span>
            ),
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            selector: (row) => row.status,
            sortField: "status",
            sortable: true,
            cell: (row) => getStatusBadge(row.status),
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) => (
                <div className="d-flex">
                    <Button
                        variant="outline-info"
                        size="sm"
                        className="me-2"
                        title="Detail"
                    >
                        <i className="bi bi-eye"></i>
                    </Button>
                    <ActionButton
                        item={row}
                        goToEditProduct={goToEdit}
                        isEditMode={getPermission(
                            allConfigData?.permissions,
                            Permissions.EDIT_DIGITAL_SALES
                        )}
                        onClickDeleteModel={onClickDeleteModel}
                        isDeleteMode={getPermission(
                            allConfigData?.permissions,
                            Permissions.DELETE_DIGITAL_SALES
                        )}
                    />
                </div>
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={getFormattedMessage("digital.sales.title")} />

            {/* Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                            <div className="card border-primary">
                                <div className="card-body text-center">
                                    <i className="bi bi-receipt fs-1 text-primary mb-2"></i>
                                    <h4 className="mb-0">
                                        {normalizedSales.length}
                                    </h4>
                            <small className="text-muted">
                                {getFormattedMessage("digital-sales.total-transactions")}
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                            <div className="card border-success">
                                <div className="card-body text-center">
                                    <i className="bi bi-check-circle fs-1 text-success mb-2"></i>
                                    <h4 className="mb-0">
                                        {completedSales.length}
                                    </h4>
                            <small className="text-muted">
                                {getFormattedMessage("digital-sales.completed-transactions")}
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-info">
                        <div className="card-body text-center">
                            <i className="bi bi-graph-up fs-1 text-info mb-2"></i>
                            <h4 className="mb-0">
                                        {formatCurrency(totalCompletedAmount)}
                            </h4>
                            <small className="text-muted">
                                {getFormattedMessage("digital-sales.total-sales")}
                            </small>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-warning">
                        <div className="card-body text-center">
                            <i className="bi bi-piggy-bank fs-1 text-warning mb-2"></i>
                            <h4 className="mb-0">
                                        {formatCurrency(totalCompletedMargin)}
                            </h4>
                            <small className="text-muted">
                                {getFormattedMessage("digital-sales.total-margin")}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <ReactDataTable
                                columns={columns}
                                items={normalizedSales}
                                onChange={onChange}
                                isLoading={isLoading}
                                totalRows={totalRows}
                                isCallFetchDataApi={isCallFetchDataApi}
                                AddButton={
                                    getPermission(
                                        allConfigData?.permissions,
                                        Permissions.CREATE_DIGITAL_SALES
                                    ) && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={goToCreate}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            {getFormattedMessage("digital-sale.create.title")}
                                        </button>
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
            <DeleteDigitalSale
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={onDelete}
                digitalSale={isDelete}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        digitalSales: digitalSalesState = {},
        allConfigData,
        frontSetting,
        isCallFetchDataApi,
    } = state;

    return {
        digitalSales: digitalSalesState.digitalSales || [],
        totalRecord: digitalSalesState.totalRecord || 0,
        isLoading: digitalSalesState.isLoading || false,
        allConfigData,
        frontSetting,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, {
    fetchDigitalSales,
    deleteDigitalSale,
})(DigitalSales);
