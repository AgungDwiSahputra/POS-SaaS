import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";
import { InputGroup } from "react-bootstrap-v5";
import { addBalanceRequest } from "../../store/action/balanceRequestAction";
import { fetchProviders } from "../../store/action/providerAction";
import {
    getFormattedMessage,
    placeholderText,
    getFormattedText,
    currencySymbolHandling
} from "../../shared/sharedMethod";
import ModelFooter from "../../shared/components/modelFooter";
import ReactSelect from "../../shared/select/reactSelect";

const BalanceRequestForm = (props) => {
    const {
        addBalanceRequest,
        navigate,
        frontSetting,
        allConfigData,
        providers,
        fetchProviders,
    } = props;

    const [balanceRequestValue, setBalanceRequestValue] = useState({
        provider_id: "",
        requested_amount: "",
        notes: "",
    });

    const [errors, setErrors] = useState({});

    // Fetch providers on component mount
    useEffect(() => {
        fetchProviders();
    }, []);

    const onChangeInput = (e) => {
        setBalanceRequestValue({
            ...balanceRequestValue,
            [e.target.name]: e.target.value
        });
        setErrors({});
    };

    const handleProviderChange = (selectedProvider) => {
        setBalanceRequestValue({
            ...balanceRequestValue,
            provider_id: selectedProvider.value,
        });
        setErrors({ ...errors, provider_id: "" });
    };

    const prepareFormData = () => {
        const formData = new FormData();
        formData.append("provider_id", balanceRequestValue.provider_id);
        formData.append("requested_amount", parseFloat(balanceRequestValue.requested_amount) || 0);
        formData.append("notes", balanceRequestValue.notes || "");
        return formData;
    };

    const handleValidation = () => {
        let errors = {};
        let isValid = false;

        if (!balanceRequestValue["provider_id"]) {
            errors["provider_id"] = getFormattedText("balance-request.input.provider.validate.label");
        } else if (!balanceRequestValue["requested_amount"] || isNaN(parseFloat(balanceRequestValue["requested_amount"])) || parseFloat(balanceRequestValue["requested_amount"]) <= 0) {
            errors["requested_amount"] = getFormattedText("balance-request.input.amount.validate.label");
        } else {
            isValid = true;
        }

        setErrors(errors);
        return isValid;
    };

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (valid) {
            const formData = prepareFormData();
            addBalanceRequest(formData, navigate);
        }
    };

    // Prepare provider options for React Select
    const providerOptions = providers && providers.length > 0
        ? providers.map(provider => {
            const attributes = provider.attributes || provider;
            return {
                value: attributes.id || provider.id,
                label: attributes.nama_provider || provider.nama_provider,
            };
        })
        : [];

    const currencySymbol = frontSetting?.value?.currency_symbol || '$';

    return (
        <>
            <div className="card">
                <div className="card-body">
                    <Form>
                        <div className="row">
                            <div className="col-xl-8">
                                <div className="card">
                                    <div className="card-body p-0">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    {getFormattedMessage("balance-request.input.provider.label")}
                                                    :{" "}
                                                </label>
                                                <span className="required" />
                                                <ReactSelect
                                                    options={providerOptions}
                                                    onChange={handleProviderChange}
                                                    placeholder={placeholderText("balance-request.input.provider.placeholder.label")}
                                                    value={providerOptions.find(option => option.value === balanceRequestValue.provider_id)}
                                                    isRequired
                                                />
                                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                                    {errors["provider_id"] ? errors["provider_id"] : null}
                                                </span>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    {getFormattedMessage("balance-request.input.amount.label")}
                                                    :{" "}
                                                </label>
                                                <span className="required" />
                                                <InputGroup>
                                                    <input
                                                        type="number"
                                                        name="requested_amount"
                                                        value={balanceRequestValue.requested_amount}
                                                        placeholder={placeholderText("balance-request.input.amount.placeholder.label")}
                                                        className="form-control"
                                                        min="0"
                                                        step="0.01"
                                                        autoFocus={true}
                                                        onChange={(e) => onChangeInput(e)}
                                                    />
                                                    <InputGroup.Text>
                                                        {currencySymbol}
                                                    </InputGroup.Text>
                                                </InputGroup>
                                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                                    {errors["requested_amount"] ? errors["requested_amount"] : null}
                                                </span>
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label">
                                                    {getFormattedMessage("balance-request.input.notes.label")}
                                                    :{" "}
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    name="notes"
                                                    rows={4}
                                                    placeholder={placeholderText("balance-request.input.notes.placeholder.label")}
                                                    onChange={(e) => onChangeInput(e)}
                                                    value={balanceRequestValue.notes}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ModelFooter
                            onEditRecord={false}
                            onSubmit={onSubmit}
                            link="/user/balance-requests"
                        />
                    </Form>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = (state) => {
    const {
        frontSetting,
        allConfigData,
        providers,
    } = state;
    return {
        frontSetting,
        allConfigData,
        providers,
    };
};

export default connect(mapStateToProps, {
    addBalanceRequest,
    fetchProviders,
})(BalanceRequestForm);
