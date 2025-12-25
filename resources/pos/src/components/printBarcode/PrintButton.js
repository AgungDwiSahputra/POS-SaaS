import React from "react";
import { Image } from "react-bootstrap-v5";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../shared/sharedMethod";

const DEFAULT_LAYOUT = {
    labelWidthIn: 1.799,
    labelHeightIn: 1.003,
    pageWidthIn: 8.27,
    columnGapIn: 0.1,
    rowGapIn: 0.1,
    paddingIn: 0.04,
};

class PrintButton extends React.PureComponent {
    render() {
        const print = this.props.updateProducts || {};
        const layout = print.layout;
        const products = print.products || [];
        const frontSetting = this.props.frontSetting;
        const allConfigData = this.props.allConfigData;
        const barcodeOptions = this.props.barcodeOptions;
        const paperSizeValue = this.props.paperSizeValue;

        const companyName = frontSetting?.value?.company_name;
        const currencySymbol =
            frontSetting &&
            frontSetting.value &&
            frontSetting.value.currency_symbol;

        const effectiveLayout = layout &&
            layout.labelWidthIn > 0 &&
            layout.labelHeightIn > 0
            ? { ...DEFAULT_LAYOUT, ...layout }
            : DEFAULT_LAYOUT;

        // Check for 105x120mm paper based on the selected option value
        const paperSizeClass = (paperSizeValue?.value === 9) ? "barcode-paper-105x120" : "";

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

        // Override inline styles for 105x120 paper to force 3 columns
        const itemStyle = paperSizeClass
            ? {} // Let CSS handle the sizing for this paper size
            : {
                width: `${effectiveLayout.labelWidthIn}in`,
                minHeight: `${effectiveLayout.labelHeightIn}in`,
                padding: `${effectiveLayout.paddingIn}in`,
            };

        function printFunction(product) {
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
                        )}
                        <Image
                            src={product && product.barcode_url}
                            alt={product && product.name}
                            className="w-100"
                        />
                        <div className="fw-bolder">
                            {product && product.code}
                        </div>
                    </div>
                );
            }
            return indents;
        }

        return (
            <div className="p-4">
                {products.map((product, index) => (
                    <div
                        className={`barcode-main ${paperSizeClass}`.trim()}
                        id={`print-${index}`}
                        key={index}
                        style={containerStyle}
                    >
                        {printFunction(product, index)}
                    </div>
                ))}
            </div>
        );
    }
}

export default PrintButton;
