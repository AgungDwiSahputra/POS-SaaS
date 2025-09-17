import React, { useMemo } from "react";
import { Form } from "react-bootstrap-v5";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { getFormattedMessage } from "../sharedMethod";

const animatedComponents = makeAnimated();

const customStyles = {
    control: (provided) => ({
        ...provided,
        overflow: "auto",
        height: "35px",
    }),
};

const ReactMultiSelect = ({
    title,
    isRequired,
    placeholder,
    value = null,
    defaultValue = null,
    onChange,
    errors = "",
    option,
    controlId,
}) => {
    const generatedId = useMemo(() => {
        if (controlId) {
            return controlId;
        }

        if (typeof ReactMultiSelect.idCounter === "undefined") {
            ReactMultiSelect.idCounter = 0;
        }

        ReactMultiSelect.idCounter += 1;

        return `react-multi-select-${ReactMultiSelect.idCounter}`;
    }, [controlId]);

    return (
        <Form.Group className="form-group w-100">
            {title ? <Form.Label htmlFor={generatedId}>{title} :</Form.Label> : ""}
            {isRequired ? "" : <span className="required" />}
            <Select
                placeholder={placeholder}
                components={animatedComponents}
                isMulti
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                options={option}
                styles={customStyles}
                noOptionsMessage={() => getFormattedMessage("no-option.label")}
                inputId={generatedId}
            />
            {errors ? (
                <span className="text-danger d-block fw-400 fs-small mt-2">
                    {errors ? errors : null}
                </span>
            ) : null}
        </Form.Group>
    );
};

export default ReactMultiSelect;
