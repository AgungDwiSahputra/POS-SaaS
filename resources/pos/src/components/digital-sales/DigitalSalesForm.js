import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap-v5';
import moment from 'moment';
import { connect, useDispatch } from 'react-redux';
import { editDigitalSale } from '../../store/action/digitalSaleAction';
import {
    placeholderText,
    getFormattedMessage,
    decimalValidate,
} from '../../shared/sharedMethod';
import ReactDatePicker from '../../shared/datepicker/ReactDatePicker';
import ModelFooter from '../../shared/components/modelFooter';
import { addToast } from '../../store/action/toastAction';
import { toastType } from '../../constants';
import ReactSelect from '../../shared/select/reactSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';

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
        digital_product_id: '',
        cost: '',
        price: '',
        margin: '0.00',
        note: '',
        description: '',
        status_id: { label: 'Completed', value: 1 },
    });

    const [errors, setErrors] = useState({
        date: '',
        provider_id: '',
        cost: '',
        price: '',
        status_id: '',
    });

    const [selectedProvider, setSelectedProvider] = useState(null);
    const [selectedDigitalProduct, setSelectedDigitalProduct] = useState(null);
    const [productSearchString, setProductSearchString] = useState('');
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (singleSale && !hasInitialized) {
            const cost = singleSale.cost || 0;
            const price = singleSale.price || 0;
            const margin = (price - cost).toFixed(2);

            setSaleValue({
                date: moment(singleSale.date).toDate(),
                provider_id: singleSale.provider_id,
                digital_product_id: singleSale.digital_product_id || '',
                cost: cost.toString(),
                price: price.toString(),
                margin: margin,
                note: singleSale.note || '',
                description: singleSale.description || '',
                status_id: statusOptions.find(s => s.value === singleSale.status) || { label: 'Completed', value: 1 },
            });

            // Set selected provider
            if (providers && singleSale.provider_id) {
                const provider = providers.find(p => p.id === singleSale.provider_id);
                setSelectedProvider(provider);
            }

            // Set selected digital product
            if (digitalProducts && singleSale.digital_product_id) {
                const product = digitalProducts.find(p => p.id === singleSale.digital_product_id);
                setSelectedDigitalProduct(product);
                if (product) {
                    setProductSearchString(product.attributes?.code || '');
                }
            }

            setHasInitialized(true);
        }
    }, [singleSale, providers, digitalProducts, hasInitialized]);

    // Calculate margin when cost or price changes - using ref to avoid infinite loop
    useEffect(() => {
        const cost = parseFloat(saleValue.cost) || 0;
        const price = parseFloat(saleValue.price) || 0;
        const margin = price - cost;

        // Only update if margin is different to avoid infinite loop
        if (margin.toFixed(2) !== saleValue.margin) {
            setSaleValue(prev => ({
                ...prev,
                margin: margin.toFixed(2),
            }));
        }
    }, [saleValue.cost, saleValue.price]);

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

        if (!saleValue.cost || parseFloat(saleValue.cost) <= 0) {
            newErrors.cost = getFormattedMessage('digital-sale.cost.required');
            error = true;
        }

        if (!saleValue.price || parseFloat(saleValue.price) <= 0) {
            newErrors.price = getFormattedMessage('digital-sale.price.required');
            error = true;
        }

        // Check provider balance
        if (selectedProvider && saleValue.cost) {
            const cost = parseFloat(saleValue.cost);
            const providerSaldo = selectedProvider.attributes?.saldo ?? 0;
            if (providerSaldo < cost) {
                dispatch(addToast({
                    text: getFormattedMessage('digital-sale.insufficient-balance') +
                          ` (Available: ${providerSaldo.toFixed(2)})`,
                    type: toastType.ERROR,
                }));
                error = true;
            }
        }

        setErrors(newErrors);
        return !error;
    };

    const prepareFormData = (prepareData) => {
        const formData = {
            date: moment(prepareData.date).format('YYYY-MM-DD'),
            provider_id: prepareData.provider_id,
            digital_product_id: prepareData.digital_product_id || null,
            cost: parseFloat(prepareData.cost),
            price: parseFloat(prepareData.price),
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

    const onChangeCost = (e) => {
        const value = e.target.value;
        if (value && value.match(/\./g)) {
            const [, decimal] = value.split('.');
            if (decimal?.length > 2) return;
        }
        setSaleValue((previousState) => {
            return { ...previousState, cost: value };
        });
    };

    const onChangePrice = (e) => {
        const value = e.target.value;
        if (value && value.match(/\./g)) {
            const [, decimal] = value.split('.');
            if (decimal?.length > 2) return;
        }
        setSaleValue((previousState) => {
            return { ...previousState, price: value };
        });
    };

    const onChangeStatus = (obj) => {
        setSaleValue((previousState) => {
            return { ...previousState, status_id: obj };
        });
    };

    // Handler for digital product selection
    const onDigitalProductSelect = (product) => {
        if (!product) return;

        const foundProduct = digitalProducts?.find(p => p.id === product.id);
        if (foundProduct) {
            setSelectedDigitalProduct(foundProduct);
            setSaleValue(prev => ({
                ...prev,
                digital_product_id: foundProduct.id,
                cost: foundProduct.attributes?.cost?.toString() || prev.cost,
                price: foundProduct.attributes?.price?.toString() || prev.price,
            }));
        }
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
        onDigitalProductSelect(item);
        setProductSearchString('');
    };

    const formatProductResult = (item) => {
        return (
            <span onClick={(e) => e.stopPropagation()}>{item.code} - {item.name}</span>
        );
    };

    // Get provider options - safely check if providers exists
    const providerOptions = providers && providers.length > 0
        ? providers.filter(item => item.attributes?.status === 'active')
        : [];

    // Store active providers for lookup when selection changes
    const activeProviders = providerOptions;

    const providerDefaultValue = activeProviders.map((option) => {
        return {
            value: option.id,
            label: option.attributes?.nama_provider || option.attributes?.name,
        };
    });

    // Get current provider value for select
    const getCurrentProviderValue = () => {
        if (saleValue.provider_id && providerDefaultValue.length > 0) {
            return providerDefaultValue.find(p => p.value === saleValue.provider_id) || null;
        }
        return null;
    };

    // Safely get provider balance
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
                            <ReactDatePicker
                                onChangeDate={onChangeDate}
                                newStartDate={saleValue.date}
                                title={getFormattedMessage('react-data-table.date.column.label')}
                                errors={errors[0]}
                                isRequiredField
                            />
                        </div>

                        {/* Provider */}
                        <div className='col-md-4'>
                            <ReactSelect
                                title={getFormattedMessage('digital-sale.provider.label')}
                                placeholder={placeholderText('digital-sale.provider.placeholder')}
                                data={providerDefaultValue}
                                defaultValue={getCurrentProviderValue()}
                                onChange={onProviderChange}
                                errors={errors[0]}
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
                                title={getFormattedMessage('digital-sale.status.label')}
                                data={statusOptions}
                                onChange={onChangeStatus}
                                defaultValue={saleValue.status_id}
                                errors={errors[0]}
                                isRequiredField
                            />
                        </div>
                    </div>

                    <div className='row mt-4'>
                        {/* Digital Product Search */}
                        <div className='col-md-6'>
                            <label className='form-label'>
                                {getFormattedMessage('digital-sale.product.label')}:
                            </label>
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
                            {selectedDigitalProduct && (
                                <small className='text-muted ms-2 d-block mt-1'>
                                    <FontAwesomeIcon icon={faInfoCircle} className='me-1' />
                                    {getFormattedMessage('digital-sale.product.selected')}: {selectedDigitalProduct.attributes?.name}
                                    ({selectedDigitalProduct.attributes?.code})
                                </small>
                            )}
                        </div>

                        {/* Cost */}
                        <div className='col-md-3'>
                            <label className='form-label'>
                                {getFormattedMessage('digital-sale.cost.label')}:
                                <span className='required' />
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={placeholderText('digital-sale.cost.placeholder')}
                                onKeyPress={(e) => decimalValidate(e)}
                                onChange={(e) => onChangeCost(e)}
                                value={saleValue.cost}
                            />
                            <span className='text-danger d-block fw-400 fs-small mt-1'>
                                {errors.cost ? errors.cost : null}
                            </span>
                        </div>

                        {/* Price */}
                        <div className='col-md-3'>
                            <label className='form-label'>
                                {getFormattedMessage('digital-sale.price.label')}:
                                <span className='required' />
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={placeholderText('digital-sale.price.placeholder')}
                                onKeyPress={(e) => decimalValidate(e)}
                                onChange={(e) => onChangePrice(e)}
                                value={saleValue.price}
                            />
                            <span className='text-danger d-block fw-400 fs-small mt-1'>
                                {errors.price ? errors.price : null}
                            </span>
                        </div>
                    </div>

                    <div className='row mt-4'>
                        {/* Margin (Auto-calculated) */}
                        <div className='col-md-4'>
                            <label className='form-label'>
                                {getFormattedMessage('digital-sale.margin.label')}:
                            </label>
                            <input
                                type='text'
                                className='form-control bg-light'
                                readOnly
                                value={saleValue.margin}
                            />
                            <small className='text-muted'>
                                {getFormattedMessage('digital-sale.margin.info')}
                            </small>
                        </div>

                        {/* Empty col for spacing */}
                        <div className='col-md-8'></div>
                    </div>

                    <div className='row mt-4'>
                        {/* Note */}
                        <div className='col-md-6'>
                            <label className='form-label'>
                                {getFormattedMessage('digital-sale.note.label')}:
                            </label>
                            <textarea
                                className='form-control'
                                rows={2}
                                placeholder={placeholderText('digital-sale.note.placeholder')}
                                onChange={(e) => setSaleValue({ ...saleValue, note: e.target.value })}
                                value={saleValue.note}
                            />
                        </div>

                        {/* Description */}
                        <div className='col-md-6'>
                            <label className='form-label'>
                                {getFormattedMessage('digital-sale.description.label')}:
                            </label>
                            <textarea
                                className='form-control'
                                rows={2}
                                placeholder={placeholderText('digital-sale.description.placeholder')}
                                onChange={(e) => setSaleValue({ ...saleValue, description: e.target.value })}
                                value={saleValue.description}
                            />
                        </div>
                    </div>

                    <ModelFooter
                        onEditRecord={editSale}
                        onSubmit={onSubmit}
                        editDisabled={false}
                        addDisabled={false}
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
