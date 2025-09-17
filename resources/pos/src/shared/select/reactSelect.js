import React, { useEffect, useMemo } from 'react';
import { Form } from 'react-bootstrap-v5';
import Select from 'react-select';
import { useDispatch, useSelector } from "react-redux";
import { getFormattedMessage } from '../sharedMethod';

const ReactSelect = ( props ) => {
    const { isCustomWidth, title, placeholder, data, defaultValue, onChange, errors, value, isRequired, multiLanguageOption, isWarehouseDisable, addSearchItems, controlId } = props;
    const dispatch = useDispatch();
    const isOptionDisabled = useSelector( ( state ) => state.isOptionDisabled );

    const generatedId = useMemo( () => {
        if (controlId) {
            return controlId;
        }

        if (typeof ReactSelect.idCounter === 'undefined') {
            ReactSelect.idCounter = 0;
        }

        ReactSelect.idCounter += 1;

        return `react-select-${ ReactSelect.idCounter }`;
    }, [controlId] );

    const option = data && data?.length > 0 ? data?.map( ( da ) => {
        return {
            value: da.value ? da.value : da.id,
            label: da.label ? da.label : da?.attributes?.symbol ? da?.attributes?.symbol : da?.attributes?.name
        }
    } ) : multiLanguageOption && multiLanguageOption?.length > 0 &&  multiLanguageOption?.map( ( option ) => {
        return {
            value: option.id,
            label: option.name
        }
    } )

    useEffect( () => {
        addSearchItems ? dispatch( { type: 'DISABLE_OPTION', payload: true } ) : dispatch( { type: 'DISABLE_OPTION', payload: false } )
    }, [] );

    return (
        <Form.Group className={isCustomWidth ? 'form-group w-117px' : 'form-group w-100'}>
            {title ? <Form.Label htmlFor={generatedId}>{title}:</Form.Label> : ''}
            {isRequired ? '' : <span className='required' />}
            <Select
                placeholder={placeholder}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                options={option}
                noOptionsMessage={() => getFormattedMessage( 'no-option.label' )}
                isDisabled={isWarehouseDisable ? isOptionDisabled : false}
                inputId={generatedId}
            />
            {errors ? <span className='text-danger d-block fw-400 fs-small mt-2'>{errors ? errors : null}</span> : null}
        </Form.Group>
    )
};
export default ReactSelect;
