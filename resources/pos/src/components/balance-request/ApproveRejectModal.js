import React, { useState } from "react";
import { connect } from "react-redux";
import { Modal, Button, Form } from "react-bootstrap-v5";
import { approveBalanceRequest, rejectBalanceRequest } from "../../store/action/balanceRequestAction";
import { getFormattedMessage, getFormattedText } from "../../shared/sharedMethod";

const ApproveRejectModal = (props) => {
    const {
        show,
        onHide,
        balanceRequest,
        approveBalanceRequest,
        rejectBalanceRequest,
        isApprove
    } = props;

    const [notes, setNotes] = useState("");

    const handleSubmit = () => {
        if (isApprove) {
            approveBalanceRequest(balanceRequest.id);
        } else {
            rejectBalanceRequest(balanceRequest.id);
        }
        onHide();
        setNotes("");
    };

    const handleClose = () => {
        onHide();
        setNotes("");
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="md"
            aria-labelledby="approve-reject-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title id="approve-reject-modal">
                    {isApprove
                        ? getFormattedMessage("balance-request.approve.title")
                        : getFormattedMessage("balance-request.reject.title")
                    }
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center mb-3">
                    <span>
                        {isApprove
                            ? getFormattedMessage("balance-request.approve.confirm")
                            : getFormattedMessage("balance-request.reject.confirm")
                        }
                    </span>
                    <br />
                    <span className="text-primary font-weight-bold">
                        {balanceRequest ? `ID: ${balanceRequest.id}` : ""}
                    </span>
                </div>
                <Form.Group className="mb-3">
                    <Form.Label>
                        {getFormattedMessage("balance-request.input.notes.label")} (Opsional)
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={getFormattedText("balance-request.input.notes.placeholder.label")}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
                <Button
                    variant="btn btn-sm btn-outline-secondary"
                    onClick={handleClose}
                >
                    {getFormattedMessage("globally.cancel-btn")}
                </Button>
                <Button
                    variant={`btn btn-sm ${isApprove ? 'btn-success' : 'btn-danger'}`}
                    onClick={handleSubmit}
                >
                    {isApprove
                        ? getFormattedMessage("globally.approve.label")
                        : getFormattedMessage("globally.reject.label")
                    }
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default connect(null, {
    approveBalanceRequest,
    rejectBalanceRequest
})(ApproveRejectModal);