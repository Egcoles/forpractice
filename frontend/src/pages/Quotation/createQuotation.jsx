import React, { use, useState } from "react";
import { useMutation, useQueryClient} from "@tanstack/react-query";
import api from "../../api";
import { useUsers, useItems, useSuppliers } from "../../hooks/useUsers";
import {useEndorsers} from "../../hooks/useEndorsers";
import { useApprovers } from "../../hooks/useApprovers";
import {FormControl, Select, Box,Button,TextField,Typography,Autocomplete,Grid,Divider,Paper,Stack,Table,TableBody,TableCell,TableContainer,TableFooter,TableHead,TableRow,Tooltip,} from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Add as AddIcon,Remove as RemoveIcon, Preview as PreviewIcon, Send as SendIcon} from "@mui/icons-material";
import dayjs from 'dayjs'; 

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
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({});
  const {data: users = [], isLoading, isError} = useUsers();
  const selectedUser = form.submittedBy || null;
  const {data: approvers = [], isAppLoading, isAppError} = useApprovers();
  const selectedApprover = form.approver || null;
  const {data: endorsers = [], isEndoLoading, isEndoError} = useEndorsers();
  const selectedEndorser = form.endorser || null;
  const {data: particulars = [], isItemLoading, isItemError} = useItems();


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
      setItems((prev) => {
          const next = [...prev];
          const row = {...next[index], [field]: value};
          if (['qty', 'unitCost', 'markup'].includes(field)) {
              const totals = calculatePerRowCost(row);
              row.totalCost = totals.totalCost;
          }
          next[index]= row;
          return next;
      });
      if (['qty', 'unitCost', 'markup'].includes(field)) {
          setRowErrors((prevErrors) => {
              const nextErrors = [...prevErrors];
              const num = parseFloat(value);
              if (value === '' || value === null || isNaN(num)) {
                  nextErrors[index] = {...nextErrors[index], [field]: ''};
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



const handleChange = (e) => {
    const discount = e.target.value;
    const numericValue = parseFloat(value); 
    if (value === '' || (numericValue > 0 && !isNaN(numericValue))) {
        setDiscount(numericValue);
    }
};


  const openSnackbar = (message, severity = 'warning') => setSnackbar({ open: true, message, severity });

  // const validateRow = (row) => {
  //   const re = {};
  //   const q = parseFloat(row.qty) || 0;
  //   const u = parseFloat(row.unitCost) || 0;
  //   const m = parseFloat(row.markup) || 0;
  //   const errorMessage = 'Please input the required field.';
  //   const errorNumber = 'Please input the number greater than zero.';
  //   if (!row.item || (row.item?.itemId ?? row.item?.ItemId)) re.item = errorMessage;
  //   if (!row.itemDescription) re.itemDescription = errorMessage;
  //   if (!q  || q <= 0) re.qty = errorNumber;
  //   if (!u  || u <= 0) re.unitCost = errorNumber;
  //   if (!m  || m <= 0) re.markup = errorNumber;
  //   return re;
  // };

  // //this function to validate if has duplicate item not being selected again
  // const ValidateRows = () => {
  //   const errs = items.map(validateRow);
  //   let duplicateFound = false;
  //   for (let i = 0; i < items.length; i++) {
  //     const row = items[i];
  //     const itemKey = row.item?.itemId ?? row.item?.ItemId;
  //     if (!itemKey) continue;
   
  //   }
  // }

//  const canAddNewRow = () => {
//     let valid = true;
//     const warningMessage = "This is a required field.";

//     // Validate for required values in the form
//     const hasInput = Boolean(form.qty || form.unitCost);
//     if (!hasInput) {
//         setErrors({ qty: warningMessage, unitCost: warningMessage });
//         valid = false;
//     }

//     // Validate each row
//     const rowsOk = items.every((item) => Object.keys(validateRow(item)).length === 0);
//     valid = valid && rowsOk;
//     if (!valid) {
//         openSnackbar("Please complete the required fields before adding a new row.");
//         return false;
//     }

//     return true;
// };



  const additemRow = () => {
    // if(!canAddNewRow()) return;
    const newRow = initialItem();
    newRow.isPrimary = false;
    setItems((prev) => [...prev, newRow]);
    setRowErrors((prev) => [...prev, {}]);
  };

  const removeItemRow = () => {
    setItems ((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    setRowErrors((prev) => (prev.length > 1 ? prev.slice(0, -1): prev));
  };
 

  return (
    <Box sx={{
       width: '100%',
       }}>
      <Typography variant="h5" component="h5" fontWeight="bold">
        Quotation
      </Typography>
      <Divider sx={{ my: 2, borderColor: 'primary.main' }} />
    <form noValidate>
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
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
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
            onChange={(e) => setForm({ ...form, ProjectName: e.target.value })}
          />
        </Grid>
        <Grid size={4}>
         <Autocomplete
            options={users}
            getOptionLabel={(option) => option?.fullName ||`User ${option?.userId}`} // must change into company options
            value={selectedUser}
            onChange={(event, newValue) => setForm({ ...form, companyName: newValue })} //-> need to declare the state selected company = company
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="Comapany Name"
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
         <Autocomplete
            options={users}
            getOptionLabel={(option) => option?.fullName ||`User ${option?.userId}`} // must change into company options
            value={selectedUser}
            onChange={(event, newValue) => setForm({ ...form, location: newValue })} //-> need to declare the state selected location = location
            renderInput={(params) => (
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
            )}
          />
        </Grid>
            <Grid size={4}>
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
            onChange={(e) => setForm({ ...form, CompanyAddress: e.target.value })}
          />
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
            onChange={(event, newValue) => setSelectedOptions(newValue)}
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
                  multiline
                  fullWidth
                  variant="outlined"
                  error={!!errors.discount}
                  helperText={errors.discount}
                  value={discount}
                  onChange={handleChange}
              />
        </Grid>
   
        <Grid size={4}>
          <Autocomplete
            options={users}
            getOptionLabel={(option) => option?.fullName ||`User ${option?.userId}`}
            value={selectedUser}
            onChange={(event, newValue) => setForm({ ...form, submittedBy: newValue })} //-> need to declare the state selected user = submittedBy
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
            onChange={(event, newValue) => setForm({ ...form, endorser: newValue })} // Updated line
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
            onChange={(event, newValue) => setForm({ ...form, approver: newValue })}
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
        <Button variant="contained" onClick={additemRow} ><AddIcon/></Button>
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
                      onChange={(event, newValue) => handleItemFieldChange(idx, 'item', newValue)}
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
        <Button variant="outlined" startIcon={<PreviewIcon/>}>
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
