import { HtmlHTMLAttributes, InputHTMLAttributes, useId, ReactNode } from "react";
import "../style/design.css";


interface TextInputProps {
  input: InputHTMLAttributes<HTMLInputElement>;
  label: HtmlHTMLAttributes<HTMLLabelElement>;
  inputRef?: React.RefObject<HTMLInputElement>;
  icon?: ReactNode; // New prop for the icon
  iconPosition?: 'start' | 'end'; // New prop to choose icon position
  onIconClick?: React.MouseEventHandler<HTMLDivElement> | undefined
}

export function TextInput({
  input,
  label,
  inputRef,
  icon,
  iconPosition = 'end', // Default position is 'end'
  onIconClick = (e) => { }
}: TextInputProps) {
  const id = useId();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative', // Enable absolute positioning for icon
      }}
    >
      <label {...label} htmlFor={id}>
        {label.title}
      </label>
      {icon && iconPosition === 'start' && (
        <div style={{ position: 'absolute', left: '8px', zIndex: 1 }}>
          {icon}
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        {...input}
        style={{
          height: '100%',
          ...input.style,
        }}
      />
      {icon && iconPosition === 'end' && (
        <div onClick={onIconClick}
          style={{
            position: 'absolute',
            right: '2px',
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:"white"
          }}>
          {icon}
        </div>

      )
      }
    </div >
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
        style={{ ...button.style, background: !disabled ? "transparent" : "#f1f1f1" }}
        className="tooltip-button"
      >
        {children}
      </button>
      {!disabled && <span className="tooltip-text">{tooltipText}</span>}
    </div>
  );
}
