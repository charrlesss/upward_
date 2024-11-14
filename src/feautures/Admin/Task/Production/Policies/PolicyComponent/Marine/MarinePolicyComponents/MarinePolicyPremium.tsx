import { useContext } from "react";
import { MarineContext } from "../MarinePolicy";
import { TextField, Divider, Button } from "@mui/material";
import { NumericFormatCustom } from "../../../../../../../../components/NumberFormat";

export default function MarinePolicyPremium() {
  const {
    state,
    handleInputChange,
    computation,
    isAddOrEditMode,
    dispatch,
  } = useContext(MarineContext);

  function onKeyDownComputation(e: any) {
    if (e.code === "NumpadEnter" || e.code === "Enter") {
      computation();
    }
  }

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          display: "flex",
          columnGap: "10px",

          flexDirection: "column",
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
          <legend>
            Clauses, Endorsements, Special Conditions and Warranties
          </legend>
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            name="prem_text_one"
            value={state.prem_text_one}
            multiline
            rows={5}
            onChange={handleInputChange}
          />
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            name="prem_text_two"
            value={state.prem_text_two}
            multiline
            rows={5}
            onChange={handleInputChange}
          />
        </fieldset>
      </div>
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
        </div>
        <Divider color="secondary" />
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
