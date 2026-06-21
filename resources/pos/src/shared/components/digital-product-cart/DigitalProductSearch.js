import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import { addToast } from '../../../store/action/toastAction';
import { toastType } from '../../../constants';
import { getFormattedMessage, placeholderText } from '../../sharedMethod';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const DigitalProductSearch = (props) => {
    const {
        products,
        updateProducts,
        setUpdateProducts,
        handleValidation
    } = props;
    const [searchString, setSearchString] = useState("");
    const dispatch = useDispatch();

    // Filter digital products - no warehouse check needed
    const filterProducts = products.map((item) => ({
        name: item.attributes.name,
        code: item.attributes.code,
        id: item.id
    }));

    const onProductSearch = (code) => {
        setSearchString(code);
        const newId = products.filter((item) =>
            item.attributes.code === code || item.attributes.code === code.code
        ).map((item) => item.id);

        if (newId[0] !== undefined) {
            if (updateProducts.find(exitId => exitId.product_id === newId[0])) {
                dispatch(addToast({
                    text: getFormattedMessage('globally.product-already-added.validate.message'),
                    type: toastType.ERROR
                }));
            } else {
                // Find the product and add it to the cart
                const product = products.find(p => p.id === newId[0]);
                if (product) {
                    const newProductItem = {
                        id: 'new_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        product_id: product.id,
                        code: product.attributes.code,
                        name: product.attributes.name,
                        product_price: product.attributes.price,
                        fix_net_unit: product.attributes.price,
                        net_unit_price: product.attributes.price,
                        tax_type: 2,
                        tax_value: 0,
                        tax_amount: 0,
                        discount_type: 2,
                        discount_value: 0,
                        discount_amount: 0,
                        quantity: 1,
                        sub_total: product.attributes.price,
                        newItem: 'new'
                    };
                    setUpdateProducts([...updateProducts, newProductItem]);
                }
            }
            removeSearchClass();
            setSearchString("");
        }
    }

    const handleOnSearch = (string) => {
        onProductSearch(string);
    }

    const handleOnSelect = (result) => {
        onProductSearch(result);
    }

    const formatResult = (item) => {
        return (
            <span onClick={(e) => e.stopPropagation()}>{item.code} ({item.name})</span>
        )
    }

    const removeSearchClass = () => {
        const html = document.getElementsByClassName(`custom-search`)[0]?.firstChild?.firstChild?.lastChild;
        if (html) {
            html.style.display = 'none'
        }
    }

    return (
        <div className='position-relative custom-search'>
            <ReactSearchAutocomplete
                items={filterProducts}
                onSearch={handleOnSearch}
                inputSearchString={searchString}
                fuseOptions={{ keys: ['code', 'name'] }}
                resultStringKeyName='code'
                placeholder={placeholderText('globally.search.field.label')}
                onSelect={handleOnSelect}
                formatResult={formatResult}
                showIcon={false}
                showClear={false}
            />
            <FontAwesomeIcon icon={faSearch}
                className='d-flex align-items-center top-0 bottom-0 react-search-icon my-auto text-gray-600 position-absolute' />
        </div>
    );
}

export default connect(null)(DigitalProductSearch);
