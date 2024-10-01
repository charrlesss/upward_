import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TimePicker } from "@mui/x-date-pickers";

export default function CustomTimePicker({
  label,
  name,
  onChange,
  value,
  onKeyDown,
  inputRef,
  datePickerRef,
  fullWidth,
  textField,
  ...rest
}: any) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        value={value}
        onChange={onChange}
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
        {...rest}
      />
    </LocalizationProvider>
  );
}
