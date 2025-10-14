import React from "react";
import { Modal, Button } from "react-bootstrap";
import { getFormattedMessage } from "../../../shared/sharedMethod";

const DeleteDigitalWithdrawal = ({
    onClickDeleteModel,
    deleteModel,
    onDelete,
    digitalWithdrawal,
}) => {
    const handleDelete = () => {
        if (typeof onDelete === "function" && digitalWithdrawal?.id) {
            onDelete(digitalWithdrawal);
        }
        onClickDeleteModel();
    };

    return (
        <Modal
            show={deleteModel}
            onHide={onClickDeleteModel}
            size="md"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header closeButton>
                <Modal.Title id="example-modal-sizes-title-lg">
                    {getFormattedMessage("digital-withdrawal.delete.title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center">
                    <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
                    <h5 className="mb-3">
                        {getFormattedMessage("digital-withdrawal.delete.confirmation")}
                    </h5>
                    {digitalWithdrawal && (
                        <div className="alert alert-light">
                            <strong>{digitalWithdrawal.reference_code}</strong>
                            <br />
                            <small className="text-muted">
                                {digitalWithdrawal.customer_name}
                            </small>
                        </div>
                    )}
                    <p className="text-muted">
                        {getFormattedMessage("digital-withdrawal.delete.warning")}
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
                <Button
                    variant="secondary"
                    onClick={onClickDeleteModel}
                    className="me-2"
                >
                    {getFormattedMessage("globally.cancel.btn")}
                </Button>
                <Button
                    variant="danger"
                    onClick={handleDelete}
                >
                    <i className="bi bi-trash me-2"></i>
                    {getFormattedMessage("globally.delete.btn")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteDigitalWithdrawal;
