import React from 'react';
import { Table } from 'react-bootstrap-v5';
import DigitalProductTableBody from './DigitalProductTableBody';
import { getFormattedMessage } from '../../sharedMethod';

const DigitalProductRowTable = (props) => {
    const {
        updateProducts, setUpdateProducts, updatedQty, updateCost, updateDiscount, updateTax,
        frontSetting, updateSubTotal, allConfigData
    } = props;

    return (
        <Table responsive>
            <thead>
                <tr>
                    <th>{getFormattedMessage('product.title')}</th>
                    <th>{getFormattedMessage('globally.detail.net-unit-price')}</th>
                    <th className='text-lg-start text-center'>{getFormattedMessage('pos-qty.title')}</th>
                    <th>{getFormattedMessage('globally.detail.discount')}</th>
                    <th>{getFormattedMessage('globally.detail.tax')}</th>
                    <th>{getFormattedMessage('globally.detail.subtotal')}</th>
                    <th>{getFormattedMessage('react-data-table.action.column.label')}</th>
                </tr>
            </thead>
            <tbody>
                {updateProducts && updateProducts.map((singleProduct, index) => {
                    return <DigitalProductTableBody
                        singleProduct={singleProduct}
                        key={index}
                        index={index}
                        updateProducts={updateProducts}
                        setUpdateProducts={setUpdateProducts}
                        frontSetting={frontSetting}
                        allConfigData={allConfigData}
                        updateQty={updatedQty}
                        updateCost={updateCost}
                        updateDiscount={updateDiscount}
                        updateTax={updateTax}
                        updateSubTotal={updateSubTotal}
                    />;
                })}
                {!updateProducts.length &&
                    <tr>
                        <td colSpan={7} className='fs-5 px-3 py-6 custom-text-center'>
                            {getFormattedMessage('sale.product.table.no-data.label')}
                        </td>
                    </tr>
                }
            </tbody>
        </Table>
    )
};

export default DigitalProductRowTable;
