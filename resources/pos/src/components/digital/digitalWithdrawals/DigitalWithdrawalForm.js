import React, { useState, useEffect } from "react";
import { Form, Row, Col, Button, InputGroup, Alert, Badge } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
} from "../../../shared/sharedMethod";
import ReactSelect from "../../../shared/select/reactSelect";

const DigitalWithdrawalForm = (props) => {
    const { onSubmit, isLoading, digitalWithdrawal, stores, digitalProviders, storeDigitalProviders, frontSetting, allConfigData } = props;

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
        customer_name: Yup.string()
            .required("Nama customer harus diisi")
            .min(2, "Nama customer minimal 2 karakter"),
        customer_phone: Yup.string(),
        withdrawal_amount: Yup.number()
            .required("Nominal penarikan harus diisi")
            .min(0.01, "Nominal penarikan minimal Rp 0.01")
            .max(selectedProviderBalance, "Saldo provider tidak mencukupi"),
        admin_fee: Yup.number()
            .required("Biaya admin harus diisi")
            .min(0, "Biaya admin tidak boleh negatif"),
    });

    const formik = useFormik({
        initialValues: {
            store_id: digitalWithdrawal ? digitalWithdrawal.store_id : "",
            digital_provider_id: digitalWithdrawal ? digitalWithdrawal.digital_provider_id : "",
            customer_name: digitalWithdrawal ? digitalWithdrawal.customer_name : "",
            customer_phone: digitalWithdrawal ? digitalWithdrawal.customer_phone : "",
            withdrawal_amount: digitalWithdrawal ? digitalWithdrawal.withdrawal_amount : "",
            admin_fee: digitalWithdrawal ? digitalWithdrawal.admin_fee : "",
            notes: digitalWithdrawal ? digitalWithdrawal.notes : "",
        },
        validationSchema,
        onSubmit: (values) => {
            onSubmit(values);
        },
    });

    // Auto-calculate total amount
    const totalAmount = (parseFloat(formik.values.withdrawal_amount) || 0) + (parseFloat(formik.values.admin_fee) || 0);

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

            {/* Provider Balance Info */}
            {formik.values.digital_provider_id && (
                <Row className="mb-3">
                    <Col md={12}>
                        <Alert variant="info">
                            <div className="d-flex justify-content-between align-items-center">
                                <span>
                                    <strong>Saldo Provider:</strong> {formatCurrency(selectedProviderBalance)}
                                </span>
                                <Badge bg={selectedProviderBalance > 0 ? "success" : "danger"}>
                                    {selectedProviderBalance > 0 ? "Tersedia" : "Saldo Habis"}
                                </Badge>
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row>
                {/* Customer Name */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("customer.name")}
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={formik.values.customer_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            name="customer_name"
                            placeholder="Nama customer yang tarik tunai"
                            isInvalid={formik.touched.customer_name && formik.errors.customer_name}
                            className="form-control-solid"
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.customer_name}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                {/* Customer Phone */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {getFormattedMessage("globally.input.phone-number.label")}
                        </Form.Label>
                        <Form.Control
                            type="tel"
                            value={formik.values.customer_phone}
                            onChange={formik.handleChange}
                            name="customer_phone"
                            placeholder="No HP customer (opsional)"
                            className="form-control-solid"
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                {/* Withdrawal Amount */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("digital-withdrawal.withdrawal-amount.label")}
                        </Form.Label>
                        <InputGroup>
                            <InputGroup.Text>{currencySymbol}</InputGroup.Text>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                name="withdrawal_amount"
                                placeholder="0.00"
                                value={formik.values.withdrawal_amount}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                isInvalid={formik.touched.withdrawal_amount && formik.errors.withdrawal_amount}
                                className="form-control-solid"
                            />
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.withdrawal_amount}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                {/* Admin Fee */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("digital-withdrawal.admin-fee.label")}
                        </Form.Label>
                        <InputGroup>
                            <InputGroup.Text>{currencySymbol}</InputGroup.Text>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                name="admin_fee"
                                placeholder="0.00"
                                value={formik.values.admin_fee}
                                onChange={formik.handleChange}
                                isInvalid={formik.touched.admin_fee && formik.errors.admin_fee}
                                className="form-control-solid"
                            />
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.admin_fee}
                        </Form.Control.Feedback>
                        <small className="text-muted">
                            Biaya admin fleksibel sesuai kesepakatan
                        </small>
                    </Form.Group>
                </Col>
            </Row>

            {/* Total Amount Display */}
            {formik.values.withdrawal_amount && formik.values.admin_fee && (
                <Row className="mb-3">
                    <Col md={12}>
                        <Alert variant="warning">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Nominal Tarik Tunai:</strong> {formatCurrency(formik.values.withdrawal_amount)}
                                </div>
                                <div>
                                    <strong>Biaya Admin:</strong> {formatCurrency(formik.values.admin_fee)}
                                </div>
                                <div className="text-primary">
                                    <strong>Total yang Diterima Customer:</strong> {formatCurrency(formik.values.withdrawal_amount)}
                                </div>
                            </div>
                            <hr />
                            <div className="text-center">
                                <h5 className="mb-0">
                                    Saldo Provider Setelah: {formatCurrency(
                                        selectedProviderBalance - parseFloat(formik.values.withdrawal_amount || 0)
                                    )}
                                </h5>
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row>
                {/* Notes */}
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {getFormattedMessage("globally.detail.notes")}
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={formik.values.notes}
                            onChange={formik.handleChange}
                            name="notes"
                            placeholder="Catatan tambahan untuk transaksi ini (opsional)"
                            className="form-control-solid"
                        />
                    </Form.Group>
                </Col>
            </Row>

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

export default DigitalWithdrawalForm;
