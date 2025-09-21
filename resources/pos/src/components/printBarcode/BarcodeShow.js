import React from "react";
import { Image } from "react-bootstrap-v5";
import { currencySymbolHandling } from "../../shared/sharedMethod";
import { getFormattedMessage } from "../../shared/sharedMethod";

const DEFAULT_LAYOUT = {
    labelWidthIn: 1.799,
    labelHeightIn: 1.003,
    pageWidthIn: 8.27,
    columnGapIn: 0.1,
    rowGapIn: 0.1,
    paddingIn: 0.04,
};

const BarcodeShow = (props) => {
    const {
        updateProducts,
        layout,
        updated,
        frontSetting,
        allConfigData,
        barcodeOptions,
    } = props;

    const companyName = frontSetting?.value?.store_name;
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const effectiveLayout = (() => {
        if (
            layout &&
            layout.labelWidthIn > 0 &&
            layout.labelHeightIn > 0
        ) {
            return {
                ...DEFAULT_LAYOUT,
                ...layout,
            };
        }

        return DEFAULT_LAYOUT;
    })();

    const containerStyle = {
        width: `${effectiveLayout.pageWidthIn}in`,
        maxWidth: `${effectiveLayout.pageWidthIn}in`,
        display: "flex",
        flexWrap: "wrap",
        gap: `${effectiveLayout.rowGapIn}in ${effectiveLayout.columnGapIn}in`,
        justifyContent: "flex-start",
        '--barcode-label-width': `${effectiveLayout.labelWidthIn}in`,
        '--barcode-label-height': `${effectiveLayout.labelHeightIn}in`,
        '--barcode-padding': `${effectiveLayout.paddingIn}in`,
    };

    const itemStyle = {
        width: `${effectiveLayout.labelWidthIn}in`,
        minHeight: `${effectiveLayout.labelHeightIn}in`,
        padding: `${effectiveLayout.paddingIn}in`,
    };

    const loopBarcode = (product) => {
        let indents = [];
        for (let i = 0; i < product.quantity; i++) {
            indents.push(
                <div
                    key={i}
                    className="barcode-main__barcode-item barcode-main__barcode-style"
                    style={itemStyle}
                >
                    <div className="fw-bolder lh-1">
                        {barcodeOptions.companyName && companyName}
                    </div>
                    <div className="text-capitalize">
                        {barcodeOptions.productName && product.name}
                    </div>
                    {barcodeOptions?.price && (
                        <div className="text-capitalize">
                            <span className="fw-bolder">
                                {getFormattedMessage(
                                    "price.title"
                                )}
                                :
                            </span>{" "}
                            {currencySymbolHandling(
                                allConfigData,
                                currencySymbol,
                                product.product_price
                            )}
                        </div>
                    )}{" "}
                    <Image
                        src={product && product.barcode_url}
                        alt={product && product.name}
                        className="w-100"
                    />
                    <div className="fw-bolder">{product && product.code}</div>
                </div>
            );
        }
        return indents;
    };

    return (
        <>
            {
                <div className="col-md-12 d-flex d-wrap justify-content-between flex-column overflow-auto">
                    {updated && updateProducts
                        ? updateProducts.map((product, index) => (
                              <div
                                  className="barcode-main"
                                  id="demo"
                                  key={index}
                                  style={containerStyle}
                              >
                                  {loopBarcode(product)}
                              </div>
                          ))
                        : ""}
                </div>
            }
        </>
    );
};
export default BarcodeShow;
