import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap-v5';
import moment from 'moment';
import { connect, useDispatch } from 'react-redux';
import { editDigitalSale } from '../../store/action/digitalSaleAction';
import {
    placeholderText,
    getFormattedMessage,
} from '../../shared/sharedMethod';
import ReactDatePicker from '../../shared/datepicker/ReactDatePicker';
import ModelFooter from '../../shared/components/modelFooter';
import { addToast } from '../../store/action/toastAction';
import { toastType } from '../../constants';
import ReactSelect from '../../shared/select/reactSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import DigitalSaleProductRowTable from './DigitalSaleProductRowTable';
import DigitalSaleMainCalculation from './DigitalSaleMainCalculation';

const DigitalSalesForm = (props) => {
    const {
        addSaleData,
        editSale,
        editDigitalSale: editDigitalSaleProp,
        id,
        singleSale,
        providers,
        digitalProducts,
        frontSetting,
        allConfigData,
    } = props;

    // Use editDigitalSale from props if available (edit mode), otherwise use imported action (create mode)
    const editDigitalSaleAction = editDigitalSaleProp || editDigitalSale;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Status options
    const statusOptions = [
        { label: 'Completed', value: 1 },
        { label: 'Pending', value: 2 },
        { label: 'Cancelled', value: 3 },
    ];

    const [saleValue, setSaleValue] = useState({
        date: new Date(),
        provider_id: '',
        note: '',
        description: '',
        status_id: { label: 'Completed', value: 1 },
    });

    const [errors, setErrors] = useState({
        date: '',
        provider_id: '',
        items: '',
    });

    // Cart items state - array of {product, qty, price, cost, sub_total}
    const [cartItems, setCartItems] = useState([]);

    const [productSearchString, setProductSearchString] = useState('');
    const [hasInitialized, setHasInitialized] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);

    // Calculate total from cart
    const calculateCartTotal = () => {
        return cartItems.reduce((sum, item) => sum + item.sub_total, 0);
    };

    // Calculate total cost from cart
    const calculateCartCost = () => {
        return cartItems.reduce((sum, item) => sum + (item.cost * item.qty), 0);
    };

    // Calculate margin
    const calculateMargin = () => {
        return calculateCartTotal() - calculateCartCost();
    };

    // Initialize form data for edit mode
    useEffect(() => {
        if (singleSale && !hasInitialized) {
            // Set cart items from singleSale.items
            const items = singleSale.items || [];
            const initialCartItems = items.map(item => {
                // Find full product data
                const product = digitalProducts?.find(p => p.id === item.digital_product_id);
                return {
                    product: product || { id: item.digital_product_id, attributes: {} },
                    qty: parseInt(item.quantity) || 1,
                    price: parseFloat(item.product_price) || 0,
                    cost: parseFloat(item.cost) || 0,
                    sub_total: parseFloat(item.sub_total) || 0,
                };
            });

            setCartItems(initialCartItems);

            setSaleValue({
                date: moment(singleSale.date).toDate(),
                provider_id: singleSale.provider_id,
                note: singleSale.note || '',
                description: singleSale.description || '',
                status_id: statusOptions.find(s => s.value === singleSale.status) || { label: 'Completed', value: 1 },
            });

            // Set selected provider
            if (providers && singleSale.provider_id) {
                const provider = providers.find(p => p.id === singleSale.provider_id);
                setSelectedProvider(provider);
            }

            setHasInitialized(true);
        }
    }, [singleSale, providers, digitalProducts, hasInitialized]);

    const handleValidation = () => {
        let error = false;
        const newErrors = { ...errors };

        if (!saleValue.date) {
            newErrors.date = getFormattedMessage('globally.date.validate.label');
            error = true;
        }

        if (!saleValue.provider_id) {
            newErrors.provider_id = getFormattedMessage('digital-sale.provider.required');
            error = true;
        }

        if (cartItems.length === 0) {
            newErrors.items = getFormattedMessage('digital-sale.items.required');
            error = true;
        }

        // Check provider balance
        if (selectedProvider && cartItems.length > 0) {
            const totalCost = calculateCartCost();
            const providerSaldo = selectedProvider.attributes?.saldo ?? 0;
            if (providerSaldo < totalCost) {
                dispatch(addToast({
                    text: getFormattedMessage('digital-sale.insufficient-balance') +
                          ` (Available: ${providerSaldo.toFixed(2)}, Required: ${totalCost.toFixed(2)})`,
                    type: toastType.ERROR,
                }));
                error = true;
            }
        }

        setErrors(newErrors);
        return !error;
    };

    const prepareFormData = (prepareData) => {
        // Convert cartItems to items array
        const items = cartItems.map(item => ({
            digital_product_id: item.product.id,
            quantity: item.qty,
            price: item.price,
            cost: item.cost,
        }));

        const formData = {
            date: moment(prepareData.date).format('YYYY-MM-DD'),
            provider_id: prepareData.provider_id,
            items: items,
            cost: calculateCartCost(),
            price: calculateCartTotal(),
            note: prepareData.note,
            description: prepareData.description,
            status: prepareData.status_id.value,
        };
        return formData;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const valid = handleValidation();
        if (valid) {
            if (editSale) {
                editDigitalSaleAction(id, prepareFormData(saleValue), navigate);
            } else {
                addSaleData(prepareFormData(saleValue));
            }
        }
    };

    const onChangeDate = (date) => {
        setSaleValue((previousState) => {
            return { ...previousState, date: date };
        });
    };

    const onProviderChange = (obj) => {
        setSaleValue((previousState) => {
            return { ...previousState, provider_id: obj.value };
        });
        const foundProvider = providers?.find(p => p.id === obj.value);
        setSelectedProvider(foundProvider || null);
    };

    const onChangeStatus = (obj) => {
        setSaleValue((previousState) => {
            return { ...previousState, status_id: obj };
        });
    };

    // Add product to cart
    const addProductToCart = (product) => {
        if (!product) return;

        // Check if product already exists in cart
        const existingIndex = cartItems.findIndex(item => item.product.id === product.id);

        if (existingIndex >= 0) {
            // Update qty if already exists
            const updated = [...cartItems];
            updated[existingIndex].qty += 1;
            updated[existingIndex].sub_total = updated[existingIndex].qty * updated[existingIndex].price;
            setCartItems(updated);
        } else {
            // Add new item
            setCartItems([...cartItems, {
                product: product,
                qty: 1,
                price: product.attributes?.price || 0,
                cost: product.attributes?.cost || 0,
                sub_total: product.attributes?.price || 0,
            }]);
        }

        setProductSearchString('');
    };

    // Update cart item quantity
    const updateCartItemQty = (index, newQty) => {
        const qty = parseInt(newQty);
        if (qty < 1) return;

        const updated = [...cartItems];
        updated[index].qty = qty;
        updated[index].sub_total = qty * updated[index].price;
        setCartItems(updated);
    };

    // Update cart item price
    const updateCartItemPrice = (index, newPrice) => {
        const price = parseFloat(newPrice);
        if (isNaN(price) || price < 0) return;

        const updated = [...cartItems];
        updated[index].price = price;
        updated[index].sub_total = updated[index].qty * price;
        setCartItems(updated);
    };

    // Remove item from cart
    const removeCartItem = (index) => {
        setCartItems(cartItems.filter((_, i) => i !== index));
    };

    // Filter digital products for search
    const filterDigitalProducts = digitalProducts && digitalProducts.length > 0
        ? digitalProducts.map(item => ({
            id: item.id,
            name: item.attributes?.name,
            code: item.attributes?.code,
        }))
        : [];

    const handleProductSearch = (string) => {
        setProductSearchString(string);
    };

    const handleProductSelect = (item) => {
        const foundProduct = digitalProducts?.find(p => p.id === item.id);
        if (foundProduct) {
            addProductToCart(foundProduct);
        }
    };

    const formatProductResult = (item) => {
        return (
            <span onClick={(e) => e.stopPropagation()}>{item.code} - {item.name}</span>
        );
    };

    // Get provider options
    const providerOptions = providers && providers.length > 0
        ? providers.filter(item => item.attributes?.status === 'active')
        : [];

    const providerDefaultValue = providerOptions.map((option) => {
        return {
            value: option.id,
            label: option.attributes?.nama_provider || option.attributes?.name,
        };
    });

    const getProviderBalance = () => {
        const saldo = selectedProvider?.attributes?.saldo;
        if (typeof saldo === 'number') {
            return saldo.toFixed(2);
        }
        if (typeof saldo === 'string') {
            const parsed = parseFloat(saldo);
            return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
        }
        return '0.00';
    };

    return (
        <div className='card'>
            <div className='card-body'>
                <Form onSubmit={(e) => onSubmit(e)}>
                    <div className='row'>
                        {/* Date */}
                        <div className='col-md-4'>
                            <label className='form-label'>
                                {getFormattedMessage('react-data-table.date.column.label')}:
                            </label>
                            <span className='required' />
                            <div className='position-relative'>
                                <ReactDatePicker onChangeDate={onChangeDate} newStartDate={saleValue.date} />
                            </div>
                            <span className='text-danger d-block fw-400 fs-small mt-2'>{errors.date ? errors.date : null}</span>
                        </div>

                        {/* Provider */}
                        <div className='col-md-4'>
                            <ReactSelect
                                name='provider_id'
                                data={providerDefaultValue}
                                onChange={onProviderChange}
                                title={getFormattedMessage('digital-sale.provider.label')}
                                errors={errors.provider_id}
                                value={providerDefaultValue.find(p => p.value === saleValue.provider_id) || null}
                                isRequiredField
                                key={saleValue.provider_id || 'provider-select'}
                            />
                            {selectedProvider && selectedProvider.attributes && (
                                <small className='text-muted ms-2 d-block mt-1'>
                                    <FontAwesomeIcon icon={faInfoCircle} className='me-1' />
                                    {getFormattedMessage('digital-sale.provider.balance')}: {getProviderBalance()}
                                </small>
                            )}
                        </div>

                        {/* Status */}
                        <div className='col-md-4'>
                            <ReactSelect
                                name='status_id'
                                data={statusOptions}
                                onChange={onChangeStatus}
                                title={getFormattedMessage('digital-sale.status.label')}
                                value={saleValue.status_id}
                                errors={errors.status_id}
                                defaultValue={statusOptions[0]}
                                isRequiredField
                            />
                        </div>
                    </div>

                    {/* Product Search Section */}
                    <div className='mb-2 mt-4'>
                        <label className='form-label'>
                            {getFormattedMessage('digital-sale.product.label')}:
                        </label>
                        <span className='required' />
                        <div className='position-relative custom-search'>
                            <ReactSearchAutocomplete
                                items={filterDigitalProducts}
                                onSearch={handleProductSearch}
                                inputSearchString={productSearchString}
                                fuseOptions={{ keys: ['code', 'name'] }}
                                resultStringKeyName='code'
                                placeholder={placeholderText('digital-sale.product.placeholder')}
                                onSelect={handleProductSelect}
                                formatResult={formatProductResult}
                                showIcon={false}
                                showClear={true}
                            />
                            <FontAwesomeIcon icon={faSearch}
                                className='d-flex align-items-center top-0 bottom-0 react-search-icon my-auto text-gray-600 position-absolute' />
                        </div>
                    </div>

                    {/* Product Table Section */}
                    <div>
                        <label className='form-label'>
                            {getFormattedMessage('purchase.order-item.table.label')}:
                        </label>
                        <span className='required' />
                        <DigitalSaleProductRowTable
                            cartItems={cartItems}
                            frontSetting={frontSetting}
                            allConfigData={allConfigData}
                            updateCartItemQty={updateCartItemQty}
                            updateCartItemPrice={updateCartItemPrice}
                            removeCartItem={removeCartItem}
                        />
                    </div>

                    {errors.items && (
                        <div className='row mt-2'>
                            <div className='col-12'>
                                <span className='text-danger'>{errors.items}</span>
                            </div>
                        </div>
                    )}

                    {/* Calculation Summary Card */}
                    {cartItems.length > 0 && (
                        <DigitalSaleMainCalculation
                            frontSetting={frontSetting}
                            allConfigData={allConfigData}
                            cartItems={cartItems}
                            calculateCartCost={calculateCartCost}
                            calculateCartTotal={calculateCartTotal}
                            calculateMargin={calculateMargin}
                        />
                    )}

                    {/* Notes Section */}
                    <div className='mb-3 mt-4'>
                        <label className='form-label'>
                            {getFormattedMessage('globally.input.note.label')}:
                        </label>
                        <textarea
                            name='note'
                            className='form-control'
                            value={saleValue.note}
                            placeholder={placeholderText('globally.input.note.placeholder.label')}
                            onChange={(e) => setSaleValue({ ...saleValue, note: e.target.value })}
                        />
                    </div>

                    <ModelFooter
                        onEditRecord={editSale}
                        onSubmit={onSubmit}
                        link='/user/digital-sales'
                    />
                </Form>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    const { frontSetting, allConfigData, digitalProducts } = state;
    return { frontSetting, allConfigData, digitalProducts };
};

export default connect(mapStateToProps, { editDigitalSale })(DigitalSalesForm);
