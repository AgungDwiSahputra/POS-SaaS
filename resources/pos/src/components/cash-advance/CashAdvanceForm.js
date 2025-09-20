import React, { useMemo, useState } from "react";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { InputGroup } from "react-bootstrap-v5";
import {
    decimalValidate,
    getFormattedMessage,
    placeholderText,
} from "../../shared/sharedMethod";
import ModelFooter from "../../shared/components/modelFooter";
import ReactSelect from "../../shared/select/reactSelect";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";

const CashAdvanceForm = (props) => {
    const {
        addCashAdvanceData,
        id,
        editCashAdvance,
        singleCashAdvance,
        warehouses,
        frontSetting,
        prefillData = null,
    } = props;
    const navigate = useNavigate();
    const prefillWarehouseOption = useMemo(() => {
        if (!prefillData || !prefillData.warehouse_id) {
            return null;
        }

        return {
            value: prefillData.warehouse_id,
            label: prefillData.warehouse_name,
        };
    }, [prefillData]);

    const [cashAdvanceValue, setCashAdvanceValue] = useState(() => ({
        date: singleCashAdvance
            ? moment(singleCashAdvance[0].date).toDate()
            : new Date(),
        warehouse_id: singleCashAdvance
            ? singleCashAdvance[0].warehouse_id
            : prefillWarehouseOption || "",
        issued_to_name: singleCashAdvance
            ? singleCashAdvance[0].issued_to_name
            : prefillData?.issued_to_name || "",
        issued_to_phone: singleCashAdvance
            ? singleCashAdvance[0].issued_to_phone
            : prefillData?.issued_to_phone || "",
        issued_to_email: singleCashAdvance
            ? singleCashAdvance[0].issued_to_email
            : prefillData?.issued_to_email || "",
        amount: singleCashAdvance ? singleCashAdvance[0].amount : "",
        notes: singleCashAdvance ? singleCashAdvance[0].notes : "",
    }));

    const [errors, setErrors] = useState({
        date: "",
        warehouse_id: "",
        issued_to_name: "",
        amount: "",
    });
    const selectedWarehouse = useMemo(() => {
        if (singleCashAdvance) {
            return singleCashAdvance[0].warehouse_id;
        }

        if (prefillWarehouseOption) {
            return prefillWarehouseOption;
        }

        return null;
    }, [singleCashAdvance, prefillWarehouseOption]);

    const disabled =
        singleCashAdvance &&
        moment(singleCashAdvance[0].date).toDate().toString() ===
            cashAdvanceValue.date.toString() &&
        singleCashAdvance[0].warehouse_id.value === cashAdvanceValue.warehouse_id.value &&
        singleCashAdvance[0].issued_to_name === cashAdvanceValue.issued_to_name &&
        (singleCashAdvance[0].issued_to_phone || "") === cashAdvanceValue.issued_to_phone &&
        (singleCashAdvance[0].issued_to_email || "") === cashAdvanceValue.issued_to_email &&
        singleCashAdvance[0].amount === cashAdvanceValue.amount &&
        (singleCashAdvance[0].notes || "") === (cashAdvanceValue.notes || "");

    const handleValidation = () => {
        let formErrors = {};
        let isValid = true;

        if (!cashAdvanceValue["warehouse_id"]) {
            formErrors["warehouse_id"] = getFormattedMessage(
                "product.input.warehouse.validate.label"
            );
            isValid = false;
        }
        if (!cashAdvanceValue["issued_to_name"]) {
            formErrors["issued_to_name"] = getFormattedMessage(
                "cash-advance.input.recipient.validate.label"
            );
            isValid = false;
        }
        if (!cashAdvanceValue["amount"]) {
            formErrors["amount"] = getFormattedMessage(
                "cash-advance.input.amount.validate.label"
            );
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    const onWarehouseChange = (obj) => {
        setCashAdvanceValue((inputs) => ({ ...inputs, warehouse_id: obj }));
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
            warehouse_id: data.warehouse_id.value,
            issued_to_name: data.issued_to_name,
            issued_to_phone: data.issued_to_phone,
            issued_to_email: data.issued_to_email,
            amount: data.amount,
            notes: data.notes,
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
                                title={getFormattedMessage("warehouse.title")}
                                placeholder={placeholderText(
                                    "product.input.warehouse.placeholder.label"
                                )}
                                defaultValue={selectedWarehouse}
                                errors={errors["warehouse_id"]}
                                data={warehouses}
                                onChange={onWarehouseChange}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance.input.recipient.label")}:
                            </label>
                            <span className="required" />
                            <input
                                type="text"
                                name="issued_to_name"
                                className="form-control"
                                placeholder={placeholderText(
                                    "cash-advance.input.recipient.placeholder.label"
                                )}
                                onChange={(e) => onChangeInput(e)}
                                value={cashAdvanceValue.issued_to_name || ""}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["issued_to_name"] ? errors["issued_to_name"] : null}
                            </span>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance.input.phone.label")}:
                            </label>
                            <input
                                type="text"
                                name="issued_to_phone"
                                className="form-control"
                                placeholder={placeholderText(
                                    "cash-advance.input.phone.placeholder.label"
                                )}
                                onChange={(e) => onChangeInput(e)}
                                value={cashAdvanceValue.issued_to_phone || ""}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance.input.email.label")}:
                            </label>
                            <input
                                type="email"
                                name="issued_to_email"
                                className="form-control"
                                placeholder={placeholderText(
                                    "cash-advance.input.email.placeholder.label"
                                )}
                                onChange={(e) => onChangeInput(e)}
                                value={cashAdvanceValue.issued_to_email || ""}
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
                                    placeholder={placeholderText(
                                        "cash-advance.input.amount.placeholder.label"
                                    )}
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

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance.input.notes.label")}: 
                            </label>
                            <textarea
                                name="notes"
                                className="form-control"
                                rows="3"
                                placeholder={placeholderText(
                                    "cash-advance.input.notes.placeholder.label"
                                )}
                                onChange={(e) => onChangeInput(e)}
                                value={cashAdvanceValue.notes || ""}
                            />
                        </div>

                        <ModelFooter
                            onEditRecord={singleCashAdvance}
                            onSubmit={onSubmit}
                            editDisabled={disabled}
                            link="/user/cash-advances"
                            addDisabled={
                                !cashAdvanceValue.warehouse_id ||
                                !cashAdvanceValue.issued_to_name ||
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
