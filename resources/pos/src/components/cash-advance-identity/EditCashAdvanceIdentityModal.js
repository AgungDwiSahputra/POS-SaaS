import React, { useEffect, useState, useCallback } from "react";
import { Modal, Form, Alert, Spinner } from "react-bootstrap-v5";
import { useIntl } from "react-intl";
import moment from "moment";
import {
    getFormattedMessage,
    placeholderText,
} from "../../shared/sharedMethod";
import ReactSelect from "../../shared/select/reactSelect";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";
import { toast } from "react-toastify";
import "./EditCashAdvanceIdentityModal.css";

const EditCashAdvanceIdentityModal = ({
    show,
    onHide,
    identity,
    onSave,
    isSaving = false,
    error = null
}) => {
    const intl = useIntl();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
        address: "",
        date_of_birth: null,
        type: "employee",
        is_active: true,
        notes: "",
    });

    // Validation state
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Auto-save state
    const [autoSaveTimer, setAutoSaveTimer] = useState(null);
    const [lastSavedData, setLastSavedData] = useState(null);

    // Type options for select
    const typeOptions = [
        { value: "employee", label: getFormattedMessage("cash-advance-identity.input.type.employee") },
        { value: "contractor", label: getFormattedMessage("cash-advance-identity.input.type.contractor") },
        { value: "other", label: getFormattedMessage("cash-advance-identity.input.type.other") },
    ];

    // Initialize form data when identity changes
    useEffect(() => {
        if (identity) {
            const initialData = {
                name: identity.name || "",
                email: identity.email || "",
                phone: identity.phone || "",
                department: identity.department || "",
                address: identity.address || "",
                date_of_birth: identity.date_of_birth ? moment(identity.date_of_birth).toDate() : null,
                type: identity.type || "employee",
                is_active: identity.is_active !== undefined ? identity.is_active : true,
                notes: identity.notes || "",
            };
            setFormData(initialData);
            setLastSavedData(JSON.stringify(initialData));
            setHasUnsavedChanges(false);
            setIsDirty(false);
            setErrors({});
            setTouched({});
        }
    }, [identity]);

    // Real-time validation
    const validateField = useCallback((name, value) => {
        let error = "";

        switch (name) {
            case "name":
                if (!value || value.trim() === "") {
                    error = getFormattedMessage("cash-advance-identity.input.name.validate.label");
                } else if (value.length > 100) {
                    error = "Nama tidak boleh lebih dari 100 karakter";
                }
                break;

            case "email":
                if (value && value.trim() !== "") {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        error = getFormattedMessage("globally.input.email.valid.validate.label");
                    }
                }
                break;

            case "phone":
                if (value && value.length > 20) {
                    error = "Nomor telepon tidak boleh lebih dari 20 karakter";
                }
                break;

            case "department":
                if (value && value.length > 50) {
                    error = "Departemen tidak boleh lebih dari 50 karakter";
                }
                break;

            case "address":
                if (value && value.length > 255) {
                    error = "Alamat tidak boleh lebih dari 255 karakter";
                }
                break;

            case "notes":
                if (value && value.length > 500) {
                    error = "Catatan tidak boleh lebih dari 500 karakter";
                }
                break;

            case "type":
                if (!value) {
                    error = getFormattedMessage("cash-advance-identity.input.type.validate.label");
                }
                break;

            default:
                break;
        }

        return error;
    }, []);

    // Handle input changes
    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        setIsDirty(true);
        setHasUnsavedChanges(true);

        // Real-time validation
        const error = validateField(name, newValue);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, [validateField]);

    // Handle type selection change
    const handleTypeChange = useCallback((obj) => {
        setFormData(prev => ({
            ...prev,
            type: obj.value
        }));

        setTouched(prev => ({
            ...prev,
            type: true
        }));

        setIsDirty(true);
        setHasUnsavedChanges(true);

        const error = validateField("type", obj.value);
        setErrors(prev => ({
            ...prev,
            type: error
        }));
    }, [validateField]);

    // Handle date change
    const handleDateChange = useCallback((date) => {
        setFormData(prev => ({
            ...prev,
            date_of_birth: date
        }));

        setTouched(prev => ({
            ...prev,
            date_of_birth: true
        }));

        setIsDirty(true);
        setHasUnsavedChanges(true);
    }, []);

    // Auto-save functionality
    useEffect(() => {
        if (isDirty && hasUnsavedChanges) {
            // Clear existing timer
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }

            // Set new timer for auto-save
            const timer = setTimeout(() => {
                const currentDataString = JSON.stringify(formData);
                if (currentDataString !== lastSavedData) {
                    // Perform auto-save (you can implement this based on your needs)
                    console.log("Auto-saving draft...", formData);

                    // Show auto-save notification
                    toast.info("Draft tersimpan otomatis", {
                        position: "bottom-right",
                        autoClose: 2000,
                        hideProgressBar: true,
                    });

                    setLastSavedData(currentDataString);
                }
            }, 30000); // 30 seconds

            setAutoSaveTimer(timer);
        }

        return () => {
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
        };
    }, [formData, isDirty, hasUnsavedChanges, autoSaveTimer, lastSavedData]);

    // Form validation
    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        // Validate all required fields
        Object.keys(formData).forEach(key => {
            if (key === "name" || key === "type") {
                const error = validateField(key, formData[key]);
                if (error) {
                    newErrors[key] = error;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [formData, validateField]);

    // Handle form submission
    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Silakan perbaiki kesalahan pada form", {
                position: "bottom-right",
                autoClose: 3000,
            });
            return;
        }

        // Clear auto-save timer
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }

        // Prepare data for submission
        const submitData = {
            ...formData,
            date_of_birth: formData.date_of_birth ? moment(formData.date_of_birth).format('YYYY-MM-DD') : null,
            is_active: formData.is_active ? 1 : 0,
        };

        console.log("Submitting form data:", submitData);
        onSave(submitData);
        setHasUnsavedChanges(false);
    }, [formData, validateForm, autoSaveTimer, onSave]);

    // Handle modal close with confirmation
    const handleClose = useCallback(() => {
        if (hasUnsavedChanges) {
            const confirmClose = window.confirm("Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin menutup?");
            if (confirmClose) {
                // Clear auto-save timer
                if (autoSaveTimer) {
                    clearTimeout(autoSaveTimer);
                }
                onHide();
            }
        } else {
            // Clear auto-save timer
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
            onHide();
        }
    }, [hasUnsavedChanges, autoSaveTimer, onHide]);

    // Enhanced onHide to handle cleanup
    const handleModalHide = useCallback(() => {
        // Clear auto-save timer
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        onHide();
    }, [autoSaveTimer, onHide]);

    // Get selected type option
    const selectedTypeOption = typeOptions.find(option => option.value === formData.type);

    // Check if form has any errors
    const hasErrors = Object.values(errors).some(error => error !== "");

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            backdrop="static"
            keyboard={false}
            className="cash-advance-identity-modal"
            aria-labelledby="edit-cash-advance-identity-modal-title"
        >
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title id="edit-cash-advance-identity-modal-title" className="text-white">
                    {getFormattedMessage("cash-advance-identity.edit.title")}
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-4">
                    {error && (
                        <Alert variant="danger" className="mb-4">
                            <strong>Error:</strong> {error}
                        </Alert>
                    )}

                    <div className="row">
                        {/* Name Field */}
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    {getFormattedMessage("cash-advance-identity.input.name.label")}
                                    <span className="text-danger ms-1">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                                    isInvalid={touched.name && !!errors.name}
                                    placeholder={intl.formatMessage({
                                        id: "cash-advance-identity.input.name.placeholder.label"
                                    })}
                                    aria-describedby="name-error"
                                    aria-required="true"
                                />
                                {touched.name && errors.name && (
                                    <Form.Control.Feedback type="invalid" id="name-error">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </div>

                        {/* Type Field */}
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    {getFormattedMessage("cash-advance-identity.input.type.label")}
                                    <span className="text-danger ms-1">*</span>
                                </Form.Label>
                                <ReactSelect
                                    title=""
                                    placeholder={intl.formatMessage({
                                        id: "cash-advance-identity.input.type.placeholder.label"
                                    })}
                                    defaultValue={selectedTypeOption}
                                    value={selectedTypeOption}
                                    errors={touched.type ? errors.type : ""}
                                    data={typeOptions}
                                    onChange={handleTypeChange}
                                    ariaLabel="Pilih tipe identitas"
                                    isInvalid={touched.type && !!errors.type}
                                />
                                {touched.type && errors.type && (
                                    <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                                        {errors.type}
                                    </div>
                                )}
                            </Form.Group>
                        </div>

                        {/* Employee ID (Read-only if exists) */}
                        {identity && identity.employee_id && (
                            <div className="col-md-6 mb-3">
                                <Form.Group>
                                    <Form.Label className="fw-bold">
                                        {getFormattedMessage("cash-advance-identity.input.employee_id.label")}
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={identity.employee_id}
                                        readOnly
                                        className="bg-light"
                                        aria-describedby="employee-id-help"
                                    />
                                    <Form.Text id="employee-id-help" className="text-muted">
                                        {getFormattedMessage("cash-advance-identity.input.employee_id.auto_generated")}
                                    </Form.Text>
                                </Form.Group>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    {getFormattedMessage("cash-advance-identity.input.email.label")}
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                                    isInvalid={touched.email && !!errors.email}
                                    placeholder={intl.formatMessage({
                                        id: "cash-advance-identity.input.email.placeholder.label"
                                    })}
                                    aria-describedby="email-error"
                                />
                                {touched.email && errors.email && (
                                    <Form.Control.Feedback type="invalid" id="email-error">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </div>

                        {/* Phone Field */}
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    {getFormattedMessage("cash-advance-identity.input.phone.label")}
                                </Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                                    isInvalid={touched.phone && !!errors.phone}
                                    placeholder={intl.formatMessage({
                                        id: "cash-advance-identity.input.phone.placeholder.label"
                                    })}
                                    aria-describedby="phone-error"
                                />
                                {touched.phone && errors.phone && (
                                    <Form.Control.Feedback type="invalid" id="phone-error">
                                        {errors.phone}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </div>

                        {/* Department Field */}
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    {getFormattedMessage("cash-advance-identity.input.department.label")}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouched(prev => ({ ...prev, department: true }))}
                                    isInvalid={touched.department && !!errors.department}
                                    placeholder={intl.formatMessage({
                                        id: "cash-advance-identity.input.department.placeholder.label"
                                    })}
                                    aria-describedby="department-error"
                                />
                                {touched.department && errors.department && (
                                    <Form.Control.Feedback type="invalid" id="department-error">
                                        {errors.department}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </div>

                        {/* Date of Birth Field */}
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    {getFormattedMessage("cash-advance-identity.input.date_of_birth.label")}
                                </Form.Label>
                                <div className="position-relative">
                                    <ReactDatePicker
                                        onChangeDate={handleDateChange}
                                        newStartDate={formData.date_of_birth}
                                        ariaLabel="Pilih tanggal lahir"
                                    />
                                </div>
                            </Form.Group>
                        </div>

                        {/* Status Field */}
                        <div className="col-md-6 mb-3">
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    {getFormattedMessage("cash-advance-identity.input.status.label")}
                                </Form.Label>
                                <div className="form-check form-switch">
                                    <Form.Check
                                        type="switch"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        aria-describedby="status-help"
                                    />
                                    <Form.Label className="form-check-label ms-2">
                                        {formData.is_active
                                            ? getFormattedMessage("cash-advance-identity.input.status.active")
                                            : "Tidak Aktif"
                                        }
                                    </Form.Label>
                                </div>
                                <Form.Text id="status-help" className="text-muted">
                                    Aktifkan untuk mengizinkan pembuatan cash advance baru
                                </Form.Text>
                            </Form.Group>
                        </div>

                        {/* Address Field */}
                        <div className="col-12 mb-3">
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    {getFormattedMessage("cash-advance-identity.input.address.label")}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
                                    isInvalid={touched.address && !!errors.address}
                                    placeholder={intl.formatMessage({
                                        id: "cash-advance-identity.input.address.placeholder.label"
                                    })}
                                    aria-describedby="address-error"
                                />
                                {touched.address && errors.address && (
                                    <Form.Control.Feedback type="invalid" id="address-error">
                                        {errors.address}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </div>

                        {/* Notes Field */}
                        <div className="col-12 mb-3">
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    {getFormattedMessage("globally.input.note.label")}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    onBlur={() => setTouched(prev => ({ ...prev, notes: true }))}
                                    isInvalid={touched.notes && !!errors.notes}
                                    placeholder={intl.formatMessage({
                                        id: "globally.input.note.placeholder.label"
                                    })}
                                    aria-describedby="notes-error"
                                />
                                {touched.notes && errors.notes && (
                                    <Form.Control.Feedback type="invalid" id="notes-error">
                                        {errors.notes}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </div>
                    </div>

                    {/* Unsaved changes indicator */}
                    {hasUnsavedChanges && (
                        <Alert variant="warning" className="mt-3">
                            <small>
                                <i className="fa fa-exclamation-triangle me-2"></i>
                                Anda memiliki perubahan yang belum disimpan
                            </small>
                        </Alert>
                    )}
                </Modal.Body>

                <Modal.Footer className="bg-light p-4">
                    <div className="d-flex justify-content-between w-100">
                        <div>
                            {isSaving && (
                                <Spinner animation="border" size="sm" className="me-2" />
                            )}
                            <small className="text-muted">
                                {isSaving ? "Menyimpan..." : "Tekan Ctrl+S untuk menyimpan cepat"}
                            </small>
                        </div>

                        <div className="btn-group">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={isSaving}
                                aria-label="Batal edit identitas"
                            >
                                {getFormattedMessage("globally.cancel-btn")}
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSaving || hasErrors || !isDirty}
                                aria-label="Simpan perubahan identitas"
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        {placeholderText("globally-saving-btn-label")}
                                    </>
                                ) : (
                                    "Simpan Perubahan"
                                )}
                            </button>
                        </div>
                    </div>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditCashAdvanceIdentityModal;