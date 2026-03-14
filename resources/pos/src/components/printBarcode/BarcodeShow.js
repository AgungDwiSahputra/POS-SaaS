import React, { useEffect } from "react";
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
        paperSizeValue,
        customPaper,
    } = props;

    // Destructure barcodeOptions with default values
    const {
        companyName: showCompanyName = true,
        productName: showProductName = true,
        price: showPrice = true,
        showBorder = true,
    } = barcodeOptions || {};

    // Inject @page CSS for custom paper sizes (same as PrintButton)
    useEffect(() => {
        const styleId = "barcodeshow-custom-page-style";
        const existingStyle = document.getElementById(styleId);
        
        if (paperSizeValue?.value === "custom" && customPaper) {
            if (existingStyle) {
                existingStyle.remove();
            }
            
            const pageWidthMm = parseFloat(customPaper.pageWidthMm) || 210;
            const pageHeightMm = parseFloat(customPaper.pageHeightMm) || 297;
            
            const style = document.createElement("style");
            style.id = styleId;
            style.innerHTML = `
                @media print {
                    @page {
                        size: ${pageWidthMm}mm ${pageHeightMm}mm;
                        margin: 0;
                    }
                    .barcode-main.barcode-custom-paper {
                        width: ${pageWidthMm}mm !important;
                        max-width: ${pageWidthMm}mm !important;
                        min-height: auto !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-sizing: border-box;
                        display: flex !important;
                        flex-wrap: wrap !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        return () => {
            if (existingStyle) {
                existingStyle.remove();
            }
        };
    }, [paperSizeValue, customPaper]);

    const companyName = frontSetting?.value?.company_name || frontSetting?.value?.store_name;
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

    // Determine paper size class
    let paperSizeClass = "";
    if (paperSizeValue?.value === 9) {
        paperSizeClass = "barcode-paper-105x120";
    } else if (paperSizeValue?.value === "custom") {
        paperSizeClass = "barcode-custom-paper";
    }

    // For custom paper, use customPaper values directly for preview
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
    // For custom paper, use customPaper values directly
    // Also apply border based on showBorder option
    const itemStyle = paperSizeValue?.value === "custom" && customPaper
        ? {
            width: `${customPaper.widthMm}mm`,
            minHeight: `${customPaper.heightMm}mm`,
            padding: `${customPaper.paddingMm}mm`,
            boxSizing: 'border-box',
            border: showBorder ? '1px dashed #ccc' : 'none',
        }
        : paperSizeClass
            ? {
                border: showBorder ? '1px dashed #ccc' : 'none',
            } // Let CSS handle the sizing for other special paper sizes (e.g., 105x120)
            : {
                width: `${effectiveLayout.labelWidthIn}in`,
                minHeight: `${effectiveLayout.labelHeightIn}in`,
                padding: `${effectiveLayout.paddingIn}in`,
                border: showBorder ? '1px dashed #ccc' : 'none',
            };

    // Check if barcode is available - defined inside loopBarcode function
    const loopBarcode = (product) => {
        // Check if barcode is available for this product
        const hasBarcode = product && product.barcode_url && product.barcode_url.length > 0;
        
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
                                  className={`barcode-main ${paperSizeClass}`.trim()}
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
