import React, { useContext, useRef } from "react";
import PageHelmet from "../../../components/Helmet";
import { Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { TextInput } from "../../../components/UpwardFields";
import { DataGridViewReactUpgraded } from "../../../components/UpgradeComponent";
import { useMutation } from "react-query";
import { AuthContext } from "../../../components/AuthContext";
import { wait } from "@testing-library/user-event/dist/utils";
import { Loading } from "../../../components/Loading";
import { format } from "date-fns";

export default function Booklet() {
  const { myAxios, user } = useContext(AuthContext);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<any>(null);

  const { mutate: mutateSearch, isLoading: loadingSearch } = useMutation({
    mutationKey: "practice-journal",
    mutationFn: async (variables: any) => {
      return await myAxios.post("/reference/practice-journal", variables, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess: (response) => {
      if (response.data.success) {
        console.log(response.data);
        wait(100).then(() => {
          tableRef.current.setDataFormated(
            response.data.data.map((itm: any) => {
              itm.DateIssued = format(new Date(itm.DateIssued), "MM/dd/yyyy");
              return itm;
            })
          );
        });
      }
    },
  });

  return (
    <>
      {loadingSearch && <Loading />}
      <PageHelmet title="Booklet" />
      <Button
        variant="contained"
        sx={{
          width: "200px",
        }}
        onClick={() => {
          mutateSearch({});
        }}
      >
        Search
      </Button>
      <div
        style={{
          padding: "5px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TextInput
          containerClassName="custom-input"
          containerStyle={{
            width: "550px",
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
                // mutateSearch({ search: e.currentTarget.value });
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                tableRef.current.focusFirstRowColumn();
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
              // mutateSearch({ search: inputSearchRef.current.value });
            }
          }}
          inputRef={inputSearchRef}
        />
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
            containerStyle={{
              flex: 1,
              height: "auto",
            }}
            ref={tableRef}
            columns={[
              { key: "IDNo", label: "ID No.", width: 150 },
              { key: "Account", label: "Account", width: 150 },
              { key: "SubAcct", label: "Sub Acct", width: 150 },
              { key: "PolicyType", label: "Policy Type", width: 150 },
              { key: "PolicyNo", label: "Policy No", width: 150 },
              { key: "DateIssued", label: "Date Issued", width: 150 },
              { key: "TotalPremium", label: "Total Premium", width: 200 },
              { key: "Vat", label: "Vat", width: 150 },
              { key: "DocStamp", label: "DocS tamp", width: 150 },
              { key: "FireTax", label: "Fire Tax", width: 150 },
              { key: "LGovTax", label: "LGovTax", width: 150 },
              { key: "Notarial", label: "Notarial", width: 150 },
            ]}
            height="280px"
            getSelectedItem={(rowItm: any) => {
              if (rowItm) {
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
