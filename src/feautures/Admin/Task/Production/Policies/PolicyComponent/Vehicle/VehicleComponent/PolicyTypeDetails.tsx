import React, { useContext } from "react";
import { VehicleContext } from "../VehiclePolicy";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Autocomplete,
} from "@mui/material";
import { NumericFormatCustom } from "../../../../../../../../components/NumberFormat";
import { LoadingButton } from "@mui/lab";
const rateOption_ = [
  { Account: "0.00" },
  { Account: "50,000.00" },
  { Account: "75,000.00" },
  { Account: "100,000.00" },
  { Account: "150,000.00" },
  { Account: "200,000.00" },
  { Account: "250,000.00" },
  { Account: "300,000.00" },
];

// const compreTypeOption_ = [
//   { Account: "" },
//   { Account: "PRIVATE VEHICLE" },
//   { Account: "LIGHT AND MEDIUM VEHICLE" },
//   { Account: "HEAVY VEHICLE" },
//   { Account: "MC/TC-MOTORCYCLE/TRICYCLE" },
// ];

const tplTypeOption_ = [
  { Account: "", PremuimPaid: "0.00" },
  { Account: "LIGHT PRIVATE VEHICLE(1YR)", PremuimPaid: "447.01" },
  { Account: "MEDIUM PRIVATE VEHICLE(1YR)", PremuimPaid: "486.92" },
  { Account: "HEAVY PRIVATE VEHICLE(1YR)", PremuimPaid: "957.88" },
  {
    Account: "MC/TC - MOTORCYCLE/TRICYCLE(1YR)",
    PremuimPaid: "199.55",
  },
  { Account: "LIGHT PRIVATE VEHICLE(3YR)", PremuimPaid: "1285.14" },
  {
    Account: "MEDIUM PRIVATE VEHICLE(3YR)",
    PremuimPaid: "1396.89",
  },
  { Account: "HEAVY PRIVATE VEHICLE(3YR)", PremuimPaid: "2746.34" },
  {
    Account: "MC/TC - MOTORCYCLE/TRICYCLE(3YR)",
    PremuimPaid: "574.72",
  },
];

