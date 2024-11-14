import React, { useContext } from "react";
import { FireContext } from "../FirePolicy";
import {
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import { NumericFormatCustom } from "../../../../../../../../components/NumberFormat";
import { useQuery } from "react-query";
import { LoadingButton } from "@mui/lab";

export default function FirePolicyPremium() {
  const {
    state,
    handleInputChange,
    computation,
    isAddOrEditMode,
    dispatch,
    myAxios,
    user,
  } = useContext(FireContext);

  const { data: dataMortgagee, isLoading: isLoadingMortgagee } = useQuery({
    queryKey: "search-mortgagee",
    queryFn: async () =>
      await myAxios.get(
        `/task/production/search-mortgagee?mortgageeSearch=FIRE`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      ),
  });

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
          <legend>Mortgage</legend>
          {isLoadingMortgagee ? (
            <LoadingButton loading={isLoadingMortgagee} />
          ) : (
            <FormControl
              size="small"
              required
              disabled={isAddOrEditMode}
              sx={{
                width: "100%",
                maxWidth: "500px",
                ".MuiFormLabel-root": {
                  fontSize: "14px",
                  background: "white",
                  zIndex: 99,
                  padding: "0 3px",
                },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            >
              <Select
                id="Mortgagee_id"
                labelId="Mortgagee"
                value={state.mortgage}
                name="mortgage"
                onChange={handleInputChange}
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
              >
                {[{ Mortgagee: "" }, ...dataMortgagee.data.mortgagee].map(
                  (items: any, idx: number) => {
                    return (
                      <MenuItem key={idx} value={items.Mortgagee}>
                        {items.Mortgagee}
                      </MenuItem>
                    );
                  }
                )}
              </Select>
            </FormControl>
          )}
        </fieldset>
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
          <legend>Warranties</legend>
          <TextField
            disabled={isAddOrEditMode}
            required
            variant="outlined"
            size="small"
            name="warranties"
            value={state.warranties}
            multiline
            rows={10}
            onChange={(e) => {
              handleInputChange(e);
            }}
            InputProps={{
              style: { flexGrow: 1, fontSize: "14px" },
            }}
            sx={{
              ".MuiFormLabel-root": { fontSize: "14px" },
              ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
            }}
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
                  field: "localGovTax",
                  value: parseFloat(state.localGovTax).toFixed(2),
                });
              }}
            />
          </div>
        </div>
        <TextField
          disabled={isAddOrEditMode}
          required
          variant="outlined"
          size="small"
          label="F.S Tax"
          name="fsTax"
          value={state.fsTax}
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
            height: "27px",
            ".MuiFormLabel-root": { fontSize: "14px" },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
          }}
          onBlur={() => {
            dispatch({
              type: "UPDATE_FIELD",
              field: "fsTax",
              value: parseFloat(state.fsTax).toFixed(2),
            });
          }}
        />
        <hr style={{ border: "1px solid #94a3b8", width: "100%" }} />
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
            flex: 1,
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
