import React, { useEffect, useRef } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    getFormattedMessage,
} from "../../../shared/sharedMethod";

const DigitalProductForm = (props) => {
    const { onSubmit, isLoading, digitalProduct, isEditMode = false } = props;
    const formikRef = useRef(null);

  
    // Jika dalam mode edit dan tidak ada data produk setelah loading, berarti produk tidak ditemukan
    if (isEditMode && !isLoading && !digitalProduct) {
        console.warn('DigitalProductForm - No product data received in edit mode');
        return (
            <div className="text-center py-5">
                <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
                <h5>Data produk tidak tersedia</h5>
                <p className="text-muted">Tidak dapat memuat data produk untuk diedit.</p>
            </div>
        );
    }

    const categoryOptions = [
        { value: 'pulsa', label: 'Pulsa' },
        { value: 'paket_data', label: 'Paket Data' },
        { value: 'voucher', label: 'Voucher' },
        { value: 'token', label: 'Token Listrik' },
        { value: 'game', label: 'Voucher Game' },
        { value: 'other', label: 'Lainnya' },
    ];

    const validationSchema = Yup.object({
        name: Yup.string()
            .required("Nama harus diisi")
            .trim()
            .max(255, "Nama maksimal 255 karakter"),
        code: Yup.string()
            .required("Kode produk wajib diisi")
            .trim()
            .uppercase()
            .max(50, "Kode maksimal 50 karakter")
            .matches(/^[A-Z0-9_]+$/, "Kode hanya boleh berisi huruf besar, angka, dan underscore"),
        product_code: Yup.string()
            .required("Kode produk wajib diisi")
            .trim()
            .max(100, "Kode produk maksimal 100 karakter"),
        category: Yup.string()
            .required("Kategori harus dipilih"),
        cost_price: Yup.number()
            .required("Harga beli harus diisi")
            .min(0, "Harga beli tidak boleh negatif")
            .max(999999999, "Harga beli terlalu besar")
            .typeError("Harga beli harus berupa angka"),
        sell_price: Yup.number()
            .required("Harga jual harus diisi")
            .min(0, "Harga jual tidak boleh negatif")
            .max(999999999, "Harga jual terlalu besar")
            .typeError("Harga jual harus berupa angka"),
        provider_code: Yup.string()
            .trim()
            .max(100, "Kode provider maksimal 100 karakter"),
        description: Yup.string()
            .trim()
            .max(500, "Deskripsi maksimal 500 karakter"),
        is_active: Yup.boolean(),
    });

    const getInitialValues = () => {

        // Untuk mode create atau ketika digitalProduct null, gunakan nilai default
        if (!isEditMode || !digitalProduct) {
            return {
                name: "",
                code: "",
                product_code: "",
                category: "",
                cost_price: "",
                sell_price: "",
                provider_code: "",
                description: "",
                is_active: true,
            };
        }

        return {
            name: digitalProduct.name || "",
            code: digitalProduct.code || "",
            product_code: digitalProduct.product_code || "",
            category: digitalProduct.category || "",
            cost_price: digitalProduct.cost_price ? String(digitalProduct.cost_price) : "",
            sell_price: digitalProduct.sell_price ? String(digitalProduct.sell_price) : "",
            provider_code: digitalProduct.provider_code || "",
            description: digitalProduct.description || "",
            is_active: digitalProduct.is_active !== undefined ? digitalProduct.is_active : true,
        };
    };

    const formik = useFormik({
        initialValues: getInitialValues(),
        validationSchema,
        onSubmit: (values) => {

            // Validate required fields manually before submitting
            const errors = {};

            if (!values.name || values.name.trim() === '') {
                errors.name = 'Nama produk harus diisi';
            }
            if (!values.code || values.code.trim() === '') {
                errors.code = 'Kode produk harus diisi';
            }
            if (!values.product_code || values.product_code.trim() === '') {
                errors.product_code = 'Kode produk eksternal harus diisi';
            }
            if (!values.category || values.category.trim() === '') {
                errors.category = 'Kategori harus dipilih';
            }
            if (!values.cost_price || parseFloat(values.cost_price) < 0) {
                errors.cost_price = 'Harga beli harus diisi dengan nilai positif';
            }
            if (!values.sell_price || parseFloat(values.sell_price) < 0) {
                errors.sell_price = 'Harga jual harus diisi dengan nilai positif';
            }

            // Set errors if any
            if (Object.keys(errors).length > 0) {
                formik.setErrors(errors);
                console.error('DigitalProductForm - validation errors:', errors);
                return;
            }

            // Ensure numeric values are properly formatted
            const formattedValues = {
                name: values.name.trim(),
                code: values.code.trim().toUpperCase(),
                product_code: values.product_code.trim(),
                category: values.category,
                cost_price: parseFloat(values.cost_price) || 0,
                sell_price: parseFloat(values.sell_price) || 0,
                provider_code: (values.provider_code || '').trim(),
                description: (values.description || '').trim(),
                is_active: values.is_active !== undefined ? values.is_active : true,
                // Add missing fields that backend expects
                product_data: null,
                sort_order: 0,
            };

            
            onSubmit(formattedValues);
        },
    });

    // Store formik reference for use in useEffect
    formikRef.current = formik;

    // Reset form when digitalProduct changes (only in edit mode)
    useEffect(() => {
        if (isEditMode && digitalProduct && digitalProduct.id) {

            const newValues = {
                name: digitalProduct.name || "",
                code: digitalProduct.code || "",
                product_code: digitalProduct.product_code || "",
                category: digitalProduct.category || "",
                cost_price: digitalProduct.cost_price ? String(digitalProduct.cost_price) : "",
                sell_price: digitalProduct.sell_price ? String(digitalProduct.sell_price) : "",
                provider_code: digitalProduct.provider_code || "",
                description: digitalProduct.description || "",
                is_active: digitalProduct.is_active !== undefined ? digitalProduct.is_active : true,
            };

            
            // Use setTimeout to ensure formik is ready
            const timeoutId = setTimeout(() => {
                try {
                    if (formik && typeof formik.setValues === 'function') {
                        formik.setValues(newValues);
                    }
                } catch (error) {
                    console.error('Error setting form values:', error);
                }
            }, 0);

            return () => clearTimeout(timeoutId);
        }
    }, [isEditMode, digitalProduct?.id]); // Include isEditMode in dependencies

    // Auto-calculate margin when cost_price or sell_price changes
    const costPrice = parseFloat(formik.values.cost_price) || 0;
    const sellPrice = parseFloat(formik.values.sell_price) || 0;
    const margin = (costPrice > 0 && sellPrice > 0) ? sellPrice - costPrice : 0;

    // Real-time validation feedback
    const getFieldStatus = (fieldName) => {
        if (formik.touched[fieldName]) {
            if (formik.errors[fieldName]) {
                return { variant: "danger", icon: "bi-exclamation-triangle", text: "Error" };
            } else if (formik.values[fieldName]) {
                return { variant: "success", icon: "bi-check-circle", text: "Valid" };
            }
        }
        return { variant: "secondary", icon: "bi-circle", text: "Pending" };
    };

    // Check if form is ready to submit
    const requiredFields = ['name', 'code', 'product_code', 'category', 'cost_price', 'sell_price'];
    const filledRequiredFields = requiredFields.filter(field => formik.values[field]);
    const formCompletionPercentage = (filledRequiredFields.length / requiredFields.length) * 100;

    return (
        <div className="container-fluid">
            <Form onSubmit={formik.handleSubmit}>
                {/* Page Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h4 className="mb-1">
                                    <i className="bi bi-box-seam me-2"></i>
                                    {isEditMode ? 'Edit Produk Digital' : 'Tambah Produk Digital Baru'}
                                </h4>
                                <p className="text-muted mb-0">
                                    {isEditMode
                                        ? 'Perbarui informasi produk digital yang sudah ada'
                                        : 'Buat produk digital baru dengan informasi lengkap'
                                    }
                                </p>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className={`badge ${isEditMode ? 'bg-warning' : 'bg-success'} fs-6 px-3 py-2`}>
                                    <i className={`bi ${isEditMode ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                                    Mode {isEditMode ? 'Edit' : 'Create'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Information Section */}
            <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                        <i className="bi bi-info-circle me-2"></i>
                        Informasi Dasar Produk
                    </h5>
                </div>
                <div className="card-body">
                    <Row>
                        <Col lg={6} md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="required d-flex align-items-center">
                                    Nama Produk
                                    {formik.values.name && (
                                        <i className="bi bi-check-circle text-success ms-2"></i>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="Contoh: Pulsa 10.000, Paket Data 5GB"
                                    value={formik.values.name}
                                    onChange={(e) => {
                                        formik.setFieldValue('name', e.target.value.trim());
                                    }}
                                    isInvalid={formik.touched.name && formik.errors.name}
                                    isValid={formik.touched.name && !formik.errors.name && formik.values.name}
                                    className="form-control-solid"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.name}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col lg={6} md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="required d-flex align-items-center">
                                    Kode Produk
                                    {formik.values.code && (
                                        <i className="bi bi-check-circle text-success ms-2"></i>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="code"
                                    placeholder="Contoh: PULSA_10K"
                                    value={formik.values.code}
                                    onChange={(e) => {
                                        const uppercaseValue = e.target.value.toUpperCase();
                                        formik.setFieldValue('code', uppercaseValue);
                                    }}
                                    isInvalid={formik.touched.code && formik.errors.code}
                                    isValid={formik.touched.code && !formik.errors.code && formik.values.code}
                                    className="form-control-solid"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.code}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Kode harus berisi huruf besar, angka, dan underscore
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={6} md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="required d-flex align-items-center">
                                    Kode Produk Provider
                                    {formik.values.product_code && (
                                        <i className="bi bi-check-circle text-success ms-2"></i>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="product_code"
                                    placeholder="Kode produk dari provider eksternal"
                                    value={formik.values.product_code}
                                    onChange={(e) => {
                                        formik.setFieldValue('product_code', e.target.value.trim());
                                    }}
                                    isInvalid={formik.touched.product_code && formik.errors.product_code}
                                    isValid={formik.touched.product_code && !formik.errors.product_code && formik.values.product_code}
                                    className="form-control-solid"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.product_code}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col lg={6} md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="required d-flex align-items-center">
                                    Kategori
                                    {formik.values.category && (
                                        <i className="bi bi-check-circle text-success ms-2"></i>
                                    )}
                                </Form.Label>
                                <Form.Select
                                    name="category"
                                    value={formik.values.category}
                                    onChange={formik.handleChange}
                                    isInvalid={formik.touched.category && formik.errors.category}
                                    isValid={formik.touched.category && !formik.errors.category && formik.values.category}
                                    className="form-control-solid"
                                >
                                    <option value="">
                                        Pilih Kategori Produk
                                    </option>
                                    {categoryOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.category}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="card mb-4">
                <div className="card-header bg-success text-white">
                    <h5 className="mb-0">
                        <i className="bi bi-cash me-2"></i>
                        Informasi Harga
                    </h5>
                </div>
                <div className="card-body">
                    <Row>
                        <Col lg={6} md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="required d-flex align-items-center">
                                    Harga Modal (Cost Price)
                                    {formik.values.cost_price && (
                                        <i className="bi bi-check-circle text-success ms-2"></i>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="cost_price"
                                    placeholder="0.00"
                                    value={formik.values.cost_price}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        formik.setFieldValue('cost_price', value === '' ? '' : parseFloat(value) || 0);
                                    }}
                                    isInvalid={formik.touched.cost_price && formik.errors.cost_price}
                                    isValid={formik.touched.cost_price && !formik.errors.cost_price && formik.values.cost_price}
                                    className="form-control-solid"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.cost_price}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col lg={6} md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="required d-flex align-items-center">
                                    Harga Jual (Sell Price)
                                    {formik.values.sell_price && (
                                        <i className="bi bi-check-circle text-success ms-2"></i>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="sell_price"
                                    placeholder="0.00"
                                    value={formik.values.sell_price}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        formik.setFieldValue('sell_price', value === '' ? '' : parseFloat(value) || 0);
                                    }}
                                    isInvalid={formik.touched.sell_price && formik.errors.sell_price}
                                    isValid={formik.touched.sell_price && !formik.errors.sell_price && formik.values.sell_price}
                                    className="form-control-solid"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.sell_price}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Additional Information Section */}
            <div className="card mb-4">
                <div className="card-header bg-info text-white">
                    <h5 className="mb-0">
                        <i className="bi bi-gear me-2"></i>
                        Informasi Tambahan
                    </h5>
                </div>
                <div className="card-body">
                    <Row>
                        <Col lg={8} md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="d-flex align-items-center">
                                    Kode Provider
                                    <small className="text-muted ms-2">(Opsional)</small>
                                    {formik.values.provider_code && (
                                        <i className="bi bi-check-circle text-success ms-2"></i>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="provider_code"
                                    placeholder="Kode produk di provider eksternal"
                                    value={formik.values.provider_code}
                                    onChange={(e) => {
                                        formik.setFieldValue('provider_code', e.target.value.trim());
                                    }}
                                    isInvalid={formik.touched.provider_code && formik.errors.provider_code}
                                    isValid={formik.touched.provider_code && !formik.errors.provider_code && formik.values.provider_code}
                                    className="form-control-solid"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.provider_code}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col lg={4} md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="d-flex align-items-center">
                                    Status Produk
                                    {formik.values.is_active !== undefined && (
                                        <i className={`bi bi-check-circle ms-2 ${formik.values.is_active ? 'text-success' : 'text-danger'}`}></i>
                                    )}
                                </Form.Label>
                                <div className="d-flex align-items-center p-2 border rounded">
                                    <Form.Check
                                        type="switch"
                                        name="is_active"
                                        checked={formik.values.is_active}
                                        onChange={formik.handleChange}
                                        className="me-3"
                                    />
                                    <div className="d-flex align-items-center">
                                        <i className={`bi ${formik.values.is_active ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                                        <span className={`fw-bold ${formik.values.is_active ? "text-success" : "text-danger"}`}>
                                            {formik.values.is_active
                                                ? "Produk Aktif"
                                                : "Produk Tidak Aktif"}
                                        </span>
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-3">
                                <Form.Label className="d-flex align-items-center">
                                    Deskripsi Produk
                                    <small className="text-muted ms-2">(Opsional)</small>
                                    {formik.values.description && (
                                        <i className="bi bi-check-circle text-success ms-2"></i>
                                    )}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="description"
                                    placeholder="Berikan deskripsi lengkap tentang produk digital ini, termasuk fitur, manfaat, dan informasi penting lainnya..."
                                    value={formik.values.description}
                                    onChange={(e) => {
                                        formik.setFieldValue('description', e.target.value);
                                    }}
                                    isInvalid={formik.touched.description && formik.errors.description}
                                    isValid={formik.touched.description && !formik.errors.description && formik.values.description}
                                    className="form-control-solid"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {formik.errors.description}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Karakter tersisa: {500 - (formik.values.description?.length || 0)} dari 500
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Margin Calculator Section - Only show when both prices are filled */}
            {costPrice > 0 && sellPrice > 0 && (
                <div className="card mb-4 border-warning">
                    <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0">
                            <i className="bi bi-calculator me-2"></i>
                            Kalkulasi Margin & Profit
                        </h5>
                    </div>
                    <div className="card-body">
                        <Row>
                            <Col md={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <div className="text-muted small">Harga Modal</div>
                                    <div className="h5 text-primary">
                                        Rp {costPrice.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <div className="text-muted small">Harga Jual</div>
                                    <div className="h5 text-success">
                                        Rp {sellPrice.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <div className="text-muted small">Margin</div>
                                    <div className="h5 text-info">
                                        Rp {margin.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="text-center p-3 bg-light rounded">
                                    <div className="text-muted small">Margin Rate</div>
                                    <div className="h5 text-warning">
                                        {costPrice > 0 ? ((margin / costPrice) * 100).toFixed(1) : 0}%
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            )}

            {/* Form Progress and Action Buttons */}
            <div className="card mb-4">
                <div className="card-header bg-light">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h6 className="mb-0">
                                <i className="bi bi-clipboard-check me-2"></i>
                                Progress Form
                            </h6>
                        </div>
                        <div className="col-md-6 text-end">
                            <small className={`fw-bold ${formCompletionPercentage === 100 ? 'text-success' : 'text-primary'}`}>
                                {Math.round(formCompletionPercentage)}% Lengkap
                            </small>
                        </div>
                    </div>
                    <div className="progress mt-2" style={{ height: '6px' }}>
                        <div
                            className={`progress-bar ${formCompletionPercentage === 100 ? 'bg-success' : 'bg-primary'}`}
                            role="progressbar"
                            style={{ width: `${formCompletionPercentage}%` }}
                        ></div>
                    </div>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-3">
                                <i className="bi bi-info-circle text-primary me-2"></i>
                                <small className="text-muted">
                                    Field dengan tanda (*) wajib diisi
                                </small>
                            </div>

                            {/* Required Fields Status */}
                            <div className="mb-3">
                                <small className="text-muted d-block mb-2">Status Field Wajib:</small>
                                <div className="d-flex flex-wrap gap-1">
                                    {requiredFields.map(field => {
                                        const fieldStatus = getFieldStatus(field);
                                        return (
                                            <small key={field} className={`badge bg-${fieldStatus.variant}`}>
                                                <i className={`bi ${fieldStatus.icon} me-1`}></i>
                                                {field.replace('_', ' ')}
                                            </small>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline-secondary"
                                    onClick={() => window.history.back()}
                                    disabled={isLoading}
                                    className="px-4"
                                >
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Batal
                                </Button>

                                <Button
                                    type="submit"
                                    variant={formCompletionPercentage === 100 ? "primary" : "outline-primary"}
                                    disabled={isLoading || formCompletionPercentage < 100}
                                    className="px-4"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-2"></i>
                                            {isEditMode ? 'Update Produk' : 'Simpan Produk'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Indicator */}
            {isLoading && (
                <div className="card">
                    <div className="card-body text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h6>Menyimpan Data Produk...</h6>
                        <p className="text-muted mb-0">Mohon tunggu sebentar, data sedang diproses.</p>
                    </div>
                </div>
            )}
        </Form>
        </div>
    );
};

export default DigitalProductForm;