export default function PolicyTypeDetails() {
  const {
    state,
    handleInputChange,
    handleDateChange,
    showField,
    isAddOrEditMode,
    dispatch,
    tplCompuation,
    comComputation,
    parseStringToNumber,
    keySave,
    domination,
    isLoadingrates,
    user,
  } = useContext(VehicleContext);

  function onKeyDownComputation(e: any) {
    if (e.code === "NumpadEnter" || e.code === "Enter") {
      if (state.form_type.toLowerCase() === "com") {
        return comComputation();
      }
      tplCompuation();
    }
  }

  function calculateDeductible(value: any, vehicle: string, towing: string) {
    const EVSV = parseFloat(parseStringToNumber(value).replace(/,/g, ""));
    let Deductible = 0;
    if (EVSV <= 0) {
      handleInputChange({ target: { name: "Deductible", value: "0" } });
      autorizeRepairComputation(
        parseStringToNumber(Deductible.toFixed(2)),
        towing
      );
    }

    if (vehicle === "private") {
      Deductible = EVSV * 0.005;
    } else if (vehicle === "heavy") {
      Deductible = EVSV * 0.01;
    } else if (vehicle === "motorcycle") {
      Deductible = EVSV * 0.01;
    }

    if (Deductible < 2000) {
      Deductible = 2000;
    }

    handleInputChange({
      target: {
        name: "Deductible",
        value: parseStringToNumber(Deductible.toFixed(2)),
      },
    });
    autorizeRepairComputation(
      parseStringToNumber(Deductible.toFixed(2)),
      towing
    );
  }
  function autorizeRepairComputation(
    DeductibleInput: string,
    TowingInput: string
  ) {
    const Deductible = parseFloat(
      parseStringToNumber(DeductibleInput).replace(/,/g, "")
    );
    const Towing = parseFloat(
      parseStringToNumber(TowingInput).replace(/,/g, "")
    );

    handleInputChange({
      target: {
        name: "ARL",
        value: parseStringToNumber(
          (Math.abs(Deductible) + Math.abs(Towing)).toFixed(2)
        ),
      },
    });
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {state.form_type.toLowerCase() === "tpl" && (
        <React.Fragment>
          <Typography variant="h6" sx={{ marginY: "10px" }}>
            THIRD PARTY LIABILITY
          </Typography>
          <fieldset
            style={{
              display: "flex",
              gap: "10px",
              padding: "15px",
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
            }}
          >
            <legend>Section I/II</legend>
            <FormControl
              size="small"
              disabled={!showField.thirdparty || isAddOrEditMode}
              sx={{
                flex: 1,
                ".MuiFormLabel-root": {
                  fontSize: "14px",
                  background: "white",
                  zIndex: 99,
                  padding: "0 3px",
                },
                ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
              }}
            >
              <InputLabel id="Type">Type</InputLabel>
              <Select
                labelId="Type"
                value={state.TplType}
                label="Type"
                name="TplType"
                onChange={(e) => {
                  const selected: any = tplTypeOption_.filter(
                    (items) => items.Account === e.target.value
                  )[0];
                  handleInputChange(e);
                  handleDateChange(selected.PremuimPaid, "PremiumPaid");
                }}
                sx={{
                  height: "27px",
                  fontSize: "14px",
                }}
              >
                {[...tplTypeOption_].map((items: any, idx: number) => {
                  return (
                    <MenuItem key={idx} value={items.Account}>
                      {items.Account}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              disabled={isAddOrEditMode}
              variant="outlined"
              size="small"
              label="Premium Paid"
              name="PremiumPaid"
              value={state.PremiumPaid}
              onChange={(e) => {
                handleInputChange(e);
              }}
              placeholder="0.00"
              onBlur={() => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "PremiumPaid",
                  value: parseFloat(state.PremiumPaid).toFixed(2),
                });
              }}
              onKeyDown={onKeyDownComputation}
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
            />
          </fieldset>
        </React.Fragment>
      )}
      {state.form_type.toLowerCase() === "com" && (
        <React.Fragment>
          <Typography variant="h6" sx={{ marginY: "10px" }}>
            COMPREHENSEVE
          </Typography>
          <fieldset
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              gridArea: "content4",
              padding: "15px",
              border: "1px solid #cbd5e1",
              borderRadius: "5px",
            }}
          >
            <legend>Section III/IV</legend>
            <Box
              sx={(theme) => ({
                flex: 1,
                display: "flex",
                columnGap: "15px",
                flexDirection: "column",
                gap: "8px",
              })}
            >
              <TextField
                disabled={isAddOrEditMode}
                fullWidth
                variant="outlined"
                size="small"
                label="Estimated Value of Schedule Vehicle"
                name="EVSV"
                value={state.EVSV}
                onChange={(e) => {
                  calculateDeductible(
                    e.target.value,
                    state.vehicle,
                    state.Towing
                  );
                  handleInputChange(e);
                }}
                placeholder="0.00"
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputComponent: NumericFormatCustom as any,
                }}
                sx={{
                  flex: 1,
                  height: "27px",
                  ".MuiFormLabel-root": { fontSize: "14px" },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
                onKeyDown={onKeyDownComputation}
                onBlur={() => {
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "EVSV",
                    value: parseFloat(state.EVSV).toFixed(2),
                  });
                }}
              />
              <TextField
                onKeyDown={keySave}
                disabled={isAddOrEditMode}
                variant="outlined"
                size="small"
                label="Aircon"
                fullWidth
                name="Aircon"
                value={state.Aircon}
                onChange={handleInputChange}
                placeholder="0.00"
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputComponent: NumericFormatCustom as any,
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
                    field: "Aircon",
                    value: parseFloat(state.Aircon).toFixed(2),
                  });
                }}
              />
              <TextField
                onKeyDown={keySave}
                disabled={isAddOrEditMode}
                variant="outlined"
                size="small"
                label="Stereo"
                fullWidth
                name="Stereo"
                value={state.Stereo}
                onChange={handleInputChange}
                placeholder="0.00"
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputComponent: NumericFormatCustom as any,
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
                    field: "Stereo",
                    value: parseFloat(state.Stereo).toFixed(2),
                  });
                }}
              />
              <TextField
                onKeyDown={keySave}
                disabled={isAddOrEditMode}
                variant="outlined"
                size="small"
                label="Magwheels"
                fullWidth
                name="Magwheels"
                value={state.Magwheels}
                onChange={handleInputChange}
                placeholder="0.00"
                InputProps={{
                  style: { height: "27px", fontSize: "14px" },
                  inputComponent: NumericFormatCustom as any,
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
                    field: "Magwheels",
                    value: parseFloat(state.Magwheels).toFixed(2),
                  });
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <TextField
                  onKeyDown={keySave}
                  disabled={isAddOrEditMode}
                  variant="outlined"
                  size="small"
                  label="Others(Specify)"
                  fullWidth
                  name="OthersDesc"
                  value={state.OthersDesc}
                  onChange={handleInputChange}
                  InputProps={{
                    style: { height: "27px", fontSize: "14px" },
                  }}
                  sx={{
                    flex: 1,
                    height: "27px",
                    ".MuiFormLabel-root": { fontSize: "14px" },
                    ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "3px",
                    backgroundColor: "black",
                    boxSizing: "border-box",
                  }}
                ></div>
                <TextField
                  onKeyDown={keySave}
                  disabled={isAddOrEditMode}
                  variant="outlined"
                  size="small"
                  name="OthersRate"
                  value={state.OthersRate}
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
                      field: "OthersRate",
                      value: parseFloat(state.OthersRate).toFixed(2),
                    });
                  }}
                />
              </div>
              {/* <FormControl
                disabled={isAddOrEditMode}  
                size="small"
                sx={{
                  flex: 1,
                  ".MuiFormLabel-root": {
                    fontSize: "14px",
                    background: "white",
                    zIndex: 99,
                    padding: "0 3px",
                  },
                  ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                }}
              >
                <InputLabel id="Type">Type</InputLabel>
                <Select
                  labelId="Type"
                  value={state.CompreType}
                  label="Type"
                  name="CompreType"
                  onChange={handleInputChange}
                  sx={{
                    height: "27px",
                    fontSize: "14px",
                  }}
                >
                  {compreTypeOption_.map((items: any, idx: number) => {
                    return (
                      <MenuItem key={idx} value={items.Account}>
                        {items.Account}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl> */}
            </Box>
            <Box sx={{ display: "flex", columnGap: "10px", flex: 1 }}>
              <Box sx={{ display: "flex", columnGap: "10px", flex: 1 }}>
                <fieldset
                  style={
                    {
                      flex: 1,
                      padding: "15px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "5px",
                    } as any
                  }
                >
                  <div style={{ display: "flex", columnGap: "4px" }}>
                    <FormControl
                      size="small"
                      disabled={isAddOrEditMode}
                      sx={{
                        width: "100px",
                        ".MuiFormLabel-root": {
                          fontSize: "14px",
                          background: "white",
                          zIndex: 99,
                          padding: "0 3px",
                        },
                        ".MuiFormLabel-root[data-shrink=false]": {
                          top: "-5px",
                        },
                      }}
                    >
                      <InputLabel id="vehicle">Vehicle</InputLabel>
                      <Select
                        labelId="vehicle"
                        value={state.vehicle}
                        label="Vehicle"
                        name="vehicle"
                        onChange={(e) => {
                          calculateDeductible(
                            state.EVSV,
                            e.target.value,
                            state.Towing
                          );
                          handleInputChange(e);
                        }}
                        sx={{
                          height: "27px",
                          fontSize: "14px",
                        }}
                      >
                        <MenuItem value={"private"}>Private</MenuItem>
                        <MenuItem value={"heavy"}>Heavy</MenuItem>
                        <MenuItem value={"motorcycle"}>Motorcycle</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      onKeyDown={keySave}
                      disabled={isAddOrEditMode}
                      variant="outlined"
                      size="small"
                      label="Deductible"
                      fullWidth
                      name="Deductible"
                      value={state.Deductible}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      InputProps={{
                        inputComponent: NumericFormatCustom as any,
                        style: { height: "27px", fontSize: "14px" },
                      }}
                      sx={{
                        marginBottom: "10px",
                        flex: 1,
                        height: "27px",
                        ".MuiFormLabel-root": { fontSize: "14px" },
                        ".MuiFormLabel-root[data-shrink=false]": {
                          top: "-5px",
                        },
                      }}
                      onBlur={() => {
                        dispatch({
                          type: "UPDATE_FIELD",
                          field: "Deductible",
                          value: parseFloat(state.Deductible).toFixed(2),
                        });
                      }}
                    />
                  </div>

                  <TextField
                    onKeyDown={keySave}
                    disabled={isAddOrEditMode}
                    variant="outlined"
                    size="small"
                    label="Towing"
                    fullWidth
                    name="Towing"
                    value={state.Towing}
                    onChange={(e) => {
                      autorizeRepairComputation(
                        state.Deductible,
                        e.target.value
                      );
                      handleInputChange(e);
                    }}
                    placeholder="0.00"
                    InputProps={{
                      inputComponent: NumericFormatCustom as any,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    sx={{
                      marginBottom: "10px",
                      flex: 1,
                      height: "27px",
                      ".MuiFormLabel-root": { fontSize: "14px" },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                    onBlur={() => {
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "Towing",
                        value: parseFloat(state.Towing).toFixed(2),
                      });
                    }}
                  />
                  <TextField
                    onKeyDown={keySave}
                    disabled={isAddOrEditMode}
                    variant="outlined"
                    size="small"
                    label="Authorized Repair Limit"
                    fullWidth
                    name="ARL"
                    value={state.ARL}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    InputProps={{
                      inputComponent: NumericFormatCustom as any,
                      style: { height: "27px", fontSize: "14px" },
                    }}
                    sx={{
                      marginBottom: "10px",
                      flex: 1,
                      height: "27px",
                      ".MuiFormLabel-root": { fontSize: "14px" },
                      ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
                    }}
                    onBlur={() => {
                      dispatch({
                        type: "UPDATE_FIELD",
                        field: "ARL",
                        value: parseFloat(state.ARL).toFixed(2),
                      });
                    }}
                  />
                </fieldset>
                <fieldset
                  style={
                    {
                      flex: 1,
                      padding: "15px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "5px",
                    } as any
                  }
                >
                  <Autocomplete
                    disabled={isAddOrEditMode}
                    value={state.BodyInjury}
                    onChange={(event: any, value: string | null) => {
                      handleInputChange({
                        target: { name: "BodyInjury", value },
                      });
                    }}
                    size="small"
                    freeSolo
                    disableClearable
                    options={rateOption_.map((option: any) => option.Account)}
                    getOptionLabel={(option: any) => option}
                    sx={(theme) => ({
                      height: "27px",
                      marginBottom: "10px",
                      "& .MuiAutocomplete-inputRoot": {
                        flexWrap: "nowrap !important",
                      },
                    })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Bodily Injury"
                        name="BodyInjury"
                        sx={{
                          height: "27px",
                        }}
                        InputProps={{
                          ...params.InputProps,
                          type: "search",
                          style: { height: "27px", fontSize: "14px" },
                        }}
                        onChange={(e) => {
                          const number: number = parseFloat(
                            e.target.value.replace(/,/g, "")
                          );
                          if (isNaN(number)) {
                            return handleInputChange(e);
                          }
                          const formattedNumberUS =
                            number.toLocaleString("en-US");
                          e.target.value = formattedNumberUS;
                          handleInputChange(e);
                        }}
                        onBlur={() => {
                          if (
                            isNaN(
                              parseFloat(state.BodyInjury.replace(/,/g, ""))
                            )
                          ) {
                            return dispatch({
                              type: "UPDATE_FIELD",
                              field: "BodyInjury",
                              value: "0.00",
                            });
                          }
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "BodyInjury",
                            value: parseFloat(
                              state.BodyInjury.replace(/,/g, "")
                            ).toLocaleString("en-US", {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }),
                          });
                        }}
                      />
                    )}
                  />
                  <Autocomplete
                    disabled={isAddOrEditMode}
                    value={state.PropertyDamage}
                    onChange={(event: any, value: string | null) => {
                      handleInputChange({
                        target: { name: "PropertyDamage", value },
                      });
                    }}
                    size="small"
                    freeSolo
                    disableClearable
                    options={rateOption_.map((option: any) => option.Account)}
                    getOptionLabel={(option: any) => option}
                    sx={(theme) => ({
                      height: "27px",
                      marginBottom: "10px",
                      "& .MuiAutocomplete-inputRoot": {
                        flexWrap: "nowrap !important",
                      },
                    })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Property Damage"
                        name="PropertyDamage"
                        sx={{
                          height: "27px",
                        }}
                        InputProps={{
                          ...params.InputProps,
                          type: "search",
                          style: { height: "27px", fontSize: "14px" },
                        }}
                        onChange={(e) => {
                          const number: number = parseFloat(
                            e.target.value.replace(/,/g, "")
                          );
                          if (isNaN(number)) {
                            return handleInputChange(e);
                          }
                          const formattedNumberUS =
                            number.toLocaleString("en-US");
                          e.target.value = formattedNumberUS;
                          handleInputChange(e);
                        }}
                        onBlur={() => {
                          if (
                            isNaN(
                              parseFloat(state.PropertyDamage.replace(/,/g, ""))
                            )
                          ) {
                            return dispatch({
                              type: "UPDATE_FIELD",
                              field: "PropertyDamage",
                              value: "0.00",
                            });
                          }
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "PropertyDamage",
                            value: parseFloat(
                              state.PropertyDamage.replace(/,/g, "")
                            ).toLocaleString("en-US", {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }),
                          });
                        }}
                      />
                    )}
                  />
                  <Autocomplete
                    disabled={isAddOrEditMode}
                    value={state.PersinalAccident}
                    onChange={(event: any, value: string | null) => {
                      handleInputChange({
                        target: { name: "PersinalAccident", value },
                      });
                    }}
                    size="small"
                    freeSolo
                    disableClearable
                    options={rateOption_.map((option: any) => option.Account)}
                    getOptionLabel={(option: any) => option}
                    sx={(theme) => ({
                      height: "27px",
                      marginBottom: "10px",
                      "& .MuiAutocomplete-inputRoot": {
                        flexWrap: "nowrap !important",
                      },
                    })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Personal Accident"
                        name="PersinalAccident"
                        sx={{
                          height: "27px",
                        }}
                        InputProps={{
                          ...params.InputProps,
                          type: "search",
                          style: { height: "27px", fontSize: "14px" },
                        }}
                        onChange={(e) => {
                          const number: number = parseFloat(
                            e.target.value.replace(/,/g, "")
                          );
                          if (isNaN(number)) {
                            return handleInputChange(e);
                          }
                          const formattedNumberUS =
                            number.toLocaleString("en-US");
                          e.target.value = formattedNumberUS;
                          handleInputChange(e);
                        }}
                        onBlur={() => {
                          if (
                            isNaN(
                              parseFloat(
                                state.PersinalAccident.replace(/,/g, "")
                              )
                            )
                          ) {
                            return dispatch({
                              type: "UPDATE_FIELD",
                              field: "PersinalAccident",
                              value: "0.00",
                            });
                          }
                          dispatch({
                            type: "UPDATE_FIELD",
                            field: "PersinalAccident",
                            value: parseFloat(
                              state.PersinalAccident.replace(/,/g, "")
                            ).toLocaleString("en-US", {
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }),
                          });
                        }}
                      />
                    )}
                  />
                </fieldset>
              </Box>
            </Box>
          </fieldset>
        </React.Fragment>
      )}
      <br />
      {isLoadingrates ? (
        <LoadingButton loading={isLoadingrates} />
      ) : (
        <FormControl
          disabled={isAddOrEditMode || state.PolicyAccount === ""}
          fullWidth
          size="small"
          sx={{
            width: "300px",
            ".MuiFormLabel-root": {
              fontSize: "14px",
              background: "white",
              zIndex: 99,
              padding: "0 3px",
            },
            ".MuiFormLabel-root[data-shrink=false]": { top: "-5px" },
          }}
        >
          <InputLabel id="Denomination">Domination</InputLabel>
          <Select
            disabled={
              state.form_action === "TEMP" && user?.department === "UCSMI"
            }
            labelId="Denomination"
            value={state.Denomination}
            label="Denomination"
            name="Denomination"
            onChange={handleInputChange}
            sx={{
              height: "27px",
              fontSize: "14px",
            }}
          >
            {domination.map((items: any, idx: number) => {
              return (
                <MenuItem key={idx} value={items.type}>
                  {items.type}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}
    </div>
  );
}
