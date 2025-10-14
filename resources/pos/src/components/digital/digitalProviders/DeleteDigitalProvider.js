import React from "react";
import { connect } from "react-redux";
import { Modal, Button } from "react-bootstrap";
import { getFormattedMessage } from "../../../shared/sharedMethod";
import { deleteDigitalProvider } from "../../../store/action/digitalProviderAction";

const DeleteDigitalProvider = (props) => {
    const {
        onClickDeleteModel,
        deleteModel,
        id,
        deleteDigitalProvider,
        digitalProviders,
        onDelete,
    } = props;

    const selectedProvider =
        id && typeof id === 'object'
            ? id
            : Array.isArray(digitalProviders)
                ? digitalProviders.find((provider) => provider.id === id)
                : null;
    const providerRecord = selectedProvider || null;
    const providerAttributes = providerRecord?.attributes || providerRecord || {};
    const providerId = providerRecord?.id || providerAttributes?.id;
    return (
        <Modal
            show={deleteModel}
            onHide={onClickDeleteModel}
            size="md"
            aria-labelledby="example-modal-sizes-title-lg"
        >
            <Modal.Header closeButton>
                <Modal.Title id="example-modal-sizes-title-lg">
                    {getFormattedMessage("digital-provider.delete.title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center">
                    <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
                    <h5 className="mb-3">
                        {getFormattedMessage("digital-provider.delete.confirmation")}
                    </h5>
                    {providerRecord && (
                        <div className="alert alert-light">
                            <strong>{providerAttributes.name}</strong>
                            <br />
                            <small className="text-muted">
                                Code: {providerAttributes.code}
                            </small>
                        </div>
                    )}
                    <p className="text-muted">
                        {getFormattedMessage("digital-provider.delete.warning")}
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
                        if (providerId) {
                            if (onDelete) {
                                onDelete(providerId);
                            } else {
                                deleteDigitalProvider(providerId);
                            }
                        }
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
    const { digitalProviders: digitalProvidersState = {} } = state;
    return {
        digitalProviders: digitalProvidersState.digitalProviders || [],
    };
};

export default connect(mapStateToProps, {
    deleteDigitalProvider,
})(DeleteDigitalProvider);
