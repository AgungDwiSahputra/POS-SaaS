import React from "react";
import { connect } from "react-redux";
import { Modal, Button } from "react-bootstrap";
import {
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";

const DeleteTopupRequest = (props) => {
    const { onClickDeleteModel, deleteModel, onDelete, topupRequest } = props;

    return (
        <Modal
            show={deleteModel}
            onHide={onClickDeleteModel}
            size="md"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header closeButton>
                <Modal.Title id="example-modal-sizes-title-lg">
                    {getFormattedMessage("topup-request.delete.title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center">
                    <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
                    <h5 className="mb-3">
                        {getFormattedMessage("topup-request.delete.confirmation")}
                    </h5>
                    {topupRequest && (
                        <div className="alert alert-light">
                            <strong>{topupRequest.request_code}</strong>
                            <br />
                            <small className="text-muted">
                                {topupRequest.digital_provider?.name || "-"}
                            </small>
                        </div>
                    )}
                    <p className="text-muted">
                        {getFormattedMessage("topup-request.delete.warning")}
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
                    onClick={() => {
                        onDelete(topupRequest?.id);
                        onClickDeleteModel();
                    }}
                >
                    <i className="bi bi-trash me-2"></i>
                    {getFormattedMessage("globally.delete.btn")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const mapStateToProps = (state) => {
    return {};
};

export default connect(mapStateToProps, {
    // deleteTopupRequest
})(DeleteTopupRequest);