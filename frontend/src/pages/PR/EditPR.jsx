import React, { useState } from "react";
import { useMutation, useQueryClient} from "@tanstack/react-query";
import api from "../../api";
import { useUsers, useItems, useSuppliers } from "../../hooks/useUsers";
import {useEndorsers} from "../../hooks/useEndorsers";
import { useApprovers } from "../../hooks/useApprovers";
import {Box,Button,TextField,Typography,Autocomplete,Grid,Divider,Paper,Stack,Table,TableBody,TableCell,TableContainer,TableFooter,TableHead,TableRow,Tooltip,} from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Add as AddIcon,Remove as RemoveIcon, Preview as PreviewIcon, Send as SendIcon} from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs'; 

const EditPR = ({roleId}) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState ({
    date: dayjs(),
    canvassedBy: "",
    project: "",
    endorser: "",
    approver: "",
    supplier1: "",
    supplier2: "",
    supplier3: "",
    item: "",
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

  const {data: users = [], isLoading, isError} = useUsers();
  const selectedUser = form.canvassedBy || null;

  const {data: approvers = [], isAppLoading, isAppError} = useApprovers();
  const selectedApprover = form.approver || null;

  const {data: endorsers = [], isEndoLoading, isEndoError} = useEndorsers();
  const selectedEndorser = form.endorser || null;

  const {data: particulars = [], isItemLoading, isItemError} = useItems();

  const {data: suppliers =[], isSuppLoading, isSuppError} = useSuppliers();
  const selectedSupplier1 = form.supplier1 || null;
  const selectedSupplier2 = form.supplier2 || null;
  const selectedSupplier3= form.supplier3 || null;
  

  const createPRMutation = useMutation ({
    mutationFn:(newPR) => api.post("PR/create", newPR, {withCredentials: true}),
    onSuccess: () => {
      queryClient.invalidateQueries(["PR"])
      setSnackbar({ open: true, message: 'PR created successfully', severity: 'success' });
      // Reset the entire form and dynamic rows
      setForm({
        date: dayjs(),
        canvassedBy: "",
        project: '',
        endorser: "",
        approver: "",
        supplier1: "",
        supplier2: "",
        supplier3: "",
        item: '',
        unit: '',
        qty: '',
        price1: '',
        price2: '',
        price3: '',
        itemDescription: '',
        supplier1Total: '',
        supplier2Total: '',
        supplier3Total: ''
      })
      setItems([{ ...initialItem(), isPrimary: true }]);
      setRowErrors([{}]);
      setErrors({});
      setCanSubmit(false);
      }, onError: (err) => {
      setSnackbar({ open: true, message: 'Error creating PR. Please try again.', severity: 'error' });
    }
  })

  // Dynamic line items
  const initialItem = () => ({
    id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    item: null,
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
  const [canSubmit, setCanSubmit] = useState(false); // submit is enabled only after successful Preview

  const computeRowTotals = (row) => {
    const qty = parseFloat(row.qty) || 0;
    const p1 = parseFloat(row.price1);
    const p2 = parseFloat(row.price2);
    const p3 = parseFloat(row.price3);
    return {
      supplier1Total: qty > 0 && p1 > 0 ? (qty * p1).toFixed(2) : '',
      supplier2Total: qty > 0 && p2 > 0 ? (qty * p2).toFixed(2) : '',
      supplier3Total: qty > 0 && p3 > 0 ? (qty * p3).toFixed(2) : '',
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
        const num = parseFloat(value);
        if (value === '' || value === null || value === undefined || isNaN(num)) {
          next[index] = { ...next[index], [field]: '' };
        } else if (num <= 0) {
          next[index] = { ...next[index], [field]: 'Price must be greater than 0.' };
        } else {
          next[index] = { ...next[index], [field]: '' };
        }
      } else {
        next[index] = { ...next[index], [field]: '' };
      }
      return next;
    });
    setCanSubmit(false);
  };

  //function to handle Material UI Autocomplete Textfields
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

  const openSnackbar = (message, severity = 'warning') => setSnackbar({ open: true, message, severity });

  //function to validate single row
  const validateRow = (row) => {
    const re = {};
    const errorMessage = 'Please input the required field.';

    // Required base fields
    if (!row.item || !(row.item?.itemId ?? row.item?.ItemId)) re.item = errorMessage;
    if (!row.itemDescription) re.itemDescription = errorMessage;
    const q = parseFloat(row.qty);
    if (!q || q <= 0) re.qty = 'Qty must be greater than 0.';

    // Supplier + price requirement: at least one selected supplier must have a positive price in this row
    const sel1 = !!form.supplier1;
    const sel2 = !!form.supplier2;
    const sel3 = !!form.supplier3;
    const anySelected = sel1 || sel2 || sel3;

    if (anySelected) {
      const v1 = parseFloat(row.price1);
      const v2 = parseFloat(row.price2);
      const v3 = parseFloat(row.price3);

      const hasAnyPositive = (sel1 && v1 > 0) || (sel2 && v2 > 0) || (sel3 && v3 > 0);
      if (!hasAnyPositive) {
        if (sel1) re.price1 = row.price1 ? 'Price must be greater than 0.' : errorMessage;
        if (sel2) re.price2 = row.price2 ? 'Price must be greater than 0.' : errorMessage;
        if (sel3) re.price3 = row.price3 ? 'Price must be greater than 0.' : errorMessage;
      } else {
        // Explicitly flag zero or negative prices if entered
        if (sel1 && row.price1 !== '' && !(v1 > 0)) re.price1 = 'Price must be greater than 0.';
        if (sel2 && row.price2 !== '' && !(v2 > 0)) re.price2 = 'Price must be greater than 0.';
        if (sel3 && row.price3 !== '' && !(v3 > 0)) re.price3 = 'Price must be greater than 0.';
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
      const itemKey = row.item?.itemId ?? row.item?.ItemId;
      if (!itemKey) continue;
      const sources = [
        { sel: !!form.supplier1, price: parseFloat(row.price1), key: 's1', field: 'price1' },
        { sel: !!form.supplier2, price: parseFloat(row.price2), key: 's2', field: 'price2' },
        { sel: !!form.supplier3, price: parseFloat(row.price3), key: 's3', field: 'price3' },
      ];
      sources.forEach((s) => {
        if (s.sel && s.price > 0) {
          const pair = `${itemKey}::${s.key}`;
          if (seen.has(pair)) {
            duplicateFound = true;
            errs[i] = { ...errs[i], item: errs[i]?.item || 'You are trying to input this item again.', [s.field]: errs[i]?.[s.field] || 'Please choose different supplier.' };
          } else {
            seen.add(pair);
          }
        }
      });
    }

    setRowErrors(errs);
    setHasDup(duplicateFound);
    if (duplicateFound) {
      openSnackbar('You are already input this item with the same supplier. Please double check your entry.', 'warning');
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
      if (!hasDup) openSnackbar('Please input all required fields before adding a new row.', 'warning');
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
    setItems((prev) => [...prev, newRow]);
    setRowErrors((prev) => [...prev, {}]);
  };

  //function to remove row
  const removeItemRow = () => {
    setItems((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    setRowErrors((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
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
    const price1 = parseFloat(f.price1);
    const price2 = parseFloat(f.price2);
    const price3 = parseFloat(f.price3);

    const t1 = qty > 0 && price1 > 0 ? qty * price1 : 0;
    const t2 = qty > 0 && price2 > 0 ? qty * price2 : 0;
    const t3 = qty > 0 && price3 > 0 ? qty * price3 : 0;

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
    setCanSubmit(false);
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
    setCanSubmit(false);
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


  // Preview flow: validate, show alert, log data, then enable Submit
  const handlePreview = () => {
    const a = validate();
    const b = validateRows();
    if (!a || !b) {
      if (!hasDup) openSnackbar('Please input all required fields before preview.', 'warning');
      setCanSubmit(false);
      return;
    }
    alert('All data is valid. Check console for preview.');
    console.log('Preview data:', { form, items });
    setCanSubmit(true);
  };

  //function to submit
  const handleSubmit = async (e) => {
      e.preventDefault();
      const a = validate();
      const b = validateRows();
      if (!a || !b) {
          if (!hasDup) openSnackbar('Please input all required fields before submitting.', 'error');
          return;
      }
      
      const toId = (obj, keys = ['userId','userid','UserId','supplierId','supplierid','SupplierId','itemId','ItemId']) => {
          if (!obj) return null;
          if (typeof obj !== 'object') return obj;
          for (const k of keys) {
              if (obj[k] !== undefined && obj[k] !== null) return obj[k];
          }
          return null;
      };

      const toNum = (x) => {
          const n = Number(x);
          return Number.isFinite(n) && n > 0 ? n : null;
      };

      const dateIso = form?.date && typeof form.date?.toISOString === 'function'
          ? form.date.toISOString()
          : null;
      const main = items[0] || {};
      const itemsPayload = items.map(item => ({
          ItemId: toId(item.item),
          ItemDescription: item.itemDescription || '',
          Qty: Number(item.qty) || 0,
          suppliers: [
              {
                  SupplierId: form.supplier1?.supplierID,
                  Price: toNum(main.price1) || 0,
                  Total: toNum(main.supplier1Total) || 0,
              },
              {
                  SupplierId: form.supplier2?.supplierID,
                  Price: toNum(main.price2) || 0,
                  Total: toNum(main.supplier2Total) || 0,
              },
              {
                  SupplierId: form.supplier3?.supplierID,
                  Price: toNum(main.price3) || 0,
                  Total: toNum(main.supplier3Total) || 0,
              },
          ]
          
      }));

      const payload = {
          ProjecDescription: form.project || '',
          DateNeeded: dateIso,
          CanvassedBy: toId(form.canvassedBy),
          EndorserId: toId(form.endorser),
          ApproverId: toId(form.approver),
          items: itemsPayload,
          
      };

      console.log(payload);
      createPRMutation.mutate(payload);
  };


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
            options={users}
            getOptionLabel={(option) => option?.fullName ||`User ${option?.userId}`}
            value={selectedUser}
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
        <Grid size={6}>
           {roleId !== '32' && (
          <Autocomplete
            options={endorsers}
            getOptionLabel={(option) => option?.fullName || `Endorser ${option?.userId}`}
            value={selectedEndorser}
            onChange={handleAutocompleteChange('endorser')}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined" 
                label="Select Endorser"
                className="endorser"
                name="endorser"
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
        <Grid size={6}>
          {roleId !== '33' && (
           <Autocomplete
            options={approvers}
            getOptionLabel={(option) => option?.fullName || `Approver ${option?.userId}`}
            value={selectedApprover}
            onChange={handleAutocompleteChange('approver')}
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
               options={suppliers}
                getOptionLabel={(option) => option?.supplierName || `Supplier ${option?.supplierid}`}
                disablePortal={false}
                slotProps={{listbox: { maxheight: 240, overflow: 'auto'},}}
                // ListboxProps={{ style: { maxheight: 240, overflow: 'auto' } }}
                value={selectedSupplier1}
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
                options={suppliers}
                getOptionLabel={(option) => option?.supplierName || `Supplier ${option?.supplierid}`}
                disablePortal={false}
                slotProps={{listbox: { maxheight: 240, overflow: 'auto'},}}
                // ListboxProps={{ style: { maxheight: 240, overflow: 'auto' } }}
                value={selectedSupplier2}
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
                options={suppliers}
                getOptionLabel={(option) => option?.supplierName || `Supplier ${option?.supplierid}`}
                disablePortal={false}
                slotProps={{listbox: { maxheight: 240, overflow: 'auto'},}}
                // ListboxProps={{ style: { maxheight: 240, overflow: 'auto' } }}
                value={selectedSupplier3}
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
              <React.Fragment key={row.id || idx}>
                <TableRow>
                  <TableCell sx={{ minWidth: 320, width: '35%' }}>
                    <Autocomplete
                      fullWidth
                      options={particulars}
                      getOptionLabel={(option) => option?.itemName|| `Item ${option?.itemId}`}
                      disablePortal={false}
                      slotProps={{listbox: { maxheight: 240, overflow: 'auto'},}}
                      // ListboxProps={{ style: { maxheight: 240, overflow: 'auto' } }}
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
                        slotProps={{input: { readOnly: !Boolean(form.supplier1) },min: 0.01, step: '0.01' }}
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
                        slotProps={{input: { readOnly: !Boolean(form.supplier2) }, min: 0.01, step: '0.01'}}
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
                        slotProps={{input: { readOnly: !Boolean(form.supplier3) }, min: 0.01, step: '0.01'}}
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
export default EditPR;
