import React from "react";
import { connect } from "react-redux";
import { Modal, Button } from "react-bootstrap-v5";
import { deleteProvider } from "../../store/action/providerAction";
import { getFormattedMessage } from "../../shared/sharedMethod";

const DeleteProvider = (props) => {
    const { deleteModel, onClickDeleteModel, onDelete, deleteProvider } = props;

    const onDeleteProvider = () => {
        deleteProvider(onDelete.id);
        onClickDeleteModel(false);
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
                    {getFormattedMessage("provider.modal.delete.title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center">
                    <span>
                        {getFormattedMessage("provider.modal.delete.message")}
                    </span>
                    <br />
                    <span className="text-danger font-weight-bold">
                        {onDelete ? onDelete.nama_provider : ""}
                    </span>
                </div>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
                <Button
                    variant="btn btn-sm btn-outline-primary"
                    onClick={onClickDeleteModel}
                >
                    {getFormattedMessage("delete-modal.no-btn")}
                </Button>
                <Button
                    variant="btn btn-sm btn-primary"
                    onClick={onDeleteProvider}
                >
                    {getFormattedMessage("delete-modal.yes-btn")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default connect(null, { deleteProvider })(DeleteProvider);