import React, { useState, useMemo, useEffect } from "react";
import { connect } from "react-redux";
import MasterLayout from "../../MasterLayout";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import DeleteDigitalProduct from "./DeleteDigitalProduct";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    getFormattedMessage,
    getPermission,
    placeholderText,
    currencySymbolHandling,
} from "../../../shared/sharedMethod";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { Permissions } from "../../../constants";
import { Badge } from "react-bootstrap";
import {
    fetchDigitalProducts,
    deleteDigitalProduct,
} from "../../../store/action/digitalProductAction";

const DigitalProducts = (props) => {
    const {
        digitalProducts,
        totalRecord,
        isLoading,
        allConfigData,
        frontSetting,
        isCallFetchDataApi,
        fetchDigitalProducts,
        deleteDigitalProduct,
    } = props;

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);

    const currencySymbol = frontSetting?.value?.currency_symbol || "Rp";

    const productList = useMemo(
        () => (Array.isArray(digitalProducts) ? digitalProducts : []),
        [digitalProducts]
    );

    useEffect(() => {
        fetchDigitalProducts({}, true);
    }, [fetchDigitalProducts]);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const itemsValue = useMemo(() => {
        if (!productList.length) {
            return [];
        }

        return productList.map((product) => ({
            name: product.name || '',
            code: product.code || '',
            category: product.category || '',
            cost_price: parseFloat(product.cost_price || 0),
            sell_price: parseFloat(product.sell_price || 0),
            margin: parseFloat(product.margin || 0),
            is_active: product.is_active !== undefined ? product.is_active : false,
            id: product.id || '',
        }));
    }, [digitalProducts]);

    const onChange = (filter) => {
        // Dispatch action untuk fetch digital products dengan filter
        // digitalProductsAction(filter, true);
    };

    const goToEdit = (item) => {
        const id = item.id;
        window.location.href = "#/user/digital/digital-products/edit/" + id;
    };

    const goToCreate = () => {
        window.location.href = "#/user/digital/digital-products/create";
    };

    const onDelete = (item) => {
        const id = item?.id || item?.attributes?.id;
        if (!id) {
            return;
        }
        deleteDigitalProduct(id);
        setDeleteModel(false);
        setIsDelete(null);
    };

    const formatCurrency = (amount) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            amount
        );
    };

    const getCategoryBadgeColor = (category) => {
        const colors = {
            'pulsa': 'bg-primary',
            'paket_data': 'bg-success',
            'voucher': 'bg-warning',
            'token': 'bg-info',
            'default': 'bg-secondary'
        };
        return colors[category] || colors.default;
    };

    const columns = [
        {
            name: "Nama Produk",
            selector: (row) => row.name,
            sortField: "name",
            sortable: true,
            cell: (row) => (
                <div>
                    <strong>{row.name}</strong>
                    <br />
                    <small className="text-muted">{row.code}</small>
                </div>
            ),
        },
        {
            name: "Kategori",
            selector: (row) => row.category,
            sortField: "category",
            sortable: true,
            cell: (row) => (
                <Badge className={getCategoryBadgeColor(row.category)}>
                    {row.category.replace('_', ' ').toUpperCase()}
                </Badge>
            ),
        },
        {
            name: "Harga Modal",
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
            name: "Harga Jual",
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
            name: "Margin",
            selector: (row) => row.margin,
            sortField: "margin",
            sortable: false,
            cell: (row) => (
                <span className="text-primary fw-bold">
                    {formatCurrency(row.margin)}
                </span>
            ),
        },
        {
            name: "Status",
            selector: (row) => row.is_active,
            sortField: "is_active",
            sortable: false,
            cell: (row) => (
                <Badge bg={row.is_active ? "success" : "danger"}>
                    {row.is_active
                        ? "Aktif"
                        : "Tidak Aktif"}
                </Badge>
            ),
        },
        {
            name: "Aksi",
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) => (
                <ActionButton
                    item={row}
                    goToEditProduct={goToEdit}
                    isEditMode={getPermission(
                        allConfigData?.permissions,
                        Permissions.EDIT_DIGITAL_PRODUCTS
                    )}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(
                        allConfigData?.permissions,
                        Permissions.DELETE_DIGITAL_PRODUCTS
                    )}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title="Produk Digital" />

            {/* Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                            <div className="card border-primary">
                                <div className="card-body text-center">
                                    <i className="bi bi-boxes fs-1 text-primary mb-2"></i>
                                    <h4 className="mb-0">
                                        {productList.length}
                                    </h4>
                                    <small className="text-muted">
                                        Total Produk
                                    </small>
                                </div>
                    </div>
                </div>

                <div className="col-md-3">
                            <div className="card border-success">
                                <div className="card-body text-center">
                                    <i className="bi bi-check-circle fs-1 text-success mb-2"></i>
                                    <h4 className="mb-0">
                                        {
                                            productList.filter(
                                                (p) => p.is_active
                                            ).length
                                        }
                                    </h4>
                                    <small className="text-muted">
                                        Produk Aktif
                                    </small>
                                </div>
                    </div>
                </div>

                <div className="col-md-3">
                            <div className="card border-info">
                                <div className="card-body text-center">
                                    <i className="bi bi-tags fs-1 text-info mb-2"></i>
                                    <h4 className="mb-0">
                                        {
                                            new Set(
                                                productList.map(
                                                    (p) => p.category
                                                )
                                            ).size
                                        }
                                    </h4>
                                    <small className="text-muted">
                                        Kategori
                                    </small>
                                </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-warning">
                        <div className="card-body text-center">
                                    <i className="bi bi-graph-up fs-1 text-warning mb-2"></i>
                                    <h4 className="mb-0">
                                        {formatCurrency(
                                            productList.reduce(
                                                (total, product) =>
                                                    total +
                                                    parseFloat(
                                                        product.margin || 0
                                                    ),
                                                0
                                            )
                                        )}
                                    </h4>
                                    <small className="text-muted">
                                        Total Margin
                                    </small>
                                </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <ReactDataTable
                                columns={columns}
                                items={itemsValue || []}
                                onChange={onChange}
                                isLoading={isLoading}
                                totalRows={totalRecord}
                                isCallFetchDataApi={isCallFetchDataApi}
                                AddButton={
                                    getPermission(
                                        allConfigData?.permissions,
                                        Permissions.CREATE_DIGITAL_PRODUCTS
                                    ) && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={goToCreate}
                                        >
                                            Tambah Produk
                                        </button>
                                    )
                                }
                            />
                            <DeleteDigitalProduct
                                onClickDeleteModel={onClickDeleteModel}
                                deleteModel={deleteModel}
                                onDelete={onDelete}
                                digitalProduct={isDelete}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        digitalProducts: digitalProductsState = {},
        allConfigData,
        frontSetting,
        isCallFetchDataApi,
    } = state;

    return {
        digitalProducts: digitalProductsState.digitalProducts || [],
        totalRecord: digitalProductsState.totalRecord || 0,
        isLoading: digitalProductsState.isLoading || false,
        allConfigData,
        frontSetting,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, {
    fetchDigitalProducts,
    deleteDigitalProduct,
})(DigitalProducts);
