import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
    getFormattedMessage,
} from "../../shared/sharedMethod";
import { useIntl } from "react-intl";
import ModelFooter from "../../shared/components/modelFooter";
import ReactSelect from "../../shared/select/reactSelect";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";

const CashAdvanceIdentityForm = (props) => {
    const {
        addCashAdvanceIdentityData,
        id,
        editCashAdvanceIdentity,
        singleCashAdvanceIdentity,
    } = props;
    const navigate = useNavigate();
    const intl = useIntl();
    const [identityValue, setIdentityValue] = useState({
        name: singleCashAdvanceIdentity ? singleCashAdvanceIdentity[0].name : "",
        email: singleCashAdvanceIdentity ? singleCashAdvanceIdentity[0].email : "",
        phone: singleCashAdvanceIdentity ? singleCashAdvanceIdentity[0].phone : "",
        department: singleCashAdvanceIdentity ? singleCashAdvanceIdentity[0].department : "",
        address: singleCashAdvanceIdentity ? singleCashAdvanceIdentity[0].address : "",
        date_of_birth: singleCashAdvanceIdentity && singleCashAdvanceIdentity[0].date_of_birth
            ? moment(singleCashAdvanceIdentity[0].date_of_birth).toDate()
            : null,
        type: singleCashAdvanceIdentity ? singleCashAdvanceIdentity[0].type : "employee",
        is_active: singleCashAdvanceIdentity ? singleCashAdvanceIdentity[0].is_active : true,
        notes: singleCashAdvanceIdentity ? singleCashAdvanceIdentity[0].notes : "",
    });

    const [errors, setErrors] = useState({
        name: "",
        type: "",
    });

    const typeOptions = [
        { value: "employee", label: getFormattedMessage("cash-advance-identity.input.type.employee") },
        { value: "contractor", label: getFormattedMessage("cash-advance-identity.input.type.contractor") },
        { value: "other", label: getFormattedMessage("cash-advance-identity.input.type.other") },
    ];

    const [selectedType] = useState(
        singleCashAdvanceIdentity
            ? typeOptions.find(option => option.value === singleCashAdvanceIdentity[0].type)
            : typeOptions[0]
    );

    const disabled =
        singleCashAdvanceIdentity &&
        singleCashAdvanceIdentity[0].name === identityValue.name &&
        singleCashAdvanceIdentity[0].email === identityValue.email &&
        singleCashAdvanceIdentity[0].phone === identityValue.phone &&
        singleCashAdvanceIdentity[0].department === identityValue.department &&
        singleCashAdvanceIdentity[0].address === identityValue.address &&
        singleCashAdvanceIdentity[0].type === identityValue.type &&
        singleCashAdvanceIdentity[0].is_active === identityValue.is_active &&
        singleCashAdvanceIdentity[0].notes === identityValue.notes;

    const handleValidation = () => {
        let formErrors = {};
        let isValid = true;

        if (!identityValue["name"]) {
            formErrors["name"] = getFormattedMessage("cash-advance-identity.input.name.validate.label");
            isValid = false;
        }
        if (!identityValue["type"]) {
            formErrors["type"] = getFormattedMessage("cash-advance-identity.input.type.validate.label");
            isValid = false;
        }

        setErrors(formErrors);
        return isValid;
    };

    const onTypeChange = (obj) => {
        setIdentityValue((inputs) => ({ ...inputs, type: obj.value }));
        setErrors("");
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        const { name, value, type, checked } = e.target;
        setIdentityValue((inputs) => ({
            ...inputs,
            [name]: type === 'checkbox' ? checked : value
        }));
        setErrors("");
    };

    const handleCallback = (date) => {
        setIdentityValue((previousState) => ({ ...previousState, date_of_birth: date }));
    };

    const prepareData = (data) => {
        return {
            name: data.name,
            email: data.email,
            phone: data.phone,
            department: data.department,
            address: data.address,
            date_of_birth: data.date_of_birth ? moment(data.date_of_birth).format('YYYY-MM-DD') : null,
            type: data.type,
            is_active: data.is_active,
            notes: data.notes,
        };
    };

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (singleCashAdvanceIdentity && valid) {
            if (!disabled) {
                editCashAdvanceIdentity(id, prepareData(identityValue), navigate);
            }
        } else if (valid) {
            setIdentityValue(identityValue);
            addCashAdvanceIdentityData(prepareData(identityValue));
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <Form>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance-identity.input.name.label")}:
                            </label>
                            <span className="required" />
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder={intl.formatMessage({ id: "cash-advance-identity.input.name.placeholder.label" })}
                                onChange={(e) => onChangeInput(e)}
                                value={identityValue.name || ""}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["name"] ? errors["name"] : null}
                            </span>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance-identity.input.type.label")}:
                            </label>
                            <span className="required" />
                            <ReactSelect
                                title=""
                                placeholder={intl.formatMessage({ id: "cash-advance-identity.input.type.placeholder.label" })}
                                defaultValue={selectedType}
                                errors={errors["type"]}
                                data={typeOptions}
                                onChange={onTypeChange}
                            />
                        </div>

                        {singleCashAdvanceIdentity && singleCashAdvanceIdentity[0].employee_id && (
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    {getFormattedMessage("cash-advance-identity.input.employee_id.label")}:
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={singleCashAdvanceIdentity[0].employee_id}
                                    readOnly
                                    style={{ backgroundColor: '#f8f9fa' }}
                                />
                                <small className="text-muted">{getFormattedMessage("cash-advance-identity.input.employee_id.auto_generated")}</small>
                            </div>
                        )}

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance-identity.input.email.label")}:
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder={intl.formatMessage({ id: "cash-advance-identity.input.email.placeholder.label" })}
                                onChange={(e) => onChangeInput(e)}
                                value={identityValue.email || ""}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance-identity.input.phone.label")}:
                            </label>
                            <input
                                type="text"
                                name="phone"
                                className="form-control"
                                placeholder={intl.formatMessage({ id: "cash-advance-identity.input.phone.placeholder.label" })}
                                onChange={(e) => onChangeInput(e)}
                                value={identityValue.phone || ""}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance-identity.input.department.label")}:
                            </label>
                            <input
                                type="text"
                                name="department"
                                className="form-control"
                                placeholder={intl.formatMessage({ id: "cash-advance-identity.input.department.placeholder.label" })}
                                onChange={(e) => onChangeInput(e)}
                                value={identityValue.department || ""}
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance-identity.input.date_of_birth.label")}:
                            </label>
                            <div className="position-relative">
                                <ReactDatePicker
                                    onChangeDate={handleCallback}
                                    newStartDate={identityValue.date_of_birth}
                                />
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance-identity.input.status.label")}:
                            </label>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="is_active"
                                    checked={identityValue.is_active}
                                    onChange={(e) => onChangeInput(e)}
                                />
                                <label className="form-check-label">
                                    {getFormattedMessage("cash-advance-identity.input.status.active")}
                                </label>
                            </div>
                        </div>

                        <div className="col-12 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("cash-advance-identity.input.address.label")}:
                            </label>
                            <textarea
                                name="address"
                                className="form-control"
                                rows="3"
                                placeholder={intl.formatMessage({ id: "cash-advance-identity.input.address.placeholder.label" })}
                                onChange={(e) => onChangeInput(e)}
                                value={identityValue.address || ""}
                            />
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
                                value={identityValue.notes || ""}
                            />
                        </div>

                        <ModelFooter
                            onEditRecord={singleCashAdvanceIdentity}
                            onSubmit={onSubmit}
                            editDisabled={disabled}
                            link="/user/cash-advance-identities"
                            addDisabled={
                                !identityValue.name ||
                                !identityValue.type
                            }
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default CashAdvanceIdentityForm;
