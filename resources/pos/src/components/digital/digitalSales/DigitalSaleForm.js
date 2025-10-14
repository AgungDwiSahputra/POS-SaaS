import React, { useEffect, useMemo, useState } from "react";
import { Form, Row, Col, Button, Alert, Badge } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useIntl } from "react-intl";
import {
    getFormattedMessage,
    currencySymbolHandling,
} from "../../../shared/sharedMethod";
import ReactSelect from "../../../shared/select/reactSelect";


const extractAttributes = (entity) => {
    if (!entity) {
        return {};
    }

    return entity.attributes ? entity.attributes : entity;
};

const toStringId = (value) => {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    return String(value);
};

const toNumber = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStoreOption = (store) => {
    const data = extractAttributes(store);
    const id = store?.id ?? data.id;

    if (!id) {
        return null;
    }

    return {
        label: data?.name ?? "-",
        value: toStringId(id),
    };
};

const normalizeProviderOption = (provider) => {
    const data = extractAttributes(provider);
    const id = provider?.id ?? data.id;

    if (!id || data?.is_active === false) {
        return null;
    }

    const providerCode = data?.code ? ` (${data.code})` : "";

    return {
        label: `${data?.name ?? "-"}${providerCode}`,
        value: toStringId(id),
    };
};

const normalizeProduct = (product) => {
    const data = extractAttributes(product);
    const id = product?.id ?? data.id;

    if (!id) {
        return null;
    }

    return {
        id: toStringId(id),
        name: data?.name ?? "-",
        cost_price: toNumber(data?.cost_price),
        sell_price: toNumber(data?.sell_price),
        is_active: data?.is_active !== false,
    };
};

const findProviderBalance = (providers, storeId, providerId) => {
    if (!Array.isArray(providers)) {
        console.warn('findProviderBalance - providers is not an array');
        return 0; // Return 0 instead of null to show actual balance
    }

    if (!storeId || !providerId) {
        return 0;
    }

    // Try multiple ways to find the provider balance
    const match = providers.find((provider) => {
        const data = extractAttributes(provider);
        const providerStoreId = toStringId(data?.store_id);
        const providerProviderId = toStringId(data?.digital_provider_id);

        
        // More flexible matching
        return (
            providerStoreId === toStringId(storeId) &&
            providerProviderId === toStringId(providerId) &&
            data?.is_active !== false
        );
    });

    if (!match) {
        return 0; // Return 0 to show the balance as 0 instead of loading
    }

    const data = extractAttributes(match);
    const balance = toNumber(data?.balance) || 0;

    return balance;
};

