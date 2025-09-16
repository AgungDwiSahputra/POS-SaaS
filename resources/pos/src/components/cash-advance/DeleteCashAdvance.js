import React from "react";
import { connect } from "react-redux";
import DeleteModel from "../../shared/action-buttons/DeleteModel";
import { deleteCashAdvance } from "../../store/action/cashAdvanceAction";
import { getFormattedMessage } from "../../shared/sharedMethod";

const DeleteCashAdvance = (props) => {
    const { deleteCashAdvance, onDelete, deleteModel, onClickDeleteModel } = props;

    const deleteClick = () => {
        deleteCashAdvance(onDelete.id);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && (
                <DeleteModel
                    onClickDeleteModel={onClickDeleteModel}
                    deleteModel={deleteModel}
                    deleteClick={deleteClick}
                    name={getFormattedMessage("cash-advance.title")}
                />
            )}
        </div>
    );
};

export default connect(null, { deleteCashAdvance })(DeleteCashAdvance);
