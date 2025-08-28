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
    clientName: '',
    PrjectName: '',
    companyName: '',
    location: '',
    CompanyAddress: '',
    Terms: '', 
    submittedBy: '',
    approver: '',
    endorser: '',
    qty: '',
    unitCost: '',
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

  // const [qty, setQty] = useState(0);
  // const [unitCost, setUnitCost] = useState(0);
  // const [markup, setMarkup] = useState(0);
  // const [discount, setDiscount] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(null);
  const calculatePerRowCost = () => {
      const qty = parseFloat(row.qty) || 0;
      const unitCost = parseFloat(row.unitCost) || 0;
      const markup = parseFloat(row.markup) || 0;

      let totalCost = qty > 0 && unitCost > 0 ? qty * unitCost : 0; // Calculate total cost
      let newTotalCost = totalCost;

      if (markup > 0) {
          const increasePrice = totalCost * (markup / 100); // Calculate increase based on markup percentage
          newTotalCost = totalCost + increasePrice; // New total cost with markup
      }

      return {
          totalCost: totalCost.toFixed(2), // Return fixed total cost as a string
          newTotalCost // Return new total cost, calculated with markup
      };
  };
  const calculateTotalCost = () => {
        const { totalCost, newTotalCost } = calculatePerRowCost(); // Destructure totalCost and newTotalCost
        let overallTotal = newTotalCost;
        let grandTotal = newTotalCost;

        if (discount > 0) {
            overallTotal -= (overallTotal * (discount / 100)); // Apply discount to overallTotal.
            grandTotal -= (grandTotal * (discount / 100)); // Apply discount to grandTotal.
        }

        if (selectedOptions && selectedOptions.value === 1.12) {
            grandTotal *= 1.12; // Multiply by 1.12 if VAT is selected
        }

        return { totalCost, overallTotal, grandTotal };
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
    setRowErrors((prev) => {
      const next = [...prev];
      if (['qty', 'unitCost', 'markup'].includes(field)) {
        const num = parseFloat(value);
        if (value === '' || value === null || value === undefined || isNaN(num)) {
          next[index] = {...next[index], [field]: ''};
        } else if (num <= 0) {
          next[index] = {...next[index], [field]: " Please input number greater tha zero"};
        } else {
          next[index] = {...next[index], [field]: ''};
        }
      } else {
        next[index] = {...next[index], [field]: ''};
      }
      return next;
    });
    setCanSubmit(false);
  };

  const openSnackbar = (message, severity = 'warning') => setSnackbar({ open: true, message, severity });

  const validateRow = (row) => {
    const re = {};
    const q = parseFloat(row.qty) || 0;
    const u = parseFloat(row.unitCost) || 0;
    const m = parseFloat(row.markup) || 0;
    const errorMessage = 'Please input the required field.';
    const errorNumber = 'Please input the number greater than zero.';
    if (!row.item || (row.item?.itemId ?? row.item?.ItemId)) re.item = errorMessage;
    if (!row.itemDescription) re.itemDescription = errorMessage;
    if (!q  || q <= 0) re.qty = errorNumber;
    if (!u  || u <= 0) re.unitCost = errorNumber;
    if (!m  || m <= 0) re.markup = errorNumber;
    return re;
  };

  //this function to validate if has duplicate item not being selected again
  const ValidateRows = () => {
    const errs = items.map(validateRow);
    let duplicateFound = false;
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const itemKey = row.item?.itemId ?? row.item?.ItemId;
      if (!itemKey) continue;
   
    }
  }

  const canAddNewRow = () => {
    let valid = true;
    let warningMessage = "This is a rquired field.";
    const hasInput = Boolean(form.qty || form.unitCost)
    if (!hasInput) {
      setErrors((prev) => ({
        ...prev,
        qty: warningMessage,
        unitCost: warningMessage,
      }))
      valid = false;
    }

    const rowsOk = validateRow();
    valid = valid && rowsOk;
    if (!valid) {
      if(!hasDuplicate) openSnackbar("Please complete the require field before adding new row.");
      return false;
    }
    return true;
  };


  const additemRow = () => {
    if(!canAddNewRow()) return;
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
            className="clientName"
            name="clientName"
            label="Client Name"
            multiline
            fullWidth 
            variant="outlined"
            error={!!errors.clientName}
            helperText={errors.clientName}
            value={form.clientName}
        
          />
        </Grid>
         <Grid size={6}>
            <TextField
            className="ProjectName"
            name="ProjectName"
            label="Project Name"
            multiline
            fullWidth 
            variant="outlined"
            error={!!errors.ProjectName}
            helperText={errors.ProjectName}
            value={form.ProjectName}
        
          />
        </Grid>
        <Grid size={4}>
         <Autocomplete
            options={users}
            getOptionLabel={(option) => option?.fullName ||`User ${option?.userId}`}
            value={selectedUser}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="Comapany Name"
                className="companyName"
                name="companyName"
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
            getOptionLabel={(option) => option?.fullName ||`User ${option?.userId}`}
            value={selectedUser}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="Location"
                className="location"
                name="location"
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
            label="Company Address"
            multiline
            fullWidth 
            variant="outlined"
            error={!!errors.CompanyAddress}
            helperText={errors.CompanyAddress}
            value={form.project}
        
          />
        </Grid>
        <Grid size={12}>
            <TextField
            className="Terms"
            name="Terms"
            label="Terms & Condition"
            value ="
            1.Price is in Philippine Peso and VAT INCLUSIVE 
            2.Delivery: 
            3.Payment: 
            4.Warranty: 
            5.Price Validity:"
            textalign = 'right'
            multiline
            fullWidth 
            minRows={4} 
            maxRows={10}
            variant="outlined"
            error={!!errors.Terms}
            helperText={errors.Terms}
        
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
            label="Discount"
            multiline
            fullWidth 
            variant="outlined"
            error={!!errors.discount}
            helperText={errors.discount}
            value={form.discount}
            onChange={(e) => setDiscount(e.target.value)}
        
          />
        </Grid>
   
        <Grid size={4}>
           {roleId !== '32' && (
          <Autocomplete
            options={endorsers}
            getOptionLabel={(option) => option?.fullName || `Endorser ${option?.userId}`}
            value={selectedEndorser}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="Submitted By"
                className="submittedBy"
                name="submittedBy"
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
          )}

        </Grid>
        <Grid size={4}>
          {roleId !== '33' && (
           <Autocomplete
            options={approvers}
            getOptionLabel={(option) => option?.fullName || `Approver ${option?.userId}`}
            value={selectedApprover}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="Select Approver"
                className="approver"
                name="approver"
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
             <Grid size={4}>
          {roleId !== '33' && (
           <Autocomplete
            options={approvers}
            getOptionLabel={(option) => option?.fullName || `Approver ${option?.userId}`}
            value={selectedApprover}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="Select Approver"
                className="approver"
                name="approver"
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
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined" 
                          label="Select an Item"
                          className="item"
                          name={`item_${idx}`}
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
                      onChange={(e) => setQty(e.target.value)}
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
                        onChange={(e) => setUnitCost(e.target.value)}
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
                        onChange={(e) => setMarkup(e.target.value)}
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
                      value={row.itemDescription}
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
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
                <TableCell>
                <Typography fontWeight="bold" align="right">	Over ALl Total: </Typography>
              </TableCell>
              <TableCell >
                <Typography fontWeight="bold" align="right">₱ {overallTotal.toFixed(2)} </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
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