const DigitalSaleForm = (props) => {
    const { onSubmit, isLoading, digitalSale, stores, digitalProviders, digitalProducts, storeDigitalProviders, frontSetting, allConfigData } = props;
    const intl = useIntl();

    // Local placeholderText function that uses intl hook
    const placeholderText = (label) => {
        if (!label) return "";
        return intl.formatMessage({ id: label });
    };

    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedProviderBalance, setSelectedProviderBalance] = useState(null);

    const currencySymbol = frontSetting?.value?.currency_symbol || "Rp";

    const formatCurrency = (amount) => {
        return currencySymbolHandling(allConfigData, currencySymbol, toNumber(amount));
    };

    const initialValues = useMemo(
        () => ({
            store_id: toStringId(digitalSale?.store_id),
            digital_provider_id: toStringId(digitalSale?.digital_provider_id),
            digital_product_id: toStringId(digitalSale?.digital_product_id),
            customer_name: digitalSale?.customer_name ?? "",
            customer_phone: digitalSale?.customer_phone ?? "",
            cost_price: digitalSale?.cost_price ?? "",
            sell_price: digitalSale?.sell_price ?? "",
            notes: digitalSale?.notes ?? "",
        }),
        [digitalSale]
    );

    const storeOptions = useMemo(() => {
        if (!Array.isArray(stores)) {
            return [];
        }

        const options = stores
            .map(normalizeStoreOption)
            .filter((option) => option !== null);

        return options;
    }, [stores]);

    const providerOptions = useMemo(() => {
        if (!Array.isArray(digitalProviders)) {
            return [];
        }

        const options = digitalProviders
            .map(normalizeProviderOption)
            .filter((option) => option !== null);

        return options;
    }, [digitalProviders]);

    const validationSchema = useMemo(() => {
        const balanceLimit =
            typeof selectedProviderBalance === "number"
                ? selectedProviderBalance
                : Number.MAX_SAFE_INTEGER;

        return Yup.object({
                store_id: Yup.string().required("Store harus dipilih"),
                digital_provider_id: Yup.string().required("Provider harus dipilih"),
                digital_product_id: Yup.string().required("Produk harus dipilih"),
                customer_name: Yup.string(),
                customer_phone: Yup.string(),
                cost_price: Yup.number()
                    .typeError("Harga beli harus berupa angka")
                    .required("Harga beli harus diisi")
                    .min(0, "Harga beli tidak boleh negatif")
                    .max(balanceLimit, "Saldo provider tidak mencukupi"),
                sell_price: Yup.number()
                    .typeError("Harga jual harus berupa angka")
                    .required("Harga jual harus diisi")
                    .min(0, "Harga jual tidak boleh negatif")
                    .when("cost_price", (costPrice, schema) => {
                        if (costPrice !== undefined) {
                            return schema.min(
                                costPrice,
                                "Harga jual harus lebih besar dari harga beli"
                            );
                        }
                        return schema;
                    }),
        });
    }, [selectedProviderBalance]);

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: (values) => {
            const payload = {
                ...values,
                store_id: Number(values.store_id),
                digital_provider_id: Number(values.digital_provider_id),
                digital_product_id: Number(values.digital_product_id),
                cost_price: toNumber(values.cost_price),
                sell_price: toNumber(values.sell_price),
                margin: toNumber(values.sell_price) - toNumber(values.cost_price),
            };

            onSubmit(payload);
        },
    });

    useEffect(() => {
        if (!Array.isArray(digitalProducts) || !formik.values.digital_provider_id) {
            setAvailableProducts([]);
            return;
        }

        const allNormalized = digitalProducts
            .map(normalizeProduct)
            .filter((product) => product !== null);

        const selectedProductId = toStringId(formik.values.digital_product_id);

        let filtered = allNormalized.filter(
            (product) => product.is_active && product !== null
        );

        if (selectedProductId) {
            const selectedProduct = allNormalized.find(
                (product) => product.id === selectedProductId
            );

            if (
                selectedProduct &&
                !filtered.some((product) => product.id === selectedProductId)
            ) {
                filtered = [selectedProduct, ...filtered];
            }
        }

        setAvailableProducts(filtered);
    }, [digitalProducts, formik.values.digital_provider_id, formik.values.digital_product_id]);

    useEffect(() => {
        if (!formik.values.store_id || !formik.values.digital_provider_id) {
            setSelectedProviderBalance(0); // Set to 0 to show actual balance
            return;
        }

        const balance = findProviderBalance(
            storeDigitalProviders,
            formik.values.store_id,
            formik.values.digital_provider_id
        );

        setSelectedProviderBalance(balance);
    }, [formik.values.store_id, formik.values.digital_provider_id, storeDigitalProviders]);

    // Separate useEffect to handle product price auto-fill
    useEffect(() => {
        if (formik.values.digital_product_id && availableProducts.length > 0) {
            const selectedProduct = availableProducts.find(
                product => product.id === formik.values.digital_product_id
            );

            if (selectedProduct) {
                const costPrice = toNumber(selectedProduct.cost_price);
                const sellPrice = toNumber(selectedProduct.sell_price);

                // Only update if values are different to avoid infinite loop
                if (formik.values.cost_price !== costPrice || formik.values.sell_price !== sellPrice) {
                    formik.setFieldValue("cost_price", costPrice);
                    formik.setFieldValue("sell_price", sellPrice);
                }
            }
        }
    }, [formik.values.digital_product_id, availableProducts]);

    const productOptions = availableProducts.map((product) => {
        return {
            label: `${product.name} - ${formatCurrency(product.sell_price)}`,
            value: product.id,
            cost_price: product.cost_price,
            sell_price: product.sell_price,
        };
    });

    const estimatedMargin =
        toNumber(formik.values.sell_price) - toNumber(formik.values.cost_price);

    const balanceValue = selectedProviderBalance ?? 0;
    const hasBalanceInfo = selectedProviderBalance !== null && selectedProviderBalance !== undefined;
    const balanceBadgeVariant = hasBalanceInfo
        ? balanceValue > 0
            ? "success"
            : "danger"
        : "secondary";
    const balanceBadgeText = hasBalanceInfo
        ? balanceValue > 0
            ? "Tersedia"
            : "Saldo Habis"
        : "Memuat...";

    
    // Show loading state while data is being fetched
    if (isLoading && (storeOptions.length === 0 || providerOptions.length === 0)) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Memuat data...</h5>
                <p className="text-muted">Silakan tunggu sebentar.</p>
            </div>
        );
    }

    // Show error if no data available
    if (storeOptions.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
                <h5>Tidak ada data toko tersedia</h5>
                <p className="text-muted">Silakan buat toko terlebih dahulu sebelum membuat penjualan digital.</p>
            </div>
        );
    }

    if (providerOptions.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
                <h5>Tidak ada provider aktif tersedia</h5>
                <p className="text-muted">Silakan aktifkan provider digital terlebih dahulu.</p>
            </div>
        );
    }

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
                            value={storeOptions.find((option) => option.value === formik.values.store_id)}
                            onChange={(option) => formik.setFieldValue("store_id", option?.value ?? "")}
                            placeholder={placeholderText("store.select.placeholder")}
                            errors={
                                (formik.touched.store_id && formik.errors.store_id) || null
                            }
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
                            value={providerOptions.find(
                                (option) => option.value === formik.values.digital_provider_id
                            )}
                            onChange={(option) =>
                                formik.setFieldValue(
                                    "digital_provider_id",
                                    option?.value ?? ""
                                )
                            }
                            placeholder={placeholderText("digital-provider.select.placeholder")}
                            errors={
                                (formik.touched.digital_provider_id &&
                                    formik.errors.digital_provider_id) ||
                                null
                            }
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
                                    <strong>Saldo Provider:</strong> {formatCurrency(balanceValue)}
                                </span>
                                <Badge bg={balanceBadgeVariant}>
                                    {balanceBadgeText}
                                </Badge>
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row>
                {/* Product Selection */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("product.title")}
                        </Form.Label>
                        <ReactSelect
                            data={productOptions}
                            value={productOptions.find(
                                (option) => option.value === formik.values.digital_product_id
                            )}
                            onChange={(option) => {
                                formik.setFieldValue("digital_product_id", option?.value ?? "");

                                if (option) {
                                    const costPrice = toNumber(option.cost_price);
                                    const sellPrice = toNumber(option.sell_price);

                                    // Set values immediately and force update
                                    formik.setFieldValue("cost_price", costPrice);
                                    formik.setFieldValue("sell_price", sellPrice);

                                    // Force re-render by updating touched state
                                    formik.setFieldTouched("cost_price", true, true);
                                    formik.setFieldTouched("sell_price", true, true);
                                } else {
                                    // Clear prices when no product is selected
                                    formik.setFieldValue("cost_price", "");
                                    formik.setFieldValue("sell_price", "");
                                }

                                // Trigger validation update with delay
                                setTimeout(() => {
                                    formik.validateField("cost_price");
                                    formik.validateField("sell_price");
                                }, 100);
                            }}
                            placeholder={placeholderText("product.select.placeholder")}
                            errors={
                                (formik.touched.digital_product_id &&
                                    formik.errors.digital_product_id) ||
                                null
                            }
                            isDisabled={!formik.values.digital_provider_id}
                        />
                    </Form.Group>
                </Col>

                {/* Customer Info */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {getFormattedMessage("customer.name")} <span className="text-muted">(opsional)</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={formik.values.customer_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            name="customer_name"
                            placeholder="Nama customer (opsional)"
                            className="form-control-solid"
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                {/* Cost Price */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("product.product-details.cost.label")}
                        </Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            name="cost_price"
                            placeholder="0.00"
                            value={formik.values.cost_price}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={formik.touched.cost_price && formik.errors.cost_price}
                            className="form-control-solid"
                        />
                        {formik.errors.cost_price && (
                            <div className="invalid-feedback d-block">
                                {formik.errors.cost_price}
                            </div>
                        )}
                    </Form.Group>
                </Col>

                {/* Sell Price */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("price.title")}
                        </Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            name="sell_price"
                            placeholder="0.00"
                            value={formik.values.sell_price}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={formik.touched.sell_price && formik.errors.sell_price}
                            className="form-control-solid"
                        />
                        {formik.errors.sell_price && (
                            <div className="invalid-feedback d-block">
                                {formik.errors.sell_price}
                            </div>
                        )}
                    </Form.Group>
                </Col>
            </Row>

            {/* Margin Display */}
            {formik.values.cost_price && formik.values.sell_price && (
                <Row className="mb-3">
                    <Col md={12}>
                        <Alert variant="success">
                            <div className="d-flex justify-content-between align-items-center">
                                <span>
                                    <strong>Estimasi Margin:</strong>
                                </span>
                                <span className="fw-bold">
                                    {formatCurrency(estimatedMargin)}
                                </span>
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}

            <Row>
                {/* Customer Phone */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {getFormattedMessage("globally.input.phone-number.label")} <span className="text-muted">(opsional)</span>
                        </Form.Label>
                        <Form.Control
                            type="tel"
                            value={formik.values.customer_phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            name="customer_phone"
                            placeholder="No HP customer (opsional)"
                            className="form-control-solid"
                        />
                    </Form.Group>
                </Col>

                {/* Notes */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {getFormattedMessage("globally.detail.notes")} <span className="text-muted">(opsional)</span>
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={formik.values.notes}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            name="notes"
                            placeholder="Catatan tambahan (opsional)"
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

export default DigitalSaleForm;
