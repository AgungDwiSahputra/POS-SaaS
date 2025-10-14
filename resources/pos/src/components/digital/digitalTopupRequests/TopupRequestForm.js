import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
} from "../../../shared/sharedMethod";
import ReactSelect from "../../../shared/select/reactSelect";

const TopupRequestForm = (props) => {
    const { onSubmit, isLoading, topupRequest, stores, digitalProviders, storeDigitalProviders, frontSetting, allConfigData } = props;

    const [selectedProviderBalance, setSelectedProviderBalance] = useState(0);

    const currencySymbol = frontSetting?.value?.currency_symbol || "Rp";

    const formatCurrency = (amount) => {
        return currencySymbolHandling(allConfigData, currencySymbol, amount);
    };

    const storeOptions = stores ? stores.map((store) => ({
        label: store.attributes.name,
        value: store.id,
    })) : [];

    const providerOptions = digitalProviders ? digitalProviders
        .filter(provider => provider.attributes.is_active)
        .map((provider) => ({
            label: `${provider.attributes.name} (${provider.attributes.code})`,
            value: provider.id,
        })) : [];

    // Update provider balance when store and provider change
    useEffect(() => {
        if (formik.values.store_id && formik.values.digital_provider_id && storeDigitalProviders) {
            const providerBalance = storeDigitalProviders.find(
                (provider) =>
                    provider.attributes.store_id === formik.values.store_id &&
                    provider.attributes.digital_provider_id === formik.values.digital_provider_id
            );

            setSelectedProviderBalance(providerBalance ? providerBalance.attributes.balance : 0);
        }
    }, [formik.values.store_id, formik.values.digital_provider_id, storeDigitalProviders, formik.setValues]);

    const validationSchema = Yup.object({
        store_id: Yup.string().required("Store harus dipilih"),
        digital_provider_id: Yup.string().required("Provider harus dipilih"),
        amount: Yup.number()
            .required("Nominal top-up harus diisi")
            .min(0.01, "Nominal top-up minimal Rp 0.01")
            .max(999999999, "Nominal top-up terlalu besar"),
        reason: Yup.string()
            .required("Alasan top-up harus diisi")
            .min(10, "Alasan minimal 10 karakter")
            .max(500, "Alasan maksimal 500 karakter"),
    });

    const formik = useFormik({
        initialValues: {
            store_id: topupRequest ? topupRequest.store_id : "",
            digital_provider_id: topupRequest ? topupRequest.digital_provider_id : "",
            amount: topupRequest ? topupRequest.amount : "",
            reason: topupRequest ? topupRequest.reason : "",
        },
        validationSchema,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    return (
        <Form onSubmit={formik.handleSubmit}>
            <Row>
                {/* Store Selection */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("store.title")}
                        </Form.Label>
                        <ReactSelect
                            data={storeOptions}
                            value={storeOptions.find(option => option.value === formik.values.store_id)}
                            onChange={(option) => formik.setFieldValue('store_id', option?.value)}
                            placeholder={placeholderText("store.select.placeholder")}
                            errors={formik.errors.store_id}
                        />
                    </Form.Group>
                </Col>

                {/* Provider Selection */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("digital-provider.title")}
                        </Form.Label>
                        <ReactSelect
                            data={providerOptions}
                            value={providerOptions.find(option => option.value === formik.values.digital_provider_id)}
                            onChange={(option) => formik.setFieldValue('digital_provider_id', option?.value)}
                            placeholder={placeholderText("digital-provider.select.placeholder")}
                            errors={formik.errors.digital_provider_id}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {/* Current Balance Info */}
            {formik.values.digital_provider_id && (
                <Row className="mb-3">
                    <Col md={12}>
                        <Alert variant="info">
                            <div className="d-flex justify-content-between align-items-center">
                                <span>
                                    <strong>Saldo Saat Ini:</strong> {formatCurrency(selectedProviderBalance)}
                                </span>
                                <span>
                                    <strong>Setelah Top-up:</strong> {formatCurrency(
                                        selectedProviderBalance + parseFloat(formik.values.amount || 0)
                                    )}
                                </span>
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row>
                {/* Topup Amount */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("topup-request.amount.label")}
                        </Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            name="amount"
                            placeholder="0.00"
                            value={formik.values.amount}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={formik.touched.amount && formik.errors.amount}
                            className="form-control-solid"
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.amount}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                {/* Reason */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("topup-request.reason.label")}
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="reason"
                            placeholder="Jelaskan alasan melakukan top-up saldo..."
                            value={formik.values.reason}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={formik.touched.reason && formik.errors.reason}
                            className="form-control-solid"
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.reason}
                        </Form.Control.Feedback>
                        <small className="text-muted">
                            Minimal 10 karakter untuk menjelaskan kebutuhan top-up
                        </small>
                    </Form.Group>
                </Col>
            </Row>

            {/* Preview */}
            {formik.values.amount && formik.values.reason && (
                <Row className="mb-3">
                    <Col md={12}>
                        <Alert variant="success">
                            <h6 className="mb-2">Ringkasan Permintaan Top-up:</h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <strong>Nominal:</strong> {formatCurrency(formik.values.amount)}
                                </div>
                                <div className="col-md-6">
                                    <strong>Saldo Setelah:</strong> {formatCurrency(
                                        selectedProviderBalance + parseFloat(formik.values.amount || 0)
                                    )}
                                </div>
                            </div>
                            <hr />
                            <p className="mb-0">
                                <strong>Alasan:</strong> {formik.values.reason}
                            </p>
                        </Alert>
                    </Col>
                </Row>
            )}

            <div className="d-flex justify-content-end">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="me-2"
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                            {getFormattedMessage("globally.saving.btn")}
                        </>
                    ) : (
                        getFormattedMessage("globally.save.btn")
                    )}
                </Button>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => window.history.back()}
                >
                    {getFormattedMessage("globally.cancel.btn")}
                </Button>
            </div>
        </Form>
    );
};

export default TopupRequestForm;
