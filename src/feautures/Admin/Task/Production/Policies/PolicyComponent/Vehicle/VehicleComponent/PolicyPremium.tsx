import React, { useContext, useState } from "react";
import { VehicleContext } from "../VehiclePolicy";
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  Typography,
  TextField,
  Divider,
  Button,
  Box,
} from "@mui/material";
import { NumericFormatCustom } from "../../../../../../../../components/NumberFormat";
import { useQuery } from "react-query";
import { LoadingButton } from "@mui/lab";

export default function PolicyPremium() {
  const {
    state,
    handleInputChange,
    handleDateChange,
    tplCompuation,
    comComputation,
    isAddOrEditMode,
    dispatch,
    myAxios,
    user,
    keySave,
  } = useContext(VehicleContext);
  const [text, setText] = useState(
    JSON.parse(state.MortgageeForm)
      ? `LOSS and/or DAMAGE, if any under this policy shall be payable to ${state.Mortgagee} as their interest may appear subject to all terms and conditions, clauses and warranties of this policy. SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING; PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVE CLAUSE THIS POLICY OR ANY RENEWAL THEREOF SHALL NOT BE CANCELLED WITHOUT PRIOR WRITTEN NOTIFICATION AND CONFORMIY TO ${state.Mortgagee}`
      : "SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVER CLAUSE"
  );

  const { data: dataMortgagee, isLoading: isLoadingMortgagee } = useQuery({
    queryKey: "get-mortgagee",
    queryFn: async () =>
      await myAxios.get(`/task/production/get-mortgagee`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      }),
  });

  function onKeyDownComputation(e: any) {
    if (e.code === "NumpadEnter" || e.code === "Enter") {
      if (state.form_type.toLowerCase() === "com") {
        return comComputation();
      }
      tplCompuation();
    }
  }

  return (
    <div>
      <fieldset
        style={{
          display: "flex",
          columnGap: "10px",
          padding: "15px",
          border: "1px solid #cbd5e1",
          borderRadius: "5px",
        }}
      >
        <legend>Mortgagee</legend>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            flex: 1,
          }}
        >
          <div>
            <FormGroup>
              <FormControlLabel
                sx={{
                  ".MuiTypography-root": {
                    fontSize: "13px !important",
                  },
                }}
                disabled={isAddOrEditMode}
                control={
                  <Checkbox
                    size="small"
                    name="MortgageeForm"
                    value={JSON.parse(state.MortgageeForm)}
                    checked={JSON.parse(state.MortgageeForm)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setText(
                          `LOSS and/or DAMAGE, if any under this policy shall be payable to ${state.Mortgagee} as their interest may appear subject to all terms and conditions, clauses and warranties of this policy. SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING; PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVE CLAUSE THIS POLICY OR ANY RENEWAL THEREOF SHALL NOT BE CANCELLED WITHOUT PRIOR WRITTEN NOTIFICATION AND CONFORMIY TO ${state.Mortgagee}`
                        );
                      } else {
                        setText(
                          "SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVER CLAUSE"
                        );
                      }

                      handleDateChange(`${e.target.checked}`, "MortgageeForm");
                    }}
                  />
                }
                label="MortgageeForm"
              />
            </FormGroup>
            <h5 style={{ margin: "0", padding: "0" }}>Form and Endorcement</h5>
          </div>

          {isLoadingMortgagee ? (
            <LoadingButton loading={isLoadingMortgagee} />
          ) : (
            <FormControl
              size="small"
              fullWidth
              required
              disabled={isAddOrEditMode}
            >
              <Select
                labelId="Mortgagee"
                value={state.Mortgagee}
                name="Mortgagee"
                onChange={handleInputChange}
              >
                {[
                  { type: "" },
                  ...dataMortgagee.data.mortgagee[
                    `${state.form_type.toUpperCase()}`
                  ],
                ].map((items: any, idx: number) => {
                  return (
                    <MenuItem key={idx} value={items.Mortgagee}>
                      {items.Mortgagee}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
          <div
            style={{
              border: "1px solid #cbd5e1",
              height: "100%",
              padding: "5px",
              overflowY: "auto",
              maxHeight: "230px",
            }}
          >
            <Typography variant="caption">{text}</Typography>
          </div>
          <TextField
            onKeyDown={keySave}
            disabled={isAddOrEditMode}
            label="Remarks"
            name="remarks"
            value={state.remarks}
            onChange={handleInputChange}
            multiline
            rows={3}
            InputProps={{
              style: { height: "auto", fontSize: "14px" },
            }}
            sx={{
              flex: 1,
              height: "auto",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
        </Box>
        <fieldset
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "10px",
            padding: "15px",
            border: "1px solid #cbd5e1",
            borderRadius: "5px",
          }}
        >
          <legend>Premiums</legend>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "5px",
            }}
          >
            <Button
              disabled={isAddOrEditMode}
              size="small"
              variant="contained"
              color="primary"
              onClick={() => {
                if (state.form_type.toLowerCase() === "com") {
                  return comComputation();
                }
                tplCompuation();
              }}
            >
              Compute
            </Button>
          </div>
          {state.form_type.toLowerCase() === "tpl" && (
            <TextField
              disabled={isAddOrEditMode}
              required
              fullWidth
              variant="outlined"
              size="small"
              label="Section I/II"
              name="SectionI_II"
              value={state.SectionI_II}
              onChange={(e) => {
                handleInputChange(e);
              }}
              onKeyDown={onKeyDownComputation}
              placeholder="0.00"
              InputProps={{
                inputComponent: NumericFormatCustom as any,
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                flex: 1,
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              onBlur={() => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "SectionI_II",
                  value: parseFloat(state.SectionI_II).toFixed(2),
                });
              }}
            />
          )}
          {state.form_type.toLowerCase() === "com" && (
            <React.Fragment>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: "10px",
                }}
              >
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Section III(%)"
                  name="SectionIII"
                  value={state.SectionIII}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "SectionIII",
                      value: parseFloat(state.SectionIII).toFixed(2),
                    });
                  }}
                />
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Own Damage"
                  name="OwnDamage"
                  value={state.OwnDamage}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "OwnDamage",
                      value: parseFloat(state.OwnDamage).toFixed(2),
                    });
                  }}
                />
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Theft"
                  name="Theft"
                  value={state.Theft}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "Theft",
                      value: parseFloat(state.Theft).toFixed(2),
                    });
                  }}
                />
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Section IV-A"
                  name="SectionIVA"
                  value={state.SectionIVA}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "SectionIVA",
                      value: parseFloat(state.SectionIVA).toFixed(2),
                    });
                  }}
                />
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Section IV-B"
                  name="SectionIVB"
                  value={state.SectionIVB}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "SectionIVB",
                      value: parseFloat(state.SectionIVB).toFixed(2),
                    });
                  }}
                />
                <TextField
                  disabled={isAddOrEditMode}
                  label="Other"
                  required
                  variant="outlined"
                  size="small"
                  name="PremiumOther"
                  value={state.PremiumOther}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "PremiumOther",
                      value: parseFloat(state.PremiumOther).toFixed(2),
                    });
                  }}
                />
              </div>
              <div
                style={{ display: "flex", gap: "5px", position: "relative" }}
              >
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  variant="outlined"
                  size="small"
                  label="AOG Percent"
                  name="AOGPercent"
                  value={state.AOGPercent}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    width: "80px",
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "AOGPercent",
                      value: parseFloat(state.AOGPercent).toFixed(2),
                    });
                  }}
                />
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  variant="outlined"
                  size="small"
                  label="AOG"
                  name="AOG"
                  value={state.AOG}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "AOG",
                      value: parseFloat(state.AOG).toFixed(2),
                    });
                  }}
                />
              </div>
            </React.Fragment>
          )}
          <Divider color="secondary" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: "10px",
            }}
          >
            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              label="Total Premium"
              name="TotalPremium"
              value={state.TotalPremium}
              InputProps={{
                inputComponent: NumericFormatCustom as any,
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                flex: 1,
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              onChange={(e) => {
                handleInputChange(e);
              }}
              onKeyDown={onKeyDownComputation}
              placeholder="0.00"
              onBlur={() => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "TotalPremium",
                  value: parseFloat(state.TotalPremium).toFixed(2),
                });
              }}
            />
            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              label="Vat"
              name="Vat"
              value={state.Vat}
              onChange={(e) => {
                handleInputChange(e);
              }}
              onKeyDown={onKeyDownComputation}
              placeholder="0.00"
              InputProps={{
                inputComponent: NumericFormatCustom as any,
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                flex: 1,
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              onBlur={() => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "Vat",
                  value: parseFloat(state.Vat).toFixed(2),
                });
              }}
            />

            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              label="Doc Stamp"
              name="DocStamp"
              value={state.DocStamp}
              onChange={(e) => {
                handleInputChange(e);
              }}
              onKeyDown={onKeyDownComputation}
              placeholder="0.00"
              InputProps={{
                inputComponent: NumericFormatCustom as any,
                style: { height: "27px", fontSize: "14px" },
              }}
              sx={{
                flex: 1,
                height: "27px",
                ".MuiFormLabel-root": { fontSize: "14px" },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
              onBlur={() => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "DocStamp",
                  value: parseFloat(state.DocStamp).toFixed(2),
                });
              }}
            />
            {state.form_type.toLowerCase() === "com" ? (
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  position: "relative",
                  width: "100%",
                }}
              >
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  variant="outlined"
                  size="small"
                  name="LocalGovTaxPercent"
                  value={state.LocalGovTaxPercent}
                  onChange={(e) => {
                    handleInputChange(e);
                  }}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    width: "80px",
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "LocalGovTaxPercent",
                      value: parseFloat(state.LocalGovTaxPercent).toFixed(2),
                    });
                  }}
                />
                <TextField
                  disabled={isAddOrEditMode}
                  required
                  variant="outlined"
                  size="small"
                  label="Local Gov Tax"
                  name="LocalGovTax"
                  value={state.LocalGovTax}
                  onChange={(e) => {
                    handleInputChange(e);
                  }}
                  onKeyDown={onKeyDownComputation}
                  placeholder="0.00"
                  InputProps={{
                    inputComponent: NumericFormatCustom as any,
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    width: "100%",
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                  onBlur={() => {
                    dispatch({
                      type: "UPDATE_FIELD",
                      field: "LocalGovTax",
                      value: parseFloat(state.LocalGovTax).toFixed(2),
                    });
                  }}
                />
              </div>
            ) : (
              <TextField
                disabled={isAddOrEditMode}
                required
                variant="outlined"
                size="small"
                label="Local Gov Tax"
                name="LocalGovTax"
                value={state.LocalGovTax}
                onChange={(e) => {
                  handleInputChange(e);
                }}
                onKeyDown={onKeyDownComputation}
                placeholder="0.00"
                InputProps={{
                  inputComponent: NumericFormatCustom as any,
                  style: { height: "27px", fontSize: "14px" },
                }}
                sx={{
                  width: "80px",
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
                onBlur={() => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "LocalGovTax",
                    value: parseFloat(state.LocalGovTax).toFixed(2),
                  });
                }}
              />
            )}
          </div>
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="StradCom"
            name="StradCom"
            value={state.StradCom}
            onChange={(e) => {
              handleInputChange(e);
            }}
            onKeyDown={onKeyDownComputation}
            placeholder="0.00"
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "50%",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "StradCom",
                value: parseFloat(state.StradCom).toFixed(2),
              });
            }}
          />
          <Divider color="secondary" />
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Total Due"
            name="TotalDue"
            value={state.TotalDue}
            onChange={handleInputChange}
            onKeyDown={onKeyDownComputation}
            placeholder="0.00"
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "50%",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "TotalDue",
                value: parseFloat(state.TotalDue).toFixed(2),
              });
            }}
          />
        </fieldset>
      </fieldset>
    </div>
  );
}
