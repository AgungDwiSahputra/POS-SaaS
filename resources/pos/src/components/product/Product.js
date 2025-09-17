import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { Button, Image } from "react-bootstrap-v5";
import MasterLayout from "../MasterLayout";
import { fetchAllMainProducts } from "../../store/action/productAction";
import { fetchAllWarehouses } from "../../store/action/warehouseAction";
import ReactSelect from "../../shared/select/reactSelect";
import ReactDataTable from "../../shared/table/ReactDataTable";
import DeleteMainProduct from "./DeleteMainProduct";
import TabTitle from "../../shared/tab-title/TabTitle";
import ProductImageLightBox from "./ProductImageLightBox";
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
import ImportProductModel from "./ImportProductModel";
import { productExcelAction } from "../../store/action/productExcelAction";
import { Permissions } from "../../constants";

const Product = (props) => {
    const {
        fetchAllMainProducts,
        products,
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
        fetchAllMainProducts(merged, true);
    };

    useEffect(() => {
        // load warehouses for filter dropdown
        fetchAllWarehouses();
    }, []);

    useEffect(() => {
        // initial fetch with warehouse filter if selected
        const filter = {};
        if (warehouseValue && warehouseValue.value) {
            filter.warehouse_id = warehouseValue.value;
        }
        fetchAllMainProducts(filter, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [warehouseValue]);

    const goToEditProduct = (item) => {
        const id = item.id;
        window.location.href = "#/user/products/edit/" + id;
    };

    const goToProductDetailPage = (ProductId) => {
        window.location.href = "#/user/products/detail/" + ProductId;
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
        products.length >= 0 &&
        products.map((product) => {
            let product_price =
                product.attributes.min_price == product.attributes.max_price
                    ? formattedPrice(product.attributes.min_price)
                    : formattedPrice(product.attributes.min_price) +
                      " - " +
                      formattedPrice(product.attributes.max_price);
            return {
                name: product?.attributes.name,
                code: product?.attributes.code,
                date: getFormattedDate(
                    product?.attributes?.products && product?.attributes?.products[0]?.created_at,
                    allConfigData && allConfigData
                ),
                time: moment(product?.attributes?.products && product?.attributes?.products[0]?.created_at).format("LT"),
                brand_name:
                    product?.attributes.products &&
                    product?.attributes?.products[0]?.brand_name
                        ? product?.attributes?.products[0]?.brand_name
                        : "",
                product_price: product_price,
                product_unit: product?.attributes.product_unit?.name
                    ? product?.attributes.product_unit?.name
                    : "N/A",
                in_stock: product.attributes.products?.reduce((sum, p) => {
                    if (warehouseValue && warehouseValue.value && warehouses && warehouses.length) {
                        const wh = warehouses.find(w => w.id === warehouseValue.value);
                        const whName = wh?.attributes?.name;
                        if (whName) {
                            const list = p?.warehouse || [];
                            const qtyForWh = list
                                .filter((x) => x?.name === whName)
                                .reduce((s, x) => s + (x?.total_quantity || 0), 0);
                            return sum + qtyForWh;
                        }
                    }
                    // fallback: total global
                    return sum + (p?.in_stock ? p.in_stock : 0);
                }, 0),
                images: product?.attributes.images,
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
                    isViewIcon={getPermission(allConfigData?.permissions, Permissions.VIEW_PRODUCTS)}
                    goToDetailScreen={goToProductDetailPage}
                    item={row}
                    goToEditProduct={goToEditProduct}
                    isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_PRODUCTS)}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_PRODUCTS)}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("products.title")} />
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
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_PRODUCTS) &&
                {
                    to: "#/user/products/create",
                    buttonValue: getFormattedMessage("product.create.title")
                }
                )}
                isShowFilterField={getPermission(allConfigData?.permissions, Permissions.CREATE_PRODUCTS)}
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
        products,
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
        products,
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
    fetchAllMainProducts,
    productExcelAction,
    fetchAllWarehouses,
})(Product);
