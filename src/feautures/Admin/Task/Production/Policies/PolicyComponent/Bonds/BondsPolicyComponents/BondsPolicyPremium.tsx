import { useContext, useRef } from "react";
import { BondContext } from "../BondsPolicy";
import { TextField, Divider, Button } from "@mui/material";
import CustomDatePicker from "../../../../../../../../components/DatePicker";
import { NumericFormatCustom } from "../../../../../../../../components/NumberFormat";

export default function BondsPolicyPremium() {
  const {
    state,
    handleInputChange,
    customInputchange,
    computation,
    isAddOrEditMode,
    dispatch,
  } = useContext(BondContext);

  const officerDateIssuedRef = useRef<HTMLElement>(null);
  const insuranceDateIssuedRef = useRef<HTMLElement>(null);

  function onKeyDownComputation(e: any) {
    if (e.code === "NumpadEnter" || e.code === "Enter") {
      computation();
    }
  }

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
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
          <legend>Information for notary (Officer)</legend>
          <TextField
          
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Name"
            name="officerName"
            value={state.officerName}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
          
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Tax Certificate No."
            name="officerTaxCertNo"
            value={state.officerTaxCertNo}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Issued Location"
            name="officerIssuedLoc"
            value={state.officerIssuedLoc}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <CustomDatePicker
            disabled={isAddOrEditMode}
            label="Date Issued"
            onChange={(e: any) => {
              customInputchange(e, "officerDateIssued");
            }}
            value={new Date(state.officerDateIssued)}
            onKeyDown={(e: any) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                const timeout = setTimeout(() => {
                  officerDateIssuedRef.current
                    ?.querySelector("button")
                    ?.click();
                  clearTimeout(timeout);
                }, 150);
              }
            }}
            datePickerRef={officerDateIssuedRef}
            textField={{
              InputLabelProps: {
                style: {
                  fontSize: "14px",
                },
              },
              InputProps: {
                style: { height: "27px", fontSize: "14px" },
              },
            }}
          />
        </fieldset>
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
          <legend>Information for notary (Insurance Corp)</legend>
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Capacity as"
            name="insuranceCapacity"
            value={state.insuranceCapacity}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Tax Certificate No"
            name="insuranceOfficerTaxCert"
            value={state.insuranceOfficerTaxCert}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Issued Location"
            name="insuranceIssuedLoc"
            value={state.insuranceIssuedLoc}
            onChange={handleInputChange}
            InputProps={{
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
          />
          <CustomDatePicker
            disabled={isAddOrEditMode}
            label="Date Issued"
            onChange={(e: any) => {
              customInputchange(e, "insuranceDateIssued");
            }}
            value={new Date(state.insuranceDateIssued)}
            onKeyDown={(e: any) => {
              if (e.code === "Enter" || e.code === "NumpadEnter") {
                const timeout = setTimeout(() => {
                  insuranceDateIssuedRef.current
                    ?.querySelector("button")
                    ?.click();
                  clearTimeout(timeout);
                }, 150);
              }
            }}
            datePickerRef={insuranceDateIssuedRef}
            textField={{
              InputLabelProps: {
                style: {
                  fontSize: "14px",
                },
              },
              InputProps: {
                style: { height: "27px", fontSize: "14px" },
              },
            }}
          />
        </fieldset>
      </div>
      <fieldset
        style={{
          flexGrow: 1,
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
              computation();
            }}
          >
            Compute
          </Button>
        </div>

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
            label="Insured Value"
            name="insuredValue"
            value={state.insuredValue}
            onChange={handleInputChange}
            onKeyDown={onKeyDownComputation}
            placeholder="0.00"
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "insuredValue",
                value: parseFloat(state.insuredValue).toFixed(2),
              });
            }}
          />
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Percentage"
            name="percentagePremium"
            value={state.percentagePremium}
            onChange={handleInputChange}
            onKeyDown={onKeyDownComputation}
            placeholder="0.00"
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "percentagePremium",
                value: parseFloat(state.percentagePremium).toFixed(2),
              });
            }}
          />
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Total Premium"
            name="totalPremium"
            value={state.totalPremium}
            onChange={handleInputChange}
            onKeyDown={onKeyDownComputation}
            placeholder="0.00"
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "totalPremium",
                value: parseFloat(state.totalPremium).toFixed(2),
              });
            }}
          />
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Vat"
            name="vat"
            value={state.vat}
            onChange={handleInputChange}
            onKeyDown={onKeyDownComputation}
            placeholder="0.00"
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "vat",
                value: parseFloat(state.vat).toFixed(2),
              });
            }}
          />
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Doc Stamp"
            name="docStamp"
            value={state.docStamp}
            onChange={handleInputChange}
            onKeyDown={onKeyDownComputation}
            placeholder="0.00"
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "docStamp",
                value: parseFloat(state.docStamp).toFixed(2),
              });
            }}
          />
          <div style={{ display: "flex", gap: "5px", position: "relative" }}>
            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              name="localGovTaxPercent"
              value={state.localGovTaxPercent}
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
                  field: "localGovTaxPercent",
                  value: parseFloat(state.localGovTaxPercent).toFixed(2),
                });
              }}
            />
            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              label="Local Gov Tax"
              name="localGovTax"
              value={state.localGovTax}
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
                  field: "localGovTax",
                  value: parseFloat(state.localGovTax).toFixed(2),
                });
              }}
            />
          </div>
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Notary/Misc(umis)"
            name="umis"
            value={state.umis}
            onChange={handleInputChange}
            onKeyDown={onKeyDownComputation}
            placeholder="0.00"
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "umis",
                value: parseFloat(state.umis).toFixed(2),
              });
            }}
          />
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            label="Notary Misc(Principal)"
            name="principal"
            value={state.principal}
            onChange={handleInputChange}
            onKeyDown={onKeyDownComputation}
            placeholder="0.00"
            InputProps={{
              inputComponent: NumericFormatCustom as any,
              style: { height: "27px", fontSize: "14px" },
            }}
            sx={{
              width: "auto",
              height: "27px",
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
            onBlur={() => {
              dispatch({
                type: "UPDATE_FIELD",
                field: "principal",
                value: parseFloat(state.principal).toFixed(2),
              });
            }}
          />
        </div>
        <Divider sx={{ background: "black" }} />
        <TextField
          disabled={isAddOrEditMode}
          required
          variant="outlined"
          size="small"
          label="Total Due"
          name="totalDue"
          value={state.totalDue}
          onChange={handleInputChange}
          placeholder="0.00"
          InputProps={{
            inputComponent: NumericFormatCustom as any,
            style: { height: "27px", fontSize: "14px" },
          }}
          sx={{
            width: "auto",
            height: "27px",
            ".MuiFormLabel-root": { fontSize: "14px" },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
          }}
          onBlur={() => {
            dispatch({
              type: "UPDATE_FIELD",
              field: "totalDue",
              value: parseFloat(state.totalDue).toFixed(2),
            });
          }}
        />
      </fieldset>
    </div>
  );
}
