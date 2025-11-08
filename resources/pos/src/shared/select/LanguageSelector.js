import React, { useEffect, useMemo } from 'react';
import { Form } from 'react-bootstrap-v5';
import Select from 'react-select';
import { useDispatch, useSelector } from "react-redux";
import { getFormattedMessage } from '../sharedMethod';

const LanguageSelector = (props) => {
    const { title, placeholder, onChange, value, isRequired, controlId } = props;
    const dispatch = useDispatch();

    const generatedId = useMemo(() => {
        if (controlId) {
            return controlId;
        }

        if (typeof LanguageSelector.idCounter === 'undefined') {
            LanguageSelector.idCounter = 0;
        }

        LanguageSelector.idCounter += 1;

        return `language-select-${ LanguageSelector.idCounter }`;
    }, [controlId]);

    // Available languages configuration
    const languages = useMemo(() => [
        { value: 'id', label: '🇮🇩 Bahasa Indonesia', nativeName: 'Indonesia' },
        { value: 'en', label: '🇺🇸 English', nativeName: 'English' },
    ], []);

    const handleChange = (selectedOption) => {
        if (onChange) {
            onChange(selectedOption);
        }

        // Dispatch action to update current language in Redux
        if (selectedOption) {
            dispatch({
                type: 'SET_CURRENT_LANGUAGE',
                payload: selectedOption.value
            });
        }
    };

    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            fontSize: '14px',
        }),
        singleValue: (provided, state) => ({
            ...provided,
            fontSize: '14px',
        }),
        control: (provided) => ({
            ...provided,
            fontSize: '14px',
        }),
    };

    return (
        <Form.Group className="form-group w-100">
            {title && <Form.Label htmlFor={generatedId}>{title}:</Form.Label>}
            {isRequired && <span className='required' />}
            <Select
                placeholder={placeholder || getFormattedMessage('language.selector.placeholder')}
                value={value}
                onChange={handleChange}
                options={languages}
                noOptionsMessage={() => getFormattedMessage('no-option.label')}
                inputId={generatedId}
                styles={customStyles}
                isSearchable={true}
            />
        </Form.Group>
    );
};

export default LanguageSelector;