import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../../components/AuthContext";
import { useMutation } from "react-query";
import { wait } from "../../../lib/wait";
import PageHelmet from "../../../components/Helmet";
import { TextInput } from "../../../components/UpwardFields";
import SearchIcon from "@mui/icons-material/Search";
import { DataGridViewReactUpgraded } from "../../../components/DataGridViewReact";
import { Loading } from "../../../components/Loading";
import "../../../style/monbileview/reference/reference.css";

export const bankColumn = [
  { key: "PolicyNo", label: "PolicyNo", width: 120 },
  { key: "TemporaryPolicy", label: "Temp Policy", width: 100 },
  { key: "Name", label: "Name", width: 250 },
  { key: "IDNo", label: "ID No", width: 120 },
  { key: "DateFrom", label: "Date From", width: 100 },
  { key: "DateTo", label: "Date To", width: 100 },
  { key: "Account", label: "Account", width: 150 },
  { key: "ChassisNo", label: "Chassis No", width: 200 },
  { key: "MotorNo", label: "Motor No", width: 200 },
  { key: "PlateNo", label: "Plate No", width: 200 },
  { key: "Color", label: "Color", width: 200 },
  { key: "BodyType", label: "Body Type", width: 200 },
  { key: "Make", label: "Make", width: 200 },
  { key: "Model", label: "Model", width: 200 },
];

export default function RegtoTpViewer() {
  const { myAxios, user } = useContext(AuthContext);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<any>(null);

  const { mutate: mutateSearch, isLoading: loadingSearch } = useMutation({
    mutationKey: "search-tp-to-reg-viewer",
    mutationFn: async (variables: any) => {
      return await myAxios.post(
        "/task/production/search-tp-to-reg-viewer",
        variables,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        }
      );
    },
    onSuccess: (response) => {
      if (response.data.success) {
        console.log(response.data);
        wait(100).then(() => {
          tableRef.current.setData(response.data.data);
        });
      }
    },
  });

  useEffect(() => {
    mutateSearch({ search: "" });
  }, [mutateSearch]);

  return (
    <>
      {loadingSearch && <Loading />}
      <PageHelmet title="Reg - TP Viewer" />
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
        <div
          style={{
            marginTop: "10px",
            marginBottom: "12px",
            width: "100%",
            display: "flex",
            columnGap: "7px",
          }}
        >
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "550px",
              marginRight: "20px",
            }}
            label={{
              title: "Search: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "50px",
              },
            }}
            input={{
              className: "search-input-up-on-key-down",
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  mutateSearch({ search: e.currentTarget.value });
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const datagridview = document.querySelector(
                    ".grid-container"
                  ) as HTMLDivElement;
                  datagridview.focus();
                }
              },
              style: { width: "500px" },
            }}
            icon={
              <SearchIcon
                sx={{
                  fontSize: "18px",
                }}
              />
            }
            onIconClick={(e) => {
              e.preventDefault();
              if (inputSearchRef.current) {
                mutateSearch({ search: inputSearchRef.current.value });
              }
            }}
            inputRef={inputSearchRef}
          />
        </div>
        <div
          style={{
            marginTop: "10px",
            width: "100%",
            position: "relative",
            flex: 1,
            display: "flex",
          }}
        >
          <DataGridViewReactUpgraded
            ref={tableRef}
            adjustVisibleRowCount={120}
            columns={bankColumn}
            handleSelectionChange={(rowItm: any) => {}}
          />
        </div>
      </div>
    </>
  );
}
