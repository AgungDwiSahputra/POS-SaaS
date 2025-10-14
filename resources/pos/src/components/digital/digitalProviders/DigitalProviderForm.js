import React, { useEffect, useMemo, useRef, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import {
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";

const resolveLogoUrl = (logo) => {
    if (!logo) {
        return "";
    }

    const trimmed = logo.trim();

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    if (trimmed.startsWith('/')) {
        return trimmed;
    }

    if (/^storage\//i.test(trimmed)) {
        return `/${trimmed}`;
    }

    if (/^app\//i.test(trimmed)) {
        return `/storage/${trimmed}`;
    }

    return `/storage/${trimmed}`;
};

const DigitalProviderForm = (props) => {
    const { onSubmit, isLoading, digitalProvider } = props;

    const allProviders = useSelector(
        (state) => state.digitalProviders?.digitalProviders || []
    );

    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const existingCodes = useMemo(
        () =>
            allProviders
                .map((provider) => provider.attributes || provider)
                .filter((provider) => provider?.code)
                .map((provider) => provider.code.trim().toUpperCase()),
        [allProviders]
    );

    const currentCode = digitalProvider?.code
        ? digitalProvider.code.trim().toUpperCase()
        : null;

    const initialLogo =
        digitalProvider && typeof digitalProvider.logo === "string"
            ? digitalProvider.logo
            : "";

    const [logoPreview, setLogoPreview] = useState(
        initialLogo ? resolveLogoUrl(initialLogo) : ""
    );

    const validationSchema = useMemo(
        () =>
            Yup.object({
                name: Yup.string()
                    .required(getFormattedMessage("globally.input.name.validate.label"))
                    .max(255, "Nama maksimal 255 karakter"),
                code: Yup.string()
                    .required("Kode provider wajib diisi")
                    .max(50, "Kode maksimal 50 karakter")
                    .matches(/^[A-Z0-9_]+$/, "Kode hanya boleh berisi huruf besar, angka, dan underscore")
                    .test(
                        "unique-code",
                        "Kode provider sudah digunakan",
                        function (value) {
                            if (!value) {
                                return true;
                            }
                            const normalized = value.trim().toUpperCase();
                            if (currentCode && normalized === currentCode) {
                                return true;
                            }
                            return !existingCodes.includes(normalized);
                        }
                    ),
        description: Yup.string().max(500, "Deskripsi maksimal 500 karakter"),
        logo: Yup.mixed()
            .nullable()
            .test(
                "fileSize",
                "Ukuran logo maksimal 2MB",
                (value) => {
                    if (!value || typeof value === "string") {
                        return true;
                    }
                    return value.size <= 2 * 1024 * 1024;
                }
            )
            .test(
                "fileFormat",
                "Format logo harus JPEG, PNG, GIF, atau SVG",
                (value) => {
                    if (!value || typeof value === "string") {
                        return true;
                    }
                    return [
                        "image/jpeg",
                        "image/png",
                        "image/jpg",
                        "image/gif",
                        "image/svg+xml",
                    ].includes(value.type);
                }
            ),
                is_active: Yup.boolean(),
            }),
        [currentCode, existingCodes]
    );

    const formik = useFormik({
        initialValues: {
            name: digitalProvider ? digitalProvider.name : "",
            code: digitalProvider ? (digitalProvider.code || "").toUpperCase() : "",
            description: digitalProvider ? digitalProvider.description || "" : "",
            logo: digitalProvider ? digitalProvider.logo || "" : "",
            is_active: digitalProvider ? digitalProvider.is_active : true,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values, formikHelpers) => {
            const payload = {
                name: values.name.trim(),
                code: values.code.trim().toUpperCase(),
                description: values.description ? values.description.trim() : "",
                is_active: values.is_active ? "1" : "0",
            };

            const formData = new FormData();
            Object.entries(payload).forEach(([key, value]) => {
                formData.append(key, value ?? "");
            });

            if (values.logo instanceof File) {
                formData.append("logo", values.logo);
            } else if (typeof values.logo === "string" && values.logo) {
                formData.append("logo_url", values.logo.trim());
            }

            try {
                await onSubmit(formData);
            } catch (error) {
                const fieldErrors =
                    error?.errors ||
                    error?.context?.errors ||
                    error?.originalError?.response?.data?.errors ||
                    error?.context?.originalError?.response?.data?.errors ||
                    null;

                if (fieldErrors && isMountedRef.current) {
                    const formattedErrors = Object.entries(fieldErrors).reduce((acc, [key, message]) => {
                        acc[key] = Array.isArray(message) ? message[0] : message;
                        return acc;
                    }, {});

                    formikHelpers.setErrors(formattedErrors);
                    formikHelpers.setTouched(
                        Object.keys(formattedErrors).reduce(
                            (touched, key) => ({ ...touched, [key]: true }),
                            {}
                        )
                    );
                }
            } finally {
                if (isMountedRef.current) {
                    formikHelpers.setSubmitting(false);
                }
            }
        },
    });

    useEffect(() => {
        if (formik.values.logo instanceof File) {
            const objectUrl = URL.createObjectURL(formik.values.logo);
            setLogoPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }

        if (typeof formik.values.logo === "string" && formik.values.logo) {
            setLogoPreview(resolveLogoUrl(formik.values.logo));
        } else if (!formik.values.logo) {
            setLogoPreview("");
        }
    }, [formik.values.logo]);

    return (
        <Form onSubmit={formik.handleSubmit}>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("globally.input.name.label")}
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            placeholder={placeholderText("globally.input.name.placeholder.label")}
                            value={formik.values.name}
                            onChange={(event) =>
                                formik.setFieldValue("name", event.target.value)
                            }
                            onBlur={(event) => {
                                formik.handleBlur(event);
                                formik.setFieldValue("name", event.target.value.trim());
                            }}
                            isInvalid={formik.touched.name && formik.errors.name}
                            className="form-control-solid"
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="required">
                            {getFormattedMessage("globally.detail.code")}
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="code"
                            placeholder="Contoh: DANA, GOPAY, OVO"
                            value={formik.values.code}
                            onChange={(event) =>
                                formik.setFieldValue("code", event.target.value.toUpperCase())
                            }
                            onBlur={(event) => {
                                formik.handleBlur(event);
                                formik.setFieldValue("code", event.target.value.trim().toUpperCase());
                            }}
                            isInvalid={formik.touched.code && formik.errors.code}
                            className="form-control-solid"
                            style={{ textTransform: 'uppercase' }}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.code}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {getFormattedMessage("globally.detail.description")}
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            placeholder={placeholderText("globally.input.description.placeholder.label")}
                            value={formik.values.description}
                            onChange={(event) =>
                                formik.setFieldValue("description", event.target.value)
                            }
                            onBlur={(event) => {
                                formik.handleBlur(event);
                                formik.setFieldValue("description", event.target.value.trim());
                            }}
                            isInvalid={formik.touched.description && formik.errors.description}
                            className="form-control-solid"
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.description}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={8}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {getFormattedMessage("digital-provider.logo.label")}
                        </Form.Label>
                        <Form.Control
                            type="file"
                            name="logo"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.currentTarget.files && event.currentTarget.files[0];
                                formik.setFieldValue("logo", file || "");
                                formik.setFieldTouched("logo", true, false);
                            }}
                            onBlur={() => formik.setFieldTouched("logo", true)}
                            isInvalid={formik.touched.logo && formik.errors.logo}
                            className="form-control-solid"
                        />
                        <Form.Control.Feedback type="invalid">
                            {formik.errors.logo}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            {getFormattedMessage("globally.detail.status")}
                        </Form.Label>
                        <div className="d-flex align-items-center">
                            <Form.Check
                                type="switch"
                                name="is_active"
                                checked={formik.values.is_active}
                                onChange={formik.handleChange}
                                className="me-2"
                            />
                            <span className={formik.values.is_active ? "text-success" : "text-danger"}>
                                {formik.values.is_active
                                    ? getFormattedMessage("globally.active")
                                    : getFormattedMessage("globally.in-active")}
                            </span>
                        </div>
                    </Form.Group>
                </Col>
            </Row>

            {logoPreview && (
                <Row>
                    <Col md={12} className="mb-3">
                        <div className="text-center">
                            <img
                                src={logoPreview}
                                alt="Provider Logo Preview"
                                height="60"
                                className="border rounded p-2"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    </Col>
                </Row>
            )}

            <div className="d-flex justify-content-end">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading || formik.isSubmitting}
                    className="me-2"
                >
                    {isLoading || formik.isSubmitting ? (
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
                    disabled={isLoading || formik.isSubmitting}
                >
                    {getFormattedMessage("globally.cancel.btn")}
                </Button>
            </div>
        </Form>
    );
};

export default DigitalProviderForm;
