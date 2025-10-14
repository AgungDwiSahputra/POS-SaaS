import React from "react";
import { Modal, Button } from "react-bootstrap";
import { getFormattedMessage } from "../../../shared/sharedMethod";

const DeleteDigitalProduct = ({ onClickDeleteModel, deleteModel, onDelete, digitalProduct }) => {
    const handleDelete = () => {
        if (typeof onDelete === "function" && digitalProduct?.id) {
            onDelete(digitalProduct);
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
                    {getFormattedMessage("digital-product.delete.title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center">
                    <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
                    <h5 className="mb-3">
                        {getFormattedMessage("digital-product.delete.confirmation")}
                    </h5>
                    {digitalProduct && (
                        <div className="alert alert-light">
                            <strong>{digitalProduct.name}</strong>
                            <br />
                            <small className="text-muted">
                                Code: {digitalProduct.code}
                            </small>
                        </div>
                    )}
                    <p className="text-muted">
                        {getFormattedMessage("digital-product.delete.warning")}
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

export default DeleteDigitalProduct;
