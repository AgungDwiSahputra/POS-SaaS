import React, { useState } from "react";
import { connect } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    getFormattedMessage,
    placeholderText,
    currencySymbolHandling,
} from "../../../shared/sharedMethod";
import { Card, Row, Col, Form, Button, Alert } from "react-bootstrap";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

const ApproveTopupRequest = (props) => {
    const { topupRequest, approveTopupRequest, rejectTopupRequest, frontSetting, allConfigData } = props;
    const navigate = useNavigate();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState(''); // 'approve' or 'reject'
    const [adminNotes, setAdminNotes] = useState('');

    const currencySymbol = frontSetting?.value?.currency_symbol || "Rp";

    const formatCurrency = (amount) => {
        return currencySymbolHandling(allConfigData, currencySymbol, amount);
    };

    const handleApproval = async (actionType) => {
        setIsLoading(true);

        try {
            if (actionType === 'approve') {
                await approveTopupRequest(id, adminNotes, navigate);
            } else {
                await rejectTopupRequest(id, adminNotes, navigate);
            }
        } catch (error) {
            console.error('Approval failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!topupRequest) {
        return (
            <MasterLayout>
                <TopProgressBar />
                <div className="text-center py-5">
                    <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
                    <h5>Request tidak ditemukan</h5>
                </div>
            </MasterLayout>
        );
    }

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("topup-request.approval.title")} />

            <div className="row">
                <div className="col-12">
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">
                                {getFormattedMessage("topup-request.approval.title")}
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {/* Request Details */}
                            <Row className="mb-4">
                                <Col md={12}>
                                    <Alert variant="info">
                                        <h6 className="mb-3">Detail Permintaan Top-up:</h6>
                                        <Row>
                                            <Col md={6}>
                                                <p><strong>Request Code:</strong> {topupRequest.request_code}</p>
                                                <p><strong>Store:</strong> {topupRequest.store?.name || "-"}</p>
                                                <p><strong>Provider:</strong> {topupRequest.digital_provider?.name || "-"}</p>
                                                <p><strong>Requested By:</strong> {topupRequest.requested_by?.first_name || "-"} {topupRequest.requested_by?.last_name || "-"}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p><strong>Amount:</strong> {formatCurrency(topupRequest.amount)}</p>
                                                <p><strong>Current Balance:</strong> {formatCurrency(topupRequest.current_balance)}</p>
                                                <p><strong>Balance After:</strong> {formatCurrency(topupRequest.balance_after_topup)}</p>
                                                <p><strong>Reason:</strong> {topupRequest.reason}</p>
                                            </Col>
                                        </Row>
                                    </Alert>
                                </Col>
                            </Row>

                            {/* Admin Notes */}
                            <Row className="mb-4">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label>
                                            {getFormattedMessage("topup-request.admin-notes.label")} *
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Catatan untuk approval/rejection ini..."
                                            className="form-control-solid"
                                            required
                                        />
                                        <Form.Text className="text-muted">
                                            Catatan ini akan dicatat dalam riwayat permintaan
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Action Buttons */}
                            <div className="d-flex justify-content-end">
                                <Button
                                    variant="success"
                                    disabled={isLoading || !adminNotes.trim()}
                                    className="me-2"
                                    onClick={() => handleApproval('approve')}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                                            {getFormattedMessage("globally.saving.btn")}
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle me-2"></i>
                                            {getFormattedMessage("topup-request.approve.btn")}
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="danger"
                                    disabled={isLoading || !adminNotes.trim()}
                                    className="me-2"
                                    onClick={() => handleApproval('reject')}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                                            {getFormattedMessage("globally.saving.btn")}
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-x-circle me-2"></i>
                                            {getFormattedMessage("topup-request.reject.btn")}
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="secondary"
                                    onClick={() => window.history.back()}
                                >
                                    {getFormattedMessage("globally.cancel.btn")}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { topupRequest, frontSetting, allConfigData } = state;
    return { topupRequest, frontSetting, allConfigData };
};

export default connect(mapStateToProps, {
    // approveTopupRequest, rejectTopupRequest
})(ApproveTopupRequest);