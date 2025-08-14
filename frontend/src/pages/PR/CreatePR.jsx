import React, { useState } from "react";
import {Box,Button,TextField,Typography,Autocomplete,Grid,Divider,Paper,Stack,Table,TableBody,TableCell,TableContainer,TableFooter,TableHead,TableRow,Tooltip,} from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Add as AddIcon,Remove as RemoveIcon, Preview as PreviewIcon, Send as SendIcon} from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs'; 
const CreatePR = () => {
  const [form, setForm] = useState ({
    date: dayjs(),
    canvassedBy: "",
    project: "",
    supplier1: "",
    supplier2: "",
    supplier3: "",
    item: "",
    unit: "",
    qty: "",
    price1: "",
    price2: "",
    price3: "",
    itemDescription: "",
    supplier1Total: "",
    supplier2Total: "",
    supplier3Total: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({});

  // Dynamic line items
  const initialItem = () => ({
    item: '',
    unit: '',
    qty: '',
    price1: '',
    price2: '',
    price3: '',
    itemDescription: '',
    supplier1Total: '',
    supplier2Total: '',
    supplier3Total: '',
    requiredSuppliers: { supplier1: false, supplier2: false, supplier3: false },
    isPrimary: false,
  });

  const [items, setItems] = useState([{ ...initialItem(), isPrimary: true }]);
  const [rowErrors, setRowErrors] = useState([{}]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'warning' });
  const [hasDup, setHasDup] = useState(false); //duplicate detection across rows

  const computeRowTotals = (row) => {
    const qty = parseFloat(row.qty) || 0;
    const p1 = parseFloat(row.price1) || 0;
    const p2 = parseFloat(row.price2) || 0;
    const p3 = parseFloat(row.price3) || 0;
    return {
      supplier1Total: qty && p1 ? (qty * p1).toFixed(2) : '',
      supplier2Total: qty && p2 ? (qty * p2).toFixed(2) : '',
      supplier3Total: qty && p3 ? (qty * p3).toFixed(2) : '',
    };
  };

  //function to handle changes on standard inputs
  const handleItemFieldChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      const row = { ...next[index], [field]: value };
      if (["qty", "price1", "price2", "price3"].includes(field)) {
        const totals = computeRowTotals(row);
        row.supplier1Total = totals.supplier1Total;
        row.supplier2Total = totals.supplier2Total;
        row.supplier3Total = totals.supplier3Total;
      }
      next[index] = row;
      return next;
    });
    setRowErrors((prev) => {
      const next = [...prev];
      if (["price1","price2","price3"].includes(field)) {
        // If any price has value all price-related errors on this row will be clreared
        if (value !== '' && value !== null && value !== undefined) {
          next[index] = { ...next[index], price1: '', price2: '', price3: '' };
        } else {
          next[index] = { ...next[index], [field]: '' };
        }
      } else {
        next[index] = { ...next[index], [field]: '' };
      }
      return next;
    });
  };

  //function to handle Material UI Autocomplete Textfields
  const handleItemAutocompleteChange = (index, field, newValue) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: newValue || '' };
      return next;
    });
    setRowErrors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: '' };
      return next;
    });
  };

  const openSnackbar = (message, severity = 'warning') => setSnackbar({ open: true, message, severity });

  //function to validate single row
  const validateRow = (row) => {
    const re = {};
    const errorMessage = 'Please input the required field.';

    // Required base fields
    if (!row.item) re.item = errorMessage;
    if (!row.itemDescription) re.itemDescription = errorMessage;
    const q = parseFloat(row.qty);
    if (!q || q <= 0) re.qty = 'Qty must be greater than 0.';

    // Supplier + price requirement: at least one selected supplier must have a price in this row
    const sel1 = !!form.supplier1;
    const sel2 = !!form.supplier2;
    const sel3 = !!form.supplier3;
    const anySelected = sel1 || sel2 || sel3;

    if (anySelected) {
      const hasAnyPrice = (sel1 && !!row.price1) || (sel2 && !!row.price2) || (sel3 && !!row.price3);
      if (!hasAnyPrice) {
        if (sel1 && !row.price1) re.price1 = errorMessage;
        if (sel2 && !row.price2) re.price2 = errorMessage;
        if (sel3 && !row.price3) re.price3 = errorMessage;
      }
    }

    return re;
  };

  //function to validate all rows
  const validateRows = () => {
    const errs = items.map(validateRow);

    // Duplicate (item + supplier) detection across rows
    const seen = new Set();
    let duplicateFound = false;
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const itemKey = (row.item || '').toString().trim().toLowerCase();
      if (!itemKey) continue;
      const sources = [
        { sel: !!form.supplier1, price: row.price1, key: 's1', field: 'price1' },
        { sel: !!form.supplier2, price: row.price2, key: 's2', field: 'price2' },
        { sel: !!form.supplier3, price: row.price3, key: 's3', field: 'price3' },
      ];
      sources.forEach((s) => {
        if (s.sel && s.price) {
          const pair = `${itemKey}::${s.key}`;
          if (seen.has(pair)) {
            duplicateFound = true;
            errs[i] = { ...errs[i], item: errs[i]?.item || 'Duplicate item and supplier.', [s.field]: errs[i]?.[s.field] || 'Duplicate combination.' };
          } else {
            seen.add(pair);
          }
        }
      });
    }

    setRowErrors(errs);
    setHasDup(duplicateFound);
    if (duplicateFound) {
      openSnackbar('You selected the same item and supplier please double check your entry.', 'warning');
    }

    return !duplicateFound && errs.every((e) => Object.keys(e).length === 0);
  };

  //function to check if can add new row
  const canAddNewRow = () => {
    let valid = true;
    let supplierMessage = "Please select at least one supplier";
    // Require at least one supplier selected
    const hasSupplier = Boolean(form.supplier1 || form.supplier2 || form.supplier3);
    if (!hasSupplier) {
      setErrors((prev) => ({
        ...prev,
        supplier1: supplierMessage,
        supplier2: supplierMessage,
        supplier3: supplierMessage,
      }));
      valid = false;
    }

    // Validate existing rows
    const rowsOk = validateRows();
    valid = valid && rowsOk;

    if (!valid) {
      if (!hasDup) openSnackbar('Complete required fields in existing rows before adding a new row.', 'warning');
      return false;
    }
    return true;
  };

  //function to add new row
  const addItemRow = () => {
    if (!canAddNewRow()) return;
    const newRow = initialItem();
    newRow.requiredSuppliers = {
      supplier1: !!form.supplier1,
      supplier2: !!form.supplier2,
      supplier3: !!form.supplier3,
    };
    newRow.isPrimary = false;
    setItems((prev) => [newRow, ...prev]);
    setRowErrors((prev) => [{} , ...prev]);
  };

  //function to remove row
  const removeItemRow = () => {
    setItems((prev) => (prev.length > 1 ? prev.slice(1) : prev));
    setRowErrors((prev) => (prev.length > 1 ? prev.slice(1) : prev));
  };

  //function to sum the overall total per supplier
  const sumSupplier = (key) => {
    const total = items.reduce((s, r) => s + (parseFloat(r[key]) || 0), 0);
    return total ? total.toFixed(2) : '0.00';
  };

  // Group keys for clearing grouped errors
  const SUPPLIER_KEYS = ['supplier1', 'supplier2', 'supplier3'];
  const PRICE_KEYS = ['price1', 'price2', 'price3'];

  // Calculate totals based on qty and prices
  const computeTotals = (f) => {
    const qty = parseFloat(f.qty) || 0;
    const price1 = parseFloat(f.price1) || 0;
    const price2 = parseFloat(f.price2) || 0;
    const price3 = parseFloat(f.price3) || 0;

    const t1 = qty * price1;
    const t2 = qty * price2;
    const t3 = qty * price3;

    return {
      supplier1Total: t1 ? t1.toFixed(2) : '',
      supplier2Total: t2 ? t2.toFixed(2) : '',
      supplier3Total: t3 ? t3.toFixed(2) : '',
    };
  };

  // Genral Handler for outlined inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextForm = { ...form, [name]: value };

    // Update totals whenever qty or any price changes
    if (name === 'qty' || PRICE_KEYS.includes(name)) {
      const totals = computeTotals(nextForm);
      nextForm.supplier1Total = totals.supplier1Total;
      nextForm.supplier2Total = totals.supplier2Total;
      nextForm.supplier3Total = totals.supplier3Total;
    }

    setForm(nextForm);

    setErrors((prev) => {
      const next = { ...prev, [name]: '' };
      return next;
    });
  };

  // General Change handler for Autocomplete
  const handleAutocompleteChange = (field) => (event, newValue) => {
    const nextForm = { ...form, [field]: newValue };

    if (SUPPLIER_KEYS.includes(field)) {
      const map = {
        supplier1: { price: 'price1', total: 'supplier1Total' },
        supplier2: { price: 'price2', total: 'supplier2Total' },
        supplier3: { price: 'price3', total: 'supplier3Total' },
      };
      const { price, total } = map[field];
      if (!newValue) {
        nextForm[price] = '';
        nextForm[total] = '';
      }

      // Also clear per-row prices/totals for the supplier that was cleared
      setItems((prev) => prev.map((r) => ({
        ...r,
        [price]: newValue ? r[price] : '',
        [total]: newValue ? r[total] : '',
      })));
    }

    setForm(nextForm);

    setErrors((prev) => {
      const next = { ...prev, [field]: '' };
      if (SUPPLIER_KEYS.includes(field)) {
        const anySupplier = SUPPLIER_KEYS.some((k) => Boolean(nextForm[k]));
        if (anySupplier) SUPPLIER_KEYS.forEach((k) => (next[k] = ''));
      }
      return next;
    });
  };

  //function to validate inputs
  const validate = () => {
    const newErrors = {};
    let errorMessage = "Please input the required field.";
    let supplierMessage = "Please select at least one supplier.";

    if (!form.date.isValid()) {
      newErrors.date = errorMessage; 
    }
    if (!form.canvassedBy) {
      newErrors.canvassedBy = errorMessage;
    }
    if (!form.project) {
      newErrors.project =errorMessage;
    }
    if (!form.supplier1 && !form.supplier2 && !form.supplier3) {
      newErrors.supplier1 = supplierMessage;
      newErrors.supplier2 = supplierMessage;
      newErrors.supplier3 = supplierMessage;
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0;
  }


  //function to handle submission
  //TODO: add validation for supplier and price fields
    const handleSubmit = async (e) => {
        e.preventDefault();
        const a = validate();
        const b = validateRows();
        if (!a || !b) {
          if (!hasDup) openSnackbar('Please input all required fields before submitting.', 'error');
          return;
        }
        console.log('Form submitted:', { form, items });
    };

    //this is static data only
    //REPLACE WITH DYNAMIC DATA SOON.....
     const options = ['Apple', 'Banana', 'Cherry', 'Date'];

    const Rows = [
      { id: 1, name: 'John Doe', age: 30, city: 'New York' },
      { id: 2, name: 'Jane Smith', age: 25, city: 'London' },
    ];

  return (
    <Box sx={{
       width: '100%',
       }}>
      <Typography variant="h5" component="h5" fontWeight="bold">
        Purchase Requisition
      </Typography>
      <Divider sx={{ my: 2, borderColor: 'primary.main' }} />
    <form onSubmit={handleSubmit} noValidate>
      <Grid container alignItems="center" justifyContent="center" spacing={2}>
        <Grid size={6}>
           <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                name = "date"
                className="date"
                error={!!errors.date}
                helperText={errors.date}
                value={form.date}
                  onChange={(newValue) => {
                        setForm((prev) => ({ ...prev, date: newValue }));
                        setErrors((prev) => ({ ...prev, date: "" })); 
                    }}
                    renderInput={(params) => (
                        <TextField {...params} error={!!errors.date} helperText={errors.date} />
                    )}
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    fullWidth: true,
                    sx: {
                      '& .MuiInput-underline:before': { 
                        borderBottom: 'none',
                      },
                      '& .MuiInput-underline:after': { 
                        borderBottom: 'none',
                      },
                    },
                  },
                }}
              />
        </LocalizationProvider>
        </Grid>
        <Grid size={6}>
         <Autocomplete
            options={options}
            value={form.canvassedBy}
            onChange={handleAutocompleteChange('canvassedBy')}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="Canvassed By"
                className="canvassedBy"
                name="canvassedBy"
                error={!!errors.canvassedBy}
                helperText={errors.canvassedBy}
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
        <Grid size={12}>
            <TextField
            className="project"
            name="project"
            label="Project Description"
            multiline
            fullWidth 
            minRows={4} 
            maxRows={10}
            variant="outlined"
            error={!!errors.project}
            helperText={errors.project}
            value={form.project}
            onChange={handleChange}
          />
        </Grid>
        
      </Grid>
      <Stack direction="row" spacing={2} mt={2} mb={2}> 
        <Button variant="contained" onClick={addItemRow}><AddIcon/></Button>
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
              <TableCell>
                <Autocomplete
                options={options}
                disablePortal={false}
                ListboxProps={{ style: { maxHeight: 240, overflow: 'auto' } }}
                value={form.supplier1}
                onChange={handleAutocompleteChange('supplier1')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined" 
                    label="Supplier 1"
                    className="supplier1"
                    name="supplier1"
                    error={!!errors.supplier1}
                    helperText={errors.supplier1}
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
                <Autocomplete
                options={options}
                disablePortal={false}
                ListboxProps={{ style: { maxHeight: 240, overflow: 'auto' } }}
                value={form.supplier2}
                onChange={handleAutocompleteChange('supplier2')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined" 
                    label="Supplier 2"
                    className="supplier2"
                    name="supplier2"
                    error={!!errors.supplier2}
                    helperText={errors.supplier2}
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
                <Autocomplete
                options={options}
                disablePortal={false}
                ListboxProps={{ style: { maxHeight: 240, overflow: 'auto' } }}
                value={form.supplier3}
                onChange={handleAutocompleteChange('supplier3')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined" 
                    label="Supplier 3"
                    className="supplier3"
                    name="supplier3"
                    error={!!errors.supplier3}
                    helperText={errors.supplier3}
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
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row, idx) => (
              <React.Fragment key={idx}>
                <TableRow>
                  <TableCell sx={{ minWidth: 320, width: '35%' }}>
                    <Autocomplete
                      fullWidth
                      options={options}
                      disablePortal={false}
                      ListboxProps={{ style: { maxHeight: 240, overflow: 'auto' } }}
                      value={row.item}
                      onChange={(e, newValue) => handleItemAutocompleteChange(idx, 'item', newValue)}
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
                      value={row.qty}
                      onChange={(e) => handleItemFieldChange(idx, 'qty', e.target.value)}
                      error={!!rowErrors[idx]?.qty}
                      helperText={rowErrors[idx]?.qty || ''}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={!Boolean(form.supplier1) ? "Select appropriate supplier" : ""}
                      arrow
                      disableHoverListener={Boolean(form.supplier1)}
                      disableFocusListener={Boolean(form.supplier1)}
                      disableTouchListener={Boolean(form.supplier1)}
                    >
                      <TextField  
                        label="Price" 
                        variant="outlined" 
                        type="number" 
                        className="price1" 
                        name={`price1_${idx}`}
                        slotProps={{input: { readOnly: !Boolean(form.supplier1) },}}
                        value={row.price1}
                        onChange={(e) => handleItemFieldChange(idx, 'price1', e.target.value)}
                        error={!!rowErrors[idx]?.price1}
                        helperText={rowErrors[idx]?.price1 || ''}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={!Boolean(form.supplier2) ? "Select appropriate supplier" : ""}
                      arrow
                      disableHoverListener={Boolean(form.supplier2)}
                      disableFocusListener={Boolean(form.supplier2)}
                      disableTouchListener={Boolean(form.supplier2)}
                    >
                      <TextField  
                        label="Price" 
                        variant="outlined" 
                        type="number"  
                        className="price2" 
                        name={`price2_${idx}`}
                        slotProps={{input: { readOnly: !Boolean(form.supplier2) },}}
                        value={row.price2}
                        onChange={(e) => handleItemFieldChange(idx, 'price2', e.target.value)}
                        error={!!rowErrors[idx]?.price2}
                        helperText={rowErrors[idx]?.price2 || ''}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip
                      title={!Boolean(form.supplier3) ? "Select appropriate supplier" : ""}
                      arrow
                      disableHoverListener={Boolean(form.supplier3)}
                      disableFocusListener={Boolean(form.supplier3)}
                      disableTouchListener={Boolean(form.supplier3)}
                    >
                      <TextField  
                        label="Price" 
                        variant="outlined" 
                        type="number"  
                        className="price3" 
                        name={`price3_${idx}`}
                        slotProps={{input: { readOnly: !Boolean(form.supplier3) },}}
                        value={row.price3}
                        onChange={(e) => handleItemFieldChange(idx, 'price3', e.target.value)}
                        error={!!rowErrors[idx]?.price3}
                        helperText={rowErrors[idx]?.price3 || ''}
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
                      onChange={(e) => handleItemFieldChange(idx, 'itemDescription', e.target.value)}
                      error={!!rowErrors[idx]?.itemDescription}
                      helperText={rowErrors[idx]?.itemDescription || ''}
                    />
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <Typography> Total Amount:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="This field is read-only" arrow>
                      <TextField 
                        slotProps={{input: { readOnly: true },}} 
                        variant="standard" 
                        type="number" 
                        className="supplier1Total" 
                        name={`supplier1Total_${idx}`} 
                        value={row.supplier1Total}
                        sx={{ '& input': { textAlign: 'right' } }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="This field is read-only" arrow>
                      <TextField  
                        slotProps={{input: { readOnly: true },}} 
                        variant="standard" 
                        type="number" 
                        className="supplier2Total" 
                        name={`supplier2Total_${idx}`} 
                        value={row.supplier2Total}
                        sx={{ '& input': { textAlign: 'right' } }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="This field is read-only" arrow>
                      <TextField  
                        slotProps={{input: { readOnly: true },}} 
                        variant="standard" 
                        type="number"  
                        className="supplier3Total" 
                        name={`supplier3Total_${idx}`} 
                        value={row.supplier3Total}
                        sx={{ '& input': { textAlign: 'right' } }}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>
                <Typography fontWeight="bold">Overall Total:</Typography>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold'}}>{sumSupplier('supplier1Total')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{sumSupplier('supplier2Total')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{sumSupplier('supplier3Total')}</TableCell>
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
        <Button variant="contained" type="submit" endIcon={<SendIcon />}>
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
export default CreatePR;
