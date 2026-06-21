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
    constructor(props) {
        super(props);
        this.customPageStyleId = "custom-barcode-page-style";
    }

    componentDidMount() {
        this.injectCustomPageStyle();
    }

    componentDidUpdate(prevProps) {
        // Re-inject style if customPaper props change or barcodeOptions.showBorder changes
        const prevCustomPaper = prevProps.customPaper;
        const currentCustomPaper = this.props.customPaper;
        const prevPaperSize = prevProps.paperSizeValue;
        const currentPaperSize = this.props.paperSizeValue;
        const prevShowBorder = prevProps.barcodeOptions?.showBorder;
        const currentShowBorder = this.props.barcodeOptions?.showBorder;

        if (
            prevCustomPaper?.widthMm !== currentCustomPaper?.widthMm ||
            prevCustomPaper?.heightMm !== currentCustomPaper?.heightMm ||
            prevCustomPaper?.pageWidthMm !== currentCustomPaper?.pageWidthMm ||
            prevCustomPaper?.pageHeightMm !== currentCustomPaper?.pageHeightMm ||
            prevCustomPaper?.columnGapMm !== currentCustomPaper?.columnGapMm ||
            prevCustomPaper?.rowGapMm !== currentCustomPaper?.rowGapMm ||
            prevCustomPaper?.paddingMm !== currentCustomPaper?.paddingMm ||
            prevPaperSize?.value !== currentPaperSize?.value ||
            prevShowBorder !== currentShowBorder
        ) {
            this.injectCustomPageStyle();
        }
    }

    componentWillUnmount() {
        this.removeCustomPageStyle();
    }

    injectCustomPageStyle = () => {
        const { paperSizeValue, customPaper, barcodeOptions } = this.props;
        const showBorder = barcodeOptions?.showBorder ?? true;

        // Remove any existing custom style first
        this.removeCustomPageStyle();

        // Always inject base print styles to remove borders during print
        // and ensure proper printing for thermal printers
        const basePrintStyles = `
            @media print {
                .barcode-main {
                    border: none !important;
                }
                .barcode-main__barcode-item {
                    border: none !important;
                }
                body {
                    margin: 0;
                    padding: 0;
                }
            }
        `;

        // For custom paper, we DON'T use @page { size: ...mm } because
        // thermal printers like TSC TTP-244 Pro don't handle this well.
        // Instead, we rely on inline styles which work correctly.
        // The @page rule was causing the paper width to be very small when printing.
        if (paperSizeValue?.value === "custom" && customPaper) {
            const labelWidthMm = parseFloat(customPaper.widthMm) || 38;
            const labelHeightMm = parseFloat(customPaper.heightMm) || 25;
            const columnGapMm = parseFloat(customPaper.columnGapMm) || 3;
            const rowGapMm = parseFloat(customPaper.rowGapMm) || 3;
            const paddingMm = parseFloat(customPaper.paddingMm) || 2;

            // Custom print styles WITHOUT @page size rule
            // Using inline styles in the component handles the sizing correctly
            const customPrintStyles = `
                @media print {
                    .barcode-main.barcode-custom-paper {
                        border: none !important;
                        width: auto !important;
                        max-width: none !important;
                        min-height: auto !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-sizing: border-box;
                        display: flex !important;
                        flex-wrap: wrap !important;
                        gap: ${rowGapMm}mm ${columnGapMm}mm !important;
                    }
                    .barcode-main.barcode-custom-paper .barcode-main__barcode-item {
                        border: none !important;
                        width: ${labelWidthMm}mm !important;
                        max-width: ${labelWidthMm}mm !important;
                        min-width: ${labelWidthMm}mm !important;
                        min-height: ${labelHeightMm}mm !important;
                        padding: ${paddingMm}mm !important;
                        box-sizing: border-box !important;
                        font-size: ${parseFloat(customPaper.fontSize) || 12}px !important;
                    }
                }
            `;

            const style = document.createElement("style");
            style.id = this.customPageStyleId;
            style.innerHTML = basePrintStyles + customPrintStyles;
            document.head.appendChild(style);
        } else {
            // For presets, inject base print styles
            const style = document.createElement("style");
            style.id = this.customPageStyleId;
            style.innerHTML = basePrintStyles;
            document.head.appendChild(style);
        }
    };

    removeCustomPageStyle = () => {
        const existingStyle = document.getElementById(this.customPageStyleId);
        if (existingStyle) {
            existingStyle.remove();
        }
    };

    render() {
        const print = this.props.updateProducts || {};
        const layout = print.layout;
        const products = print.products || [];
        const frontSetting = this.props.frontSetting;
        const allConfigData = this.props.allConfigData;
        const barcodeOptions = this.props.barcodeOptions;
        const paperSizeValue = this.props.paperSizeValue;
        const customPaper = this.props.customPaper;

        const companyName = frontSetting?.value?.company_name || frontSetting?.value?.store_name;
        const currencySymbol =
            frontSetting &&
            frontSetting.value &&
            frontSetting.value.currency_symbol;

        const effectiveLayout = layout &&
            layout.labelWidthIn > 0 &&
            layout.labelHeightIn > 0
            ? { ...DEFAULT_LAYOUT, ...layout }
            : DEFAULT_LAYOUT;

        // Determine paper size class
        let paperSizeClass = "";
        if (paperSizeValue?.value === 9) {
            paperSizeClass = "barcode-paper-105x120";
        } else if (paperSizeValue?.value === "custom") {
            paperSizeClass = "barcode-custom-paper";
        }

        // For custom paper, use customPaper values directly (same as BarcodeShow for consistency)
        const containerStyle = paperSizeValue?.value === "custom" && customPaper
            ? {
                width: `${customPaper.pageWidthMm}mm`,
                maxWidth: `${customPaper.pageWidthMm}mm`,
                display: "flex",
                flexWrap: "wrap",
                gap: `${customPaper.rowGapMm}mm ${customPaper.columnGapMm}mm`,
                justifyContent: "flex-start",
                '--barcode-label-width': `${customPaper.widthMm}mm`,
                '--barcode-label-height': `${customPaper.heightMm}mm`,
                '--barcode-padding': `${customPaper.paddingMm}mm`,
            }
            : {
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

        // Override inline styles for special paper sizes
        // For custom paper, use customPaper values directly (same as BarcodeShow for consistency)
        // Also apply border based on showBorder option
        const showBorder = barcodeOptions?.showBorder ?? true;
        const itemStyle = paperSizeValue?.value === "custom" && customPaper
            ? {
                width: `${customPaper.widthMm}mm`,
                minHeight: `${customPaper.heightMm}mm`,
                padding: `${customPaper.paddingMm}mm`,
                boxSizing: 'border-box',
                fontSize: `${customPaper.fontSize || 12}px`,
            }
            : paperSizeClass
                ? {
                    // Let CSS handle the sizing for other special paper sizes (e.g., 105x120)
                }
                : {
                    width: `${effectiveLayout.labelWidthIn}in`,
                    minHeight: `${effectiveLayout.labelHeightIn}in`,
                    padding: `${effectiveLayout.paddingIn}in`,
                };

        // Add border style for preview (not printed)
        const borderStyle = showBorder ? { border: '1px dashed #ccc' } : {};
        const combinedItemStyle = { ...itemStyle, ...borderStyle };

        function printFunction(product) {
            // Check if barcode is available
            const hasBarcode = product && product.barcode_url && product.barcode_url.length > 0;
            
            let indents = [];
            for (let i = 0; i < product.quantity; i++) {
                indents.push(
                    <div
                        key={i}
                        className="barcode-main__barcode-item barcode-main__barcode-style"
                        style={combinedItemStyle}
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
                        {/* Barcode Image - with error handling */}
                        {hasBarcode ? (
                            <Image
                                src={product.barcode_url}
                                alt={product.name}
                                className="w-100"
                            />
                        ) : (
                            <div className="text-danger small py-2">
                                {getFormattedMessage("print-barcode.no-barcode.label") || "Barcode not available"}
                            </div>
                        )}
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
