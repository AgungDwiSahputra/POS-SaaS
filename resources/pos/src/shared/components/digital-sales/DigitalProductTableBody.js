import React, { useEffect, useState } from "react";
import { InputGroup } from "react-bootstrap-v5";
import { useDispatch } from "react-redux";
import {
    taxAmountMultiply,
    discountAmountMultiply,
    subTotalCount,
    amountBeforeTax,
} from "../../calculation/calculation";
import {
    currencySymbolHandling,
    decimalValidate,
    getFormattedMessage,
} from "../../sharedMethod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPencil } from "@fortawesome/free-solid-svg-icons";
import { addToast } from "../../../store/action/toastAction";
import { toastType } from "../../../constants";

const DigitalProductTableBody = (props) => {
    const {
        singleProduct,
        index,
        updateProducts,
        setUpdateProducts,
        updateCost,
        updateDiscount,
        updateTax,
        updateSubTotal,
        frontSetting,
        allConfigData,
    } = props;
    const [isShowModal, setIsShowModal] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        singleProduct.sub_total = Number(subTotalCount(singleProduct));
    }, [singleProduct.sub_total]);

    const onProductUpdateInCart = (item) => {
        // Update product in cart
        setUpdateProducts(updateProducts.map((p) =>
            p.id === item.id ? item : p
        ));
    };

    const onDeleteCartItem = (id) => {
        const newProduct = updateProducts.filter((item) => item.id !== id);
        setUpdateProducts(newProduct);
        dispatch(addToast({ text: getFormattedMessage("item.deleted.success.message") }));
    };

    const handleIncrement = () => {
        setUpdateProducts((updateProducts) =>
            updateProducts.map((item) => {
                if (item.id === singleProduct.id) {
                    const newQuantity = item.quantity + 1;
                    if (item.quantity_limit && newQuantity > item.quantity_limit) {
                        dispatch(
                            addToast({
                                text: getFormattedMessage(
                                    "sale.product-qty.limit.validate.message"
                                ),
                                type: toastType.ERROR,
                            })
                        );
                        return { ...item };
                    }
                    return { ...item, quantity: newQuantity };
                } else {
                    return item;
                }
            })
        );
    };

    const handleDecrement = () => {
        if (singleProduct.quantity - 1 > 0) {
            setUpdateProducts((updateProducts) =>
                updateProducts.map((item) =>
                    item.id === singleProduct.id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
            );
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        const { value } = e.target;
        if (value.match(/\./g)) {
            const [, decimal] = value.split(".");
            if (decimal?.length > 2) {
                return;
            }
        }

        setUpdateProducts((updateProducts) =>
            updateProducts.map((item) =>
                item.id === singleProduct.id
                    ? { ...item, quantity: Number(value) }
                    : item
            )
        );
    };

    const onChangePrice = (e) => {
        e.preventDefault();
        const { value } = e.target;
        if (value.match(/\./g)) {
            const [, decimal] = value.split(".");
            if (decimal?.length > 2) {
                return;
            }
        }
        setUpdateProducts((updateProducts) =>
            updateProducts.map((item) => {
                if (item.id === singleProduct.id) {
                    const netPrice = Number(value);
                    const discountAmount = discountAmountMultiply(item.discount_type, item.discount_value, netPrice, item.quantity);
                    const priceBeforeTax = amountBeforeTax(netPrice, discountAmount, item.quantity);
                    const newTaxAmount = taxAmountMultiply(item.tax_type, item.tax_value, priceBeforeTax, item.quantity);
                    const newSubTotal = subTotalCount({
                        ...item,
                        net_unit_price: netPrice,
                        discount_amount: discountAmount,
                        tax_amount: newTaxAmount
                    });
                    return {
                        ...item,
                        product_price: netPrice,
                        net_unit_price: netPrice,
                        sub_total: newSubTotal
                    };
                } else {
                    return item;
                }
            })
        );
    };

    const onClickShowProductModal = () => {
        setIsShowModal(true);
    };

    // Modal for editing discount and tax
    const ProductModal = () => {
        const [discountValue, setDiscountValue] = useState(singleProduct.discount_value);
        const [taxValue, setTaxValue] = useState(singleProduct.tax_value);
        const [discountType, setDiscountType] = useState(singleProduct.discount_type);
        const [taxType, setTaxType] = useState(singleProduct.tax_type);

        const handleDiscountChange = (e) => {
            const value = e.target.value;
            if (value.match(/\./g)) {
                const [, decimal] = value.split('.');
                if (decimal?.length > 2) return;
            }
            setDiscountValue(value);
        };

        const handleTaxChange = (e) => {
            const value = e.target.value;
            if (value.match(/\./g)) {
                const [, decimal] = value.split('.');
                if (decimal?.length > 2) return;
            }
            setTaxValue(value);
        };

        const onSave = () => {
            const newProduct = {
                ...singleProduct,
                discount_value: Number(discountValue),
                tax_value: Number(taxValue),
                discount_type: Number(discountType),
                tax_type: Number(taxType)
            };

            // Recalculate
            const netPrice = singleProduct.net_unit_price;
            const discountAmount = discountAmountMultiply(newProduct.discount_type, newProduct.discount_value, netPrice, newProduct.quantity);
            const priceBeforeTax = amountBeforeTax(netPrice, discountAmount, newProduct.quantity);
            const newTaxAmount = taxAmountMultiply(newProduct.tax_type, newProduct.tax_value, priceBeforeTax, newProduct.quantity);
            newProduct.discount_amount = discountAmount;
            newProduct.tax_amount = newTaxAmount;
            newProduct.sub_total = subTotalCount(newProduct);

            onProductUpdateInCart(newProduct);
            setIsShowModal(false);
        };

        return (
            <div className={`modal fade ${isShowModal ? 'show' : ''}`} style={{ display: isShowModal ? 'block' : 'none' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{getFormattedMessage('product.title')}</h5>
                            <button type="button" className="btn-close" onClick={() => setIsShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">{getFormattedMessage('globally.detail.discount')}</label>
                                <InputGroup>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={discountValue}
                                        onChange={handleDiscountChange}
                                        onKeyPress={(e) => decimalValidate(e)}
                                    />
                                    <InputGroup.Text>
                                        <select
                                            className="border-0 bg-transparent"
                                            value={discountType}
                                            onChange={(e) => setDiscountType(Number(e.target.value))}
                                        >
                                            <option value={1}>%</option>
                                            <option value={2}>{frontSetting?.value?.currency_symbol || '$'}</option>
                                        </select>
                                    </InputGroup.Text>
                                </InputGroup>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">{getFormattedMessage('globally.detail.tax')}</label>
                                <InputGroup>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={taxValue}
                                        onChange={handleTaxChange}
                                        onKeyPress={(e) => decimalValidate(e)}
                                    />
                                    <InputGroup.Text>
                                        <select
                                            className="border-0 bg-transparent"
                                            value={taxType}
                                            onChange={(e) => setTaxType(Number(e.target.value))}
                                        >
                                            <option value={1}>{getFormattedMessage('tax-type.exclusive.label')}</option>
                                            <option value={2}>{getFormattedMessage('tax-type.inclusive.label')}</option>
                                        </select>
                                    </InputGroup.Text>
                                </InputGroup>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsShowModal(false)}>
                                {getFormattedMessage('modal-close.title')}
                            </button>
                            <button type="button" className="btn btn-primary" onClick={onSave}>
                                {getFormattedMessage('modal-save.title')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {isShowModal && ProductModal()}
            <tr key={index} className="align-middle text-nowrap">
                <td>
                    <h4 className="product-name">{singleProduct.name}</h4>
                    <div className="d-flex align-items-center">
                        <span className="badge bg-light-success">
                            <span>{singleProduct.code}</span>
                        </span>
                        <span className="badge bg-light-primary p-1 ms-1">
                            <FontAwesomeIcon
                                icon={faPencil}
                                onClick={(e) => onClickShowProductModal(e)}
                                style={{ cursor: "pointer" }}
                            />
                        </span>
                    </div>
                </td>
                <td>
                    {currencySymbolHandling(
                        allConfigData,
                        frontSetting.value && frontSetting.value.currency_symbol,
                        singleProduct.net_unit_price
                    )}
                </td>
                <td className="text-center">
                    <div className="d-flex justify-content-center align-items-center">
                        <span
                            className="badge bg-light-danger react-bootstrap-tables-pagination mx-1"
                            onClick={() => handleDecrement()}
                            style={{ cursor: 'pointer' }}
                        >
                            -
                        </span>
                        <input
                            type="text"
                            className="form-control d-flex justify-content-center text-center"
                            name="quantity"
                            style={{ width: '70px' }}
                            onKeyPress={(e) => decimalValidate(e)}
                            onChange={(e) => handleChange(e)}
                            value={singleProduct.quantity}
                        />
                        <span
                            className="badge bg-light-success react-bootstrap-tables-pagination mx-1"
                            onClick={() => handleIncrement()}
                            style={{ cursor: 'pointer' }}
                        >
                            +
                        </span>
                    </div>
                </td>
                <td>
                    {currencySymbolHandling(
                        allConfigData,
                        frontSetting.value && frontSetting.value.currency_symbol,
                        singleProduct.discount_amount
                    )}
                </td>
                <td>
                    {currencySymbolHandling(
                        allConfigData,
                        frontSetting.value && frontSetting.value.currency_symbol,
                        singleProduct.tax_amount
                    )}
                </td>
                <td>
                    {currencySymbolHandling(
                        allConfigData,
                        frontSetting.value && frontSetting.value.currency_symbol,
                        singleProduct.sub_total
                    )}
                </td>
                <td>
                    <button
                        className="btn btn-sm text-danger"
                        onClick={() => onDeleteCartItem(singleProduct.id)}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </td>
            </tr>
        </>
    );
};

export default DigitalProductTableBody;
