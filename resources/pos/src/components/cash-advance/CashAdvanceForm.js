import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import { useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment";
import { InputGroup } from "react-bootstrap-v5";
import {
    decimalValidate,
    getFormattedMessage,
} from "../../shared/sharedMethod";
import { useIntl } from "react-intl";
import ModelFooter from "../../shared/components/modelFooter";
import ReactSelect from "../../shared/select/reactSelect";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";
import { fetchActiveIdentitiesForSelect } from "../../store/action/cashAdvanceIdentityAction";

const CashAdvanceForm = (props) => {
    const {
        addCashAdvanceData,
        id,
        editCashAdvance,
        singleCashAdvance,
        frontSetting,
        activeIdentitiesForSelect,
        fetchActiveIdentitiesForSelect,
    } = props;
    const navigate = useNavigate();
    const intl = useIntl();
    const [cashAdvanceValue, setCashAdvanceValue] = useState({
        date: singleCashAdvance
            ? moment(singleCashAdvance[0].date).toDate()
            : new Date(),
        warehouse_id: singleCashAdvance ? singleCashAdvance[0].warehouse_id : 1, // Default warehouse ID
        identity_id: singleCashAdvance ? singleCashAdvance[0].identity_id : "",
        amount: singleCashAdvance ? String(singleCashAdvance[0].amount || "") : "",
        notes: singleCashAdvance ? String(singleCashAdvance[0].notes || "") : "",
    });

    const [errors, setErrors] = useState({
        date: "",
        identity_id: "",
        amount: "",
    });

    // Get identity ID from URL if present
    const [searchParams] = useSearchParams();
    const identityIdFromUrl = searchParams.get('identity_id');

    // Set selected identity based on singleCashAdvance, URL parameter, or stored selection
    const selectedIdentity = singleCashAdvance && singleCashAdvance[0]?.identity_id
        ? {
            value: singleCashAdvance[0].identity_id,
            label: singleCashAdvance[0].identity_name || singleCashAdvance[0].identity_id
          }
        : cashAdvanceValue.selectedIdentity || // Use stored selection first
          (identityIdFromUrl && activeIdentitiesForSelect?.find(id => Number(id.value) === Number(identityIdFromUrl))) || null;

    // Debug logging
    console.log('CashAdvanceForm Debug:', {
        identityIdFromUrl,
        identityIdFromUrlType: typeof identityIdFromUrl,
        activeIdentitiesForSelectLength: activeIdentitiesForSelect?.length,
        selectedIdentity,
        cashAdvanceValueIdentityId: cashAdvanceValue.identity_id,
        cashAdvanceValueSelectedIdentity: cashAdvanceValue.selectedIdentity,
        activeIdentitiesForSelect: activeIdentitiesForSelect?.slice(0, 3) // First 3 items for debugging
    });

    useEffect(() => {
        if (!activeIdentitiesForSelect || (Array.isArray(activeIdentitiesForSelect) && activeIdentitiesForSelect.length === 0)) {
            if (fetchActiveIdentitiesForSelect) {
                console.log('Fetching active identities for select...');
                fetchActiveIdentitiesForSelect();
            }
        }
    }, [activeIdentitiesForSelect, fetchActiveIdentitiesForSelect]);

    // Handle initial URL parameter setup
    useEffect(() => {
        if (identityIdFromUrl && !singleCashAdvance) {
            console.log('Initial URL parameter setup:', identityIdFromUrl);
            // The useEffect below will handle setting the identity_id once identities are loaded
        }
    }, [identityIdFromUrl, singleCashAdvance]);

    // Update identity_id when URL parameter is present and identities are loaded
    useEffect(() => {
        if (identityIdFromUrl && activeIdentitiesForSelect && activeIdentitiesForSelect.length > 0) {
            const identityExists = activeIdentitiesForSelect.find(identity => Number(identity.value) === Number(identityIdFromUrl));
            console.log('useEffect Debug:', {
                identityIdFromUrl,
                identityIdFromUrlType: typeof identityIdFromUrl,
                identityExists,
                currentIdentityId: cashAdvanceValue.identity_id,
                shouldUpdate: identityExists && !cashAdvanceValue.identity_id
            });
            if (identityExists && !cashAdvanceValue.identity_id) {
                setCashAdvanceValue(prev => ({
                    ...prev,
                    identity_id: identityIdFromUrl
                }));
            }
        }
    }, [identityIdFromUrl, activeIdentitiesForSelect, cashAdvanceValue.identity_id]);

    // Force re-render when selectedIdentity changes (to update ReactSelect value)
    const [renderKey, setRenderKey] = useState(0);

    useEffect(() => {
        if (activeIdentitiesForSelect && activeIdentitiesForSelect.length > 0 && identityIdFromUrl) {
            const identityExists = activeIdentitiesForSelect.find(identity => Number(identity.value) === Number(identityIdFromUrl));
            if (identityExists) {
                setRenderKey(prev => prev + 1);
            }
        }
    }, [activeIdentitiesForSelect, identityIdFromUrl]);

    // Additional useEffect to ensure form state is synchronized with selectedIdentity
    useEffect(() => {
        if (selectedIdentity && selectedIdentity.value && !cashAdvanceValue.identity_id) {
            console.log('Setting form identity_id from selectedIdentity:', selectedIdentity);
            setCashAdvanceValue(prev => ({
                ...prev,
                identity_id: selectedIdentity.value,
                selectedIdentity: selectedIdentity
            }));
        }
    }, [selectedIdentity, cashAdvanceValue.identity_id]);

    // Debug selectedIdentity changes
    useEffect(() => {
        console.log('selectedIdentity changed:', selectedIdentity);
    }, [selectedIdentity]);
    const disabled =
        singleCashAdvance &&
        moment(singleCashAdvance[0].date).toDate().toString() ===
            cashAdvanceValue.date.toString() &&
        singleCashAdvance[0].identity_id === cashAdvanceValue.identity_id &&
        singleCashAdvance[0].amount === cashAdvanceValue.amount &&
        (singleCashAdvance[0].notes || "") === (cashAdvanceValue.notes || "");

    const handleValidation = () => {
        let formErrors = {};
        let isValid = true;

        if (!cashAdvanceValue["identity_id"]) {
            formErrors["identity_id"] = getFormattedMessage("cash_advance_identity.input.identity_id.validate.label");
            isValid = false;
        }
        if (!cashAdvanceValue["amount"]) {
            formErrors["amount"] = getFormattedMessage("cash_advance.input.amount.validate.label");
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    const onWarehouseChange = (obj) => {
        console.log('CashAdvanceForm onWarehouseChange called:', { obj, objValue: obj?.value, objLabel: obj?.label });
        setCashAdvanceValue((inputs) => ({
            ...inputs,
            warehouse_id: obj?.value || obj
        }));
        setErrors("");
    };

    const onIdentityChange = (obj) => {
        console.log('CashAdvanceForm onIdentityChange called:', { obj, objValue: obj?.value, objLabel: obj?.label });
        // Store the full option object for ReactSelect, but also keep the value for form submission
        setCashAdvanceValue((inputs) => ({
            ...inputs,
            identity_id: obj?.value || obj,
            selectedIdentity: obj // Store the full object for display
        }));
        setErrors("");
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setCashAdvanceValue((inputs) => ({ ...inputs, [e.target.name]: e.target.value }));
        setErrors("");
    };

    const handleCallback = (date) => {
        setCashAdvanceValue((previousState) => ({ ...previousState, date }));
    };

    const prepareData = (data) => {
        return {
            date: moment(data.date).toDate(),
            warehouse_id: data.warehouse_id || 1, // Default to warehouse ID 1 if not set
            identity_id: typeof data.identity_id === 'object' ? data.identity_id.value : data.identity_id,
            amount: String(data.amount || ""),
            notes: String(data.notes || ""),
        };
    };

    const currencySymbol = frontSetting?.value?.currency_symbol;

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (singleCashAdvance && valid) {
            if (!disabled) {
                editCashAdvance(id, prepareData(cashAdvanceValue), navigate);
            }
        } else if (valid) {
            setCashAdvanceValue(cashAdvanceValue);
            addCashAdvanceData(prepareData(cashAdvanceValue));
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <Form>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash_advance.detail.date")}:
                            </label>
                            <span className="required" />
                            <div className="position-relative">
                                <ReactDatePicker
                                    onChangeDate={handleCallback}
                                    newStartDate={cashAdvanceValue.date}
                                />
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <ReactSelect
                                key={renderKey}
                                title={getFormattedMessage("cash_advance_identity.title")}
                                placeholder={intl.formatMessage({ id: "cash_advance_identity.input.identity_id.placeholder.label" })}
                                value={selectedIdentity}
                                errors={errors["identity_id"]}
                                data={activeIdentitiesForSelect}
                                onChange={onIdentityChange}
                                isDisabled={false}
                                isWarehouseDisable={false}
                            />
                        </div>


                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash_advance.input.amount.label")}:
                            </label>
                            <span className="required" />
                            <InputGroup>
                                <input
                                    type="text"
                                    name="amount"
                                    value={cashAdvanceValue.amount || ""}
                                    placeholder={intl.formatMessage({ id: "cash_advance.input.amount.placeholder.label" })}
                                    pattern="[0-9]*"
                                    min={0}
                                    className="form-control"
                                    onKeyPress={(event) => decimalValidate(event)}
                                    onChange={(e) => onChangeInput(e)}
                                />
                                {currencySymbol && (
                                    <InputGroup.Text>{currencySymbol}</InputGroup.Text>
                                )}
                            </InputGroup>
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["amount"] ? errors["amount"] : null}
                            </span>
                        </div>

                        <div className="col-12 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash_advance.input.note.label")}:
                            </label>
                            <textarea
                                name="notes"
                                className="form-control"
                                rows="3"
                                placeholder={intl.formatMessage({ id: "cash_advance.input.note.placeholder.label" })}
                                onChange={(e) => onChangeInput(e)}
                                value={cashAdvanceValue.notes || ""}
                            />
                        </div>

                        <ModelFooter
                            onEditRecord={singleCashAdvance}
                            onSubmit={onSubmit}
                            editDisabled={disabled}
                            link="/user/cash-advance-identities"
                            addDisabled={
                                !cashAdvanceValue.identity_id ||
                                !cashAdvanceValue.amount
                            }
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default CashAdvanceForm;
