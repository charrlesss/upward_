import { useEffect, useState, useRef } from "react";
import { myAxios } from "../../lib/axios";
import { useContext } from "react";
import { AuthContext } from "../../components/AuthContext";
import "../../style/dashboard.css";
import PageHelmet from "../../components/Helmet";
import { DataGridViewReact } from "../../components/DataGridViewReact";
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
const POLICYTABLE = () => {
  const tableRef = useRef<any>(null);
  // const [laoding, setLoading] = useState(false);
  // const { user } = useContext(AuthContext);

  // useEffect(() => {
  //   setLoading(true);
  //   myAxios
  //     .get(`/get-renewal-this-month?policy=${policy}`, {
  //       headers: {
  //         Authorization: `Bearer ${user?.accessToken}`,
  //       },
  //     })
  //     .then((data) => {
  //       setLoading(false);
  //       console.log(data?.data.renewal);
  //       if (tableRef.current)
  //         tableRef.current.setDataFormated(data?.data.renewal);
  //     });
  // }, [user, policy]);

  // const width = window.innerWidth - 50;
  // const height = window.innerHeight - 145;
  // if (laoding) {
  //   return <div style={{ textAlign: "center" }}>Loading...</div>;
  // }
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
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
  );
};
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
        tableRef.current.setDataFormated(res?.data.renewal);
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
        <div style={{ display: "flex" }}>
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
                padding: "10px",
                cursor: "pointer",
                backgroundColor: activeTab === tab.id ? "white" : "transparent",
                color: activeTab === tab.id ? "#0074cc" : "#000",
                border: "none",
                borderRight:
                  activeTab === tab.id
                    ? tab.id === 0
                      ? "none"
                      : "1px solid #0074cc"
                    : tab.id === 0
                    ? "none"
                    : "1px solid #64748b",
                borderLeft:
                  activeTab === tab.id
                    ? tab.id === 2
                      ? "none"
                      : "1px solid #0074cc"
                    : tab.id === 2
                    ? "none"
                    : "1px solid #64748b",
                borderTop:
                  activeTab === tab.id
                    ? "1px solid #0074cc"
                    : "1px solid #64748b",

                // borderBottom:
                //   activeTab === tab.id ? "2px solid #007BFF" : "2px solid #ccc",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              {tab.label}
            </button>
          ))}
          <div
            style={{
              flex: 1,
              borderTop: "1px solid #64748b",
              borderRight: "1px solid #64748b",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background:"#3EA1E2",
              color:"white"
            }}
          >
            RENEWAL NOTICE
          </div>
        </div>
        <div
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
        </div>
      </div>
    </>
  );
}
