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

    // Set selected identity based on singleCashAdvance or URL parameter
    const selectedIdentity = singleCashAdvance && singleCashAdvance[0]?.identity_id 
        ? { 
            value: singleCashAdvance[0].identity_id, 
            label: singleCashAdvance[0].identity_name || singleCashAdvance[0].identity_id 
          }
        : identityIdFromUrl && activeIdentitiesForSelect?.find(id => id.value == identityIdFromUrl);

    useEffect(() => {
        if (!activeIdentitiesForSelect && fetchActiveIdentitiesForSelect) {
            fetchActiveIdentitiesForSelect();
        }
    }, [activeIdentitiesForSelect, fetchActiveIdentitiesForSelect]);
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
            formErrors["identity_id"] = getFormattedMessage("cash-advance-identity.input.identity_id.validate.label");
            isValid = false;
        }
        if (!cashAdvanceValue["amount"]) {
            formErrors["amount"] = getFormattedMessage("cash-advance.input.amount.validate.label");
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    const onIdentityChange = (obj) => {
        setCashAdvanceValue((inputs) => ({ ...inputs, identity_id: obj?.value || obj }));
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
                                {getFormattedMessage("react-data-table.date.column.label")}:
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
                                title={getFormattedMessage("cash-advance-identity.title")}
                                placeholder={intl.formatMessage({ id: "cash-advance-identity.input.identity_id.placeholder.label" })}
                                defaultValue={selectedIdentity}
                                errors={errors["identity_id"]}
                                data={activeIdentitiesForSelect}
                                onChange={onIdentityChange}
                                isDisabled={!!identityIdFromUrl}
                            />
                        </div>


                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("amount.title")}:
                            </label>
                            <span className="required" />
                            <InputGroup>
                                <input
                                    type="text"
                                    name="amount"
                                    value={cashAdvanceValue.amount || ""}
                                    placeholder={intl.formatMessage({ id: "cash-advance.input.amount.placeholder.label" })}
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
                                {getFormattedMessage("globally.input.note.label")}: 
                            </label>
                            <textarea
                                name="notes"
                                className="form-control"
                                rows="3"
                                placeholder={intl.formatMessage({ id: "globally.input.note.placeholder.label" })}
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
