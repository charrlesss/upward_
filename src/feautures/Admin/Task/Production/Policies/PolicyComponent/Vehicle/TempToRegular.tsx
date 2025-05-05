import { useEffect, useRef, useState } from "react";
import { TextInput } from "../../../../../../../components/UpwardFields";
import { addYears, format } from "date-fns";
import { wait } from "@testing-library/user-event/dist/utils";
import { Button } from "@mui/material";
import { useMutation } from "react-query";
import axios from "axios";
import { Loading } from "../../../../../../../components/Loading";

const instance = axios.create();

let requestCount = 0;

const setLoading = (isLoading: any) => {
  // Connect this to your global store or React state setter
  const event = new CustomEvent("axios-loading", { detail: isLoading });
  window.dispatchEvent(event);
};

instance.interceptors.request.use((config) => {
  requestCount++;
  setLoading(true);
  return config;
});

instance.interceptors.response.use(
  (response) => {
    requestCount--;
    if (requestCount === 0) setLoading(false);
    return response;
  },
  (error) => {
    requestCount--;
    if (requestCount === 0) setLoading(false);
    return Promise.reject(error);
  }
);

function TempToRegular() {
  const [loading, setLoading] = useState(false);

  const [accessToken, setAccessToken] = useState("");
  const [oldPolicy, setOldPolicy] = useState("");
  const policyNoRef = useRef<HTMLInputElement>(null);
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);
  const dateIssuedRef = useRef<HTMLInputElement>(null);

  const { mutate: mutate, isLoading: isLoading } = useMutation({
    mutationKey: "sample",
    mutationFn: (variables: any) => {
      return axios.post(
        `${process.env.REACT_APP_API_URL}/task/production/get-transaction`,
        variables,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
    },
    onSuccess(response) {},
  });

  useEffect(() => {
    wait(100).then(() => {
      const params = new URLSearchParams(window.location.search);
      const policy_no = params.get("policy_no");
      const accessToken = params.get("accessToken");

      if (policy_no) {
        setOldPolicy(policy_no);
      }

      if (accessToken) {
        setAccessToken(accessToken);
      }
    });
  }, []);

  useEffect(() => {
    const handleLoading = (e: any) => setLoading(e.detail);
    window.addEventListener("axios-loading", handleLoading);
    return () => window.removeEventListener("axios-loading", handleLoading);
  }, []);

  return (
    <>
      {loading && <div className="loading-bar">Loading...</div>}

      <div
        style={{
          flex: 1,
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "50%",
            borderLeft: "1px",
            borderRight: "1px",
            boxShadow: "0px 0px 6px -2px rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            background: "#EFEEEA",
          }}
        >
          <div
            style={{
              background: "#183B4E",
              width: "100%",
              textAlign: "center",
              height: "35px",
            }}
          >
            <p
              style={{
                padding: 5,
                margin: 0,
                color: "white",
              }}
            >
              TRANSACTION DETAILS{" "}
              <span style={{ color: "#DDEB9D" }}>({oldPolicy})</span>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "10px",
              rowGap: "15px",
            }}
          >
            <div
              style={{
                boxShadow: "0px 0px 5px -2px rgba(0,0,0,0.75)",
                display: "grid",
                gridTemplateColumns: "repeat(2,1fr)",
                width: "100%",
                padding: "20px",
                boxSizing: "border-box",
                rowGap: "15px",
                columnGap: "20px",
                borderRadius: "5px",
                height: "105px",
              }}
            >
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "New Policy No: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  type: "text",
                  style: { width: "calc(100% - 100px) " },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      dateFromRef.current?.focus();
                    }
                  },
                }}
                inputRef={policyNoRef}
              />
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Date Issued:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  type: "date",
                  defaultValue: format(new Date(), "yyyy-MM-dd"),
                  style: { width: "calc(100% - 100px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                    }
                  },
                }}
                inputRef={dateIssuedRef}
              />
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Date From:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  type: "date",
                  defaultValue: format(new Date(), "yyyy-MM-dd"),
                  style: { width: "calc(100% - 100px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      dateToRef.current?.focus();
                    }
                  },
                }}
                inputRef={dateFromRef}
              />
              <TextInput
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Date To:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "100px",
                  },
                }}
                input={{
                  type: "date",
                  defaultValue: format(addYears(new Date(), 1), "yyyy-MM-dd"),
                  style: { width: "calc(100% - 100px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      dateIssuedRef.current?.focus();
                    }
                  },
                }}
                inputRef={dateToRef}
              />
            </div>
            <div
              style={{
                padding: 0,
                margin: 0,
                width: "100%",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              TRANSACTION HISTORY
            </div>
            <div
              style={{
                height: "calc(100% - 190px)",
                border: "1px solid #D4C9BE",
                boxSizing: "border-box",
                position: "relative",
                overflowY: "auto",
                overflowX: "hidden",
                padding: "15px",
                borderRadius: "5px",
                boxShadow: "0px 0px 5px -2px rgba(0,0,0,0.75)",
              }}
            >
              <div
                style={{
                  height: "auto",
                  width: "calc(100% - 30px)",
                  position: "absolute",
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "10px",
                }}
              >
                {[{ title: "DC", transction: [] }, 2, 3].map((itm, idx) => {
                  return (
                    <div
                      style={{
                        background: "#EFEEEA",
                        padding: "10px",
                        borderRadius: "5px",
                        boxShadow: "0px 0px 5px -2px rgba(0,0,0,0.75)",
                      }}
                      key={idx}
                    >
                      sdasdasd
                    </div>
                  );
                })}
              </div>
            </div>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                mutate({ sample: "Qweqwe" });
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default TempToRegular;
