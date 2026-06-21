import React from "react";
import { currencySymbolHandling, getFormattedMessage } from "../../shared/sharedMethod";

const formatNumber = (value) => {
    return (typeof value === 'number' && !isNaN(value)) ? value.toFixed(2) : '0.00';
};

const DigitalSaleMainCalculation = (props) => {
    const { frontSetting, allConfigData, cartItems, calculateCartCost, calculateCartTotal, calculateMargin } = props;

    const totalCost = calculateCartCost();
    const totalPrice = calculateCartTotal();
    const margin = calculateMargin();

    return (
        <div className="col-xxl-5 col-lg-6 col-md-6 col-12 float-end">
            <div className="card">
                <div className="card-body pt-7 pb-2">
                    <div className="table-responsive">
                        <table className="table border">
                            <tbody>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage("digital-sale.total-cost.label") || "Total Cost"}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value && frontSetting.value.currency_symbol,
                                            formatNumber(totalCost)
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage("digital-sale.total-price.label") || "Total Price"}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value && frontSetting.value.currency_symbol,
                                            formatNumber(totalPrice)
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-primary">
                                        {getFormattedMessage("digital-sale.margin.label") || "Margin"}
                                    </td>
                                    <td className="py-3 text-primary">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value && frontSetting.value.currency_symbol,
                                            formatNumber(margin)
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalSaleMainCalculation;
