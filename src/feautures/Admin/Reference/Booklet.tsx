import { useRef } from "react";
import PageHelmet from "../../../components/Helmet";
import { TextInput } from "../../../components/UpwardFields";

export default function Booklet() {
  const bookRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <PageHelmet title="Petty Cash Transaction" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          flex: 1,
          padding: "5px",
          position: "relative",
        }}
      >
        <TextInput
          containerClassName="custom-input"
          label={{
            title: "book : ",
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              width: "100px",
            },
          }}
          input={{
            type: "text",
            style: { width: "500px" },
            onKeyDown: (e) => {
              if (e.code === "NumpadEnter" || e.code === "Enter") {
                e.preventDefault();
              }
            },
          }}
          inputRef={bookRef}
        />
      </div>
    </>
  );
}
