import React from "react";
import { InputGroup, Form } from "react-bootstrap-v5";
import { currencySymbolHandling, getFormattedMessage } from "../../shared/sharedMethod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const formatNumber = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

const DigitalSaleProductTableBody = (props) => {
    const {
        item,
        index,
        frontSetting,
        allConfigData,
        updateCartItemQty,
        updateCartItemPrice,
        updateCartItemCost,
        removeCartItem,
    } = props;

    const handleIncrement = () => {
        updateCartItemQty(index, item.qty + 1);
    };

    const handleDecrement = () => {
        if (item.qty > 1) {
            updateCartItemQty(index, item.qty - 1);
        }
    };

    const handleChange = (e) => {
        const newQty = parseInt(e.target.value);
        if (newQty >= 1) {
            updateCartItemQty(index, newQty);
        }
    };

    const handlePriceChange = (e) => {
        const newPrice = parseFloat(e.target.value);
        if (!isNaN(newPrice) && newPrice >= 0) {
            updateCartItemPrice(index, newPrice);
        }
    };

    const handleCostChange = (e) => {
        const newCost = parseFloat(e.target.value);
        if (!isNaN(newCost) && newCost >= 0) {
            updateCartItemCost(index, newCost);
        }
    };

    return (
        <tr key={index} className="align-middle text-nowrap">
            {/* Product Name & Code */}
            <td>
                <h4 className="product-name">{item.product.attributes?.name}</h4>
                <div className="d-flex align-items-center">
                    <span className="badge bg-light-success">
                        <span>{item.product.attributes?.code}</span>
                    </span>
                </div>
            </td>

            {/* Cost Price (editable) */}
            <td>
                <input
                    type="number"
                    className="form-control form-control-sm"
                    value={item.cost}
                    onChange={handleCostChange}
                    step="0.01"
                    min="0"
                />
            </td>

            {/* Sale Price (editable) */}
            <td>
                <input
                    type="number"
                    className="form-control form-control-sm"
                    value={item.price}
                    onChange={handlePriceChange}
                    step="0.01"
                    min="0"
                />
            </td>

            {/* Quantity */}
            <td>
                <div className="custom-qty">
                    <InputGroup className="flex-nowrap">
                        <InputGroup.Text
                            className="btn btn-primary btn-sm px-4 pt-2"
                            onClick={handleDecrement}
                        >
                            -
                        </InputGroup.Text>
                        <Form.Control
                            aria-label="Product Quantity"
                            className="text-center px-0 py-2 rounded-0 hide-arrow"
                            value={item.qty}
                            type="number"
                            min={1}
                            onChange={handleChange}
                        />
                        <InputGroup.Text
                            className="btn btn-primary btn-sm px-4 pt-2"
                            onClick={handleIncrement}
                        >
                            +
                        </InputGroup.Text>
                    </InputGroup>
                </div>
            </td>

            {/* Sub Total */}
            <td>
                {currencySymbolHandling(
                    allConfigData,
                    frontSetting.value?.currency_symbol,
                    formatNumber(item.sub_total)
                )}
            </td>

            {/* Action */}
            <td className="text-start">
                <button className="btn px-2 text-danger fs-3">
                    <FontAwesomeIcon
                        icon={faTrash}
                        onClick={() => removeCartItem(index)}
                    />
                </button>
            </td>
        </tr>
    );
};

export default DigitalSaleProductTableBody;
