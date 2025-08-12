import React, { useState } from "react";
import {Box,Button,TextField,Typography,Autocomplete,Grid,TextareaAutosize,} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
const CreatePR = () => {

//static data
const comapny = [
  { label: 'MsDcu'},
  { label: 'Grab' },
  { label: 'FOPRD'},
  { label: 'Toyota'},
];
const location = [
   { label: 'Bacolod'},
  { label: 'Sagay' },
  { label: 'Cadiz'},
  { label: 'Toboso'},
]

  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    vat: "",
    discount: "",
    company: "",
    location: "",
    comapanyAddress: "",
    submittedBy: "",
    endorser: "",
    approver: "",
  });


  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", px: 3, py: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Create New PR
      </Typography>

      <Box
        component="form"
        // onSubmit={handleSubmit}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mt: 2,
        }}
      >
        <TextField
          id="clientName"
          label="Client Name"
          name="clientName"
          value={formData.clientName}
          // onChange={handleChange}
          required
          fullWidth
          autoComplete="clientName"
        />
        <TextField
          id="projectName"
          label="Project Name"
          name="projectName"
          value={formData.projectName}
          // onChange={handleChange}
          required
          fullWidth
          autoComplete="projectName"
        />
        <TextField
          id="vat"
          label="VAT"
          name="vat"
          value={formData.vat}
          // onChange={handleChange}
          required
          fullWidth
          autoComplete="vat"
        />

        
          

            <TextareaAutosize
             id="terms"
            label="Terms & Conditions"
            name="terms"
            maxRows={4}
            aria-label="maximum height"
            placeholder="Maximum 4 rows"
            defaultValue="1.Price is in Philippine Peso and VAT INCLUSIVE 
                2.Delivery: 
                3.Payment: 
                4.Warranty: 
                5.Price Validity:"
            style={{ width: 200 }}
          />
    
  
        <TextField
          id="discount"
          label="Discount"
          name="discount"
          value={formData.discount}
          // onChange={handleChange}
          required
          fullWidth
          autoComplete="discount"
        />
        
        <Autocomplete
          disablePortal
          options={comapny}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Company Name" />}
        />
        <Autocomplete
          disablePortal
          options={location}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Location" />}
        />
     
        <TextField
          id="comapanyAddress"
          label="Comapany Address"
          name="comapanyAddress"
          type="comapanyAddress"
          value={formData.comapanyAddress}
          // onChange={handleChange}
          required
          fullWidth
          autoComplete="comapanyAddress"
        />
           <TextField
          id="submittedBy"
          label="Submitted By"
          name="submittedBy"
          type="submittedBy"
          value={formData.submittedBy}
          // onChange={handleChange}
          required
          fullWidth
          autoComplete="submittedBy"
        />
           <TextField
          id="endorser"
          label="Endorser"
          name="endorser"
          type="endorser"
          value={formData.endorser}
          // onChange={handleChange}
          required
          fullWidth
          autoComplete="endorser"
        />
           <TextField
          id="approver"
          label="Approver"
          name="approver"
          type="approver"
          value={formData.approver}
          // onChange={handleChange}
          required
          fullWidth
          autoComplete="approver"
        />

        <Box sx={{ gridColumn: "1 / -1", mt: 2, textAlign: "right" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            
            sx={{
              transition: "transform 0.1s ease-in-out",
              "&:hover": { transform: "scale(0.95)" },
              "&:active": { transform: "scale(0.92)" },
            }}
          >
            <SaveIcon sx={{ mr: 1 }} />
            Save
          </Button>
        </Box>
      </Box>

    </Box>
    
  );
};
export default CreatePR;

