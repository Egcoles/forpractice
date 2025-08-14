import React, { useState } from "react";
import {Box,Button,TextField,Typography,Autocomplete,Grid,Divider,Paper,Stack,Table,TableBody,TableCell,TableContainer,TableFooter,TableHead,TableRow,Tooltip,} from "@mui/material";
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

  const validate = () => {
    const newErrors = {};
    let errorMessage = "Please input the required field.";
    let supplierMessage = "Please select atleast one supllier";
    let priceMessage = "Price is required for the selected supplier.";

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
    if (!form.item) {
      newErrors.item = errorMessage;
    }
    if (!form.qty) {
      newErrors.qty = errorMessage;
    }
    if (form.supplier1 && !form.price1) {
      newErrors.price1 = priceMessage;
    }
    if (form.supplier2 && !form.price2) {
      newErrors.price2 = priceMessage;
    }
    if (form.supplier3 && !form.price3) {
      newErrors.price3 = priceMessage;
    }
    if (!form.itemDescription)
    {
      newErrors.itemDescription = errorMessage;
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0;
  }


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return; 

      
        console.log('Form submitted:', form);
    };

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
        <Button variant="contained"><AddIcon/></Button>
        <Button variant="outlined" color="error"><RemoveIcon/></Button>
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
          <TableBody className="PrTable">
            <TableRow>
              <TableCell sx={{ minWidth: 320, width: '35%' }}>
                <Autocomplete
                fullWidth
                options={options}
                disablePortal={false}
                ListboxProps={{ style: { maxHeight: 240, overflow: 'auto' } }}
                value={form.item}
                onChange={handleAutocompleteChange('item')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined" 
                    label="Select an Item"
                    className="item"
                    name="item"
                    error={!!errors.item}
                    helperText={errors.item}
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
                      fullWidth: true,
                    }}
                  />
                )}
              />
              </TableCell>
              <TableCell>
                <Tooltip title="This field is read-only" arrow>
                  <TextField 
                  slotProps={{input: { readOnly: true },}}
                  variant="outlined"  className="unit" name="unit" />
                </Tooltip>
              </TableCell>
              <TableCell>
                <TextField  align="right" label="Input Qty" variant="outlined" type="number" className="qty" name="qty"
                    onChange={handleChange}
                    error={!!errors.qty}
                    helperText={errors.qty}
                    value={form.qty}
                    sx={{ '& input': { textAlign: 'right' } }}/>
              </TableCell>
               <TableCell>
                <Tooltip
                  title={!Boolean(form.supplier1) ? "Select appropriate supplier" : ""}
                  arrow
                  disableHoverListener={Boolean(form.supplier1)}
                  disableFocusListener={Boolean(form.supplier1)}
                  disableTouchListener={Boolean(form.supplier1)}
                >
                  <TextField  align="right" label="Price" variant="outlined" type="number" className="price1" name="price1"
                      slotProps={{input: { readOnly: !Boolean(form.supplier1) },}}
                      onChange={handleChange}
                      error={!!errors.price1}
                      helperText={errors.price1}
                      value={form.price1}
                      sx={{ '& input': { textAlign: 'right' } }}/>
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
                  <TextField  align="right" label="Price" variant="outlined" type="number"  className="price2" name="price2"
                     slotProps={{input: { readOnly: !Boolean(form.supplier2) },}}
                     onChange={handleChange}
                     error={!!errors.price2}
                      helperText={errors.price2}
                      value={form.price2}
                      sx={{ '& input': { textAlign: 'right' } }}/>
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
                  <TextField  align="right" label="Price" variant="outlined" type="number"  className="price3" name="price3"
                      slotProps={{input: { readOnly: !Boolean(form.supplier3) },}}
                      onChange={handleChange}
                      error={!!errors.price3}
                      helperText={errors.price3}
                      value={form.price3}
                      sx={{ '& input': { textAlign: 'right' } }}/>
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
                  name="itemDescription"
                  onChange={handleChange}
                  error={!!errors.itemDescription}
                  helperText={errors.itemDescription}
                  value={form.itemDescription}/>
              </TableCell>
              <TableCell></TableCell>
              <TableCell>
                <Typography> Total Amount</Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="This field is read-only" arrow>
                  <TextField slotProps={{input: { readOnly: true },}} variant="outlined" type="number" className="supplier1Total" name="supplier1Total" value={form.supplier1Total} sx={{ '& input': { textAlign: 'right' } }}/>
                </Tooltip>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="This field is read-only" arrow>
                  <TextField  slotProps={{input: { readOnly: true },}} variant="outlined" type="number" className="supplier2Total" name="supplier2Total" value={form.supplier2Total} sx={{ '& input': { textAlign: 'right' } }}/>
                </Tooltip>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="This field is read-only" arrow>
                  <TextField  slotProps={{input: { readOnly: true },}} variant="outlined" type="number" className="supplier3Total" name="supplier3Total" value={form.supplier3Total} sx={{ '& input': { textAlign: 'right' } }}/>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>
                <Typography fontWeight="bold">Overall Total</Typography>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold'}}>
                <TextField  variant="standard"  value={form.supplier1Total ? form.supplier1Total : '0.00'} sx={{ '& input': { textAlign: 'right', mr: 4 } }}  slotProps={{input: { disableUnderline: true},}}/>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
               <TextField  variant="standard"  value={form.supplier2Total ? form.supplier2Total : '0.00'} sx={{ '& input': { textAlign: 'right', mr: 4} }}  slotProps={{input: { disableUnderline: true},}}/>
                </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                <TextField  variant="standard"  value={form.supplier3Total ? form.supplier3Total : '0.00'} sx={{ '& input': { textAlign: 'right', mr: 4 } }}  slotProps={{input: { disableUnderline: true},}}/>
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
        <Button variant="contained" type="submit" endIcon={<SendIcon />}>
          Submit
        </Button>
      </Stack>
    </form>
         
        
    </Box>
    
  );
};
export default CreatePR;

