import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { InputGroup } from "react-bootstrap-v5";
import { addDigitalProduct, editDigitalProduct } from "../../store/action/digitalProductAction";
import { fetchAllProductCategories } from "../../store/action/productCategoryAction";
import { fetchAllBrands } from "../../store/action/brandsAction";
import { getFormattedMessage, placeholderText, getCurrentUser, getFormattedOptions } from "../../shared/sharedMethod";
import MultipleImage from "../product/MultipleImage";
import ModelFooter from "../../shared/components/modelFooter";
import ReactSelect from "../../shared/select/reactSelect";
import moment from "moment";
import ReactDatePicker from "../../shared/datepicker/ReactDatePicker";
import { digitalProductTypeOptions } from "../../constants";

const DigitalProductForm = (props) => {
     const {
         addDigitalProduct,
         editDigitalProduct,
         id,
         frontSetting,
         digitalProduct,
         editDigitalProductData,
     } = props;

    const navigate = useNavigate();

    const [digitalProductValue, setDigitalProductValue] = useState({
        name: "",
        code: "",
        description: "",
        price: "",
        cost: "",
        expiry_date: null,
        file_path: "",
        type: "",
    });

    const [multipleFiles, setMultipleFiles] = useState([]);
    const [errors, setErrors] = useState({});

    const digitalProductTypeOptionsObj = getFormattedOptions(digitalProductTypeOptions);

    // Digital products don't need brands and product categories

    // Populate form data when editing
    useEffect(() => {
        if (digitalProduct && digitalProduct.length > 0 && id) {
            // Find the specific product by ID instead of taking the first one
            const product = digitalProduct.find(p => {
                const productId = p.attributes ? p.attributes.id : p.id;
                return productId === parseInt(id);
            });

            if (product) {
                console.log('DigitalProductForm: Populating form with data for ID', id, ':', product);

                // Handle JSON:API format (check if attributes exist)
                const attributes = product.attributes || product;

                setDigitalProductValue({
                    name: attributes.name || "",
                    code: attributes.code || "",
                    description: attributes.description || "",
                    price: attributes.price || "",
                    cost: attributes.cost || "",
                    expiry_date: attributes.expiry_date ? moment(attributes.expiry_date) : null,
                    file_path: attributes.file_path || "",
                    type: attributes.type || "",
                });

                console.log('DigitalProductForm: Form values set for ID', id, ':', {
                    name: attributes.name || "",
                    code: attributes.code || "",
                    price: attributes.price || "",
                    type: attributes.type || "",
                });
            } else {
                console.warn('DigitalProductForm: Product with ID', id, 'not found in Redux state');
            }
        }
    }, [digitalProduct, id]);

    const onChangeInput = (e) => {
        setDigitalProductValue({
            ...digitalProductValue,
            [e.target.name]: e.target.value
        });
        setErrors({});
    };

    const handleCallback = (date) => {
        setDigitalProductValue({
            ...digitalProductValue,
            expiry_date: date,
        });
        setErrors({});
    };

    const onChangeFiles = (file) => {
        setMultipleFiles(file);
    };

    const prepareFormData = () => {
        const formData = new FormData();

        // Remove manual tenant_id sending - let backend handle it via Multitenantable trait

        formData.append("name", digitalProductValue.name);
        formData.append("code", digitalProductValue.code);
        formData.append("description", digitalProductValue.description || "");
        formData.append("price", parseFloat(digitalProductValue.price) || 0);
        formData.append("cost", parseFloat(digitalProductValue.cost) || 0);
        if (digitalProductValue.expiry_date) {
            formData.append("expiry_date", moment(digitalProductValue.expiry_date).format("YYYY-MM-DD"));
        }
        formData.append("file_path", digitalProductValue.file_path || "");
        formData.append("type", digitalProductValue.type || "");

        if (multipleFiles && multipleFiles.length > 0) {
            multipleFiles.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });
        }

        return formData;
    };

    const handleValidation = () => {
        let errors = {};
        let isValid = false;

        console.log('Validating form data:', digitalProductValue);

        if (!digitalProductValue["name"] || digitalProductValue["name"].trim() === "") {
            errors["name"] = getFormattedMessage("globally.input.name.validate.label");
        } else if (!digitalProductValue["code"] || digitalProductValue["code"].trim() === "") {
            errors["code"] = getFormattedMessage("product.input.code.validate.label");
        } else if (!digitalProductValue["price"] || isNaN(parseFloat(digitalProductValue["price"]))) {
            errors["price"] = getFormattedMessage("product.input.product-price.validate.label");
        } else if (!digitalProductValue["cost"] || isNaN(parseFloat(digitalProductValue["cost"]))) {
            errors["cost"] = getFormattedMessage("digital-product.input.cost.validate.label");
        } else if (!digitalProductValue["type"] || digitalProductValue["type"].trim() === "") {
            errors["type"] = getFormattedMessage("digital-product.input.type.validate.label");
        } else {
            isValid = true;
        }

        console.log('Validation errors:', errors);
        console.log('Is valid:', isValid);

        setErrors(errors);
        return isValid;
    };

    const onSubmit = (event) => {
         event.preventDefault();
         const valid = handleValidation();
         if (valid) {
             const formData = prepareFormData();
             console.log('Digital Product Form Data being sent:', {
                 name: digitalProductValue.name,
                 code: digitalProductValue.code,
                 description: digitalProductValue.description,
                 price: digitalProductValue.price,
                 cost: digitalProductValue.cost,
                 expiry_date: digitalProductValue.expiry_date,
                 file_path: digitalProductValue.file_path,
                 type: digitalProductValue.type,
                 multipleFiles: multipleFiles
             });

             // Debug FormData contents
             console.log('FormData entries:');
             for (let [key, value] of formData.entries()) {
                 console.log(key, value);
             }

             if (id) {
                 // Edit mode
                 editDigitalProductData(formData);
             } else {
                 // Create mode
                 addDigitalProduct(formData, navigate);
             }
         }
     };

    return (
        <>
            <div className="card">
                <div className="card-body">
                    <Form>
                        <div className="row">
                            <div className="col-xl-8">
                                <div className="card">
                                    <div className="card-body p-0">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    {getFormattedMessage("globally.input.name.label")}
                                                    :{" "}
                                                </label>
                                                <span className="required" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={digitalProductValue.name}
                                                    placeholder={placeholderText("globally.input.name.placeholder.label")}
                                                    className="form-control"
                                                    autoFocus={true}
                                                    onChange={(e) => onChangeInput(e)}
                                                />
                                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                                    {errors["name"] ? errors["name"] : null}
                                                </span>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    {getFormattedMessage("globally.code.label")}
                                                    :{" "}
                                                </label>
                                                <span className="required" />
                                                <input
                                                    type="text"
                                                    name="code"
                                                    value={digitalProductValue.code}
                                                    placeholder={placeholderText("product.input.code.placeholder.label")}
                                                    className="form-control"
                                                    onChange={(e) => onChangeInput(e)}
                                                />
                                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                                    {errors["code"] ? errors["code"] : null}
                                                </span>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    {getFormattedMessage("digital-product.input.price.label")}
                                                    :{" "}
                                                </label>
                                                <span className="required" />
                                                <InputGroup>
                                                    <input
                                                        type="number"
                                                        name="price"
                                                        value={digitalProductValue.price}
                                                        placeholder={placeholderText("digital-product.input.price.placeholder.label")}
                                                        className="form-control"
                                                        min="0"
                                                        step="0.01"
                                                        onChange={(e) => onChangeInput(e)}
                                                    />
                                                    <InputGroup.Text>
                                                        {frontSetting?.value?.currency_symbol || '$'}
                                                    </InputGroup.Text>
                                                </InputGroup>
                                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                                    {errors["price"] ? errors["price"] : null}
                                                </span>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    {getFormattedMessage("digital-product.input.cost.label")}
                                                    :{" "}
                                                </label>
                                                <span className="required" />
                                                <InputGroup>
                                                    <input
                                                        type="number"
                                                        name="cost"
                                                        value={digitalProductValue.cost}
                                                        placeholder={placeholderText("digital-product.input.cost.placeholder.label")}
                                                        className="form-control"
                                                        min="0"
                                                        step="0.01"
                                                        onChange={(e) => onChangeInput(e)}
                                                    />
                                                    <InputGroup.Text>
                                                        {frontSetting?.value?.currency_symbol || '$'}
                                                    </InputGroup.Text>
                                                </InputGroup>
                                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                                    {errors["cost"] ? errors["cost"] : null}
                                                </span>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                {/* <label className="form-label">
                                                    {getFormattedMessage("digital-product.input.type.label")}
                                                    :{" "}
                                                </label> */}
                                                {/* <span className="required" /> */}
                                                <ReactSelect
                                                    title={getFormattedMessage("digital-product.input.type.label")}
                                                    multiLanguageOption={digitalProductTypeOptionsObj}
                                                    onChange={(obj) => {
                                                        setDigitalProductValue({
                                                            ...digitalProductValue,
                                                            type: obj ? obj.value : ""
                                                        });
                                                        setErrors({});
                                                    }}
                                                    value={digitalProductValue.type ? {
                                                        value: digitalProductValue.type,
                                                        label: digitalProductTypeOptionsObj.find(opt => opt.id === digitalProductValue.type)?.name || ""
                                                    } : null}
                                                    errors={errors["type"]}
                                                    placeholder={placeholderText("digital-product.input.type.placeholder.label")}
                                                />
                                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                                    {errors["type"] ? errors["type"] : null}
                                                </span>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    {getFormattedMessage("expiry.date.title")}
                                                    :{" "}
                                                </label>
                                                <ReactDatePicker
                                                    onChangeDate={handleCallback}
                                                    newStartDate={digitalProductValue.expiry_date}
                                                    readOnlyref={false}
                                                    disablePast={false}
                                                    disableFuture={false}
                                                    placeholder={placeholderText("expiry.date.placeholder.title")}
                                                />
                                            </div>
                                            <div className="col-md-12 mb-3">
                                                <label className="form-label">
                                                    {getFormattedMessage("digital-product.input.description.label")}
                                                    :{" "}
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    name="description"
                                                    rows={4}
                                                    placeholder={placeholderText("digital-product.input.description.placeholder.label")}
                                                    onChange={(e) => onChangeInput(e)}
                                                    value={digitalProductValue.description}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4">
                                <div className="card">
                                    <div className="card-body p-0">
                                        <label className="form-label">
                                            {getFormattedMessage("product.input.multiple-image.label")}
                                            :{" "}
                                        </label>
                                        <MultipleImage
                                            product={null}
                                            fetchFiles={onChangeFiles}
                                            transferImage={() => {}}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ModelFooter
                            onEditRecord={id ? true : false}
                            onSubmit={onSubmit}
                            link="/user/digital-products"
                        />
                    </Form>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = (state) => {
     const {
         brands,
         productCategories,
         frontSetting,
         allConfigData,
         digitalProducts,
     } = state;
     return {
         brands,
         productCategories,
         frontSetting,
         allConfigData,
         digitalProduct: digitalProducts,
     };
 };

export default connect(mapStateToProps, {
    addDigitalProduct,
    editDigitalProduct,
    fetchAllBrands,
    fetchAllProductCategories,
})(DigitalProductForm);