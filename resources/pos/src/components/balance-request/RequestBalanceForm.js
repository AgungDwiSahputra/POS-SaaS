import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { InputGroup } from "react-bootstrap-v5";
import { addBalanceRequest, fetchBalanceRequests } from "../../store/action/balanceRequestAction";
import { fetchProviders } from "../../store/action/providerAction";
import { getFormattedMessage, placeholderText, getCurrentUser, getFormattedText, currencySymbolHandling } from "../../shared/sharedMethod";
import ModelFooter from "../../shared/components/modelFooter";

const RequestBalanceForm = (props) => {
    const {
        addBalanceRequest,
        fetchProviders,
        providers,
        frontSetting,
        allConfigData,
    } = props;

    const navigate = useNavigate();

    const [balanceRequestValue, setBalanceRequestValue] = useState({
        provider_id: "",
        amount: "",
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

    const prepareFormData = () => {
        const formData = new FormData();

        formData.append("provider_id", balanceRequestValue.provider_id);
        formData.append("amount", parseFloat(balanceRequestValue.amount) || 0);
        formData.append("notes", balanceRequestValue.notes || "");

        return formData;
    };

    const handleValidation = () => {
        let errors = {};
        let isValid = false;

        if (!balanceRequestValue["provider_id"] || balanceRequestValue["provider_id"] === "") {
            errors["provider_id"] = getFormattedText("balance-request.input.provider.validate.label");
        } else if (!balanceRequestValue["amount"] || isNaN(parseFloat(balanceRequestValue["amount"])) || parseFloat(balanceRequestValue["amount"]) <= 0) {
            errors["amount"] = getFormattedText("balance-request.input.amount.validate.label");
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

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    // Format currency for display
    const formatCurrency = (amount) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            amount
        );
    };

    // Prepare providers for select dropdown
    const providerOptions = providers && providers.length > 0
        ? providers.map(provider => {
            const attributes = provider.attributes || provider;
            return {
                value: attributes.id || provider.id,
                label: attributes.nama_provider || provider.nama_provider,
                saldo: attributes.saldo || provider.saldo || 0,
                status: attributes.status || provider.status || 'active'
            };
        })
        : [];

    // Get selected provider details
    const selectedProvider = providerOptions.find(
        p => p.value === parseInt(balanceRequestValue.provider_id)
    );

    return (
        <div className="card">
            <div className="card-body">
                <div className="mb-4">
                    <h5 className="mb-2">{getFormattedMessage("balance-request.create.title")}</h5>
                    <p className="text-muted mb-0">
                        {getFormattedText("balance-request.input.provider.validate.label") === "Please select provider"
                            ? "Submit a balance request for your provider account"
                            : "Ajukan permintaan saldo untuk akun provider Anda"}
                    </p>
                </div>

                <Form>
                    <div className="row">
                        {/* Left Column - Form */}
                        <div className="col-xl-7 col-lg-8">
                            {/* Provider Selection */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">
                                    {getFormattedMessage("balance-request.input.provider.label")}
                                </label>
                                <span className="required text-danger ms-1">*</span>
                                <Form.Select
                                    name="provider_id"
                                    value={balanceRequestValue.provider_id}
                                    onChange={(e) => onChangeInput(e)}
                                    className={`form-control ${errors["provider_id"] ? "is-invalid" : ""}`}
                                    autoFocus={true}
                                >
                                    <option value="">
                                        {placeholderText("balance-request.input.provider.placeholder.label")}
                                    </option>
                                    {providerOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                                {errors["provider_id"] && (
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["provider_id"]}
                                    </span>
                                )}
                            </div>

                            {/* Provider Info Card - Show when provider is selected */}
                            {selectedProvider && (
                                <div className="card bg-light border-0 mb-4">
                                    <div className="card-body py-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="mb-1">{selectedProvider.label}</h6>
                                                <div className="d-flex align-items-center gap-3">
                                                    <small className="text-muted">
                                                        {getFormattedMessage("provider.input.saldo.label")}:{" "}
                                                        <span className="fw-semibold text-dark">
                                                            {formatCurrency(selectedProvider.saldo)}
                                                        </span>
                                                    </small>
                                                    <span className={`badge ${selectedProvider.status === 'active' ? 'bg-light-success' : 'bg-light-danger'}`}>
                                                        {selectedProvider.status === 'active'
                                                            ? getFormattedText("status.active")
                                                            : getFormattedText("status.inactive")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <i className="fa fa-building fa-2x text-primary opacity-25"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Amount Input */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">
                                    {getFormattedMessage("balance-request.input.amount.label")}
                                </label>
                                <span className="required text-danger ms-1">*</span>
                                <InputGroup className={`${errors["amount"] ? "is-invalid" : ""}`}>
                                    <InputGroup.Text className="bg-light">
                                        {currencySymbol || '$'}
                                    </InputGroup.Text>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={balanceRequestValue.amount}
                                        placeholder={placeholderText("balance-request.input.amount.placeholder.label")}
                                        className="form-control"
                                        min="0.01"
                                        step="0.01"
                                        onChange={(e) => onChangeInput(e)}
                                    />
                                </InputGroup>
                                {errors["amount"] && (
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["amount"]}
                                    </span>
                                )}
                                {!errors["amount"] && (
                                    <small className="text-muted">
                                        {getFormattedMessage("balance-request.input.amount.placeholder.label")}
                                    </small>
                                )}
                            </div>

                            {/* Notes Input */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">
                                    {getFormattedMessage("balance-request.input.notes.label")}
                                </label>
                                <textarea
                                    className="form-control"
                                    name="notes"
                                    rows={3}
                                    placeholder={placeholderText("balance-request.input.notes.placeholder.label")}
                                    onChange={(e) => onChangeInput(e)}
                                    value={balanceRequestValue.notes}
                                />
                                <small className="text-muted">
                                    {getFormattedMessage("balance-request.input.notes.placeholder.label")}
                                </small>
                            </div>
                        </div>

                        {/* Right Column - Summary */}
                        <div className="col-xl-5 col-lg-4">
                            <div className="card border-primary">
                                <div className="card-header bg-primary text-white">
                                    <h6 className="mb-0">
                                        <i className="fa fa-file-invoice me-2"></i>
                                        {getFormattedMessage("globally.detail.summary") || "Summary"}
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">
                                            {getFormattedMessage("balance-request.input.provider.label")}
                                        </span>
                                        <span className="fw-semibold">
                                            {selectedProvider ? selectedProvider.label : "-"}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted">
                                            {getFormattedMessage("balance-request.input.amount.label")}
                                        </span>
                                        <span className="fw-semibold text-primary fs-5">
                                            {balanceRequestValue.amount && parseFloat(balanceRequestValue.amount) > 0
                                                ? formatCurrency(balanceRequestValue.amount)
                                                : "-"}
                                        </span>
                                    </div>
                                    {selectedProvider && balanceRequestValue.amount && parseFloat(balanceRequestValue.amount) > 0 && (
                                        <>
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="text-muted">Current Balance</span>
                                                <span className="fw-semibold">
                                                    {formatCurrency(selectedProvider.saldo)}
                                                </span>
                                            </div>
                                            <hr />
                                            <div className="d-flex justify-content-between">
                                                <span className="fw-semibold">New Balance (Est.)</span>
                                                <span className="fw-bold text-success fs-5">
                                                    {formatCurrency(
                                                        (parseFloat(selectedProvider.saldo) || 0) + parseFloat(balanceRequestValue.amount)
                                                    )}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    {balanceRequestValue.notes && (
                                        <>
                                            <hr />
                                            <div className="mb-2">
                                                <small className="text-muted d-block mb-1">
                                                    {getFormattedMessage("balance-request.input.notes.label")}
                                                </small>
                                                <p className="mb-0 small">{balanceRequestValue.notes}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="alert alert-info mt-3 mb-0">
                                <i className="fa fa-info-circle me-2"></i>
                                <small>
                                    Your request will be submitted for admin approval.
                                    You will be notified once it's approved or rejected.
                                </small>
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
    );
};

const mapStateToProps = (state) => {
    const {
        frontSetting,
        providers,
        balanceRequests,
        allConfigData,
    } = state;
    return {
        frontSetting,
        providers,
        balanceRequests,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    addBalanceRequest,
    fetchProviders,
})(RequestBalanceForm);
