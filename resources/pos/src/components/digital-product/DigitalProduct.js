import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { Button, Image } from "react-bootstrap-v5";
import MasterLayout from "../MasterLayout";
import { fetchDigitalProducts } from "../../store/action/digitalProductAction";
import { fetchAllWarehouses } from "../../store/action/warehouseAction";
import ReactSelect from "../../shared/select/reactSelect";
import ReactDataTable from "../../shared/table/ReactDataTable";
import DeleteMainProduct from "../product/DeleteMainProduct";
import TabTitle from "../../shared/tab-title/TabTitle";
import ProductImageLightBox from "../product/ProductImageLightBox";
import user from "../../assets/images/brand_logo.png";
import {
    getFormattedDate,
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
    getPermission,
} from "../../shared/sharedMethod";
import ActionButton from "../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import ImportProductModel from "../product/ImportProductModel";
import { productExcelAction } from "../../store/action/productExcelAction";
import { Permissions } from "../../constants";

const DigitalProduct = (props) => {
    const {
        fetchDigitalProducts,
        digitalProducts,
        totalRecord,
        isLoading,
        frontSetting,
        productExcelAction,
        productUnitId,
        allConfigData,
        callAPIAfterImport,
        isCallFetchDataApi,
        warehouses,
    } = props;

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [lightBoxImage, setLightBoxImage] = useState([]);

    const [importProduct, setimportProduct] = useState(false);
    const [warehouseValue, setWarehouseValue] = useState(null);
    const handleClose = () => {
        setimportProduct(!importProduct);
    };

    const [isWarehouseValue, setIsWarehouseValue] = useState(false);
    useEffect(() => {
        if (isWarehouseValue === true) {
            productExcelAction(setIsWarehouseValue, true, productUnitId);
        }
    }, [isWarehouseValue]);

    const onExcelClick = () => {
        setIsWarehouseValue(true);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const onChange = (filter) => {
        const merged = { ...filter };
        if (warehouseValue && warehouseValue.value) {
            merged.warehouse_id = warehouseValue.value;
        }
        // Add digital product filter
        fetchDigitalProducts(merged, true);
    };

    useEffect(() => {
        // load warehouses for filter dropdown
        fetchAllWarehouses();
    }, []);

    useEffect(() => {
        // initial fetch with warehouse filter if selected
        const filter = { is_digital: true };
        if (warehouseValue && warehouseValue.value) {
            filter.warehouse_id = warehouseValue.value;
        }
        fetchDigitalProducts(filter, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [warehouseValue]);

    const goToEditProduct = (item) => {
        const id = item.id;
        window.location.href = "#/user/product-digital/edit/" + id;
    };

    const goToProductDetailPage = (ProductId) => {
        window.location.href = "#/user/product-digital/detail/" + ProductId;
    };

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const formattedPrice = (product_price) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            product_price
        );
    };
    const itemsValue =
        currencySymbol &&
        digitalProducts.length >= 0 &&
        digitalProducts.map((product) => {
            // Format price with currency
            const product_price = formattedPrice(product.attributes.price || 0);
            
            // Format cost with currency
            const product_cost = formattedPrice(product.attributes.cost || 0);
            
            return {
                name: product?.attributes.name,
                code: product?.attributes.code,
                date: getFormattedDate(
                    product?.attributes.created_at,
                    allConfigData && allConfigData
                ),
                time: moment(product?.attributes.created_at).format("LT"),
                brand_name: "", // Digital products don't have brands
                product_price: product_price,
                product_cost: product_cost,
                product_cost_raw: product.attributes.cost || 0, // For sorting
                product_unit: "N/A", // Digital products don't have units
                in_stock: "Unlimited", // Digital products have unlimited stock
                images: product?.attributes.image_url,
                id: product.id,
                currency: currencySymbol,
            };
        });

    const columns = [
        {
            name: getFormattedMessage("product.title"),
            sortField: "name",
            sortable: false,
            cell: (row) => {
                const imageUrl = row.images
                    ? row.images.imageUrls && row.images.imageUrls[0]
                    : null;
                return imageUrl ? (
                    <div className="d-flex align-items-center">
                        <Button
                            type="button"
                            className="btn-transparent me-2 d-flex align-items-center justify-content-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(!isOpen);
                                setLightBoxImage(row.images.imageUrls);
                            }}
                        >
                            <Image
                                src={imageUrl}
                                height="50"
                                width="50"
                                alt="Product Image"
                                className="image image-circle image-mini cursor-pointer"
                            />
                        </Button>
                    </div>
                ) : (
                    <div className="d-flex align-items-center">
                        <div className="me-2">
                            <Image
                                src={user}
                                height="50"
                                width="50"
                                alt="Product Image"
                                className="image image-circle image-mini"
                            />
                        </div>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row.name,
            className: "product-name",
            sortField: "name",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.code.label"),
            selector: (row) => (
                <span className="badge bg-light-danger d-flex">
                    <span className="overflow-hidden text-truncate">{row.code}</span>
                </span>
            ),
            sortField: "code",
            sortable: true,
        },
        {
            name: getFormattedMessage("brand.title"),
            selector: (row) => row.brand_name,
            sortField: "brand_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("price.title"),
            selector: (row) => row.product_price,
        },
        {
            name: getFormattedMessage("digital-product.input.cost.label"),
            selector: (row) => row.product_cost,
            sortField: "product_cost_raw",
            sortable: true,
            cell: (row) => (
                <span className="badge bg-light-warning cost-column">
                    <span>{row.product_cost}</span>
                </span>
            ),
            minWidth: "120px",
        },
        {
            name: getFormattedMessage("product.input.product-unit.label"),
            sortField: "product_unit",
            sortable: true,
            cell: (row) => {
                return (
                    row.product_unit && (
                        <span className="badge bg-light-success">
                            <span>{row.product_unit}</span>
                        </span>
                    )
                );
            },
        },
        {
            name: getFormattedMessage("product.product-in-stock.label"),
            selector: (row) => row.in_stock,
            sortField: "in_stock",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{row.time}</div>
                        {row.date}
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "120px",
            cell: (row) => (
                <ActionButton
                    isViewIcon={getPermission(allConfigData?.permissions, Permissions.VIEW_PRODUCT_DIGITALS)}
                    goToDetailScreen={goToProductDetailPage}
                    item={row}
                    goToEditProduct={goToEditProduct}
                    isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_PRODUCT_DIGITALS)}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_PRODUCT_DIGITALS)}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("product-digital.title")} />
            <style jsx>{`
                @media (max-width: 768px) {
                    .rdt_TableCol {
                        min-width: 120px !important;
                    }
                    .cost-column {
                        min-width: 100px !important;
                    }
                }
                @media (max-width: 576px) {
                    .rdt_TableCol {
                        min-width: 80px !important;
                        font-size: 0.8rem !important;
                    }
                    .cost-column {
                        min-width: 80px !important;
                    }
                    .badge {
                        font-size: 0.7rem !important;
                        padding: 0.25rem 0.5rem !important;
                    }
                }
            `}</style>
            <div className="mx-auto mb-md-5 col-12 col-md-4">
                {warehouses && warehouses[0] && (
                    <ReactSelect
                        data={warehouses}
                        onChange={(obj) => setWarehouseValue(obj)}
                        defaultValue={warehouseValue}
                        title={getFormattedMessage("warehouse.title")}
                        errors={""}
                        placeholder={placeholderText(
                            "product.input.warehouse.placeholder.label"
                        )}
                    />
                )}
            </div>
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_PRODUCT_DIGITALS) &&
                {
                    to: "#/user/product-digital/create",
                    buttonValue: getFormattedMessage("product.create.title")
                }
                )}
                isShowFilterField={getPermission(allConfigData?.permissions, Permissions.CREATE_PRODUCT_DIGITALS)}
                isUnitFilter
                title={getFormattedMessage("product.input.product-unit.label")}
                goToImport={handleClose}
                isExportDropdown={true}
                isImportDropdown={true}
                onExcelClick={onExcelClick}
                isProductCategoryFilter
                isBrandFilter
                brandFilterTitle={getFormattedMessage(
                    "brand.title"
                )}
                productCategoryFilterTitle={getFormattedMessage(
                    "product-category.title"
                )}
                callAPIAfterImport={callAPIAfterImport}
                isCallFetchDataApi={isCallFetchDataApi}
            />
            <DeleteMainProduct
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
            {isOpen && lightBoxImage.length !== 0 && (
                <ProductImageLightBox
                    setIsOpen={setIsOpen}
                    isOpen={isOpen}
                    lightBoxImage={lightBoxImage}
                />
            )}
            {importProduct && (
                <ImportProductModel
                    handleClose={handleClose}
                    show={importProduct}
                />
            )}
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        digitalProducts,
        totalRecord,
        isLoading,
        frontSetting,
        productUnitId,
        allConfigData,
        callAPIAfterImport,
        isCallFetchDataApi,
        warehouses,
    } = state;
    return {
        digitalProducts,
        totalRecord,
        isLoading,
        frontSetting,
        productUnitId,
        allConfigData,
        callAPIAfterImport,
        isCallFetchDataApi,
        warehouses,
    };
};

export default connect(mapStateToProps, {
    fetchDigitalProducts,
    productExcelAction,
    fetchAllWarehouses,
})(DigitalProduct);