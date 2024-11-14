import { useContext } from "react";
import { MSPRContext } from "../MSPRPolicy";
import { TextField, Divider, Button } from "@mui/material";
import { NumericFormatCustom } from "../../../../../../../../components/NumberFormat";

export default function MSPRPolicyPremium() {
  const {
    state,
    handleInputChange,
    computation,
    isAddOrEditMode,
    dispatch,
  } = useContext(MSPRContext);

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
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <fieldset
          style={{
            display: "flex",
            gap: "10px",
            padding: "15px",
            border: "1px solid #cbd5e1",
            borderRadius: "5px",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          <legend style={{ height: "22px" }}></legend>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
              flexGrow: 1,
            }}
          >
            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              label="Section I Insurance"
              name="sec1"
              value={state.sec1}
              onChange={handleInputChange}
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
                  field: "sec1",
                  value: parseFloat(state.sec1).toFixed(2),
                });
              }}
            />
            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              label="Section IB Insurance"
              name="sec2"
              value={state.sec2}
              onChange={handleInputChange}
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
                  field: "sec2",
                  value: parseFloat(state.sec2).toFixed(2),
                });
              }}
            />
            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              label="Section II Insurance"
              name="sec3"
              value={state.sec3}
              onChange={handleInputChange}
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
                  field: "sec3",
                  value: parseFloat(state.sec3).toFixed(2),
                });
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
              flexGrow: 1,
            }}
          >
            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              label="Premium"
              name="prem1"
              value={state.prem1}
              onChange={handleInputChange}
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
                  field: "prem1",
                  value: parseFloat(state.prem1).toFixed(2),
                });
              }}
            />
            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              label="Premium"
              name="prem2"
              value={state.prem2}
              onChange={handleInputChange}
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
                  field: "prem2",
                  value: parseFloat(state.prem2).toFixed(2),
                });
              }}
            />
            <TextField
              disabled={isAddOrEditMode}
              required
              variant="outlined"
              size="small"
              label="Premium"
              name="prem3"
              value={state.prem3}
              onChange={handleInputChange}
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
                  field: "prem3",
                  value: parseFloat(state.prem3).toFixed(2),
                });
              }}
            />
          </div>
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
          flexGrow: 1,
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
        <TextField
          disabled={isAddOrEditMode}
          required
          variant="outlined"
          size="small"
          label="Net Premium"
          name="netPremium"
          value={state.netPremium}
          onChange={handleInputChange}
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
              field: "netPremium",
              value: parseFloat(state.netPremium).toFixed(2),
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
            width: "100%",
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
            width: "100%",
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
        <div
          style={{
            display: "flex",
            gap: "5px",
            position: "relative",
          }}
        >
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
              width: "100%",
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
            width: "100%",
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
