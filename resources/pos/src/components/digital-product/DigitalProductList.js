import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import { Button, Image } from "react-bootstrap-v5";
import MasterLayout from "../MasterLayout";
import { fetchDigitalProducts } from "../../store/action/digitalProductAction";
import ReactSelect from "../../shared/select/reactSelect";
import ReactDataTable from "../../shared/table/ReactDataTable";
import DeleteDigitalProduct from "./DeleteDigitalProduct";
import TabTitle from "../../shared/tab-title/TabTitle";
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
import { Permissions } from "../../constants";

const DigitalProductList = (props) => {
    const {
        fetchDigitalProducts,
        digitalProducts,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    } = props;

    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [lightBoxImage, setLightBoxImage] = useState([]);

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const onChange = (filter) => {
        fetchDigitalProducts(filter, true);
    };

    useEffect(() => {
        fetchDigitalProducts();
    }, []);

    // Digital products don't need brands and product categories

    const goToEditProduct = (item) => {
        const id = item.id;
        window.location.href = "#/user/digital-products/edit/" + id;
    };

    const goToProductDetailPage = (ProductId) => {
        window.location.href = "#/user/digital-products/detail/" + ProductId;
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
              // Handle JSON:API format (check if attributes exist)
              const attributes = product.attributes || product;

              return {
                  name: attributes.name || "",
                  code: attributes.code || "",
                  description: attributes.description || "",
                  date: getFormattedDate(
                      attributes.created_at || product.created_at,
                      allConfigData && allConfigData
                  ),
                  time: moment(attributes.created_at || product.created_at).format("LT"),
                  product_price: formattedPrice(attributes.price || product.price),
                  product_cost: formattedPrice(attributes.cost || product.cost),
                  expiry_date: attributes.expiry_date || "",
                  images: attributes.image_url || product.image_url || { imageUrls: [] },
                  id: attributes.id || product.id,
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
                                alt="Digital Product Image"
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
                                alt="Digital Product Image"
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
            name: getFormattedMessage("digital-product.input.price.label"),
            selector: (row) => row.product_price,
            sortField: "price",
            sortable: true,
        },
        {
            name: getFormattedMessage("digital-product.input.cost.label"),
            selector: (row) => row.product_cost,
            sortField: "cost",
            sortable: true,
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
                    isViewIcon={true}
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
            <TabTitle title={placeholderText("digital-product.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                {...(getPermission(allConfigData?.permissions, Permissions.CREATE_PRODUCTS) &&
                {
                    to: "#/user/digital-products/create",
                    buttonValue: getFormattedMessage("digital-product.create.title")
                }
                )}
            />
            <DeleteDigitalProduct
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        digitalProducts,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    } = state;
    return {
        digitalProducts,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchDigitalProducts,
})(DigitalProductList);