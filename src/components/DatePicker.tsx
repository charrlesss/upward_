import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers";
export default function CustomDatePicker({
  label,
  name,
  onChange,
  value,
  onKeyDown,
  inputRef,
  datePickerRef,
  fullWidth,
  textField,
  minWidth = "200px",
  ...rest
}: any) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
      floatingLabelStyle={{color: "black" }}
        value={value}
        onChange={onChange}
        ref={datePickerRef}
        slotProps={{
          textField: {
            size: "small",
            label,
            name,
            onKeyDown,
            inputRef: inputRef,
            fullWidth,

            ...textField,
          },
        }}
        InputLabelProps={{
          sx: {
            color: "black",
          },
        }}
        sx={{
          minWidth,
          fieldset: { borderColor: "black" },
          ".MuiFormLabel-root": { fontSize: "14px" },
          ".MuiFormLabel-root[data-shrink=false]": {
            top: "-5px",
          },
        }}
        {...rest}
      />
    </LocalizationProvider>
  );
}
