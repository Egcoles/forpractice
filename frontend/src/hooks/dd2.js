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
    VAT: '',
    discount: '',
    submittedBy: '',
    approver: '',
    endorser: '',
    overAllTotal: '',
    GrandTotal: '',
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

const filteredLocations = locations.filter(location => location.companyID === selectedCompany?.companyID);
  // Dynamic line items
  const initialItem = () => ({
    id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    item: null,
    itemDescription: '',
    unit: '',
    qty: '',
    unitCost: '',
    markupPercentage: '',
    totalCost: '',
    isPrimary: false,
  });

  const [items, setItems] = useState([{ ...initialItem(), isPrimary: true }]);
  const [rowErrors, setRowErrors] = useState([{}]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'warning' });
  const [canSubmit, setCanSubmit] = useState(false); 

  const options = [
    { label: 'With VAT', value: 1.12},
    { label: 'Without VAT', value:0 },
  ]

  const [qty, setQty] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [markup, setMarkup] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectedOptions, setselectedOptions] = useState(false);
  
  const calculatePerRowCost = () => {
    return qty * unitCost;
  };

  const calculateTotalCost = () => {
    let totalCost = calculatePerRowCost();
    let overallTotal = totalCost;
    let grandTotal = totalCost;
    // Apply markup if present
    if (markup > 0) {
      totalCost *= (1 + markup / 100);
      overallTotal *= (1 + markup / 100);
      grandTotal *= (1 + markup / 100);
    }
    // Apply discount if present
    if (discount > 0) {
      overallTotal -= overallTotal * (discount / 100);
      grandTotal -= grandTotal * (discount / 100);
    }
    //Apply VAT if selected
    if (selectedOptions) {
      grandTotal *= 1.12; // Adding VAT (12%)
    }
    return { totalCost, overallTotal, grandTotal };
  };
  const {totalCost, overallTotal, grandTotal} = calculateTotalCost();

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
            value ="1.Price is in Philippine Peso and VAT INCLUSIVE 
            2.Delivery: 
            3.Payment: 
            4.Warranty: 
            5.Price Validity:"
            textAlign = 'right'
            multiline
            fullWidth 
            minRows={4} 
            maxRows={10}
            variant="outlined"
            error={!!errors.Terms}
            helperText={errors.Terms}
        
            slotProps={{
                 style: { textAlign: 'right' }, 
            }}
          />
        </Grid>
        <Grid size={6}>
         <Autocomplete
            options={options}
            value={selectedOptions}
            onChange={() => setVatIncluded(!vatIncluded)} 
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
        <Button variant="contained" ><AddIcon/></Button>
        <Button variant="outlined" color="error"  disabled={items.length === 1}><RemoveIcon/></Button>
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
                      onChange={(e) => setQuantity(e.target.value)}
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
                <Typography fontWeight="bold">	Over ALl Total:${overallTotal.toFixed(2)}</Typography>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
                <TableCell>
                <Typography fontWeight="bold">	Grand Total (VAT Inclusive):${grandTotal.toFixed(2)}</Typography>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}></TableCell>
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
