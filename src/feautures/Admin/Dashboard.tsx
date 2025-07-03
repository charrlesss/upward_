import { useEffect, useState, useRef } from "react";
import { myAxios } from "../../lib/axios";
import { useContext } from "react";
import { AuthContext } from "../../components/AuthContext";
import "../../style/dashboard.css";
import PageHelmet from "../../components/Helmet";
import {
  DataGridViewReact,
  DataGridViewReactUpgraded,
} from "../../components/DataGridViewReact";
import { useMutation } from "react-query";
import { Loading } from "../../components/Loading";

const policyColumn = [
  { key: "AssuredName", label: "Assured Name", width: 300 },
  { key: "PolicyNo", label: "Policy No.", width: 200 },
  {
    key: "InsuredValue",
    label: "Insured Value",
    width: 120,
    type: "number",
  },
  { key: "unit", label: "Unit", width: 270 },
  { key: "ChassisNo", label: "Chassis No.", width: 160 },
  { key: "DateExpired", label: "Date Expired", width: 100 },
];

const tabs = [
  {
    id: 0,
    label: "TPL Policy",
    policy: "TPL",
  },
  {
    id: 1,
    label: "COM Policy",
    policy: "COM",
  },
  {
    id: 2,
    label: "CGL Policy",
    policy: "CGL",
  },
  {
    id: 3,
    label: "FIRE Policy",
    policy: "FIRE",
  },
  {
    id: 4,
    label: "MAR Policy",
    policy: "MAR",
  },
  {
    id: 5,
    label: "PA Policy",
    policy: "PA",
  },
];

export default function Dashboard() {
  const { myAxios, user } = useContext(AuthContext);
  const tableRef = useRef<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [buttonPosition, setButtonPosition] = useState<any>({});
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const { mutate: mutateSearchPolicy, isLoading: isLoadingSearchPolicy } =
    useMutation({
      mutationKey: "search-policy",
      mutationFn: async (variables: any) => {
        return await myAxios.post("/get-renewal-this-month", variables, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
      },
      onSuccess: (res) => {
        tableRef.current.setData(res?.data.renewal);
      },
    });

  const mutateSearchPolicyRef = useRef<any>(mutateSearchPolicy);

  useEffect(() => {
    mutateSearchPolicyRef.current({
      policy: "TPL",
    });
  }, []);

  return (
    <>
      {isLoadingSearchPolicy && <Loading />}
      <div
        id="main"
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "5px",
          background: "#F1F1F1",
        }}
      >
        <PageHelmet title={"Dashboard"} />
        <p
          style={{
            padding: 0,
            margin: 0,
            fontFamily: "fantasy",
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          Renewal Notice
        </p>
        <div
          className="dashboard-button-selection"
          style={{
            width: "auto",
            margin: "0px auto",
            height: "auto",
            borderRadius: "10px",
            boxShadow: " -1px 3px 10px -3px rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            columnGap: "10px",
            background: "white",
            padding: "7px 10px",
            boxSizing: "border-box",
            transition: "all 250ms",
          }}
        >
          {tabs.map((tab, index) => (
            <button
              ref={(el) => (buttonsRef.current[index] = el)}
              key={tab.id}
              onClick={(el) => {
                setActiveTab(tab.id);
                setButtonPosition(el.currentTarget.getBoundingClientRect());
                mutateSearchPolicyRef.current({
                  policy: tab.policy,
                });
              }}
              style={{
                width: "auto",
                fontSize: "11px",
                padding: "7px",
                cursor: "pointer",
                backgroundColor:
                  activeTab === tab.id ? "#0074cc" : "transparent",
                color: activeTab === tab.id ? "white" : "#000",
                border: "none",
                textTransform: "uppercase",
                fontWeight: "bold",
                borderRadius: "5px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          style={{
            marginTop: "10px",
            width: "100%",
            position: "relative",
            flex: 1,
            display: "flex",
            borderRadius: "5px",
            // border:"1px solid red",
            padding: "5px",
            boxSizing: "border-box",
          }}
        >
          <DataGridViewReactUpgraded
            ref={tableRef}
            adjustVisibleRowCount={200}
            columns={policyColumn}
            handleSelectionChange={(rowItm: any) => {}}
          />
        </div>

        {/* <div
          style={{
            display: "flex",
            padding: 0,
            margin: 0,
          }}
        >
         
          <div
            className="desktop-title"
            style={{
              flex: 1,
              borderTop: "1px solid #64748b",
              borderRight: "1px solid #64748b",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#3EA1E2",
              color: "white",
            }}
          >
            RENEWAL NOTICE
          </div>
        </div> */}
        {/* <div
          style={{
            // padding: "7px",
            flex: 1,
            display: "flex",
            // borderTop: "2px solid #007BFF",
            position: "relative",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: 0,
              width: `${(buttonPosition?.left as number) - 5 || 0}px`,
              height: "1px",
              background: "#64748b",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              top: "-20px",
              right: 0,
              left: `${(buttonPosition?.right as number) - 5 || 0}px`,
              height: "1px",
              background: "#64748b",
            }}
          ></div>
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
            }}
          >
            <DataGridViewReact
              containerStyle={{
                flex: 1,
                height: "auto",
              }}
              ref={tableRef}
              width="100%"
              height="350px"
              columns={policyColumn}
              getSelectedItem={(
                rowItm: any,
                colItm: any,
                rowIdx: any,
                colIdx: any
              ) => {}}
              onKeyDown={(rowSelected: any, RowIndex: any, e: any) => {}}
            />
          </div>
        </div> */}
      </div>
    </>
  );
}
