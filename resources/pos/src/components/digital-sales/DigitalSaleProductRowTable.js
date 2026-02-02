import React from 'react';
import { Table } from 'react-bootstrap-v5';
import DigitalSaleProductTableBody from './DigitalSaleProductTableBody';
import { getFormattedMessage } from '../../shared/sharedMethod';

const DigitalSaleProductRowTable = (props) => {
    const {
        cartItems,
        frontSetting,
        allConfigData,
        updateCartItemQty,
        updateCartItemPrice,
        updateCartItemCost,
        removeCartItem,
    } = props;

    return (
        <Table responsive>
            <thead>
                <tr>
                    <th>{getFormattedMessage('digital-sale.product.label')}</th>
                    <th>{getFormattedMessage('digital-sale.cost.label')}</th>
                    <th>{getFormattedMessage('digital-sale.price.label')}</th>
                    <th className='text-center'>{getFormattedMessage('digital-sale.quantity.label') || 'Quantity'}</th>
                    <th>{getFormattedMessage('digital-sale.sub-total.label') || 'Sub Total'}</th>
                    <th>{getFormattedMessage('react-data-table.action.column.label')}</th>
                </tr>
            </thead>
            <tbody>
                {cartItems && cartItems.map((item, index) => (
                    <DigitalSaleProductTableBody
                        key={index}
                        index={index}
                        item={item}
                        frontSetting={frontSetting}
                        allConfigData={allConfigData}
                        updateCartItemQty={updateCartItemQty}
                        updateCartItemPrice={updateCartItemPrice}
                        updateCartItemCost={updateCartItemCost}
                        removeCartItem={removeCartItem}
                    />
                ))}
                {!cartItems.length && (
                    <tr>
                        <td colSpan={6} className='fs-5 px-3 py-6 custom-text-center'>
                            {getFormattedMessage('digital-sale.product.table.no-data.label') || 'No products added'}
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );
};

export default DigitalSaleProductRowTable;
