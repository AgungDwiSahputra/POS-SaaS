import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { InputGroup } from "react-bootstrap-v5";
import { addProvider, editProvider } from "../../store/action/providerAction";
import { getFormattedMessage, placeholderText, getCurrentUser, getFormattedText } from "../../shared/sharedMethod";
import ModelFooter from "../../shared/components/modelFooter";

const ProviderForm = (props) => {
      const {
          addProvider,
          editProvider,
          id,
          frontSetting,
          provider,
          editProviderData,
      } = props;

     const navigate = useNavigate();

     const [providerValue, setProviderValue] = useState({
         nama_provider: "",
         saldo: "",
         deskripsi: "",
         status: "active",
     });

     const [errors, setErrors] = useState({});

     // Populate form data when editing
     useEffect(() => {
         console.log('ProviderForm: useEffect triggered, provider:', provider, 'id:', id);
         if (provider && provider.length > 0 && id) {
             // Find the specific provider by ID instead of taking the first one
             const prov = provider.find(p => {
                 const providerId = p.id || (p.attributes && p.attributes.id);
                 console.log('Checking provider ID:', providerId, 'against id:', id, 'type:', typeof providerId, typeof id);
                 return String(providerId) === String(id);
             });

             if (prov) {
                 console.log('ProviderForm: Populating form with data for ID', id, ':', prov);

                 // Handle JSON:API format (check if attributes exist)
                 const attributes = prov.attributes || prov;

                 setProviderValue({
                     nama_provider: attributes.nama_provider || "",
                     saldo: attributes.saldo || "",
                     deskripsi: attributes.deskripsi || "",
                     status: attributes.status || "active",
                 });

                 console.log('ProviderForm: Form values set for ID', id, ':', {
                     nama_provider: attributes.nama_provider || "",
                     saldo: attributes.saldo || "",
                 });
             } else {
                 console.warn('ProviderForm: Provider with ID', id, 'not found in Redux state');
             }
         } else {
             console.log('ProviderForm: Conditions not met - provider:', provider, 'id:', id);
         }
     }, [provider, id]);

     const onChangeInput = (e) => {
         setProviderValue({
             ...providerValue,
             [e.target.name]: e.target.value
         });
         setErrors({});
     };

     const prepareFormData = () => {
         const formData = new FormData();

         // Remove manual tenant_id sending - let backend handle it via Multitenantable trait
         formData.append("_method", "PATCH");

         formData.append("nama_provider", providerValue.nama_provider);
         formData.append("saldo", parseFloat(providerValue.saldo) || 0);
         formData.append("deskripsi", providerValue.deskripsi || "");
         formData.append("status", providerValue.status);

         return formData;
     };

     const handleValidation = () => {
         let errors = {};
         let isValid = false;

         console.log('Validating form data:', providerValue);

         if (!providerValue["nama_provider"] || providerValue["nama_provider"].trim() === "") {
             errors["nama_provider"] = getFormattedText("globally.input.nama_provider.validate.label");
         } else if (!providerValue["saldo"] || isNaN(parseFloat(providerValue["saldo"]))) {
             errors["saldo"] = getFormattedText("provider.input.saldo.validate.label");
         } else if (!providerValue["status"] || !["active", "inactive"].includes(providerValue["status"])) {
             errors["status"] = getFormattedText("provider.input.status.validate.label");
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
              console.log('Provider Form Data being sent:', {
                  nama_provider: providerValue.nama_provider,
                  saldo: providerValue.saldo,
                  deskripsi: providerValue.deskripsi,
                  status: providerValue.status,
              });

              // Debug FormData contents
              console.log('FormData entries:');
              for (let [key, value] of formData.entries()) {
                  console.log(key, value);
              }

              if (id) {
                  // Edit mode
                  editProviderData(formData);
              } else {
                  // Create mode
                  addProvider(formData, navigate);
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
                                                     {getFormattedMessage("provider.input.nama_provider.label")}
                                                     :{" "}
                                                 </label>
                                                 <span className="required" />
                                                 <input
                                                     type="text"
                                                     name="nama_provider"
                                                     value={providerValue.nama_provider}
                                                     placeholder={placeholderText("provider.input.nama_provider.placeholder.label")}
                                                     className="form-control"
                                                     autoFocus={true}
                                                     onChange={(e) => onChangeInput(e)}
                                                 />
                                                 <span className="text-danger d-block fw-400 fs-small mt-2">
                                                     {errors["nama_provider"] ? errors["nama_provider"] : null}
                                                 </span>
                                             </div>
                                             <div className="col-md-6 mb-3">
                                                 <label className="form-label">
                                                     {getFormattedMessage("provider.input.saldo.label")}
                                                     :{" "}
                                                 </label>
                                                 <span className="required" />
                                                 <InputGroup>
                                                     <input
                                                         type="number"
                                                         name="saldo"
                                                         value={providerValue.saldo}
                                                         placeholder={placeholderText("provider.input.saldo.placeholder.label")}
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
                                                     {errors["saldo"] ? errors["saldo"] : null}
                                                 </span>
                                             </div>
                                             <div className="col-md-6 mb-3">
                                                 <label className="form-label">
                                                     {getFormattedMessage("provider.input.status.label")}
                                                     :{" "}
                                                 </label>
                                                 <span className="required" />
                                                 <Form.Select
                                                     name="status"
                                                     value={providerValue.status}
                                                     onChange={(e) => onChangeInput(e)}
                                                     className="form-control"
                                                 >
                                                     <option value="active">{getFormattedText("status.active")}</option>
                                                     <option value="inactive">{getFormattedText("status.inactive")}</option>
                                                 </Form.Select>
                                                 <span className="text-danger d-block fw-400 fs-small mt-2">
                                                     {errors["status"] ? errors["status"] : null}
                                                 </span>
                                             </div>
                                             <div className="col-md-12 mb-3">
                                                 <label className="form-label">
                                                     {getFormattedMessage("provider.input.deskripsi.label")}
                                                     :{" "}
                                                 </label>
                                                 <textarea
                                                     className="form-control"
                                                     name="deskripsi"
                                                     rows={4}
                                                     placeholder={placeholderText("provider.input.deskripsi.placeholder.label")}
                                                     onChange={(e) => onChangeInput(e)}
                                                     value={providerValue.deskripsi}
                                                 />
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <ModelFooter
                             onEditRecord={id ? true : false}
                             onSubmit={onSubmit}
                             link="/user/providers"
                         />
                     </Form>
                 </div>
             </div>
         </>
     );
 };

 const mapStateToProps = (state) => {
      const {
          frontSetting,
          allConfigData,
          providers,
      } = state;
      return {
          frontSetting,
          allConfigData,
          provider: providers,
      };
  };

 export default connect(mapStateToProps, {
     addProvider,
     editProvider,
 })(ProviderForm);