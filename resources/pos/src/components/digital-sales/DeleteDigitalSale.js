import React from 'react';
import {connect} from 'react-redux';
import DeleteModel from '../../shared/action-buttons/DeleteModel';
import {deleteDigitalSale} from '../../store/action/digitalSaleAction';
import {getFormattedMessage} from '../../shared/sharedMethod';

const DeleteDigitalSale = (props) => {
    const {deleteDigitalSale, onDelete, deleteModel, onClickDeleteModel} = props;

    const deleteSaleClick = () => {
        deleteDigitalSale(onDelete.id);
        onClickDeleteModel(false);
    };

    return (
        <div>
            {deleteModel && <DeleteModel onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel}
                                         deleteClick={deleteSaleClick} name={getFormattedMessage('digital-sales.title')}/>}
        </div>
    )
};

export default connect(null, {deleteDigitalSale})(DeleteDigitalSale);
