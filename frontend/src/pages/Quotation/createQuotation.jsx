import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient} from "@tanstack/react-query";
import api from "../../api";
import { useUsers, useItems } from "../../hooks/useUsers";
import { useCompanyList, useLocationList} from "../../hooks/useQuotations";
import {useEndorsers} from "../../hooks/useEndorsers";
import { useApprovers } from "../../hooks/useApprovers";
import {Box,Button,TextField,Typography,Autocomplete,Grid,Divider,Paper,Stack,Table,TableBody,TableCell,TableContainer,TableFooter,TableHead,TableRow,Tooltip,} from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Add as AddIcon,Remove as RemoveIcon, Preview as PreviewIcon, Send as SendIcon} from "@mui/icons-material";

const CreateQuotation = ({roleId}) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState ({
    clientName: "",
    ProjectName: "",
    companyName: "",
    location: "",
    CompanyAddress: "",
    Terms: `
      1. Price is in Philippine Peso and VAT INCLUSIVE
      2. Delivery:
      3. Payment:
      4. Warranty:
      5. Price Validity:`,
    submittedBy: "",
    approver: "",
    endorser: "",
    qty: "",
    unitCost: "",
    item: "",
    itemDescription: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({});
  const {data: users = [], isLoading, isError} = useUsers();
  const selectedUser = form.submittedBy || null;
  const {data: approvers = [], isAppLoading, isAppError} = useApprovers();
  const selectedApprover = form.approver || (approvers[0]) || null;
  const {data: endorsers = [], isEndoLoading, isEndoError} = useEndorsers();
  const selectedEndorser = form.endorser || (endorsers.length > 1 ? endorsers[1] : null) || null;
  const {data: particulars = [], isItemLoading, isItemError} = useItems();
  const {data: companies = [], isCompanyLoading, isCompanyError} = useCompanyList();
  const selectedCompany = form.companyName || null;
  const {data: locations = [], isLocationLoading, isLocationError} = useLocationList(selectedCompany?.companyID);
  const selectedLocation = form.location || null;


  const createQuotation = useMutation ({
    mutationFn:(newQuotation) => api.post("Quotation/create", newQuotation, { withCredentials: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(["quotations"]);
      setSnackbar({ open: true, message: "Quotation created successfully", severity: "success" });
      setForm({
        clientName: "",
        ProjectName: "",
        companyName: "",
        location: "",
        CompanyAddress: "",
        Terms: `
          1. Price is in Philippine Peso and VAT INCLUSIVE
          2. Delivery:
          3. Payment:
          4. Warranty:
          5. Price Validity:`,
        submittedBy: "",
        approver: "",
        endorser: "",
        qty: "",
        unitCost: "",
        item: "",
        itemDescription: "",
      })
         setItems([{ ...initialItem(), isPrimary: true }]);
      setRowErrors([{}]);
      setErrors({});
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  })
  // Dynamic line items
  const initialItem = () => ({
    id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    item: null,
    itemDescription: '',
    unit: '',
    qty: '',
    unitCost: '',
    markup: '',
    totalCost: '',
    isPrimary: false,
  });

  const [items, setItems] = useState([{ ...initialItem(), isPrimary: true }]);
  const [rowErrors, setRowErrors] = useState([{}]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'warning' });
  const [canSubmit, setCanSubmit] = useState(false); 

  const options = [
    { label: 'With VAT', name: 'With VAT', value: 1.12},
    { label: 'Without VAT', name: 'Without VAT', value: 1  },
  ]

  const [qty, setQty] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [markup, setMarkup] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(null);

  const calculatePerRowCost = (row) => {
      const qty = parseFloat(row.qty) || 0;
      const unitCost = parseFloat(row.unitCost) || 0;
      const markup = parseFloat(row.markup) || 0;

      let totalCost = qty > 0 && unitCost > 0 ? qty * unitCost : 0; 
      let newTotalCost = totalCost;

      if (markup > 0) {
          const increasePrice = totalCost * (markup / 100); 
          newTotalCost = totalCost + increasePrice; 
      }

      row.totalCost = newTotalCost.toFixed(2);

      return { totalCost: totalCost.toFixed(2), newTotalCost };
  };

  const calculateTotalCost = () => {
      let overallTotal = 0;
      let grandTotal = 0;
     

      items.forEach(item => {
          const { totalCost, newTotalCost } = calculatePerRowCost(item);
          overallTotal += parseFloat(newTotalCost);
          grandTotal += parseFloat(newTotalCost);
      });

      if (discount > 0) {
          overallTotal -= discount;
          grandTotal -= discount;
      }

      if (selectedOptions && selectedOptions.value === 1.12) {
          grandTotal *= 1.12; 
      }

      return { totalCost: overallTotal.toFixed(2), overallTotal, grandTotal };
  };


  const {overallTotal, grandTotal} = calculateTotalCost();

  const handleItemFieldChange = (index, field, value) => {
      // Update items state
      setItems((prev) => {
          const next = [...prev];
          const row = {...next[index], [field]: value};
          
          // Calculate total if applicable
          if (['qty', 'unitCost', 'markup'].includes(field)) {
              const totals = calculatePerRowCost(row);
              row.totalCost = totals.totalCost;
          }

          next[index] = row;
          return next;
      });

      // Clear error for itemDescription field immediately on change
      if (field === 'itemDescription') {
          setRowErrors((prevErrors) => {
              const nextErrors = [...prevErrors];
              nextErrors[index] = {...nextErrors[index], itemDescription: ''}; // Clear the description error
              return nextErrors;
          });
      }
      else if (field === 'item') {
          // Clear error for item field as before
          setRowErrors((prevErrors) => {
              const nextErrors = [...prevErrors];
              nextErrors[index] = {...nextErrors[index], item: ''}; // Clear the item error
              return nextErrors;
          });
      } 
      else if (['qty', 'unitCost', 'markup'].includes(field)) {
          setRowErrors((prevErrors) => {
              const nextErrors = [...prevErrors];
              const num = parseFloat(value);
              if (value === '' || isNaN(num)) {
                  nextErrors[index] = {...nextErrors[index], [field]: 'This field is required.'};
              } else if (num <= 0) {
                  nextErrors[index] = {...nextErrors[index], [field]: "Please input number greater than zero"};
              } else {
                  nextErrors[index] = {...nextErrors[index], [field]: ''};
              }
              return nextErrors;
          });
      }

      setCanSubmit(false);
  };

  const handleItemAutocompleteChange = (index, field, newValue) => {
      setItems((prev) => {
          const next = [...prev];
          const updated = { ...next[index], [field]: newValue || '' }; 
          if (field === 'item') {
              updated.unit = newValue ? (newValue.unit ?? newValue.Unit ?? '') : ''; 
          }
          next[index] = updated;
          return next;
      });
      setRowErrors((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], [field]: '' }; 
          return next;
      });
      setCanSubmit(false);
  };



const validateRow = (row) => {
    const errors = {};
    const message = "Please fill in the required fields.";
    if (!row.item) errors.item = message;
    if (!row.itemDescription) errors.itemDescription = message;
    if (!row.qty) errors.qty = message;
    if (!row.unitCost) errors.unitCost = message;
    return errors;
};

const addItemRow = () => {
    const errors = items.map(row => validateRow(row));
    setRowErrors(errors);

    if (errors.some(error => Object.keys(error).length > 0)) {
        openSnackbar('Please fill all required fields before adding a new row.');
        return; 
    }

    const newRow = initialItem();
    newRow.isPrimary = false;
    setItems(prev => [...prev, newRow]);
    setRowErrors((prev) => [...prev, {}]);
};

const openSnackbar = (message, severity = 'warning') => {
    setSnackbar({ open: true, message, severity });
};

const removeItemRow = () => {
  setItems ((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  setRowErrors((prev) => (prev.length > 1 ? prev.slice(0, -1): prev));
};

 const handlePreview = () => {
    const itemErrors = items.map(row => validateRow(row));
    setRowErrors(itemErrors);
    const errors = {};
    const errorMessage = "Please input the required field.";

    // Validate each required field
    if (!form.clientName) errors.clientName = errorMessage;
    if (!form.ProjectName) errors.ProjectName = errorMessage;
    if (!form.companyName) errors.companyName = errorMessage;
    if (!form.location) errors.location = errorMessage;
    if (!form.submittedBy) errors.submittedBy = errorMessage;
    if (selectedOptions === null) errors.vat = errorMessage;

    if (Object.keys(errors).length > 0) {
        setErrors(errors); // Update your errors state 
        openSnackbar("Please complete the required fields before previewing.");
        return;
    }
    //clear errors if field has value || not empty
     setErrors({});
     alert('All data is valid. Check console for preview.');
    const itemsPayload = items.map(item => ({
        ItemID: item.item?.itemId || item.item?.ItemId || null,
        ItemDescription: item.itemDescription || '',
        Quantity: parseInt(item.qty, 10) || 0,
        UnitCost: parseFloat(item.unitCost) || 0.0,
        Markup: parseInt(item.markup, 10) || 0,
        TotalCost: parseFloat(item.totalCost) || 0.0
    }));

    const payload = {
        ClientName: form.clientName,
        ProjectName: form.ProjectName,
        CompanyID: form.companyName.companyID,
        LocationID: form.location.locationID,
        CompanyAddress: form.CompanyAddress,
        Terms: form.Terms,
        Endorser: form.endorser.userId || selectedEndorser.userId || 0,
        Approver: form.approver.userId || selectedApprover.userId || 0,
        SubmittedBy: form.submittedBy.userId || 0,
        Discount: discount || 0,
        VAT: selectedOptions ? selectedOptions.label : null,
        OverAllTotal: overallTotal || 0,
        GrandTotalVat: grandTotal || 0,
        Items: itemsPayload
    };

    console.log('Preview Payload:', payload);
     setCanSubmit(true);

};

const handleSubmit = async (e) => {
    e.preventDefault();
    const itemsPayload = items.map(item => ({
        ItemID: item.item?.itemId || item.item?.ItemId || null,
        ItemDescription: item.itemDescription || '',
        Quantity: parseInt(item.qty, 10) || 0,
        UnitCost: parseFloat(item.unitCost) || 0.0,
        Markup: parseInt(item.markup, 10) || 0,
        TotalCost: parseFloat(item.totalCost) || 0.0
    }));

    const payload = {
        ClientName: form.clientName,
        ProjectName: form.ProjectName,
        CompanyID: form.companyName.companyID,
        LocationID: form.location.locationID,
        CompanyAddress: form.CompanyAddress,
        Terms: form.Terms,
        Endorser: form.endorser.userId || selectedEndorser.userId || 0,
        Approver: form.approver.userId || selectedApprover.userId || 0,
        SubmittedBy: form.submittedBy.userId || 0,
        Discount: discount || 0,
        VAT: selectedOptions ? selectedOptions.label : null,
        OverAllTotal: overallTotal || 0,
        GrandTotalVat: grandTotal || 0,
        Items: itemsPayload
    };

    console.log('Final Payload:', payload);

    createQuotation.mutate(payload);
};



  return (
    <Box sx={{
       width: '100%',
       }}>
      <Typography variant="h5" component="h5" fontWeight="bold">
        Quotation
      </Typography>
      <Divider sx={{ my: 2, borderColor: 'primary.main' }} />
    <form onSubmit={handleSubmit}  noValidate>
      <Grid container alignItems="center" justifyContent="center" spacing={2}>
        <Grid size={6}>
            <TextField
            id = "clientName"
            className="clientName"
            name="clientName"
            label="Client Name"
            multiline
            fullWidth 
            variant="outlined"
            error={!!errors.clientName}
            helperText={errors.clientName}
            value={form.clientName}
            onChange={(e) => {
                setForm({ ...form, clientName: e.target.value });
                if (e.target.value) {
                    setErrors(prev => ({ ...prev, clientName: '' }));
                }
            }}
          />
        </Grid>
         <Grid size={6}>
            <TextField
            id="ProjectName"
            className="ProjectName"
            name="ProjectName"
            label="Project Name"
            multiline
            fullWidth 
            variant="outlined"
            error={!!errors.ProjectName}
            helperText={errors.ProjectName}
            value={form.ProjectName}
            onChange={(e) => {
                setForm({ ...form, ProjectName: e.target.value });
                if (e.target.value) {
                    setErrors(prev => ({ ...prev, ProjectName: '' }));
                }
            }}
          />
        </Grid>
        <Grid size={4}>
        <Autocomplete
          options={companies}
          getOptionLabel={(option) => option?.companyName || `CompanyName ${option?.companyID}`} 
          value={selectedCompany}
          onChange={(event, newValue) => {
              console.log(newValue?.companyID); 
              setForm({ ...form, companyName: newValue });
              if (newValue) {
                  setErrors(prev => ({ ...prev, companyName: '' }));
              }
          }} 
          renderInput={(params) => (
              <TextField
                  {...params}
                  variant="outlined" 
                  label="Company Name"
                  className="companyName"
                  name="companyName"
                  id="companyName"
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                  sx={{
                      '& .MuiInput-root': {
                          '& fieldset': {
                              border: 'none', 
                          },
                          '&:hover fieldset': {
                              border: 'none', 
                          },
                          '&.Mui-focused fieldset': {
                              border: 'none',
                          },
                      },
                  }}
              />
          )}
        /> 

        </Grid>
         <Grid size={4}>
           {selectedCompany ? (
            <Autocomplete
                options={locations }
                getOptionLabel={(option) => option?.locationName || `Location ${option?.locationID }`}
                value={selectedLocation}
                onChange={(event, newValue) => {
                  console.log(newValue?.locationID); 
                    setForm(prev => ({ ...prev, location: newValue }));
                    if (newValue) {
                        const addressData = locations.find(location => location.locationID === newValue.locationID);
                        if (addressData) {
                            setForm(prev => ({ ...prev, CompanyAddress: addressData.address }));
                        } else {
                            setForm(prev => ({ ...prev, CompanyAddress: '' }));
                        }
                        console.log(form); 
                        setErrors(prev => ({ ...prev, location: '' }));
                    }
                }}
                disabled={!selectedCompany} 
                renderInput={(params) => (
                  <Tooltip title={errors.location || ""} arrow open={!!errors.location}>
                    <TextField
                        {...params}
                        variant="outlined"
                        label="Location"
                        className="location"
                        name="location"
                        id="location"
                        error={!!errors.location}
                        helperText={errors.location}
                        sx={{
                            '& .MuiInput-root': {
                                '& fieldset': {
                                    border: 'none',
                                },
                                '&:hover fieldset': {
                                    border: 'none',
                                },
                                '&.Mui-focused fieldset': {
                                    border: 'none',
                                },
                            },
                        }}
                    />
                  </Tooltip>
                )}
            />
        ) : (
           <Tooltip title="Please select a company to enable this field" arrow>
                <span style={{ display: 'inline-block', width: '100%' }}>
                    <TextField
                        variant="outlined"
                        label="Location"
                        disabled
                        fullWidth
                    />
                </span>
            </Tooltip>
        )}
        </Grid>
            <Grid size={4}>
            <Tooltip title="This field is read-only" arrow>
              <TextField
              className="CompanyAddress"
              name="CompanyAddress"
              id="CompanyAddress"
              label="Company Address"
              multiline
              fullWidth 
              variant="outlined"
              error={!!errors.CompanyAddress}
              helperText={errors.CompanyAddress}
              value={form.CompanyAddress} 
              slotProps={{input: { readOnly: true },}}
              />
            </Tooltip>
           
        </Grid>
        <Grid size={12}>
            <TextField
            className="Terms"
            name="Terms"
            id="Terms"
            label="Terms & Condition"
            value={form.Terms} 
            textalign = 'right'
            multiline
            fullWidth 
            minRows={4} 
            maxRows={10}
            variant="outlined"
            error={!!errors.Terms}
            helperText={errors.Terms}
            onChange={(e) => setForm({ ...form, Terms: e.target.value })} 
            slotProps={{
                 style: { textalign: 'right' }, 
            }}
          />
        </Grid>
        <Grid size={6}>
         <Autocomplete
            options={options}
            getOptionLabel={(options) => options.label}
            value={selectedOptions}
            onChange={(event, newValue) => {
              setSelectedOptions(newValue);
              if (newValue) {
                  setErrors(prev => ({ ...prev, vat: '' }));
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="VAT"
                className="vat"
                name="vat"
                id="vat"
                error={!!errors.vat}
                helperText={errors.vat}
                sx={{
                  '& .MuiInput-root': {
                    '& fieldset': {
                      border: 'none', 
                    },
                    '&:hover fieldset': {
                      border: 'none', 
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            )}
          />
        </Grid>
          <Grid size={6}>
            <TextField
            className="discount"
            name="discount"
            id="discount"
            label="Discount"
            type="number"
            fullWidth
            variant="outlined"
            error={!!errors.discount}
            helperText={errors.discount}
            value={discount}
            onChange={(e) => {
                const value = e.target.value;
                setDiscount(value);
                if (value === "0" || value === "") {
                    setErrors({ discount: "Please input number greater than zero" });
                } else {
                    setErrors({ discount: null });
                }
            }}
          />
        </Grid>
        <Grid size={4}>
          <Autocomplete 
            options={users}
            getOptionLabel={(option) => option?.fullName ||`User ${option?.userId}`}
            value={selectedUser}
            onChange={(event, newValue) => {
                setForm({ ...form, submittedBy: newValue });
                if (newValue) {
                    setErrors(prev => ({ ...prev, submittedBy: '' }));
                }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="Submitted By"
                className="submittedBy"
                name="submittedBy"
                id="submittedBy"
                error={!!errors.submittedBy}
                helperText={errors.submittedBy}
                sx={{
                  '& .MuiInput-root': {
                    '& fieldset': {
                      border: 'none', 
                    },
                    '&:hover fieldset': {
                      border: 'none', 
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid size={4}>
          {roleId !== '33' && (
            <Autocomplete
            options={endorsers}
            getOptionLabel={(option) => option?.fullName || `Endorser ${option?.userId}`}
            value={selectedEndorser}
            onChange={(event, newValue) => {
                setForm({ ...form, endorser: newValue });
                if (newValue) {
                    setErrors(prev => ({ ...prev, endorser: '' }));
                }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Endorser"
                className="endorser"
                name="endorser"
                id="endorser"
                error={!!errors.endorser}
                helperText={errors.endorser}
                sx={{
                  '& .MuiInput-root': {
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            )}
          />  

          )}
        </Grid>
        <Grid size={4}>
          {roleId !== '33' && (
           <Autocomplete
            options={approvers}
            getOptionLabel={(option) => option?.fullName || `Approver ${option?.userId}`}
            value={selectedApprover}
              onChange={(event, newValue) => {
                setForm({ ...form, approver: newValue });
                if (newValue) {
                    setErrors(prev => ({ ...prev, approver: '' }));
                }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="Select Approver"
                className="approver"
                name="approver"
                id="approver"
                error={!!errors.approver}
                helperText={errors.approver}
                sx={{
                  '& .MuiInput-root': {
                    '& fieldset': {
                      border: 'none', 
                    },
                    '&:hover fieldset': {
                      border: 'none', 
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            )}
          />
          )}
        </Grid>
        
      </Grid>
      <Stack direction="row" spacing={2} mt={2} mb={2}> 
        <Button variant="contained" onClick={addItemRow} ><AddIcon/></Button>
        <Button variant="outlined" color="error" onClick={removeItemRow} disabled={items.length === 1}><RemoveIcon/></Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table
          sx={{
            minWidth: 650,
            borderCollapse: 'separate',
            borderSpacing: '12px 0',
          }}
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell align="center">Particular </TableCell>
              <TableCell align="center">Unit</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="center">Unit Cost</TableCell>
              <TableCell align="center">Markup(%)</TableCell>
              <TableCell align="center">Total Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row, idx) => (
              <React.Fragment key={row.id || idx}>
                <TableRow>
                  <TableCell sx={{ minWidth: 320, width: '35%' }}>
                    <Autocomplete
                      fullWidth
                      options={particulars}
                      getOptionLabel={(option) => option?.itemName|| `Item ${option?.itemId}`}
                      disablePortal={false}
                      slotProps={{listbox: { maxheight: 240, overflow: 'auto'},}}
                      value={row.item}
                      isOptionEqualToValue={(o, v) => (o?.itemId ?? o?.ItemId) === (v?.itemId ?? v?.ItemId)}
                      onChange={(e, newValue) => handleItemAutocompleteChange(idx, 'item', newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined" 
                          label="Select an Item"
                          className="item"
                          name={`item_${idx}`}
                          id={`item_${idx}`}
                          error={!!rowErrors[idx]?.item}
                          helperText={rowErrors[idx]?.item || ''}
                          sx={{
                            '& .MuiInput-root': {
                              '& fieldset': {
                                border: 'none', 
                              },
                              '&:hover fieldset': {
                                border: 'none', 
                              },
                              '&.Mui-focused fieldset': {
                                border: 'none',
                              },
                            },
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="This field is read-only" arrow>
                      <TextField 
                        slotProps={{input: { readOnly: true },}}
                        variant="outlined"
                        className="unit" 
                        name={`unit_${idx}`}
                        id={`unit_${idx}`}
                        value={row.unit}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <TextField 
                      label="Input Qty" 
                      variant="outlined" 
                      type="number" 
                      className="qty" 
                      name={`qty_${idx}`}
                      id={`qty_${idx}`}
                      onChange={(e) => handleItemFieldChange(idx, 'qty', e.target.value)}
                      value={row.qty}
                      error={!!rowErrors[idx]?.qty}
                      helperText={rowErrors[idx]?.qty || ''}
                    />
                  </TableCell>
                  <TableCell>
                      <TextField  
                        label="Input Unit Cost" 
                        variant="outlined" 
                        type="number" 
                        className="unitCost" 
                        name={`unitCost_${idx}`}
                        id={`unitCost_${idx}`}
                        onChange={(e) => handleItemFieldChange(idx, 'unitCost', e.target.value)}
                        value={row.unitCost}
                        error={!!rowErrors[idx]?.unitCost}
                        helperText={rowErrors[idx]?.unitCost || ''}
                      />
                  </TableCell>
                  <TableCell>
                      <TextField  
                        label="Input MarkUp" 
                        variant="outlined" 
                        type="number"  
                        className="markup" 
                        name={`inputMarkup_${idx}`}
                        id={`inputMarkup_${idx}`}
                        onChange={(e) => handleItemFieldChange(idx, 'markup', e.target.value)}
                        value={row.markup}
                        error={!!rowErrors[idx]?.markup}
                        helperText={rowErrors[idx]?.markup || ''}
                      />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="This field is read-only" arrow>
                        <TextField  
                        variant="outlined" 
                        type="number"  
                        className="totalCost" 
                        name={`totalCost_${idx}`}
                        id={`totalCost_${idx}`}
                        slotProps={{input: { readOnly: true },}}
                        value={row.totalCost}
                        error={!!rowErrors[idx]?.totalCost}
                        helperText={rowErrors[idx]?.totalCost || ''}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <TextField
                      label="Input Item Description"
                      multiline
                      fullWidth 
                      variant="outlined"
                      className="itemDescription"
                      name={`itemDescription_${idx}`}
                      ide={`itemDescription_${idx}`}
                      value={row.itemDescription}
                      onChange={(e) => handleItemFieldChange(idx, 'itemDescription', e.target.value)}
                      error={!!rowErrors[idx]?.itemDescription}
                      helperText={rowErrors[idx]?.itemDescription || ''}
                    />
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}></TableCell>
                <TableCell>
                <Typography fontWeight="bold" align="right">	Overall Total: </Typography>
              </TableCell>
              <TableCell >
                <Typography fontWeight="bold" align="right">₱ {overallTotal.toFixed(2)} </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4}></TableCell>
                <TableCell>
                <Typography fontWeight="bold" align="right">	Grand Total (VAT Inclusive): </Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight="bold" align="right"> ₱ {grandTotal.toFixed(2)}</Typography>
                </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2} mt={2} mb={2}
       sx={{ display: 'flex', justifyContent: 'flex-end' }}
       > 
        <Button variant="outlined" startIcon={<PreviewIcon/>} onClick={handlePreview}>
           Preview
        </Button>
        <Button variant="contained" type="submit" endIcon={<SendIcon />} disabled={!canSubmit}>
          Submit
        </Button>
      </Stack>
    </form>

    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>

    </Box>
    
  );
};
export default CreateQuotation;
