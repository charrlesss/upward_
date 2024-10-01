import { HtmlHTMLAttributes, InputHTMLAttributes, useId } from "react";
import "../style/design.css";

export function TextInput({
  input,
  label,
  inputRef,
}: {
  inputRef?: React.RefObject<HTMLInputElement>;
  labelRef?: React.RefObject<HTMLLabelElement>;
  input: InputHTMLAttributes<HTMLInputElement>;
  label: HtmlHTMLAttributes<HTMLLabelElement>;
}) {
  const id = useId();
  return (
    <div
      style={{
        display: "flex",
        height: "18px",
        alignItems: "center",
      }}
    >
      <label {...label} htmlFor={id}>
        {label.title}
      </label>
      <input
        ref={inputRef}
        id={id}
        {...input}
        style={{
          height: "18px",
          ...input.style,
        }}
      />
    </div>
  );
}

export function SelectInput({
  select,
  label,
  selectRef,
  datasource = [],
  values = "",
  display = "",
}: {
  selectRef?: React.RefObject<HTMLSelectElement>;
  labelRef?: React.RefObject<HTMLLabelElement>;
  select: InputHTMLAttributes<HTMLSelectElement>;
  label: HtmlHTMLAttributes<HTMLLabelElement>;
  datasource: Array<any>;
  values: string;
  display: string;
}) {
  const id = useId();
  return (
    <div
      style={{
        display: "flex",
        height: "18px",
        alignItems: "center",
      }}
    >
      <label {...label} htmlFor={id}>
        {label.title}
      </label>
      <select
        {...select}
        ref={selectRef}
        className="select"
        style={{
          height: "18px",
          ...select.style,
        }}
      >
        {datasource.map((itm, idx) => {
          return (
            <option key={idx} value={itm[values]}>
              {itm[display]}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function ButtonField({
  buttonRetRef,
  button,
  tooltipText = "",
  children,
  disabled = false,
}: {
  buttonRetRef?: React.RefObject<HTMLButtonElement>;
  button: HtmlHTMLAttributes<HTMLButtonElement>;
  tooltipText: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="tooltip">
      <button
        disabled={disabled}
        {...button}
        ref={buttonRetRef}
        style={{ ...button.style, background:!disabled ? "transparent" : "#f1f1f1" }}
        className="tooltip-button"
      >
        {children}
      </button>
      {!disabled && <span className="tooltip-text">{tooltipText}</span>}
    </div>
  );
}
