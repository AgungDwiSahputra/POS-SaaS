import React, { useState } from "react";
import { Row, Col, Form } from "react-bootstrap-v5";
import { getFormattedMessage } from "../../shared/sharedMethod";

const CustomPaperSize = ({ onCustomSizeChange, customSize, errors }) => {
    const [showCustom, setShowCustom] = useState(false);

    const handleCustomToggle = (e) => {
        setShowCustom(e.target.checked);
        if (!e.target.checked) {
            onCustomSizeChange({
                enabled: false,
                width: '',
                height: '',
                label: ''
            });
        } else {
            onCustomSizeChange({
                enabled: true,
                width: customSize?.width || '',
                height: customSize?.height || '',
                label: customSize?.label || ''
            });
        }
    };

    const handleSizeChange = (field, value) => {
        onCustomSizeChange({
            ...customSize,
            [field]: value
        });
    };

    return (
        <div className="mt-3">
            <Row>
                <Col xs={12}>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="customPaperSize"
                            checked={showCustom}
                            onChange={handleCustomToggle}
                        />
                        <label className="form-check-label" htmlFor="customPaperSize">
                            {getFormattedMessage("print-barcode.custom-paper-size.label")}
                        </label>
                    </div>
                </Col>
            </Row>

            {showCustom && (
                <Row className="mt-3">
                    <Col xs={12} md={4}>
                        <Form.Group>
                            <Form.Label>
                                {getFormattedMessage("print-barcode.paper-width.label")} (mm)
                            </Form.Label>
                            <Form.Control
                                type="number"
                                step="1"
                                min="1"
                                placeholder="63.5"
                                value={customSize?.width || ''}
                                onChange={(e) => handleSizeChange('width', e.target.value)}
                                isInvalid={!!errors?.width}
                            />
                            {errors?.width && (
                                <Form.Control.Feedback type="invalid">
                                    {errors.width}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                        <Form.Group>
                            <Form.Label>
                                {getFormattedMessage("print-barcode.paper-height.label")} (mm)
                            </Form.Label>
                            <Form.Control
                                type="number"
                                step="1"
                                min="1"
                                placeholder="25.4"
                                value={customSize?.height || ''}
                                onChange={(e) => handleSizeChange('height', e.target.value)}
                                isInvalid={!!errors?.height}
                            />
                            {errors?.height && (
                                <Form.Control.Feedback type="invalid">
                                    {errors.height}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={4}>
                        <Form.Group>
                            <Form.Label>
                                {getFormattedMessage("print-barcode.paper-label.label")}
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Custom Size"
                                value={customSize?.label || ''}
                                onChange={(e) => handleSizeChange('label', e.target.value)}
                                isInvalid={!!errors?.label}
                            />
                            {errors?.label && (
                                <Form.Control.Feedback type="invalid">
                                    {errors.label}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default CustomPaperSize;
