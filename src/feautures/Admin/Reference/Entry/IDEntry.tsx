import { useState, lazy, Suspense } from "react";
import { Box, Chip } from "@mui/material";
import useUrlParams from "../../../../hooks/useUrlParams";
import { User } from "../../../../components/AuthContext";
import { AxiosInstance } from "axios";
import LoaderCircular from "../../../../components/LoaderCircular";

type classificationType =
  | "Client"
  | "Employee"
  | "Agent"
  | "Fixed Assets"
  | "Supplier"
  | "Others";

const Client = lazy(() => import("./EntryComponents/Client"));
const Employee = lazy(() => import("./EntryComponents/Employee"));
const Agent = lazy(() => import("./EntryComponents/Agent"));
const FixedAssets = lazy(() => import("./EntryComponents/FixedAssets"));
const Supplier = lazy(() => import("./EntryComponents/Supplier"));
const Others = lazy(() => import("./EntryComponents/Others"));

const components = [
  {
    component: <Client />,
    classification: "Client",
  },
  {
    component: <Employee />,
    classification: "Employee",
  },
  {
    component: <Agent />,
    classification: "Agent",
  },
  {
    component: <FixedAssets />,
    classification: "Fixed Assets",
  },
  {
    component: <Supplier />,
    classification: "Supplier",
  },
  {
    component: <Others />,
    classification: "Others",
  },
];

function GetComponentByClassfication(classification: string) {
  return components.filter((item) =>
    item.classification.includes(classification)
  )[0].component;
}

function LoadingEntry() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: "0",
        bottom: "0",
        left: "0",
        right: "0",
        background:"#F1F1F1"
      }}
    >
      <div>
        <LoaderCircular open />
      </div>
    </div>
  );
}

export default function IDEntry() {
  const { searchParams, setSearchParams } = useUrlParams();
  const [renderComponent, setRenderComponent] = useState<JSX.Element | null>(
    GetComponentByClassfication(searchParams.get("classification") as string)
  );

  const classification = searchParams.get(
    "classification"
  ) as classificationType;

  const handleClick = (e: any) => {
    setSearchParams((prev) => {
      prev.set("selected", "");
      prev.set("classification", e.target.textContent);
      return prev;
    });
    setRenderComponent(GetComponentByClassfication(e.target.textContent));
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "5px"
      }}
    >
      <Box>
        {/* <Typography variant="h5" sx={{ marginBottom: "10px" }}>
          Identification Detail
        </Typography> */}
        <ChipsButton
          classification={classification}
          ClassificationData={components}
          handleClick={handleClick}
          disabled={false}
        />
      </Box>
      <Suspense fallback={<LoadingEntry />}>{renderComponent}</Suspense>
    </Box>
  );
}

export async function RequestNewID(
  myAxios: AxiosInstance,
  user: User | null,
  data: { sign: string; type: string }
) {
  return await myAxios.post("/reference/id-entry-generate-id", data, {
    headers: { Authorization: `Bearer ${user?.accessToken}` },
  });
}

function ChipsButton({
  handleClick,
  ClassificationData,
  classification,
  disabled,
}: {
  handleClick: any;
  ClassificationData: Array<{ classification: string }>;
  classification: string;
  disabled?: boolean;
}) {
  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        columnGap: "5px",
        marginBottom: "12px",
        [theme.breakpoints.down("md")]: {
          flexWrap: "wrap",
          width: "100%",
          gap: "5px",
          marginBottom: "10px",
        },
      })}
    >
      {ClassificationData.map((item, idx) => {
        return (
          <Chip
            disabled={item.classification.includes(classification) || disabled}
            color={
              item.classification.includes(classification) ? "error" : "default"
            }
            label={item.classification}
            key={idx}
            variant="outlined"
            onClick={handleClick}
          />
        );
      })}
    </Box>
  );
}
