import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button, Image, Table } from "react-bootstrap-v5";
import { useParams } from "react-router-dom";
import Carousel from "react-elastic-carousel";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchDigitalProduct } from "../../store/action/digitalProductAction";
import HeaderTitle from "../header/HeaderTitle";
import user from "../../assets/images/brand_logo.png";
import {
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
    getFormattedDate,
    getFormattedOptions,
} from "../../shared/sharedMethod";
import moment from "moment";
import { digitalProductTypeOptions } from "../../constants";

const DigitalProductDetail = (props) => {
     const { fetchDigitalProduct, digitalProducts, frontSetting, allConfigData } = props;
     const { id } = useParams();

     // Debug: Log the digitalProducts data
     console.log('DigitalProductDetail - digitalProducts:', digitalProducts);
     console.log('DigitalProductDetail - first product:', digitalProducts?.[0]);

     // Handle JSON:API format - extract attributes if present
     const productData = digitalProducts?.[0]?.attributes || digitalProducts?.[0];
     console.log('DigitalProductDetail - productData (attributes or direct):', productData);

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const formatCurrency = (amount) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            amount
        );
    };

    useEffect(() => {
        fetchDigitalProduct(id);
    }, [id]);

    // Handle image carousel data
    const sliderImage = productData?.image_url?.imageUrls || [];

    return (
        <MasterLayout>
            <HeaderTitle
                title={getFormattedMessage("digital-product.detail.title")}
                to="/user/digital-products"
            />
            <TabTitle
                title={placeholderText("digital-product.detail.title")}
            />
            <div className="card card-body">
                <div className="row">
                    <div className="col-xxl-7">
                        <table className="table table-responsive gy-7 main-product-details">
                            <tbody>
                                <tr>
                                    <th className="py-4" scope="row">
                                        {getFormattedMessage("globally.code.label")}
                                    </th>
                                    <td className="py-4">
                                        <span className="badge bg-light-info">
                                            {productData?.code || ""}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <th className="py-4" scope="row">
                                        {getFormattedMessage("globally.input.name.label")}
                                    </th>
                                    <td className="py-4">
                                        {productData?.name || ""}
                                    </td>
                                </tr>
                                <tr>
                                    <th className="py-4" scope="row">
                                        {getFormattedMessage("digital-product.input.price.label")}
                                    </th>
                                    <td className="py-4">
                                        {productData?.price ? formatCurrency(productData.price) : ""}
                                    </td>
                                </tr>
                                <tr>
                                    <th className="py-4" scope="row">
                                        {getFormattedMessage("digital-product.input.cost.label")}
                                    </th>
                                    <td className="py-4">
                                        {productData?.cost ? formatCurrency(productData.cost) : ""}
                                    </td>
                                </tr>
                                <tr>
                                    <th className="py-4" scope="row">
                                        {getFormattedMessage("digital-product.input.type.label")}
                                    </th>
                                    <td className="py-4">
                                        <span className="badge bg-light-primary">
                                            {(() => {
                                                const digitalProductTypeOptionsObj = getFormattedOptions(digitalProductTypeOptions);
                                                const typeOption = digitalProductTypeOptionsObj.find(opt => opt.id === productData?.type);
                                                return typeOption ? typeOption.name : productData?.type || "";
                                            })()}
                                        </span>
                                    </td>
                                </tr>
                                {productData?.expiry_date && (
                                    <tr>
                                        <th className="py-4" scope="row">
                                            {getFormattedMessage("expiry.date.title")}
                                        </th>
                                        <td className="py-4">
                                            {getFormattedDate(productData.expiry_date, allConfigData)}
                                        </td>
                                    </tr>
                                )}
                                {productData?.description && (
                                    <tr>
                                        <th className="py-4" scope="row">
                                            {getFormattedMessage("digital-product.input.description.label")}
                                        </th>
                                        <td className="py-4">
                                            {productData.description}
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <th className="py-4" scope="row">
                                        {getFormattedMessage("globally.react-table.column.created-date.label")}
                                    </th>
                                    <td className="py-4">
                                        {productData?.created_at
                                            ? getFormattedDate(productData.created_at, allConfigData)
                                            : ""}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="col-xxl-5 d-flex justify-content-center m-auto">
                        {sliderImage && sliderImage.length !== 0 ? (
                            <Carousel>
                                {sliderImage.length !== 0 &&
                                    sliderImage.map((img, i) => {
                                        return (
                                            <div key={i}>
                                                <Image
                                                    src={img}
                                                    width="413px"
                                                    className="img-fluid"
                                                    alt="Digital Product Image"
                                                />
                                            </div>
                                        );
                                    })}
                            </Carousel>
                        ) : (
                            <div>
                                <Image src={user} width="413px" alt="Default Product Image" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
     const { digitalProducts, frontSetting, allConfigData } = state;
     return { digitalProducts, frontSetting, allConfigData };
 };

export default connect(mapStateToProps, { fetchDigitalProduct })(DigitalProductDetail);