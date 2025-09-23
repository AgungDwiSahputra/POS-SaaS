import React from "react";
import { connect } from "react-redux";
import { deleteCashAdvanceIdentity } from "../../store/action/cashAdvanceIdentityAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import DeleteModel from "../../shared/action-buttons/DeleteModel";

const DeleteCashAdvanceIdentity = (props) => {
    const { onDeleteModel, onDelete, show, deleteCashAdvanceIdentity } = props;

    const onDeleteItem = () => {
        deleteCashAdvanceIdentity(onDelete.id, onDeleteModel);
    };

    return (
        <DeleteModel
            show={show}
            onDeleteModel={onDeleteModel}
            onDeleteItem={onDeleteItem}
            message={getFormattedMessage("cash-advance-identity.delete.message")}
        />
    );
};

export default connect(null, { deleteCashAdvanceIdentity })(DeleteCashAdvanceIdentity);
