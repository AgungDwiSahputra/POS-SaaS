import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Modal, Button, Form, InputGroup } from "react-bootstrap-v5";
import { addBalanceRequest } from "../../store/action/balanceRequestAction";
import { fetchProviders } from "../../store/action/providerAction";
import { getFormattedMessage, placeholderText, currencySymbolHandling } from "../../shared/sharedMethod";

const CreateBalanceRequestModal = (props) => {
    const {
        show,
        onHide,
        addBalanceRequest,
        fetchProviders,
        providers,
        frontSetting,
        allConfigData,
    } = props;

    const [balanceRequestValue, setBalanceRequestValue] = useState({
        provider_id: "",
        amount: "",
        notes: "",
    });

    const [errors, setErrors] = useState({});

    // Fetch providers on component mount
    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!show) {
            setBalanceRequestValue({
                provider_id: "",
                amount: "",
                notes: "",
            });
            setErrors({});
        }
    }, [show]);

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const formatCurrency = (amount) => {
        return currencySymbolHandling(
            allConfigData,
            currencySymbol,
            amount
        );
    };

    const providerOptions = providers && providers.length > 0
        ? providers.map((provider) => ({
            value: provider.id,
            label: provider.attributes?.nama_provider || provider.nama_provider,
            saldo: provider.attributes?.saldo || provider.saldo || 0,
            status: provider.attributes?.status || provider.status || 'inactive',
        }))
        : [];

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

    const getFormattedText = (key) => {
        const message = getFormattedMessage(key);
        return message !== key ? message : "";
    };

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (valid) {
            const formData = prepareFormData();
            addBalanceRequest(formData, onHide);
        }
    };

    const handleClose = () => {
        setBalanceRequestValue({
            provider_id: "",
            amount: "",
            notes: "",
        });
        setErrors({});
        onHide();
    };

    // Get selected provider details
    const selectedProvider = providerOptions.find(
        p => p.value === parseInt(balanceRequestValue.provider_id)
    );

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            aria-labelledby="create-balance-request-modal"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="create-balance-request-modal">
                    {getFormattedMessage("balance-request.create.title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onSubmit}>
                    {/* Provider Selection */}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            {getFormattedMessage("balance-request.input.provider.label")}
                            <span className="required text-danger ms-1">*</span>
                        </Form.Label>
                        <Form.Select
                            name="provider_id"
                            value={balanceRequestValue.provider_id}
                            onChange={(e) => onChangeInput(e)}
                            className={errors["provider_id"] ? "is-invalid" : ""}
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
                    </Form.Group>

                    {/* Provider Info Card - Show when provider is selected */}
                    {selectedProvider && (
                        <div className="alert alert-light border mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted d-block">
                                        {getFormattedMessage("provider.input.saldo.label")}:
                                    </small>
                                    <span className="fw-semibold text-dark">
                                        {formatCurrency(selectedProvider.saldo)}
                                    </span>
                                </div>
                                <span className={`badge ${selectedProvider.status === 'active' ? 'bg-light-success' : 'bg-light-danger'}`}>
                                    {selectedProvider.status === 'active'
                                        ? getFormattedText("status.active")
                                        : getFormattedText("status.inactive")}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Amount Input */}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            {getFormattedMessage("balance-request.input.amount.label")}
                            <span className="required text-danger ms-1">*</span>
                        </Form.Label>
                        <InputGroup className={errors["amount"] ? "is-invalid" : ""}>
                            <InputGroup.Text className="bg-light">
                                {currencySymbol || '$'}
                            </InputGroup.Text>
                            <Form.Control
                                type="number"
                                name="amount"
                                value={balanceRequestValue.amount}
                                placeholder={placeholderText("balance-request.input.amount.placeholder.label")}
                                min="0.01"
                                step="0.01"
                                onChange={(e) => onChangeInput(e)}
                                isInvalid={!!errors["amount"]}
                            />
                        </InputGroup>
                        {errors["amount"] && (
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["amount"]}
                            </span>
                        )}
                        {/* Estimated new balance */}
                        {!errors["amount"] && selectedProvider && balanceRequestValue.amount && parseFloat(balanceRequestValue.amount) > 0 && (
                            <small className="text-muted">
                                {getFormattedText("balance-request.estimated-balance") || "Estimated Balance"}:{" "}
                                <span className="fw-semibold text-success">
                                    {formatCurrency(
                                        (parseFloat(selectedProvider.saldo) || 0) + parseFloat(balanceRequestValue.amount)
                                    )}
                                </span>
                            </small>
                        )}
                    </Form.Group>

                    {/* Notes Input */}
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            {getFormattedMessage("balance-request.input.notes.label")}
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            name="notes"
                            rows={3}
                            placeholder={placeholderText("balance-request.input.notes.placeholder.label")}
                            onChange={(e) => onChangeInput(e)}
                            value={balanceRequestValue.notes}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    {getFormattedMessage("globally.cancel-btn")}
                </Button>
                <Button
                    variant="primary"
                    onClick={onSubmit}
                >
                    {getFormattedMessage("balance-request.create.title")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const mapStateToProps = (state) => {
    const { frontSetting, providers, allConfigData } = state;
    return {
        frontSetting,
        providers,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    addBalanceRequest,
    fetchProviders,
})(CreateBalanceRequestModal);
