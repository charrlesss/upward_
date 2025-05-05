import { useQuery, useMutation } from "react-query";
import Swal from "sweetalert2";
import {
  codeCondfirmationAlert,
  saveCondfirmationAlert,
} from "../../../../../../../lib/confirmationAlert";
import { addYears, format } from "date-fns";
import styled from "@emotion/styled";
import {
  useContext,
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button, IconButton } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { AuthContext } from "../../../../../../../components/AuthContext";
import {
  SelectInput,
  TextAreaInput,
  TextFormatedInput,
  TextInput,
} from "../../../../../../../components/UpwardFields";
import CalculateIcon from "@mui/icons-material/Calculate";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import SearchIcon from "@mui/icons-material/Search";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import AddBoxIcon from "@mui/icons-material/AddBox";
import CloseIcon from "@mui/icons-material/Close";
import {
  Autocomplete,
  AutocompleteNumber,
} from "../../../../Accounting/PettyCash";
import { useUpwardTableModalSearchSafeMode } from "../../../../../../../components/DataGridViewReact";
import { Loading } from "../../../../../../../components/Loading";
import { wait } from "../../../../../../../lib/wait";
import PageHelmet from "../../../../../../../components/Helmet";
import "../../../../../../../style/monbileview/production/production.css";
import RepeatIcon from "@mui/icons-material/Repeat";

export default function VehiclePolicy() {
  const { user, myAxios } = useContext(AuthContext);
  const [policy, setPolicy] = useState(
    window.localStorage.getItem("__policy__")
  );
  const _policy = useRef<any>(null);

  useEffect(() => {
    if (user) {
      if (user.department === "UMIS") {
        return _policy.current?.setDataSource([{ key: "COM" }, { key: "TPL" }]);
      } else {
        return _policy.current?.setDataSource([{ key: "COM" }]);
      }
    }
  }, [user, policy]);

  useEffect(() => {
    window.localStorage.setItem("__policy__", policy as string);
    if (policy === "TPL") {
      window.localStorage.setItem("__policy_type__", "REG");
    }
  }, [policy]);

  return (
    <div
      style={{
        flex: 1,
        height: "calc(100% - 35px)",
        paddingTop: "5px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHelmet title="Vehicle Policy" />

      {policy === "COM" ? (
        <COMPolicy
          user={user}
          myAxios={myAxios}
          policy={policy}
          setPolicy={setPolicy}
          _policy={_policy}
        />
      ) : (
        <TPLPolicy
          user={user}
          myAxios={myAxios}
          policy={policy}
          setPolicy={setPolicy}
          _policy={_policy}
        />
      )}
    </div>
  );
}

function COMPolicy({ user, myAxios, policy, setPolicy, _policy }: any) {
  const [mode, setMode] = useState("");
  const [selectedPage, setSelectedPage] = useState(0);
  const [policyType, setPolicyType] = useState(
    window.localStorage.getItem("__policy_type__")
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const regularPolicyRef = useRef<any>(null);
  const temporaryPolicyRef = useRef<any>(null);
  const subAccountRef = useRef<HTMLSelectElement>(null);
  const subAccountRef_ = useRef<any>(null);
  function handleSave() {
    if (policyType === "TEMP") {
      return temporaryPolicyRef.current.handleOnSave(mode);
    } else {
      if (policyType === "REG") {
        return regularPolicyRef.current.handleOnSave(mode);
      } else {
      }
    }
  }
  const { isLoading } = useQuery({
    queryKey: "sub-account",
    queryFn: () => {
      return myAxios.get("/task/production/sub-account", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess(response) {
      wait(100).then(() => {
        if (subAccountRef_.current)
          subAccountRef_.current.setDataSource(response.data?.data);
        wait(100).then(() => {
          if (subAccountRef.current) subAccountRef.current.value = "HO";
        });
      });
    },
    refetchOnWindowFocus: false,
  });
  const {
    UpwardTableModalSearch: PolicySearchUpwardTableModalSearch,
    openModal: policySearchOpenModal,
    closeModal: policySearchCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "large",
    link: "/task/production/search-policy",
    column: [
      { key: "Date", label: "Date", width: 110 },
      { key: "PolicyNo", label: "PolicyNo", width: 150 },
      {
        key: "Account",
        label: "Account",
        width: 100,
      },
      {
        key: "Name",
        label: "Name",
        width: 255,
      },
      {
        key: "ChassisNo",
        label: "Chassis No",
        width: 255,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        regularPolicyRef.current.loadPolicy(rowItm);
        policySearchCloseModal();
        setMode("edit");
        if (policyType === "REG") {
          wait(100).then(() => {
            regularPolicyRef.current.disableField(false);
          });
        } else {
          wait(100).then(() => {
            temporaryPolicyRef.current.disableField(false);
          });
        }
      }
    },
  });
  const {
    UpwardTableModalSearch: PolicySearchTempUpwardTableModalSearch,
    openModal: policySearcTempOpenModal,
    closeModal: policySearchTempCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "medium",
    link: "/task/production/search-policy-temp",
    column: [
      { key: "Date", label: "Date", width: 110 },
      { key: "PolicyNo", label: "PolicyNo", width: 150 },
      {
        key: "Account",
        label: "Account",
        width: 100,
      },
      {
        key: "Name",
        label: "Name",
        width: 255,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        temporaryPolicyRef.current.loadPolicy(rowItm);
        policySearchTempCloseModal();
        setMode("edit");

        if (policyType === "REG") {
          wait(100).then(() => {
            regularPolicyRef.current.disableField(false);
          });
        } else {
          wait(100).then(() => {
            temporaryPolicyRef.current.disableField(false);
          });
        }
      }
    },
  });
  useEffect(() => {
    if (policyType === "REG") {
      wait(100).then(() => {
        regularPolicyRef.current.disableField(true);
      });
    } else {
      wait(100).then(() => {
        temporaryPolicyRef.current.disableField(true);
      });
    }
  }, [policyType]);

  return (
    <>
      <PolicySearchUpwardTableModalSearch />
      <PolicySearchTempUpwardTableModalSearch />
      <div
        className="header"
        style={{
          display: "flex",
          columnGap: "8px",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <div
          className="search-container-mobile"
          style={{
            display: "none",
            alignItems: "center",
            columnGap: "8px",
          }}
        >
          <div className="search-container-mobile-buttons">
            {user?.department === "UMIS" && (
              <SelectInput
                containerClassName="custom-input adjust-label"
                ref={_policy}
                label={{
                  title: "Policy: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "50px",
                  },
                }}
                select={{
                  style: { width: "70px", height: "20px" },
                  value: policy,
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      e.preventDefault();
                    }
                  },
                  onChange: (e) => {
                    setPolicy(e.currentTarget.value);
                  },
                }}
                datasource={[
                  {
                    key: "COM",
                  },
                  {
                    key: "TPL",
                  },
                ]}
                values={"key"}
                display={"key"}
              />
            )}
            <div
              style={{
                display: "flex",
                columnGap: "5px",
                alignItems: "center",
                marginLeft: "10px",
                borderLeft: "1px solid black",
                paddingLeft: "20px",
              }}
            >
              <Button
                // disabled={policyType === "REG"}
                sx={{
                  height: "23px",
                  fontSize: "11px",
                  background: policyType === "REG" ? blue[700] : grey[700],
                  "&:hover": {
                    background: policyType === "REG" ? blue[800] : grey[800],
                  },
                }}
                variant="contained"
                color={policyType === "REG" ? "secondary" : "info"}
                onClick={() => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, Change  to Regualr!",
                    cancelButtonText: "No",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setPolicyType("REG");
                      window.localStorage.setItem("__policy_type__", "REG");
                      setMode("");
                    }
                  });
                }}
              >
                REGULAR
              </Button>
              <Button
                // disabled={policyType === "TEMP"}
                sx={{
                  height: "23px",
                  fontSize: "11px",
                  marginLeft: "5px",
                  background: policyType === "TEMP" ? blue[700] : grey[700],
                  "&:hover": {
                    background: policyType === "TEMP" ? blue[800] : grey[800],
                  },
                }}
                onClick={() => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, Change  to Temporary!",
                    cancelButtonText: "No",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setPolicyType("TEMP");
                      window.localStorage.setItem("__policy_type__", "TEMP");
                      setMode("");
                    }
                  });
                }}
                variant="contained"
                color={policyType === "TEMP" ? "secondary" : "info"}
              >
                TEMPORARY
              </Button>
            </div>
          </div>
          <TextInput
            containerClassName="custom-input adjust-label-search"
            containerStyle={{ width: "550px" }}
            label={{
              title: "Search: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "60px",
              },
            }}
            input={{
              className: "search-input-up-on-key-down",
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  if (policyType === "TEMP") {
                    return policySearcTempOpenModal(e.currentTarget.value);
                  } else {
                    if (policyType === "REG") {
                      return policySearchOpenModal(e.currentTarget.value);
                    } else {
                    }
                  }
                }
              },
              style: { width: "100%", height: "22px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (searchRef.current) {
                if (policyType === "TEMP") {
                  return policySearcTempOpenModal(searchRef.current.value);
                } else {
                  if (policyType === "REG") {
                    return policySearchOpenModal(searchRef.current.value);
                  } else {
                  }
                }
              }
            }}
            inputRef={searchRef}
          />
        </div>

        <div
          className="search-container-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "8px",
          }}
        >
          {user?.department === "UMIS" && (
            <SelectInput
              containerClassName="custom-input"
              ref={_policy}
              label={{
                title: "Policy: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "50px",
                },
              }}
              select={{
                style: { width: "70px", height: "20px" },
                value: policy,
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                  }
                },
                onChange: (e) => {
                  setPolicy(e.currentTarget.value);
                },
              }}
              datasource={[
                {
                  key: "COM",
                },
                {
                  key: "TPL",
                },
              ]}
              values={"key"}
              display={"key"}
            />
          )}

          <TextInput
            containerClassName="custom-input"
            containerStyle={{ width: "550px" }}
            label={{
              title: "Search: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "60px",
              },
            }}
            input={{
              className: "search-input-up-on-key-down",
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  if (policyType === "TEMP") {
                    return policySearcTempOpenModal(e.currentTarget.value);
                  } else {
                    if (policyType === "REG") {
                      return policySearchOpenModal(e.currentTarget.value);
                    } else {
                    }
                  }
                }
              },
              style: { width: "100%", height: "22px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (searchRef.current) {
                if (policyType === "TEMP") {
                  return policySearcTempOpenModal(searchRef.current.value);
                } else {
                  if (policyType === "REG") {
                    return policySearchOpenModal(searchRef.current.value);
                  } else {
                  }
                }
              }
            }}
            inputRef={searchRef}
          />
        </div>
        <div
          className="button-action-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "8px",
          }}
        >
          <Button
            sx={{
              height: "23px",
              fontSize: "11px",
            }}
            disabled={mode === "add" || mode === "edit"}
            size="small"
            color="primary"
            onClick={() => {
              setMode("add");
              if (policyType === "REG") {
                wait(100).then(() => {
                  regularPolicyRef.current.disableField(false);
                });
              }

              if (policyType === "TEMP") {
                wait(100).then(() => {
                  temporaryPolicyRef.current.disableField(false);
                  temporaryPolicyRef.current.refetchID();
                });
              }
            }}
            variant="contained"
            startIcon={<AddBoxIcon />}
          >
            New
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveAsIcon />}
            disabled={mode === ""}
            size="small"
            onClick={handleSave}
            sx={{
              height: "23px",
              fontSize: "11px",
            }}
          >
            Save
          </Button>
          <Button
            sx={{
              height: "23px",
              fontSize: "11px",
            }}
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
            disabled={mode === ""}
            size="small"
            onClick={() => {
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, cencel it!",
                cancelButtonText: "No",
              }).then((result) => {
                if (result.isConfirmed) {
                  if (policyType === "REG") {
                    regularPolicyRef.current.disableField(true);
                    regularPolicyRef.current?.resetFields();
                  }
                  if (policyType === "TEMP") {
                    wait(100).then(() => {
                      temporaryPolicyRef.current.disableField(true);
                    });
                    temporaryPolicyRef.current.resetFields(true);
                  }
                  setMode("");
                }
              });
            }}
          >
            Cancel
          </Button>
          {policyType === "TEMP" && (
            <Button
              sx={{
                height: "23px",
                fontSize: "11px",
              }}
              variant="contained"
              color="info"
              startIcon={<RepeatIcon />}
              disabled={mode === "" || mode === "add"}
              size="small"
              onClick={() => {
                window.location.href = `/${
                  process.env.REACT_APP_DEPARTMENT
                }/dashboard/temp-to-regular?policy_no=${temporaryPolicyRef.current.getPolicy()}&accessToken=${user.accessToken}`;
              }}
            >
              To Regular
            </Button>
          )}
          <div
            style={{
              display: "flex",
              columnGap: "5px",
              alignItems: "center",
              marginLeft: "10px",
              borderLeft: "1px solid black",
              paddingLeft: "20px",
            }}
          >
            <Button
              // disabled={policyType === "REG"}
              sx={{
                height: "23px",
                fontSize: "11px",
                background: policyType === "REG" ? blue[700] : grey[700],
                "&:hover": {
                  background: policyType === "REG" ? blue[800] : grey[800],
                },
              }}
              variant="contained"
              color={policyType === "REG" ? "secondary" : "info"}
              onClick={() => {
                Swal.fire({
                  title: "Are you sure?",
                  text: "You won't be able to revert this!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, Change  to Regualr!",
                  cancelButtonText: "No",
                }).then((result) => {
                  if (result.isConfirmed) {
                    setPolicyType("REG");
                    window.localStorage.setItem("__policy_type__", "REG");
                    setMode("");
                  }
                });
              }}
            >
              REGULAR
            </Button>
            <Button
              // disabled={policyType === "TEMP"}
              sx={{
                height: "23px",
                fontSize: "11px",
                marginLeft: "5px",
                background: policyType === "TEMP" ? blue[700] : grey[700],
                "&:hover": {
                  background: policyType === "TEMP" ? blue[800] : grey[800],
                },
              }}
              onClick={() => {
                Swal.fire({
                  title: "Are you sure?",
                  text: "You won't be able to revert this!",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes, Change  to Temporary!",
                  cancelButtonText: "No",
                }).then((result) => {
                  if (result.isConfirmed) {
                    setPolicyType("TEMP");
                    window.localStorage.setItem("__policy_type__", "TEMP");
                    setMode("");
                  }
                });
              }}
              variant="contained"
              color={policyType === "TEMP" ? "secondary" : "info"}
            >
              TEMPORARY
            </Button>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", columnGap: "7px", marginBottom: "6px" }}>
        <div
          className="desktop-choices-buttons"
          style={{ display: "flex", columnGap: "2px" }}
        >
          <Button
            // disabled={selectedPage === 0}
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 0 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 0 ? blue[800] : grey[800],
              },
            }}
            variant="contained"
            onClick={() => {
              setSelectedPage(0);
            }}
          >
            Policy Information
          </Button>
          <Button
            // disabled={selectedPage === 1}
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 1 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 1 ? blue[800] : grey[800],
              },
            }}
            onClick={() => {
              setSelectedPage(1);
            }}
            variant="contained"
          >
            Policy Type Details
          </Button>
          <Button
            // disabled={selectedPage === 2}
            sx={{
              height: "23px",
              fontSize: "11px",

              background: selectedPage === 2 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 2 ? blue[800] : grey[800],
              },
            }}
            onClick={() => {
              setSelectedPage(2);
            }}
            variant="contained"
          >
            Policy Premium
          </Button>
          {isLoading ? (
            <>Laoding...</>
          ) : (
            <SelectInput
              ref={subAccountRef_}
              label={{
                title: "Sub Account :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              selectRef={subAccountRef}
              select={{
                style: { flex: 1, height: "22px" },
                defaultValue: "HO",
              }}
              containerStyle={{
                flex: 2,
                marginLeft: "20px",
              }}
              datasource={[]}
              values={"Acronym"}
              display={"Acronym"}
            />
          )}
        </div>
        <div
          className="mobile-choices-buttons"
          style={{ display: "none", columnGap: "2px" }}
        >
          <Button
            // disabled={selectedPage === 0}
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 0 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 0 ? blue[800] : grey[800],
              },
            }}
            variant="contained"
            onClick={() => {
              setSelectedPage(0);
            }}
          >
            Information
          </Button>
          <Button
            // disabled={selectedPage === 1}
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 1 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 1 ? blue[800] : grey[800],
              },
            }}
            onClick={() => {
              setSelectedPage(1);
            }}
            variant="contained"
          >
            Details
          </Button>
          <Button
            // disabled={selectedPage === 2}
            sx={{
              height: "23px",
              fontSize: "11px",

              background: selectedPage === 2 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 2 ? blue[800] : grey[800],
              },
            }}
            onClick={() => {
              setSelectedPage(2);
            }}
            variant="contained"
          >
            Premium
          </Button>
          {isLoading ? (
            <>Laoding...</>
          ) : (
            <SelectInput
              ref={subAccountRef_}
              label={{
                title: "",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "50px",
                  display: "none",
                },
              }}
              selectRef={subAccountRef}
              select={{
                style: { flex: 1, height: "22px" },
                defaultValue: "HO",
              }}
              containerStyle={{
                flex: 2,
                marginLeft: "10px",
              }}
              datasource={[]}
              values={"Acronym"}
              display={"Acronym"}
            />
          )}
        </div>
      </div>
      {policyType === "REG" ? (
        <COMRegular
          setMode={setMode}
          subAccountRef={subAccountRef}
          ref={regularPolicyRef}
          selectedPage={selectedPage}
          policyType={policyType}
          mode={mode}
          policy={policy}
        />
      ) : (
        <COMTemporary
          setMode={setMode}
          subAccountRef={subAccountRef}
          ref={temporaryPolicyRef}
          selectedPage={selectedPage}
          policyType={policyType}
          mode={mode}
          policy={policy}
        />
      )}

      <div
        className="button-action-mobile"
        style={{
          display: "none",
          alignItems: "center",
          columnGap: "8px",
        }}
      >
        <Button
          sx={{
            height: "23px",
            fontSize: "11px",
          }}
          disabled={mode === "add" || mode === "edit"}
          size="small"
          color="primary"
          onClick={() => {
            setMode("add");
            if (policyType === "REG") {
              wait(100).then(() => {
                regularPolicyRef.current.disableField(false);
              });
            }

            if (policyType === "TEMP") {
              wait(100).then(() => {
                temporaryPolicyRef.current.disableField(false);
                temporaryPolicyRef.current.refetchID();
              });
            }
          }}
          variant="contained"
          startIcon={<AddBoxIcon />}
        >
          New
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveAsIcon />}
          disabled={mode === ""}
          size="small"
          onClick={handleSave}
          sx={{
            height: "23px",
            fontSize: "11px",
          }}
        >
          Save
        </Button>
        <Button
          sx={{
            height: "23px",
            fontSize: "11px",
          }}
          variant="contained"
          color="error"
          startIcon={<CloseIcon />}
          disabled={mode === ""}
          size="small"
          onClick={() => {
            Swal.fire({
              title: "Are you sure?",
              text: "You won't be able to revert this!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, cencel it!",
              cancelButtonText: "No",
            }).then((result) => {
              if (result.isConfirmed) {
                if (policyType === "REG") {
                  regularPolicyRef.current.disableField(true);
                  regularPolicyRef.current?.resetFields();
                }
                if (policyType === "TEMP") {
                  wait(100).then(() => {
                    temporaryPolicyRef.current.disableField(true);
                  });
                  temporaryPolicyRef.current.resetFields(true);
                }
                setMode("");
              }
            });
          }}
        >
          Cancel
        </Button>
      </div>
    </>
  );
}
const COMRegular = forwardRef(
  (
    {
      selectedPage,
      policyType,
      subAccountRef,
      setMode,
      searchPolicyNo,
      mode,
      policy,
    }: any,
    ref
  ) => {
    const { user, myAxios } = useContext(AuthContext);
    const _policyInformationRef = useRef<any>(null);
    const _policyTypeDetailsRef = useRef<any>(null);
    const _policyPremiumRef = useRef<any>(null);

    const {
      UpwardTableModalSearch: ClientUpwardTableModalSearch,
      openModal: clientOpenModal,
      closeModal: clientCloseModal,
    } = useUpwardTableModalSearchSafeMode({
      link: "/task/production/search-client-by-id-or-name",
      column: [
        { key: "IDNo", label: "ID No", width: 120 },
        { key: "Name", label: "Name", width: 200 },
        {
          key: "IDType",
          label: "ID Type",
          width: 90,
        },
        {
          key: "address",
          label: "Address",
          width: 90,
          hide: true,
        },
        {
          key: "sale_officer",
          label: "Sale Officer",
          width: 90,
          hide: true,
        },
      ],
      getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
        if (rowItm) {
          if (_policyInformationRef.current) {
            if (_policyInformationRef.current.getRefs().clientIDRef.current) {
              _policyInformationRef.current.getRefs().clientIDRef.current.value =
                rowItm[0];
            }
            if (_policyInformationRef.current.getRefs().clientNameRef.current) {
              _policyInformationRef.current.getRefs().clientNameRef.current.value =
                rowItm[1];
            }
            if (
              _policyInformationRef.current.getRefs().clientAddressRef.current
            ) {
              _policyInformationRef.current.getRefs().clientAddressRef.current.value =
                rowItm[3];
            }
            if (
              _policyInformationRef.current.getRefs().saleOfficerRef.current
            ) {
              _policyInformationRef.current.getRefs().saleOfficerRef.current.value =
                rowItm[4];
            }
          }

          clientCloseModal();
          wait(100).then(() => {
            if (_policyInformationRef.current)
              _policyInformationRef.current
                .getRefs()
                .agentIdRef.current?.focus();
          });
        }
      },
    });

    const {
      UpwardTableModalSearch: AgentUpwardTableModalSearch,
      openModal: agentOpenModal,
      closeModal: agentCloseModal,
    } = useUpwardTableModalSearchSafeMode({
      link: "/task/production/search-agent-by-id-or-name",
      column: [
        { key: "IDNo", label: "ID No", width: 120 },
        { key: "Name", label: "Name", width: 200 },
        {
          key: "IDType",
          label: "ID Type",
          width: 90,
        },
      ],
      getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
        if (rowItm) {
          if (_policyInformationRef.current) {
            if (_policyInformationRef.current.getRefs().agentIdRef.current) {
              _policyInformationRef.current.getRefs().agentIdRef.current.value =
                rowItm[0];
            }
            if (_policyInformationRef.current.getRefs().agentNameRef.current) {
              _policyInformationRef.current.getRefs().agentNameRef.current.value =
                rowItm[1];
            }
          }

          agentCloseModal();
          wait(100).then(() => {
            if (_policyInformationRef.current)
              _policyInformationRef.current
                .getRefs()
                .accountRef.current?.focus();
          });
        }
      },
    });
    const { mutate: mutatateAccount, isLoading: isLoadingAccount } =
      useMutation({
        mutationKey: "account",
        mutationFn: (variables: any) => {
          return myAxios.post("/task/production/account", variables, {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          });
        },
        onSuccess(response) {
          wait(100).then(() => {
            if (_policyTypeDetailsRef.current)
              _policyInformationRef.current
                .getRefs()
                ._accountRef.current.setDataSource(response.data?.data);
          });
        },
      });
    const { mutate: mutatateMortgagee, isLoading: isLoadingMortgagee } =
      useMutation({
        mutationKey: "mortgagee",
        mutationFn: (variables: any) => {
          return myAxios.post("/task/production/mortgagee", variables, {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          });
        },
        onSuccess(response) {
          wait(100).then(() => {
            console.log(response.data?.data);
            if (
              _policyPremiumRef.current &&
              _policyPremiumRef.current.getRefs
            ) {
              _policyPremiumRef.current
                .getRefs()
                .mortgageeSelect_.current.setDataSource(response.data?.data);
            }
          });
        },
      });
    const { mutate: mutatateDenomination, isLoading: isLoadingDenomination } =
      useMutation({
        mutationKey: "denomination",
        mutationFn: (variables: any) => {
          return myAxios.post("/task/production/denomination", variables, {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          });
        },
        onSuccess(response) {
          wait(100).then(() => {
            if (_policyTypeDetailsRef.current)
              _policyTypeDetailsRef.current
                .getRefs()
                ._dinomination.current.setDataSource(response.data?.data);
          });
        },
      });

    const mutatateAccountRef = useRef(mutatateAccount);
    const mutatateMortgageeRef = useRef(mutatateMortgagee);
    const mutatateDenominationRef = useRef(mutatateDenomination);
    const {
      mutate: mutatateSelectedSearch,
      isLoading: isLoadingSelectedSearch,
    } = useMutation({
      mutationKey: "selected-search",
      mutationFn: (variables: any) => {
        return myAxios.post(
          "/task/production/search-policy-selected",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      },
      onSuccess(response) {
        if (response.data.success) {
          const dt = response.data.data1;
          const dtVP = response.data.data2;
          const dtVP1 = response.data.data3;
          if (dt.length <= 0) {
            return alert("Unable to load data!");
          }

          if (policy === "COM" && dtVP.length <= 0) {
            return alert("Unable to load data!");
          }

          if (dtVP1.length > 0) {
            if (_policyInformationRef.current.getRefs().rateCostRef.current) {
              _policyInformationRef.current.getRefs().rateCostRef.current =
                dtVP1[0].Cost;
            }
          }
          if (dt.length > 0) {
            if (subAccountRef.current) {
              subAccountRef.current.value = dt[0].SubAcct;
            }
            if (_policyInformationRef.current.getRefs().clientIDRef.current) {
              _policyInformationRef.current.getRefs().clientIDRef.current.value =
                dt[0].IDNo;
            }
            if (_policyInformationRef.current.getRefs().clientNameRef.current) {
              _policyInformationRef.current.getRefs().clientNameRef.current.value =
                dt[0].InsName;
            }
            if (
              _policyInformationRef.current.getRefs().clientAddressRef.current
            ) {
              _policyInformationRef.current.getRefs().clientAddressRef.current.value =
                dt[0].InsAdd;
            }
            if (_policyInformationRef.current.getRefs().accountRef.current) {
              _policyInformationRef.current.getRefs().accountRef.current.value =
                dt[0].Account;
            }
            if (_policyInformationRef.current.getRefs().policyNoRef.current) {
              _policyInformationRef.current.getRefs().policyNoRef.current.value =
                dt[0].PolicyNo;
            }
            if (_policyInformationRef.current.getRefs().dateIssuedRef.current) {
              _policyInformationRef.current.getRefs().dateIssuedRef.current.value =
                format(new Date(dt[0].DateIssued), "yyyy-MM-dd");
            }
            if (_policyPremiumRef.current.getRefs().totalPremiumRef.current) {
              _policyPremiumRef.current.getRefs().totalPremiumRef.current.value =
                formatNumber(parseFloat(dt[0].TotalPremium.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().vatRef.current) {
              _policyPremiumRef.current.getRefs().vatRef.current.value =
                formatNumber(parseFloat(dt[0].Vat.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().docstampRef.current) {
              _policyPremiumRef.current.getRefs().docstampRef.current.value =
                formatNumber(parseFloat(dt[0].DocStamp.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs()._localGovTaxRef.current) {
              _policyPremiumRef.current.getRefs()._localGovTaxRef.current.value =
                formatNumber(parseFloat(dt[0].LGovTax.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().stradComRef.current) {
              _policyPremiumRef.current.getRefs().stradComRef.current.value =
                formatNumber(parseFloat(dt[0].Misc.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().totalDueRef.current) {
              _policyPremiumRef.current.getRefs().totalDueRef.current.value =
                formatNumber(parseFloat(dt[0].TotalDue.replace(/,/g, "")));
            }
            if (
              _policyInformationRef.current.getRefs().agentCommisionRef.current
            ) {
              _policyInformationRef.current.getRefs().agentCommisionRef.current.value =
                formatNumber(parseFloat(dt[0].AgentCom.replace(/,/g, "")));
            }
          }

          if (dtVP.length > 0) {
            if (_policyPremiumRef.current.getRefs().aogRef.current) {
              _policyPremiumRef.current.getRefs().aogRef.current.value =
                formatNumber(parseFloat(dtVP[0].AOGPercent.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs()._aogRef.current) {
              _policyPremiumRef.current.getRefs()._aogRef.current.value =
                formatNumber(parseFloat(dtVP[0].AOG.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().localGovTaxRef.current) {
              _policyPremiumRef.current.getRefs().localGovTaxRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].LocalGovTaxPercent.replace(/,/g, ""))
                );
            }

            if (_policyInformationRef.current.getRefs().corNoRef.current) {
              _policyInformationRef.current.getRefs().corNoRef.current.value =
                dtVP[0].CoverNo;
            }
            if (_policyInformationRef.current.getRefs().orNoRef.current) {
              _policyInformationRef.current.getRefs().orNoRef.current.value =
                dtVP[0].ORNo;
            }
            if (_policyInformationRef.current.getRefs().dateFromRef.current) {
              _policyInformationRef.current.getRefs().dateFromRef.current.value =
                format(new Date(dtVP[0].DateFrom), "yyyy-MM-dd");
            }
            if (_policyInformationRef.current.getRefs().dateToRef.current) {
              _policyInformationRef.current.getRefs().dateToRef.current.value =
                format(new Date(dtVP[0].DateTo), "yyyy-MM-dd");
            }
            if (_policyInformationRef.current.getRefs().modelRef.current) {
              _policyInformationRef.current.getRefs().modelRef.current.value =
                dtVP[0].Model;
            }
            if (_policyInformationRef.current.getRefs().makeRef.current) {
              _policyInformationRef.current.getRefs().makeRef.current.value =
                dtVP[0].Make;
            }
            if (_policyInformationRef.current.getRefs().typeOfBodyRef.current) {
              _policyInformationRef.current.getRefs().typeOfBodyRef.current.value =
                dtVP[0].BodyType;
            }
            if (_policyInformationRef.current.getRefs().colorRef.current) {
              _policyInformationRef.current.getRefs().colorRef.current.value =
                dtVP[0].Color;
            }
            if (_policyInformationRef.current.getRefs().bltFileNoRef.current) {
              _policyInformationRef.current.getRefs().bltFileNoRef.current.value =
                dtVP[0].BLTFileNo;
            }
            if (_policyInformationRef.current.getRefs().plateNoRef.current) {
              _policyInformationRef.current.getRefs().plateNoRef.current.value =
                dtVP[0].PlateNo;
            }
            if (_policyInformationRef.current.getRefs().chassisNoRef.current) {
              _policyInformationRef.current.getRefs().chassisNoRef.current.value =
                dtVP[0].ChassisNo;
            }
            if (_policyInformationRef.current.getRefs().motorNoRef.current) {
              _policyInformationRef.current.getRefs().motorNoRef.current.value =
                dtVP[0].MotorNo;
            }
            if (
              _policyInformationRef.current.getRefs().authorizedCapacityRef
                .current
            ) {
              _policyInformationRef.current.getRefs().authorizedCapacityRef.current.value =
                dtVP[0].AuthorizedCap;
            }
            if (
              _policyInformationRef.current.getRefs().unladenWeightRef.current
            ) {
              _policyInformationRef.current.getRefs().unladenWeightRef.current.value =
                dtVP[0].UnladenWeight;
            }

            if (
              _policyTypeDetailsRef.current.getRefs().premiumPaidRef.current
            ) {
              _policyTypeDetailsRef.current.getRefs().premiumPaidRef.current.value =
                formatNumber(parseFloat(dtVP[0].PremiumPaid.replace(/,/g, "")));
            }

            if (
              _policyTypeDetailsRef.current.getRefs()
                .estimatedValueSchedVehicleRef.current
            ) {
              _policyTypeDetailsRef.current.getRefs().estimatedValueSchedVehicleRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].EstimatedValue.replace(/,/g, ""))
                );
            }
            if (_policyTypeDetailsRef.current.getRefs().airconRef.current) {
              _policyTypeDetailsRef.current.getRefs().airconRef.current.value =
                formatNumber(parseFloat(dtVP[0].Aircon.replace(/,/g, "")));
            }
            if (_policyTypeDetailsRef.current.getRefs().stereoRef.current) {
              _policyTypeDetailsRef.current.getRefs().stereoRef.current.value =
                formatNumber(parseFloat(dtVP[0].Stereo.replace(/,/g, "")));
            }
            if (_policyTypeDetailsRef.current.getRefs().magwheelsRef.current) {
              _policyTypeDetailsRef.current.getRefs().magwheelsRef.current.value =
                formatNumber(parseFloat(dtVP[0].Magwheels.replace(/,/g, "")));
            }
            if (
              _policyTypeDetailsRef.current.getRefs().othersSpecifyRef.current
            ) {
              _policyTypeDetailsRef.current.getRefs().othersSpecifyRef.current.value =
                dtVP[0].Others;
            }
            if (
              _policyTypeDetailsRef.current.getRefs().othersSpecifyRef_.current
            ) {
              _policyTypeDetailsRef.current.getRefs().othersSpecifyRef_.current.value =
                formatNumber(
                  parseFloat(dtVP[0].OthersAmount.replace(/,/g, ""))
                );
            }
            if (_policyTypeDetailsRef.current.getRefs().DeductibleRef.current) {
              _policyTypeDetailsRef.current.getRefs().DeductibleRef.current.value =
                formatNumber(parseFloat(dtVP[0].Deductible.replace(/,/g, "")));
            }
            if (_policyTypeDetailsRef.current.getRefs().towingRef.current) {
              _policyTypeDetailsRef.current.getRefs().towingRef.current.value =
                formatNumber(parseFloat(dtVP[0].Towing.replace(/,/g, "")));
            }
            if (
              _policyTypeDetailsRef.current.getRefs().authorizedRepairLimitRef
                .current
            ) {
              _policyTypeDetailsRef.current.getRefs().authorizedRepairLimitRef.current.value =
                formatNumber(parseFloat(dtVP[0].RepairLimit.replace(/,/g, "")));
            }
            if (_policyTypeDetailsRef.current.getRefs().bodyInjuryRef.current) {
              _policyTypeDetailsRef.current.getRefs().bodyInjuryRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].BodilyInjury.replace(/,/g, ""))
                );
            }
            if (
              _policyTypeDetailsRef.current.getRefs().propertyDamageRef.current
            ) {
              _policyTypeDetailsRef.current.getRefs().propertyDamageRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].PropertyDamage.replace(/,/g, ""))
                );
            }
            if (
              _policyTypeDetailsRef.current.getRefs().personalAccidentRef
                .current
            ) {
              _policyTypeDetailsRef.current.getRefs().personalAccidentRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].PersonalAccident.replace(/,/g, ""))
                );
            }
            if (_policyPremiumRef.current.getRefs().sectionI_IIRef.current) {
              _policyPremiumRef.current.getRefs().sectionI_IIRef.current.value =
                formatNumber(parseFloat(dtVP[0].SecI.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().sectionIIIRef.current) {
              _policyPremiumRef.current.getRefs().sectionIIIRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].SecIIPercent.replace(/,/g, ""))
                );
            }
            if (_policyPremiumRef.current.getRefs().ownDamageRef.current) {
              _policyPremiumRef.current.getRefs().ownDamageRef.current.value =
                formatNumber(parseFloat(dtVP[0].ODamage.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().theftRef.current) {
              _policyPremiumRef.current.getRefs().theftRef.current.value =
                formatNumber(parseFloat(dtVP[0].Theft.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().sectionIVARef.current) {
              _policyPremiumRef.current.getRefs().sectionIVARef.current.value =
                formatNumber(parseFloat(dtVP[0].Sec4A.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().sectionIVBRef.current) {
              _policyPremiumRef.current.getRefs().sectionIVBRef.current.value =
                formatNumber(parseFloat(dtVP[0].Sec4B.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().othersRef.current) {
              _policyPremiumRef.current.getRefs().othersRef.current.value =
                formatNumber(parseFloat(dtVP[0].Sec4C.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().mortgageecheckRef.current) {
              _policyPremiumRef.current.getRefs().mortgageecheckRef.current.checked =
                Boolean(parseInt(dtVP[0].MortgageeForm));
            }
            if (_policyPremiumRef.current.getRefs().mortgageeSelect.current) {
              _policyPremiumRef.current.getRefs().mortgageeSelect.current.value =
                dtVP[0].Mortgagee;
            }
            if (_policyTypeDetailsRef.current.getRefs().dinomination.current) {
              _policyTypeDetailsRef.current.getRefs().dinomination.current.value =
                dtVP[0].Denomi;
            }

            if (_policyTypeDetailsRef.current.getRefs().typeRef.current) {
              _policyTypeDetailsRef.current.getRefs().typeRef.current.value =
                dtVP[0].TPLTypeSection_I_II;
            }

            if (_policyPremiumRef.current.getRefs().remarksRef.current) {
              _policyPremiumRef.current.getRefs().remarksRef.current.value =
                dtVP[0].Remarks;
            }
            setFormIndorseValue(
              Boolean(parseInt(dtVP[0].MortgageeForm)),
              _policyPremiumRef.current.getRefs().formIndorsementRef,
              _policyPremiumRef.current.getRefs().mortgageeSelect
            );
          }
        }
      },
    });
    const { mutate: mutatateSave, isLoading: isLoadingSave } = useMutation({
      mutationKey: "save",
      mutationFn: (variables: any) => {
        return myAxios.post("/task/production/save", variables, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
      },
      onSuccess(response) {
        if (response.data.success) {
          _policyInformationRef.current.resetRefs();
          _policyTypeDetailsRef.current.resetRefs();
          _policyPremiumRef.current.resetRefs();

          _policyInformationRef.current.refEnableDisable(true);
          _policyTypeDetailsRef.current.refEnableDisable(true);
          _policyPremiumRef.current.refEnableDisable(true);

          if (subAccountRef.current) {
            subAccountRef.current.value = "HO";
          }
          setMode("");
          return Swal.fire({
            position: "center",
            icon: "success",
            title: response.data.message,
            showConfirmButton: false,
            timer: 1500,
          });
        }
        return Swal.fire({
          position: "center",
          icon: "error",
          title: response.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
      },
    });

    const { mutate: mutatateUpdate, isLoading: isLoadingUpdate } = useMutation({
      mutationKey: "update",
      mutationFn: (variables: any) => {
        const link =
          policy === "COM"
            ? "/task/production/com-update-regular"
            : "/task/production/com-update-regular-tpl";
        return myAxios.post(link, variables, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
      },
      onSuccess(response) {
        console.log(response);
        if (response.data.success) {
          _policyInformationRef.current.resetRefs();
          _policyTypeDetailsRef.current.resetRefs();
          _policyPremiumRef.current.resetRefs();

          _policyInformationRef.current.refEnableDisable(true);
          _policyTypeDetailsRef.current.refEnableDisable(true);
          _policyPremiumRef.current.refEnableDisable(true);

          if (subAccountRef.current) {
            subAccountRef.current.value = "HO";
          }
          setMode("");

          return Swal.fire({
            position: "center",
            icon: "success",
            title: response.data.message,
            showConfirmButton: false,
            timer: 1500,
          });
        }
        return Swal.fire({
          position: "center",
          icon: "error",
          title: response.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
      },
    });

    useImperativeHandle(ref, () => ({
      handleOnSave: (mode: string) => {
        if (
          _policyInformationRef.current.requiredField() ||
          _policyTypeDetailsRef.current.requiredField() ||
          _policyPremiumRef.current.requiredField()
        ) {
          return;
        }

        if (mode === "edit") {
          codeCondfirmationAlert({
            isUpdate: true,
            cb: (userCodeConfirmation) => {
              const data = {
                ..._policyInformationRef.current.getRefsValue(),
                ..._policyTypeDetailsRef.current.getRefsValue(),
                ..._policyPremiumRef.current.getRefsValue(),
                policy: window.localStorage.getItem("__policy__"),
                form_action: policyType,
                subAccountRef: subAccountRef.current?.value,
                userCodeConfirmation,
              };
              mutatateUpdate(data);
            },
          });
        } else {
          saveCondfirmationAlert({
            isConfirm: () => {
              const data = {
                ..._policyInformationRef.current.getRefsValue(),
                ..._policyTypeDetailsRef.current.getRefsValue(),
                ..._policyPremiumRef.current.getRefsValue(),
                policy: window.localStorage.getItem("__policy__"),
                form_action: policyType,
                subAccountRef: subAccountRef.current?.value,
              };
              mutatateSave(data);
            },
          });
        }
      },
      loadPolicy: (selected: any) => {
        mutatateSelectedSearch({
          account: selected[2],
          policy: window.localStorage.getItem("__policy__"),
          policyNo: selected[1],
        });
      },
      resetFields: () => {
        _policyInformationRef.current.resetRefs();
        _policyTypeDetailsRef.current.resetRefs();
        _policyPremiumRef.current.resetRefs();
        if (subAccountRef.current) {
          subAccountRef.current.value = "HO";
        }
        setMode("");
      },
      getRefs: () => {
        return {
          _policyInformationRef,
          _policyTypeDetailsRef,
          _policyPremiumRef,
        };
      },
      disableField: (disable: boolean) => {
        _policyInformationRef.current.refEnableDisable(disable);
        _policyTypeDetailsRef.current.refEnableDisable(disable);
        _policyPremiumRef.current.refEnableDisable(disable);
      },
    }));

    useEffect(() => {
      mutatateAccountRef.current({
        policy,
      });
      mutatateMortgageeRef.current({
        policy,
      });
      mutatateDenominationRef.current({
        policy,
      });
    }, [policy, policyType]);

    function computation() {
      const insuredValue = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .estimatedValueSchedVehicleRef.current?.value.replace(/,/g, "") || 0
      );
      const aircon = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .airconRef.current?.value.replace(/,/g, "") || 0
      );
      const stereo = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .stereoRef.current?.value.replace(/,/g, "") || 0
      );
      const magwheels = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .magwheelsRef.current?.value.replace(/,/g, "") || 0
      );
      const others = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .othersSpecifyRef_.current?.value.replace(/,/g, "") || 0
      );

      const secIII = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .sectionIIIRef.current?.value.replace(/,/g, "") || 0
      );
      const premiumPaid = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .premiumPaidRef.current?.value.replace(/,/g, "") || 0
      );
      const theft = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .theftRef.current?.value.replace(/,/g, "") || 0
      );
      const secIVA = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .sectionIVARef.current?.value.replace(/,/g, "") || 0
      );
      const secIVB = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .sectionIVBRef.current?.value.replace(/,/g, "") || 0
      );
      const other = parseFloat(
        (_policyPremiumRef.current.getRefs().othersRef.current?.value || 0)
          .toString()
          .replace(/,/g, "")
      );
      const aog = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .aogRef.current?.value.replace(/,/g, "") || 0
      );
      const stradCom = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .stradComRef.current?.value.replace(/,/g, "") || 0
      );

      const localGovTax = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .localGovTaxRef.current?.value.replace(/,/g, "") || 0
      );

      // Calculate Insured
      const insured = insuredValue + aircon + stereo + magwheels + others;
      // Calculate Own Damage
      const ownDamage = insured * (secIII / 100);

      const newAog = (aog / 100) * insuredValue;
      // Calculate Premium
      const premium =
        premiumPaid + ownDamage + theft + secIVA + secIVB + other + newAog;
      // aog;

      const vat = premium * 0.12;
      // Calculate Doc Stamp
      const docStamp = premium * 0.125;

      // Calculate Local Government Tax
      const locGovTax = premium * (localGovTax / 100);

      // Calculate StradCom
      const stradComValue = stradCom;

      const totalDue = premium + vat + docStamp + locGovTax + stradComValue;

      if (_policyPremiumRef.current.getRefs()._aogRef.current) {
        _policyPremiumRef.current.getRefs()._aogRef.current.value =
          newAog.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().sectionI_IIRef.current) {
        _policyPremiumRef.current.getRefs().sectionI_IIRef.current.value =
          premiumPaid.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().sectionI_IIRef.current) {
        _policyPremiumRef.current.getRefs().sectionI_IIRef.current.value =
          premiumPaid.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().ownDamageRef.current) {
        _policyPremiumRef.current.getRefs().ownDamageRef.current.value =
          ownDamage.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().totalPremiumRef.current) {
        _policyPremiumRef.current.getRefs().totalPremiumRef.current.value =
          premium.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().vatRef.current) {
        _policyPremiumRef.current.getRefs().vatRef.current.value =
          vat.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().docstampRef.current) {
        _policyPremiumRef.current.getRefs().docstampRef.current.value =
          docStamp.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs()._localGovTaxRef.current) {
        _policyPremiumRef.current.getRefs()._localGovTaxRef.current.value =
          locGovTax.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().stradComRef.current) {
        _policyPremiumRef.current.getRefs().stradComRef.current.value =
          stradComValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().totalDueRef.current) {
        _policyPremiumRef.current.getRefs().totalDueRef.current.value =
          totalDue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
    }

    function formatNumber(Amount: number) {
      return Amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          height: "100%",
          padding: "5px",
        }}
      >
        {(isLoadingUpdate ||
          isLoadingAccount ||
          isLoadingMortgagee ||
          isLoadingDenomination ||
          isLoadingSave ||
          isLoadingSelectedSearch) && <Loading />}
        <ClientUpwardTableModalSearch />
        <AgentUpwardTableModalSearch />
        <div
          style={{
            display: selectedPage === 0 ? "flex" : "none",
            flex: 1,
            height: "100%",
          }}
        >
          <PolicyInformation
            disabled={mode === ""}
            ref={_policyInformationRef}
            clientSearch={(input: string) => {
              clientOpenModal(input);
            }}
            agentSearch={(input: string) => {
              agentOpenModal(input);
            }}
            onChangeAccount={(e: any) => {
              mutatateDenomination({
                policy: window.localStorage.getItem("__policy__"),
                account: e.target.value,
              });
            }}
            searchPolicyNo={searchPolicyNo}
            policy={policy}
            policyType={policyType}
          />
        </div>
        <div
          style={{
            display: selectedPage === 1 ? "flex" : "none",
            flex: 1,
            height: "100%",
          }}
        >
          <PolicyTypeDetails
            disabled={mode === ""}
            ref={_policyTypeDetailsRef}
            policy={policy}
            policyType={policyType}
          />
        </div>
        <div
          style={{
            display: selectedPage === 2 ? "flex" : "none",
            flex: 1,
            height: "100%",
          }}
        >
          <PolicyPremium
            disabled={mode === ""}
            ref={_policyPremiumRef}
            onComputation={() => {
              computation();
            }}
            policy={policy}
            policyType={policyType}
          />
        </div>
      </div>
    );
  }
);
const COMTemporary = forwardRef(
  ({ selectedPage, policyType, subAccountRef, setMode, policy }: any, ref) => {
    const { user, myAxios } = useContext(AuthContext);
    const _policyInformationRef = useRef<any>(null);
    const _policyTypeDetailsRef = useRef<any>(null);
    const _policyPremiumRef = useRef<any>(null);
    const {
      UpwardTableModalSearch: ClientUpwardTableModalSearch,
      openModal: clientOpenModal,
      closeModal: clientCloseModal,
    } = useUpwardTableModalSearchSafeMode({
      link: "/task/production/search-client-by-id-or-name",
      column: [
        { key: "IDNo", label: "ID No", width: 120 },
        { key: "Name", label: "Name", width: 200 },
        {
          key: "IDType",
          label: "ID Type",
          width: 90,
        },
        {
          key: "address",
          label: "Address",
          width: 90,
          hide: true,
        },
        {
          key: "sale_officer",
          label: "Sale Officer",
          width: 90,
          hide: true,
        },
      ],
      getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
        if (rowItm) {
          if (_policyInformationRef.current.getRefs().clientIDRef.current) {
            _policyInformationRef.current.getRefs().clientIDRef.current.value =
              rowItm[0];
          }
          if (_policyInformationRef.current.getRefs().clientNameRef.current) {
            _policyInformationRef.current.getRefs().clientNameRef.current.value =
              rowItm[1];
          }
          if (
            _policyInformationRef.current.getRefs().clientAddressRef.current
          ) {
            _policyInformationRef.current.getRefs().clientAddressRef.current.value =
              rowItm[3];
          }
          if (_policyInformationRef.current.getRefs().saleOfficerRef.current) {
            _policyInformationRef.current.getRefs().saleOfficerRef.current.value =
              rowItm[4];
          }
          clientCloseModal();
        }
      },
    });
    const {
      UpwardTableModalSearch: AgentUpwardTableModalSearch,
      openModal: agentOpenModal,
      closeModal: agentCloseModal,
    } = useUpwardTableModalSearchSafeMode({
      link: "/task/production/search-agent-by-id-or-name",
      column: [
        { key: "IDNo", label: "ID No", width: 120 },
        { key: "Name", label: "Name", width: 200 },
        {
          key: "IDType",
          label: "ID Type",
          width: 90,
        },
      ],
      getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
        if (rowItm) {
          if (
            _policyInformationRef.current &&
            _policyInformationRef.current.getRefs
          ) {
            if (_policyInformationRef.current.getRefs().agentIdRef.current) {
              _policyInformationRef.current.getRefs().agentIdRef.current.value =
                rowItm[0];
            }
            if (_policyInformationRef.current.getRefs().agentNameRef.current) {
              _policyInformationRef.current.getRefs().agentNameRef.current.value =
                rowItm[1];
            }
          }

          agentCloseModal();
        }
      },
    });
    const { mutate: mutatateAccount, isLoading: isLoadingAccount } =
      useMutation({
        mutationKey: "account",
        mutationFn: (variables: any) => {
          return myAxios.post("/task/production/account", variables, {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          });
        },
        onSuccess(response) {
          wait(100).then(() => {
            if (
              _policyInformationRef.current &&
              _policyInformationRef.current.getRefs
            ) {
              _policyInformationRef.current
                .getRefs()
                ._accountRef.current.setDataSource(response.data?.data);
            }

            wait(100).then(() => {
              if (
                _policyInformationRef.current &&
                _policyInformationRef.current.getRefs
              ) {
                if (
                  _policyInformationRef.current.getRefs().accountRef.current
                ) {
                  _policyInformationRef.current.getRefs().accountRef.current.value =
                    "Alpha";
                }
              }

              mutatateDenomination({
                policy: window.localStorage.getItem("__policy__"),
                account: "Alpha",
              });
            });
          });
        },
      });
    const { mutate: mutatateMortgagee, isLoading: isLoadingMortgagee } =
      useMutation({
        mutationKey: "mortgagee",
        mutationFn: (variables: any) => {
          return myAxios.post("/task/production/mortgagee", variables, {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          });
        },
        onSuccess(response) {
          wait(100).then(() => {
            _policyPremiumRef.current
              .getRefs()
              .mortgageeSelect_.current.setDataSource(response.data?.data);

            // .mortgageeSelect_.current.setDataSource(response.data?.data);
            // if (_policyPremiumRef.current && _policyPremiumRef.current.getRefs)
            //   _policyPremiumRef.current
            //     .getRefs()
            //     .mortgageeSelect_.current.setDataSource(response.data?.data);
          });
        },
      });
    const { mutate: mutatateDenomination, isLoading: isLoadingDenomination } =
      useMutation({
        mutationKey: "denomination",
        mutationFn: (variables: any) => {
          return myAxios.post("/task/production/denomination", variables, {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          });
        },
        onSuccess(response) {
          wait(100).then(() => {
            if (
              _policyTypeDetailsRef.current &&
              _policyTypeDetailsRef.current.getRefs
            )
              _policyTypeDetailsRef.current
                .getRefs()
                ._dinomination.current.setDataSource(response.data?.data);
          });
        },
      });
    const mutatateAccountRef = useRef(mutatateAccount);
    const mutatateMortgageeRef = useRef(mutatateMortgagee);
    const mutatateDenominationRef = useRef(mutatateDenomination);
    const { mutate: mutatateSave, isLoading: isLoadingSave } = useMutation({
      mutationKey: "save",
      mutationFn: (variables: any) => {
        return myAxios.post("/task/production/save", variables, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
      },
      onSuccess(response) {
        if (response.data.success) {
          _policyInformationRef.current.resetRefs();
          _policyTypeDetailsRef.current.resetRefs();
          _policyPremiumRef.current.resetRefs();

          _policyInformationRef.current.refEnableDisable(
            true,
            user?.department
          );
          _policyTypeDetailsRef.current.refEnableDisable(
            true,
            user?.department
          );
          _policyPremiumRef.current.refEnableDisable(true, user?.department);

          if (subAccountRef.current) {
            subAccountRef.current.value = "HO";
          }
          setMode("");
          refetchTempID();
          return Swal.fire({
            position: "center",
            icon: "success",
            title: response.data.message,
            showConfirmButton: false,
            timer: 1500,
          });
        }
        return Swal.fire({
          position: "center",
          icon: "error",
          title: response.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
      },
    });
    const { mutate: mutatateUpdate, isLoading: isLoadingUpdate } = useMutation({
      mutationKey: "update",
      mutationFn: (variables: any) => {
        const link =
          policy === "COM"
            ? "/task/production/com-update-regular"
            : "/task/production/com-update-regular-tpl";
        return myAxios.post(link, variables, {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
      },
      onSuccess(response) {
        if (response.data.success) {
          _policyInformationRef.current.resetRefs();
          _policyTypeDetailsRef.current.resetRefs();
          _policyPremiumRef.current.resetRefs();

          _policyInformationRef.current.refEnableDisable(
            true,
            user?.department
          );
          _policyTypeDetailsRef.current.refEnableDisable(
            true,
            user?.department
          );
          _policyPremiumRef.current.refEnableDisable(true, user?.department);

          if (subAccountRef.current) {
            subAccountRef.current.value = "HO";
          }
          setMode("");
          refetchTempID();

          return Swal.fire({
            position: "center",
            icon: "success",
            title: response.data.message,
            showConfirmButton: false,
            timer: 1500,
          });
        }
        return Swal.fire({
          position: "center",
          icon: "error",
          title: response.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
      },
    });
    const {
      mutate: mutatateSelectedSearch,
      isLoading: isLoadingSelectedSearch,
    } = useMutation({
      mutationKey: "selected-search",
      mutationFn: (variables: any) => {
        return myAxios.post(
          "/task/production/search-policy-selected",
          variables,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
            },
          }
        );
      },
      onSuccess(response) {
        if (response.data.success) {
          const dt = response.data.data1;
          const dtVP = response.data.data2;

          if (dt.length <= 0 || dtVP.length <= 0) {
            return alert("Unable to load data!");
          }
          if (dt.length > 0) {
            console.log(dt);

            if (subAccountRef.current) {
              subAccountRef.current.value = dt[0].SubAcct;
            }
            if (_policyInformationRef.current.getRefs().clientIDRef.current) {
              _policyInformationRef.current.getRefs().clientIDRef.current.value =
                dt[0].IDNo;
            }
            if (_policyInformationRef.current.getRefs().clientNameRef.current) {
              _policyInformationRef.current.getRefs().clientNameRef.current.value =
                dt[0].InsName;
            }
            if (
              _policyInformationRef.current.getRefs().clientAddressRef.current
            ) {
              _policyInformationRef.current.getRefs().clientAddressRef.current.value =
                dt[0].InsAdd;
            }
            if (_policyInformationRef.current.getRefs().accountRef.current) {
              _policyInformationRef.current.getRefs().accountRef.current.value =
                dt[0].Account;
            }
            if (_policyInformationRef.current.getRefs().policyNoRef.current) {
              _policyInformationRef.current.getRefs().policyNoRef.current.value =
                dt[0].PolicyNo;
            }
            if (_policyInformationRef.current.getRefs().dateIssuedRef.current) {
              _policyInformationRef.current.getRefs().dateIssuedRef.current.value =
                format(new Date(dt[0].DateIssued), "yyyy-MM-dd");
            }
            if (_policyPremiumRef.current.getRefs().totalPremiumRef.current) {
              _policyPremiumRef.current.getRefs().totalPremiumRef.current.value =
                formatNumber(parseFloat(dt[0].TotalPremium.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().vatRef.current) {
              _policyPremiumRef.current.getRefs().vatRef.current.value =
                formatNumber(parseFloat(dt[0].Vat.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().docstampRef.current) {
              _policyPremiumRef.current.getRefs().docstampRef.current.value =
                formatNumber(parseFloat(dt[0].DocStamp.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs()._localGovTaxRef.current) {
              _policyPremiumRef.current.getRefs()._localGovTaxRef.current.value =
                formatNumber(parseFloat(dt[0].LGovTax.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().stradComRef.current) {
              _policyPremiumRef.current.getRefs().stradComRef.current.value =
                formatNumber(parseFloat(dt[0].Misc.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().totalDueRef.current) {
              _policyPremiumRef.current.getRefs().totalDueRef.current.value =
                formatNumber(parseFloat(dt[0].TotalDue.replace(/,/g, "")));
            }
            if (
              _policyInformationRef.current.getRefs().agentCommisionRef.current
            ) {
              _policyInformationRef.current.getRefs().agentCommisionRef.current.value =
                formatNumber(parseFloat(dt[0].AgentCom.replace(/,/g, "")));
            }
          }

          if (dtVP.length > 0) {
            if (_policyPremiumRef.current.getRefs().aogRef.current) {
              _policyPremiumRef.current.getRefs().aogRef.current.value =
                formatNumber(parseFloat(dtVP[0].AOGPercent.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs()._aogRef.current) {
              _policyPremiumRef.current.getRefs()._aogRef.current.value =
                formatNumber(parseFloat(dtVP[0].AOG.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().localGovTaxRef.current) {
              _policyPremiumRef.current.getRefs().localGovTaxRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].LocalGovTaxPercent.replace(/,/g, ""))
                );
            }

            if (_policyInformationRef.current.getRefs().corNoRef.current) {
              _policyInformationRef.current.getRefs().corNoRef.current.value =
                dtVP[0].CoverNo;
            }
            if (_policyInformationRef.current.getRefs().orNoRef.current) {
              _policyInformationRef.current.getRefs().orNoRef.current.value =
                dtVP[0].ORNo;
            }
            if (_policyInformationRef.current.getRefs().dateFromRef.current) {
              _policyInformationRef.current.getRefs().dateFromRef.current.value =
                format(new Date(dtVP[0].DateFrom), "yyyy-MM-dd");
            }
            if (_policyInformationRef.current.getRefs().dateToRef.current) {
              _policyInformationRef.current.getRefs().dateToRef.current.value =
                format(new Date(dtVP[0].DateTo), "yyyy-MM-dd");
            }
            if (_policyInformationRef.current.getRefs().modelRef.current) {
              _policyInformationRef.current.getRefs().modelRef.current.value =
                dtVP[0].Model;
            }
            if (_policyInformationRef.current.getRefs().makeRef.current) {
              _policyInformationRef.current.getRefs().makeRef.current.value =
                dtVP[0].Make;
            }
            if (_policyInformationRef.current.getRefs().typeOfBodyRef.current) {
              _policyInformationRef.current.getRefs().typeOfBodyRef.current.value =
                dtVP[0].BodyType;
            }
            if (_policyInformationRef.current.getRefs().colorRef.current) {
              _policyInformationRef.current.getRefs().colorRef.current.value =
                dtVP[0].Color;
            }
            if (_policyInformationRef.current.getRefs().bltFileNoRef.current) {
              _policyInformationRef.current.getRefs().bltFileNoRef.current.value =
                dtVP[0].BLTFileNo;
            }
            if (_policyInformationRef.current.getRefs().plateNoRef.current) {
              _policyInformationRef.current.getRefs().plateNoRef.current.value =
                dtVP[0].PlateNo;
            }
            if (_policyInformationRef.current.getRefs().chassisNoRef.current) {
              _policyInformationRef.current.getRefs().chassisNoRef.current.value =
                dtVP[0].ChassisNo;
            }
            if (_policyInformationRef.current.getRefs().motorNoRef.current) {
              _policyInformationRef.current.getRefs().motorNoRef.current.value =
                dtVP[0].MotorNo;
            }
            if (
              _policyInformationRef.current.getRefs().authorizedCapacityRef
                .current
            ) {
              _policyInformationRef.current.getRefs().authorizedCapacityRef.current.value =
                dtVP[0].AuthorizedCap;
            }
            if (
              _policyInformationRef.current.getRefs().unladenWeightRef.current
            ) {
              _policyInformationRef.current.getRefs().unladenWeightRef.current.value =
                dtVP[0].UnladenWeight;
            }

            if (
              _policyTypeDetailsRef.current.getRefs().premiumPaidRef.current
            ) {
              _policyTypeDetailsRef.current.getRefs().premiumPaidRef.current.value =
                formatNumber(parseFloat(dtVP[0].PremiumPaid.replace(/,/g, "")));
            }

            if (
              _policyTypeDetailsRef.current.getRefs()
                .estimatedValueSchedVehicleRef.current
            ) {
              _policyTypeDetailsRef.current.getRefs().estimatedValueSchedVehicleRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].EstimatedValue.replace(/,/g, ""))
                );
            }
            if (_policyTypeDetailsRef.current.getRefs().airconRef.current) {
              _policyTypeDetailsRef.current.getRefs().airconRef.current.value =
                formatNumber(parseFloat(dtVP[0].Aircon.replace(/,/g, "")));
            }
            if (_policyTypeDetailsRef.current.getRefs().stereoRef.current) {
              _policyTypeDetailsRef.current.getRefs().stereoRef.current.value =
                formatNumber(parseFloat(dtVP[0].Stereo.replace(/,/g, "")));
            }
            if (_policyTypeDetailsRef.current.getRefs().magwheelsRef.current) {
              _policyTypeDetailsRef.current.getRefs().magwheelsRef.current.value =
                formatNumber(parseFloat(dtVP[0].Magwheels.replace(/,/g, "")));
            }
            if (
              _policyTypeDetailsRef.current.getRefs().othersSpecifyRef.current
            ) {
              _policyTypeDetailsRef.current.getRefs().othersSpecifyRef.current.value =
                dtVP[0].Others;
            }
            if (
              _policyTypeDetailsRef.current.getRefs().othersSpecifyRef_.current
            ) {
              _policyTypeDetailsRef.current.getRefs().othersSpecifyRef_.current.value =
                formatNumber(
                  parseFloat(dtVP[0].OthersAmount.replace(/,/g, ""))
                );
            }
            if (_policyTypeDetailsRef.current.getRefs().DeductibleRef.current) {
              _policyTypeDetailsRef.current.getRefs().DeductibleRef.current.value =
                formatNumber(parseFloat(dtVP[0].Deductible.replace(/,/g, "")));
            }
            if (_policyTypeDetailsRef.current.getRefs().towingRef.current) {
              _policyTypeDetailsRef.current.getRefs().towingRef.current.value =
                formatNumber(parseFloat(dtVP[0].Towing.replace(/,/g, "")));
            }
            if (
              _policyTypeDetailsRef.current.getRefs().authorizedRepairLimitRef
                .current
            ) {
              _policyTypeDetailsRef.current.getRefs().authorizedRepairLimitRef.current.value =
                formatNumber(parseFloat(dtVP[0].RepairLimit.replace(/,/g, "")));
            }
            if (_policyTypeDetailsRef.current.getRefs().bodyInjuryRef.current) {
              _policyTypeDetailsRef.current.getRefs().bodyInjuryRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].BodilyInjury.replace(/,/g, ""))
                );
            }
            if (
              _policyTypeDetailsRef.current.getRefs().propertyDamageRef.current
            ) {
              _policyTypeDetailsRef.current.getRefs().propertyDamageRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].PropertyDamage.replace(/,/g, ""))
                );
            }
            if (
              _policyTypeDetailsRef.current.getRefs().personalAccidentRef
                .current
            ) {
              _policyTypeDetailsRef.current.getRefs().personalAccidentRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].PersonalAccident.replace(/,/g, ""))
                );
            }
            if (_policyPremiumRef.current.getRefs().sectionI_IIRef.current) {
              _policyPremiumRef.current.getRefs().sectionI_IIRef.current.value =
                formatNumber(parseFloat(dtVP[0].SecI.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().sectionIIIRef.current) {
              _policyPremiumRef.current.getRefs().sectionIIIRef.current.value =
                formatNumber(
                  parseFloat(dtVP[0].SecIIPercent.replace(/,/g, ""))
                );
            }
            if (_policyPremiumRef.current.getRefs().ownDamageRef.current) {
              _policyPremiumRef.current.getRefs().ownDamageRef.current.value =
                formatNumber(parseFloat(dtVP[0].ODamage.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().theftRef.current) {
              _policyPremiumRef.current.getRefs().theftRef.current.value =
                formatNumber(parseFloat(dtVP[0].Theft.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().sectionIVARef.current) {
              _policyPremiumRef.current.getRefs().sectionIVARef.current.value =
                formatNumber(parseFloat(dtVP[0].Sec4A.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().sectionIVBRef.current) {
              _policyPremiumRef.current.getRefs().sectionIVBRef.current.value =
                formatNumber(parseFloat(dtVP[0].Sec4B.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().othersRef.current) {
              _policyPremiumRef.current.getRefs().othersRef.current.value =
                formatNumber(parseFloat(dtVP[0].Sec4C.replace(/,/g, "")));
            }
            if (_policyPremiumRef.current.getRefs().mortgageecheckRef.current) {
              _policyPremiumRef.current.getRefs().mortgageecheckRef.current.checked =
                Boolean(parseInt(dtVP[0].MortgageeForm));
            }
            if (_policyPremiumRef.current.getRefs().mortgageeSelect.current) {
              _policyPremiumRef.current.getRefs().mortgageeSelect.current.value =
                dtVP[0].Mortgagee;
            }
            if (_policyTypeDetailsRef.current.getRefs().dinomination.current) {
              _policyTypeDetailsRef.current.getRefs().dinomination.current.value =
                dtVP[0].Denomi;
            }

            if (_policyTypeDetailsRef.current.getRefs().typeRef.current) {
              _policyTypeDetailsRef.current.getRefs().typeRef.current.value =
                dtVP[0].TPLTypeSection_I_II;
            }
            if (_policyPremiumRef.current.getRefs().remarksRef.current) {
              _policyPremiumRef.current.getRefs().remarksRef.current.value =
                dtVP[0].Remarks;
            }

            setFormIndorseValue(
              Boolean(parseInt(dtVP[0].MortgageeForm)),
              _policyPremiumRef.current.getRefs().formIndorsementRef,
              _policyPremiumRef.current.getRefs().mortgageeSelect
            );
          }
        }
      },
    });
    const { isLoading: isLoadingTempId, refetch: refetchTempID } = useQuery({
      queryKey: "temp-id",
      queryFn: () => {
        return myAxios.get("/task/production/temp-id", {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
          },
        });
      },
      onSuccess(response) {
        wait(100).then(() => {
          if (_policyInformationRef.current.getRefs().policyNoRef.current) {
            _policyInformationRef.current.getRefs().policyNoRef.current.readOnly =
              true;
            _policyInformationRef.current.getRefs().policyNoRef.current.value =
              response?.data.data[0].PolicyNo;
          }
        });
      },
      refetchOnWindowFocus: false,
    });
    useImperativeHandle(ref, () => ({
      handleOnSave: (mode: string) => {
        if (
          _policyInformationRef.current.requiredField() ||
          _policyTypeDetailsRef.current.requiredField() ||
          _policyPremiumRef.current.requiredField()
        ) {
          return;
        }

        if (mode === "edit") {
          console.log(_policyInformationRef.current.getRefsValue());
          codeCondfirmationAlert({
            isUpdate: true,
            cb: (userCodeConfirmation) => {
              const data = {
                ..._policyInformationRef.current.getRefsValue(),
                ..._policyTypeDetailsRef.current.getRefsValue(),
                ..._policyPremiumRef.current.getRefsValue(),
                policy: window.localStorage.getItem("__policy__"),
                form_action: policyType,
                subAccountRef: subAccountRef.current?.value,
                userCodeConfirmation,
              };
              mutatateUpdate(data);
            },
          });
        } else {
          saveCondfirmationAlert({
            isConfirm: () => {
              const data = {
                ..._policyInformationRef.current.getRefsValue(),
                ..._policyTypeDetailsRef.current.getRefsValue(),
                ..._policyPremiumRef.current.getRefsValue(),
                policy: window.localStorage.getItem("__policy__"),
                form_action: policyType,
                subAccountRef: subAccountRef.current?.value,
              };
              mutatateSave(data);
            },
          });
        }
      },
      loadPolicy: (selected: any) => {
        mutatateSelectedSearch({
          account: selected[2],
          policy: window.localStorage.getItem("__policy__"),
          policyNo: selected[1],
        });
      },
      resetFields: () => {
        refetchTempID();
        _policyInformationRef.current.resetRefs();
        _policyTypeDetailsRef.current.resetRefs();
        _policyPremiumRef.current.resetRefs();
        if (subAccountRef.current) {
          subAccountRef.current.value = "HO";
        }
        setMode("");
      },
      disableField: (disable: boolean) => {
        _policyInformationRef.current.refEnableDisable(
          disable,
          user?.department
        );
        _policyTypeDetailsRef.current.refEnableDisable(
          disable,
          user?.department
        );
        _policyPremiumRef.current.refEnableDisable(disable, user?.department);
      },
      refetchID: () => {
        refetchTempID();
      },
      getPolicy: () => {
        return _policyInformationRef.current.getRefs().policyNoRef.current
          .value;
      },
    }));
    useEffect(() => {
      mutatateAccountRef.current({
        policy: window.localStorage.getItem("__policy__"),
      });
      mutatateMortgageeRef.current({
        policy: window.localStorage.getItem("__policy__"),
      });
      mutatateDenominationRef.current({
        policy: window.localStorage.getItem("__policy__"),
      });
    }, []);
    function computation() {
      const insuredValue = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .estimatedValueSchedVehicleRef.current?.value.replace(/,/g, "") || 0
      );
      const aircon = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .airconRef.current?.value.replace(/,/g, "") || 0
      );
      const stereo = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .stereoRef.current?.value.replace(/,/g, "") || 0
      );
      const magwheels = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .magwheelsRef.current?.value.replace(/,/g, "") || 0
      );
      const others = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .othersSpecifyRef_.current?.value.replace(/,/g, "") || 0
      );

      const secIII = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .sectionIIIRef.current?.value.replace(/,/g, "") || 0
      );
      const premiumPaid = parseFloat(
        _policyTypeDetailsRef.current
          .getRefs()
          .premiumPaidRef.current?.value.replace(/,/g, "") || 0
      );
      const theft = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .theftRef.current?.value.replace(/,/g, "") || 0
      );
      const secIVA = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .sectionIVARef.current?.value.replace(/,/g, "") || 0
      );
      const secIVB = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .sectionIVBRef.current?.value.replace(/,/g, "") || 0
      );
      const other = parseFloat(
        (_policyPremiumRef.current.getRefs().othersRef.current?.value || 0)
          .toString()
          .replace(/,/g, "")
      );

      const aog = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .aogRef.current?.value.replace(/,/g, "") || 0
      );
      const stradCom = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .stradComRef.current?.value.replace(/,/g, "") || 0
      );

      const localGovTax = parseFloat(
        _policyPremiumRef.current
          .getRefs()
          .localGovTaxRef.current?.value.replace(/,/g, "") || 0
      );

      // Calculate Insured
      const insured = insuredValue + aircon + stereo + magwheels + others;
      // Calculate Own Damage
      const ownDamage = insured * (secIII / 100);

      const newAog = (aog / 100) * insuredValue;
      // Calculate Premium
      const premium =
        premiumPaid + ownDamage + theft + secIVA + secIVB + other + newAog;
      // aog;

      const vat = premium * 0.12;
      // Calculate Doc Stamp
      const docStamp = premium * 0.125;

      // Calculate Local Government Tax
      const locGovTax = premium * (localGovTax / 100);

      // Calculate StradCom
      const stradComValue = stradCom;

      const totalDue = premium + vat + docStamp + locGovTax + stradComValue;

      if (_policyPremiumRef.current.getRefs()._aogRef.current) {
        _policyPremiumRef.current.getRefs()._aogRef.current.value =
          newAog.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().sectionI_IIRef.current) {
        _policyPremiumRef.current.getRefs().sectionI_IIRef.current.value =
          premiumPaid.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().sectionI_IIRef.current) {
        _policyPremiumRef.current.getRefs().sectionI_IIRef.current.value =
          premiumPaid.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().ownDamageRef.current) {
        _policyPremiumRef.current.getRefs().ownDamageRef.current.value =
          ownDamage.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().totalPremiumRef.current) {
        _policyPremiumRef.current.getRefs().totalPremiumRef.current.value =
          premium.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().vatRef.current) {
        _policyPremiumRef.current.getRefs().vatRef.current.value =
          vat.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().docstampRef.current) {
        _policyPremiumRef.current.getRefs().docstampRef.current.value =
          docStamp.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs()._localGovTaxRef.current) {
        _policyPremiumRef.current.getRefs()._localGovTaxRef.current.value =
          locGovTax.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().stradComRef.current) {
        _policyPremiumRef.current.getRefs().stradComRef.current.value =
          stradComValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
      if (_policyPremiumRef.current.getRefs().totalDueRef.current) {
        _policyPremiumRef.current.getRefs().totalDueRef.current.value =
          totalDue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
      }
    }

    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          height: "100%",
          padding: "5px",
        }}
      >
        {(isLoadingAccount ||
          isLoadingMortgagee ||
          isLoadingDenomination ||
          isLoadingTempId ||
          isLoadingSave ||
          isLoadingUpdate ||
          isLoadingSelectedSearch) && <Loading />}
        <ClientUpwardTableModalSearch />
        <AgentUpwardTableModalSearch />
        <div
          style={{
            display: selectedPage === 0 ? "flex" : "none",
            flex: 1,
            height: "100%",
          }}
        >
          <PolicyInformation
            ref={_policyInformationRef}
            clientSearch={(input: string) => {
              clientOpenModal(input);
            }}
            agentSearch={(input: string) => {
              agentOpenModal(input);
            }}
            onChangeAccount={(e: any) => {
              mutatateDenomination({
                policy: window.localStorage.getItem("__policy__"),
                account: e.target.value,
              });
            }}
            policyType={policyType}
            policy={policy}
          />
        </div>
        <div
          style={{
            display: selectedPage === 1 ? "flex" : "none",
            flex: 1,
            height: "100%",
          }}
        >
          <PolicyTypeDetails
            ref={_policyTypeDetailsRef}
            policyType={policyType}
            policy={policy}
          />
        </div>
        <div
          style={{
            display: selectedPage === 2 ? "flex" : "none",
            flex: 1,
            height: "100%",
          }}
        >
          <PolicyPremium
            ref={_policyPremiumRef}
            onComputation={() => {
              computation();
            }}
            policyType={policyType}
            policy={policy}
          />
        </div>
      </div>
    );
  }
);
function TPLPolicy({ user, myAxios, policy, setPolicy, _policy }: any) {
  const [mode, setMode] = useState("");
  const [selectedPage, setSelectedPage] = useState(0);
  const [policyType, setPolicyType] = useState(
    window.localStorage.getItem("__policy_type__")
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const regularPolicyRef = useRef<any>(null);
  const subAccountRef = useRef<HTMLSelectElement>(null);
  const subAccountRef_ = useRef<any>(null);
  function handleSave() {
    regularPolicyRef.current.handleOnSave(mode);
  }
  const { isLoading } = useQuery({
    queryKey: "sub-account",
    queryFn: () => {
      return myAxios.get("/task/production/sub-account", {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
    },
    onSuccess(response) {
      wait(100).then(() => {
        subAccountRef_.current.setDataSource(response.data?.data);
        wait(100).then(() => {
          if (subAccountRef.current) subAccountRef.current.value = "HO";
        });
      });
    },
  });
  const {
    UpwardTableModalSearch: PolicySearchUpwardTableModalSearch,
    openModal: policySearchOpenModal,
    closeModal: policySearchCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    size: "medium",
    link: "/task/production/search-policy-tpl",
    column: [
      { key: "Date", label: "Date", width: 110 },
      { key: "PolicyNo", label: "PolicyNo", width: 150 },
      {
        key: "Account",
        label: "Account",
        width: 100,
      },
      {
        key: "Name",
        label: "Name",
        width: 255,
      },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        regularPolicyRef.current.loadPolicy(rowItm);
        policySearchCloseModal();
        setMode("edit");
      }
    },
  });
  const {
    UpwardTableModalSearch: PolicyNoUpwardTableModalSearch,
    openModal: policyNoOpenModal,
    closeModal: policyNoCloseModal,
  } = useUpwardTableModalSearchSafeMode({
    link: "/task/production/get-tpl-id",
    column: [
      { key: "Source_No", label: "Source No.", width: 200 },
      { key: "Cost", label: "Cost", width: 150 },
    ],
    getSelectedItem: async (rowItm: any, _: any, rowIdx: any, __: any) => {
      if (rowItm) {
        if (
          regularPolicyRef.current
            .getRefs()
            ._policyInformationRef.current.getRefs().policyNoRef.current
        ) {
          regularPolicyRef.current
            .getRefs()
            ._policyInformationRef.current.getRefs().policyNoRef.current.value =
            rowItm[0];
        }

        if (
          regularPolicyRef.current
            .getRefs()
            ._policyInformationRef.current.getRefs().rateCostRef.current
        ) {
          regularPolicyRef.current
            .getRefs()
            ._policyInformationRef.current.getRefs().rateCostRef.current.value =
            rowItm[1];
        }

        policyNoCloseModal();
        wait(100).then(() => {
          regularPolicyRef.current
            .getRefs()
            ._policyInformationRef.current.getRefs()
            .corNoRef.current?.focus();
        });
      }
    },
  });

  return (
    <>
      <PolicyNoUpwardTableModalSearch />
      <PolicySearchUpwardTableModalSearch />
      <div
        className="header"
        style={{
          display: "flex",
          columnGap: "8px",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <div
          className="search-container-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "8px",
          }}
        >
          <div className="search-container-mobile-buttons">
            {process.env.REACT_APP_DEPARTMENT === "UMIS" && (
              <SelectInput
                ref={_policy}
                label={{
                  title: "Policy: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "50px",
                  },
                }}
                select={{
                  style: { width: "70px", height: "20px" },
                  value: policy,
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      e.preventDefault();
                    }
                  },
                  onChange: (e) => {
                    setPolicy(e.currentTarget.value);
                  },
                }}
                datasource={[
                  {
                    key: "COM",
                  },
                  {
                    key: "TPL",
                  },
                ]}
                values={"key"}
                display={"key"}
              />
            )}
            <div
              style={{
                display: "flex",
                columnGap: "5px",
                alignItems: "center",
                marginLeft: "10px",
                borderLeft: "1px solid black",
                paddingLeft: "20px",
              }}
            >
              <Button
                // disabled={policyType === "REG"}
                sx={{
                  height: "23px",
                  fontSize: "11px",
                  background: policyType === "REG" ? blue[700] : grey[700],
                  "&:hover": {
                    background: policyType === "REG" ? blue[800] : grey[800],
                  },
                }}
                variant="contained"
                color={policyType === "REG" ? "secondary" : "info"}
                onClick={() => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, Change  to Regualr!",
                    cancelButtonText: "No",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setPolicyType("REG");
                      window.localStorage.setItem("__policy_type__", "REG");
                      setMode("");
                    }
                  });
                }}
              >
                REGULAR
              </Button>
              <Button
                // disabled={policyType === "TEMP"}
                sx={{
                  height: "23px",
                  fontSize: "11px",
                  marginLeft: "5px",
                  background: policyType === "TEMP" ? blue[700] : grey[700],
                  "&:hover": {
                    background: policyType === "TEMP" ? blue[800] : grey[800],
                  },
                }}
                onClick={() => {
                  Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, Change  to Temporary!",
                    cancelButtonText: "No",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setPolicyType("TEMP");
                      window.localStorage.setItem("__policy_type__", "TEMP");
                      setMode("");
                    }
                  });
                }}
                variant="contained"
                color={policyType === "TEMP" ? "secondary" : "info"}
              >
                TEMPORARY
              </Button>
            </div>
          </div>
          <TextInput
            containerClassName="custom-input"
            containerStyle={{ width: "550px" }}
            label={{
              title: "Search: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "60px",
              },
            }}
            input={{
              className: "search-input-up-on-key-down",
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  return policySearchOpenModal(e.currentTarget.value);
                }
              },
              style: { width: "100%", height: "22px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (searchRef.current) {
                policySearchOpenModal(searchRef.current.value);
              }
            }}
            inputRef={searchRef}
          />
        </div>
        <div
          className="search-container-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "8px",
          }}
        >
          {process.env.REACT_APP_DEPARTMENT === "UMIS" && (
            <SelectInput
              ref={_policy}
              label={{
                title: "Policy: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "50px",
                },
              }}
              select={{
                style: { width: "70px", height: "20px" },
                value: policy,
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    e.preventDefault();
                  }
                },
                onChange: (e) => {
                  setPolicy(e.currentTarget.value);
                },
              }}
              datasource={[
                {
                  key: "COM",
                },
                {
                  key: "TPL",
                },
              ]}
              values={"key"}
              display={"key"}
            />
          )}
          <TextInput
            containerStyle={{ width: "550px" }}
            label={{
              title: "Search: ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "60px",
              },
            }}
            input={{
              className: "search-input-up-on-key-down",
              type: "search",
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === "NumpadEnter") {
                  e.preventDefault();
                  return policySearchOpenModal(e.currentTarget.value);
                }
              },
              style: { width: "100%", height: "22px" },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (searchRef.current) {
                policySearchOpenModal(searchRef.current.value);
              }
            }}
            inputRef={searchRef}
          />
        </div>
        <div
          className="button-action-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            columnGap: "8px",
          }}
        >
          <Button
            sx={{
              height: "23px",
              fontSize: "11px",
            }}
            disabled={mode === "add" || mode === "edit"}
            size="small"
            color="primary"
            onClick={() => {
              setMode("add");
              wait(100).then(() => {
                regularPolicyRef.current.disableField(false);
              });
            }}
            variant="contained"
            startIcon={<AddBoxIcon />}
          >
            New
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveAsIcon />}
            disabled={mode === ""}
            size="small"
            onClick={handleSave}
            sx={{
              height: "23px",
              fontSize: "11px",
            }}
          >
            Save
          </Button>
          <Button
            sx={{
              height: "23px",
              fontSize: "11px",
            }}
            variant="contained"
            color="error"
            startIcon={
              <CloseIcon
              // color="error"
              // // sx={{
              // //   fill: red[500],
              // // }}
              />
            }
            disabled={mode === ""}
            size="small"
            onClick={() => {
              Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, cencel it!",
                cancelButtonText: "No",
              }).then((result) => {
                if (result.isConfirmed) {
                  regularPolicyRef.current.disableField(true);
                  regularPolicyRef.current?.resetFields();

                  setMode("");
                }
              });
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
      <div style={{ display: "flex", columnGap: "7px", marginBottom: "6px" }}>
        {policy === "COM" && (
          <>
            <div
              style={{
                display: "flex",
                columnGap: "5px",
                alignItems: "center",
              }}
            >
              <Button
                disabled={policyType === "REG"}
                sx={{
                  height: "23px",
                  fontSize: "11px",
                }}
                variant="contained"
                color={policyType === "REG" ? "secondary" : "info"}
                onClick={() => {
                  setPolicyType("REG");
                }}
              >
                REGULAR
              </Button>
              <Button
                disabled={policyType === "TEMP"}
                sx={{
                  height: "23px",
                  fontSize: "11px",
                  marginLeft: "5px",
                }}
                onClick={() => {
                  setPolicyType("TEMP");
                }}
                variant="contained"
                color={policyType === "TEMP" ? "secondary" : "info"}
              >
                TEMPORAY
              </Button>
            </div>
            <div>|</div>
          </>
        )}
        <div
          className="desktop-choices-buttons"
          style={{ display: "flex", columnGap: "2px" }}
        >
          <Button
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 0 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 0 ? blue[800] : grey[800],
              },
            }}
            variant="contained"
            onClick={() => {
              setSelectedPage(0);
            }}
          >
            Policy Information
          </Button>
          <Button
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 1 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 1 ? blue[800] : grey[800],
              },
            }}
            onClick={() => {
              setSelectedPage(1);
            }}
            variant="contained"
          >
            Policy Type Details
          </Button>
          <Button
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 2 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 2 ? blue[800] : grey[800],
              },
            }}
            onClick={() => {
              setSelectedPage(2);
            }}
            variant="contained"
          >
            Policy Premium
          </Button>
          {isLoading ? (
            <div>Loading..</div>
          ) : (
            <SelectInput
              ref={subAccountRef_}
              label={{
                title: "Sub Account :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                },
              }}
              selectRef={subAccountRef}
              select={{
                style: { flex: 1, height: "22px" },
                defaultValue: "HO",
              }}
              containerStyle={{
                flex: 2,
                marginLeft: "20px",
              }}
              datasource={[]}
              values={"Acronym"}
              display={"Acronym"}
            />
          )}
        </div>
        <div
          className="mobile-choices-buttons"
          style={{ display: "flex", columnGap: "2px" }}
        >
          <Button
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 0 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 0 ? blue[800] : grey[800],
              },
            }}
            variant="contained"
            onClick={() => {
              setSelectedPage(0);
            }}
          >
            Information
          </Button>
          <Button
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 1 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 1 ? blue[800] : grey[800],
              },
            }}
            onClick={() => {
              setSelectedPage(1);
            }}
            variant="contained"
          >
            Details
          </Button>
          <Button
            sx={{
              height: "23px",
              fontSize: "11px",
              background: selectedPage === 2 ? blue[700] : grey[700],
              "&:hover": {
                background: selectedPage === 2 ? blue[800] : grey[800],
              },
            }}
            onClick={() => {
              setSelectedPage(2);
            }}
            variant="contained"
          >
            Premium
          </Button>
          {isLoading ? (
            <div>Loading..</div>
          ) : (
            <SelectInput
              ref={subAccountRef_}
              label={{
                title: "Sub Account :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "100px",
                  display: "none",
                },
              }}
              selectRef={subAccountRef}
              select={{
                style: { flex: 1, height: "22px" },
                defaultValue: "HO",
              }}
              containerStyle={{
                flex: 2,
                marginLeft: "5px",
              }}
              datasource={[]}
              values={"Acronym"}
              display={"Acronym"}
            />
          )}
        </div>
      </div>
      <COMRegular
        setMode={setMode}
        subAccountRef={subAccountRef}
        ref={regularPolicyRef}
        selectedPage={selectedPage}
        policyType={policyType}
        searchPolicyNo={(input: string) => {
          policyNoOpenModal(input);
        }}
        mode={mode}
        policy={policy}
      />

      <div
        className="button-action-mobile"
        style={{
          display: "none",
          alignItems: "center",
          columnGap: "8px",
        }}
      >
        <Button
          sx={{
            height: "23px",
            fontSize: "11px",
          }}
          disabled={mode === "add" || mode === "edit"}
          size="small"
          color="primary"
          onClick={() => {
            setMode("add");
            wait(100).then(() => {
              regularPolicyRef.current.disableField(false);
            });
          }}
          variant="contained"
          startIcon={<AddBoxIcon />}
        >
          New
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveAsIcon />}
          disabled={mode === ""}
          size="small"
          onClick={handleSave}
          sx={{
            height: "23px",
            fontSize: "11px",
          }}
        >
          Save
        </Button>
        <Button
          sx={{
            height: "23px",
            fontSize: "11px",
          }}
          variant="contained"
          color="error"
          startIcon={
            <CloseIcon
            // color="error"
            // // sx={{
            // //   fill: red[500],
            // // }}
            />
          }
          disabled={mode === ""}
          size="small"
          onClick={() => {
            Swal.fire({
              title: "Are you sure?",
              text: "You won't be able to revert this!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Yes, cencel it!",
              cancelButtonText: "No",
            }).then((result) => {
              if (result.isConfirmed) {
                regularPolicyRef.current.disableField(true);
                regularPolicyRef.current?.resetFields();

                setMode("");
              }
            });
          }}
        >
          Cancel
        </Button>
      </div>
    </>
  );
}
const PolicyInformation = forwardRef((props: any, ref) => {
  const policy = props.policy;
  const policy_type = props.policyType;

  // Insurer Information
  const clientIDRef = useRef<HTMLInputElement>(null);
  const clientNameRef = useRef<HTMLInputElement>(null);
  const clientAddressRef = useRef<HTMLTextAreaElement>(null);

  // Insurer Information
  const agentIdRef = useRef<HTMLInputElement>(null);
  const agentNameRef = useRef<HTMLInputElement>(null);
  const agentCommisionRef = useRef<HTMLInputElement>(null);
  const saleOfficerRef = useRef<HTMLInputElement>(null);

  // Vehicle Policy
  const _accountRef = useRef<any>(null);
  const rateCostRef = useRef<any>(null);
  const accountRef = useRef<HTMLSelectElement>(null);
  const policyNoRef = useRef<HTMLInputElement>(null);
  const corNoRef = useRef<HTMLInputElement>(null);
  const orNoRef = useRef<HTMLInputElement>(null);

  // Period of Insurance
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);
  const dateIssuedRef = useRef<HTMLInputElement>(null);

  // Insured Unit
  const modelRef = useRef<HTMLInputElement>(null);
  const plateNoRef = useRef<HTMLInputElement>(null);
  const makeRef = useRef<HTMLInputElement>(null);
  const chassisNoRef = useRef<HTMLInputElement>(null);
  const typeOfBodyRef = useRef<HTMLInputElement>(null);
  const motorNoRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);
  const authorizedCapacityRef = useRef<HTMLInputElement>(null);
  const bltFileNoRef = useRef<HTMLInputElement>(null);
  const unladenWeightRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getRefsValue: () => {
      return {
        clientIDRef: clientIDRef.current?.value,
        clientNameRef: clientNameRef.current?.value,
        clientAddressRef: clientAddressRef.current?.value,
        agentIdRef: agentIdRef.current?.value,
        agentNameRef: agentNameRef.current?.value,
        agentCommisionRef: agentCommisionRef.current?.value,
        saleOfficerRef: saleOfficerRef.current?.value,
        accountRef: accountRef.current?.value,
        policyNoRef: policyNoRef.current?.value,
        corNoRef: corNoRef.current?.value,
        orNoRef: orNoRef.current?.value,
        dateFromRef: dateFromRef.current?.value,
        dateToRef: dateToRef.current?.value,
        dateIssuedRef: dateIssuedRef.current?.value,
        modelRef: modelRef.current?.value,
        plateNoRef: plateNoRef.current?.value,
        makeRef: makeRef.current?.value,
        chassisNoRef: chassisNoRef.current?.value,
        typeOfBodyRef: typeOfBodyRef.current?.value,
        motorNoRef: motorNoRef.current?.value,
        colorRef: colorRef.current?.value,
        authorizedCapacityRef: authorizedCapacityRef.current?.value,
        bltFileNoRef: bltFileNoRef.current?.value,
        unladenWeightRef: unladenWeightRef.current?.value,
        rateCost: rateCostRef.current,
      };
    },
    getRefs: () => {
      return {
        clientIDRef,
        clientNameRef,
        clientAddressRef,
        agentIdRef,
        agentNameRef,
        agentCommisionRef,
        saleOfficerRef,
        accountRef,
        policyNoRef,
        corNoRef,
        orNoRef,
        dateFromRef,
        dateToRef,
        dateIssuedRef,
        modelRef,
        plateNoRef,
        makeRef,
        chassisNoRef,
        typeOfBodyRef,
        motorNoRef,
        colorRef,
        authorizedCapacityRef,
        bltFileNoRef,
        unladenWeightRef,
        _accountRef,
        rateCostRef,
      };
    },
    resetRefs: () => {
      if (clientIDRef.current) {
        clientIDRef.current.value = "";
      }
      if (clientNameRef.current) {
        clientNameRef.current.value = "";
      }
      if (clientAddressRef.current) {
        clientAddressRef.current.value = "";
      }
      if (agentIdRef.current) {
        agentIdRef.current.value = "";
      }
      if (agentNameRef.current) {
        agentNameRef.current.value = "";
      }
      if (agentCommisionRef.current) {
        agentCommisionRef.current.value = "0.00";
      }
      if (saleOfficerRef.current) {
        saleOfficerRef.current.value = "";
      }
      if (accountRef.current) {
        accountRef.current.value = "";
      }
      if (policy_type === "REG") {
        if (policyNoRef.current) {
          policyNoRef.current.value = "";
        }
      }
      if (corNoRef.current) {
        corNoRef.current.value = "";
      }
      if (orNoRef.current) {
        orNoRef.current.value = "";
      }

      if (dateFromRef.current) {
        dateFromRef.current.value = format(new Date(), "yyyy-MM-dd");
      }
      if (dateToRef.current) {
        dateToRef.current.value = format(addYears(new Date(), 1), "yyyy-MM-dd");
      }
      if (dateIssuedRef.current) {
        dateIssuedRef.current.value = format(new Date(), "yyyy-MM-dd");
      }

      if (modelRef.current) {
        modelRef.current.value = "";
      }
      if (plateNoRef.current) {
        plateNoRef.current.value = "";
      }
      if (makeRef.current) {
        makeRef.current.value = "";
      }
      if (chassisNoRef.current) {
        chassisNoRef.current.value = "";
      }
      if (typeOfBodyRef.current) {
        typeOfBodyRef.current.value = "";
      }
      if (motorNoRef.current) {
        motorNoRef.current.value = "";
      }
      if (colorRef.current) {
        colorRef.current.value = "";
      }
      if (authorizedCapacityRef.current) {
        authorizedCapacityRef.current.value = "";
      }
      if (bltFileNoRef.current) {
        bltFileNoRef.current.value = "";
      }

      if (unladenWeightRef.current) {
        unladenWeightRef.current.value = "";
      }
    },
    refEnableDisable: (disabled: boolean, department: string) => {
      if (accountRef.current) {
        accountRef.current.disabled = disabled;
      }
      if (clientIDRef.current) {
        clientIDRef.current.disabled = disabled;
      }
      if (clientNameRef.current) {
        clientNameRef.current.disabled = disabled;
      }
      if (clientAddressRef.current) {
        clientAddressRef.current.disabled = disabled;
      }
      if (agentIdRef.current) {
        agentIdRef.current.disabled = disabled;
      }
      if (agentNameRef.current) {
        agentNameRef.current.disabled = disabled;
      }
      if (agentCommisionRef.current) {
        agentCommisionRef.current.disabled = disabled;
      }
      if (saleOfficerRef.current) {
        saleOfficerRef.current.disabled = disabled;
      }
      if (rateCostRef.current) {
        rateCostRef.current.disabled = disabled;
      }

      if (policyNoRef.current) {
        policyNoRef.current.disabled = disabled;
      }
      if (corNoRef.current) {
        corNoRef.current.disabled = disabled;
      }
      if (orNoRef.current) {
        orNoRef.current.disabled = disabled;
      }
      if (dateFromRef.current) {
        dateFromRef.current.disabled = disabled;
      }
      if (dateToRef.current) {
        dateToRef.current.disabled = disabled;
      }

      if (dateIssuedRef.current) {
        dateIssuedRef.current.disabled = disabled;
      }
      if (modelRef.current) {
        modelRef.current.disabled = disabled;
      }
      if (plateNoRef.current) {
        plateNoRef.current.disabled = disabled;
      }
      if (makeRef.current) {
        makeRef.current.disabled = disabled;
      }
      if (chassisNoRef.current) {
        chassisNoRef.current.disabled = disabled;
      }
      if (typeOfBodyRef.current) {
        typeOfBodyRef.current.disabled = disabled;
      }
      if (motorNoRef.current) {
        motorNoRef.current.disabled = disabled;
      }
      if (colorRef.current) {
        colorRef.current.disabled = disabled;
      }
      if (authorizedCapacityRef.current) {
        authorizedCapacityRef.current.disabled = disabled;
      }
      if (bltFileNoRef.current) {
        bltFileNoRef.current.disabled = disabled;
      }
      if (unladenWeightRef.current) {
        unladenWeightRef.current.disabled = disabled;
      }
    },
    requiredField: () => {
      if (clientIDRef.current?.value === "") {
        clientIDRef.current.focus();
        alert("Client Details is Required!");
        return true;
      } else if (policyNoRef.current?.value === "") {
        policyNoRef.current.focus();
        alert("Policy No is Required!");
        return true;
      } else if (accountRef.current?.value === "") {
        accountRef.current.focus();
        alert("Account No is Required!");
        return true;
      } else {
        return false;
      }
    },
  }));

  return (
    <div
      className="main-field-container"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        marginTop: "10px",
        rowGap: "20px",
      }}
    >
      {/* First Field*/}
      <div
        className="container-fields"
        style={{
          display: "flex",
          columnGap: "15px",
        }}
      >
        {/* Insurer Information*/}
        <div
          className="container-max-width"
          style={{
            width: "50%",
            border: "1px solid #9ca3af",
            boxSizing: "border-box",
            padding: "10px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Insurer Information
          </span>
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "70%",
            }}
            label={{
              title: "Client ID:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  props.clientSearch(e.currentTarget.value);
                }
              },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              props.clientSearch(clientIDRef.current?.value);
            }}
            inputRef={clientIDRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Name:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
            }}
            inputRef={clientNameRef}
          />
          <TextAreaInput
            containerClassName="custom-input"
            label={{
              title: "Address",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            textarea={{
              disabled: props.disabled,
              rows: 3,
              style: { flex: 1 },
              defaultValue: "",
              onChange: (e) => {},
            }}
            _inputRef={clientAddressRef}
          />
        </div>
        {/* Agent Information*/}
        <div
          className="container-max-width"
          style={{
            width: "50%",
            border: "1px solid #9ca3af",
            boxSizing: "border-box",
            padding: "10px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Agent Information
          </span>
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "70%",
            }}
            label={{
              title: "Agent ID:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  props.agentSearch(e.currentTarget.value);
                }
              },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              props.agentSearch(agentIdRef.current?.value);
            }}
            inputRef={agentIdRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Name:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
            }}
            inputRef={agentNameRef}
          />
          <TextFormatedInput
            containerClassName="custom-input"
            label={{
              title: "Commission:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "50%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
            }}
            inputRef={agentCommisionRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "100%",
            }}
            label={{
              title: "Sale Officer:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
            }}
            inputRef={saleOfficerRef}
          />
        </div>
      </div>
      {/* Second Field*/}
      <div
        className="container-fields"
        style={{
          display: "flex",
          columnGap: "15px",
        }}
      >
        {/* Vehicle Policy*/}
        <div
          className="container-max-width"
          style={{
            width: "50%",
            border: "1px solid #9ca3af",
            boxSizing: "border-box",
            padding: "10px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Vehicle Policy
          </span>
          <SelectInput
            containerClassName="custom-input"
            ref={_accountRef}
            label={{
              title: "Account:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            selectRef={accountRef}
            select={{
              disabled: props.disabled,
              style: { flex: 1, height: "22px" },
              defaultValue: "",
              onChange: props.onChangeAccount,
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  policyNoRef.current?.focus();
                }
              },
            }}
            containerStyle={{
              width: "90%",
            }}
            datasource={[]}
            values={"Account"}
            display={"Account"}
          />
          {policy === "COM" ? (
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "90%",
              }}
              label={{
                title: "Policy No: ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                type: "text",
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    corNoRef.current?.focus();
                  }
                },
              }}
              inputRef={policyNoRef}
            />
          ) : (
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "90%",
              }}
              label={{
                title: "Policy No:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              input={{
                disabled: props.disabled,
                readOnly: true,
                type: "text",
                style: { width: "calc(100% - 150px) " },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    props.searchPolicyNo(e.currentTarget.value);
                  }
                },
              }}
              inputRef={policyNoRef}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={(e) => {
                e.preventDefault();
                if (policyNoRef.current) {
                  props.searchPolicyNo(policyNoRef.current.value);
                }
              }}
            />
          )}

          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Certificate of Cover No.:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  orNoRef.current?.focus();
                }
              },
            }}
            inputRef={corNoRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Official Receipt No.:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  dateFromRef.current?.focus();
                }
              },
            }}
            inputRef={orNoRef}
          />
        </div>
        {/* Period of Insurance*/}
        <div
          className="container-max-width"
          style={{
            width: "50%",
            border: "1px solid #9ca3af",
            boxSizing: "border-box",
            padding: "10px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Period of Insurance
          </span>
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "50%",
            }}
            label={{
              title: "Date From:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "date",
              defaultValue: format(new Date(), "yyyy-MM-dd"),
              style: { width: "calc(100% - 150px)" },
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
              width: "50%",
            }}
            label={{
              title: "Date To:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "date",
              defaultValue: format(addYears(new Date(), 1), "yyyy-MM-dd"),
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  dateIssuedRef.current?.focus();
                }
              },
            }}
            inputRef={dateToRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "50%",
            }}
            label={{
              title: "Date Issued:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "date",
              defaultValue: format(new Date(), "yyyy-MM-dd"),
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  modelRef.current?.focus();
                }
              },
            }}
            inputRef={dateIssuedRef}
          />
        </div>
      </div>
      {/* Last Field*/}
      {/* Insured Unit*/}
      <div
        style={{
          width: "100%",
          border: "1px solid #9ca3af",
          boxSizing: "border-box",
          padding: "10px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          rowGap: "5px",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "-12px",
            left: "20px",
            fontSize: "14px",
            background: "#F1F1F1",
            padding: "0 2px",
            fontWeight: "bold",
          }}
        >
          Insured Unit
        </span>
        <div
          className="container-fields"
          style={{ display: "flex", columnGap: "100px" }}
        >
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "83%",
            }}
            label={{
              title: "Model:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  plateNoRef.current?.focus();
                }
              },
            }}
            inputRef={modelRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Plate No.:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  makeRef.current?.focus();
                }
              },
            }}
            inputRef={plateNoRef}
          />
        </div>
        <div
          className="container-fields"
          style={{ display: "flex", columnGap: "100px" }}
        >
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "83%",
            }}
            label={{
              title: "Make:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  chassisNoRef.current?.focus();
                }
              },
            }}
            inputRef={makeRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Chassis No.:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  typeOfBodyRef.current?.focus();
                }
              },
            }}
            inputRef={chassisNoRef}
          />
        </div>
        <div
          className="container-fields"
          style={{ display: "flex", columnGap: "100px" }}
        >
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "83%",
            }}
            label={{
              title: "Type of Body:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  motorNoRef.current?.focus();
                }
              },
            }}
            inputRef={typeOfBodyRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Motor No.:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  colorRef.current?.focus();
                }
              },
            }}
            inputRef={motorNoRef}
          />
        </div>
        <div
          className="container-fields"
          style={{ display: "flex", columnGap: "100px" }}
        >
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "83%",
            }}
            label={{
              title: "Color:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  authorizedCapacityRef.current?.focus();
                }
              },
            }}
            inputRef={colorRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Authorized Capacity:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  bltFileNoRef.current?.focus();
                }
              },
            }}
            inputRef={authorizedCapacityRef}
          />
        </div>
        <div
          className="container-fields"
          style={{ display: "flex", columnGap: "100px" }}
        >
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "83%",
            }}
            label={{
              title: "BLT File No:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  unladenWeightRef.current?.focus();
                }
              },
            }}
            inputRef={bltFileNoRef}
          />
          <TextInput
            containerClassName="custom-input"
            containerStyle={{
              width: "90%",
            }}
            label={{
              title: "Unladen Weight:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            input={{
              disabled: props.disabled,
              type: "text",
              style: { width: "calc(100% - 150px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
            }}
            inputRef={unladenWeightRef}
          />
        </div>
      </div>
    </div>
  );
});
const PolicyTypeDetails = forwardRef((props: any, ref) => {
  const policy = props.policy;

  const premiumPaidRef = useRef<HTMLInputElement>(null);
  const estimatedValueSchedVehicleRef = useRef<HTMLInputElement>(null);
  const airconRef = useRef<HTMLInputElement>(null);
  const stereoRef = useRef<HTMLInputElement>(null);
  const magwheelsRef = useRef<HTMLInputElement>(null);
  const othersSpecifyRef = useRef<HTMLInputElement>(null);
  const othersSpecifyRef_ = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const _typeRef = useRef<any>(null);
  const DeductibleRef = useRef<HTMLInputElement>(null);
  const towingRef = useRef<HTMLInputElement>(null);
  const authorizedRepairLimitRef = useRef<HTMLInputElement>(null);
  const bodyInjuryRef = useRef<HTMLInputElement>(null);
  const propertyDamageRef = useRef<HTMLInputElement>(null);
  const personalAccidentRef = useRef<HTMLInputElement>(null);
  const dinomination = useRef<HTMLSelectElement>(null);
  const _dinomination = useRef<any>(null);

  const rbTPLRef = useRef<HTMLInputElement>(null);
  const rbCompreRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getRefsValue: () => {
      if (policy === "TPL") {
        if (bodyInjuryRef.current) {
          bodyInjuryRef.current.value = "0.00";
        }
        if (propertyDamageRef.current) {
          propertyDamageRef.current.value = "0.00";
        }
        if (personalAccidentRef.current) {
          personalAccidentRef.current.value = "0.00";
        }
      }
      return {
        premiumPaidRef: premiumPaidRef.current?.value,
        estimatedValueSchedVehicleRef:
          estimatedValueSchedVehicleRef.current?.value,
        airconRef: airconRef.current?.value,
        stereoRef: stereoRef.current?.value,
        magwheelsRef: magwheelsRef.current?.value,
        othersSpecifyRef: othersSpecifyRef.current?.value,
        othersSpecifyRef_: othersSpecifyRef_.current?.value,
        typeRef: typeRef.current?.value,
        DeductibleRef: DeductibleRef.current?.value,
        towingRef: towingRef.current?.value,
        authorizedRepairLimitRef: authorizedRepairLimitRef.current?.value,
        bodyInjuryRef: bodyInjuryRef.current?.value,
        propertyDamageRef: propertyDamageRef.current?.value,
        personalAccidentRef: personalAccidentRef.current?.value,
        dinomination: dinomination.current?.value,
        rbTPLRef: rbTPLRef.current?.value,
        rbCompreRef: rbCompreRef.current?.value,
      };
    },
    getRefs: () => {
      return {
        premiumPaidRef,
        estimatedValueSchedVehicleRef,
        airconRef,
        stereoRef,
        magwheelsRef,
        othersSpecifyRef,
        othersSpecifyRef_,
        typeRef,
        DeductibleRef,
        towingRef,
        authorizedRepairLimitRef,
        bodyInjuryRef,
        propertyDamageRef,
        personalAccidentRef,
        dinomination,
        _dinomination,
      };
    },
    resetRefs: () => {
      if (premiumPaidRef.current) {
        premiumPaidRef.current.value = "0.00";
      }
      if (estimatedValueSchedVehicleRef.current) {
        estimatedValueSchedVehicleRef.current.value = "0.00";
      }
      if (airconRef.current) {
        airconRef.current.value = "0.00";
      }
      if (stereoRef.current) {
        stereoRef.current.value = "0.00";
      }
      if (magwheelsRef.current) {
        magwheelsRef.current.value = "0.00";
      }
      if (othersSpecifyRef.current) {
        othersSpecifyRef.current.value = "";
      }
      if (othersSpecifyRef_.current) {
        othersSpecifyRef_.current.value = "0.00";
      }
      if (typeRef.current) {
        typeRef.current.value = "";
      }
      if (DeductibleRef.current) {
        DeductibleRef.current.value = "0.00";
      }
      if (towingRef.current) {
        towingRef.current.value = "0.00";
      }
      if (authorizedRepairLimitRef.current) {
        authorizedRepairLimitRef.current.value = "0.00";
      }
      if (bodyInjuryRef.current) {
        bodyInjuryRef.current.value = "";
      }
      if (propertyDamageRef.current) {
        propertyDamageRef.current.value = "";
      }
      if (personalAccidentRef.current) {
        personalAccidentRef.current.value = "";
      }
      if (dinomination.current) {
        dinomination.current.value = "";
      }
      if (rbTPLRef.current) {
        rbTPLRef.current.checked = policy === "TPL";
      }
      if (rbCompreRef.current) {
        rbCompreRef.current.checked = policy === "COM";
      }
    },
    refEnableDisable: (disabled: boolean, department: string) => {
      if (dinomination.current) {
        dinomination.current.disabled = disabled;
      }
      if (typeRef.current) {
        typeRef.current.disabled = disabled;
      }
      if (typeRef.current) {
        typeRef.current.disabled = disabled;
      }
      if (estimatedValueSchedVehicleRef.current) {
        estimatedValueSchedVehicleRef.current.disabled = disabled;
      }
      if (airconRef.current) {
        airconRef.current.disabled = disabled;
      }
      if (stereoRef.current) {
        stereoRef.current.disabled = disabled;
      }
      if (magwheelsRef.current) {
        magwheelsRef.current.disabled = disabled;
      }
      if (othersSpecifyRef.current) {
        othersSpecifyRef.current.disabled = disabled;
      }

      if (DeductibleRef.current) {
        DeductibleRef.current.disabled = disabled;
      }
      if (towingRef.current) {
        towingRef.current.disabled = disabled;
      }
      if (authorizedRepairLimitRef.current) {
        authorizedRepairLimitRef.current.disabled = disabled;
      }
      if (bodyInjuryRef.current) {
        bodyInjuryRef.current.disabled = disabled;
      }
      if (propertyDamageRef.current) {
        propertyDamageRef.current.disabled = disabled;
      }
      if (personalAccidentRef.current) {
        personalAccidentRef.current.disabled = disabled;
      }

      if (rbTPLRef.current) {
        rbTPLRef.current.disabled = disabled;
      }
      if (rbCompreRef.current) {
        rbCompreRef.current.disabled = disabled;
      }
    },
    requiredField: () => {
      if (policy === "TPL") {
        if (dinomination.current?.value === "") {
          dinomination.current.focus();
          alert("Denomination is Required!");
          return true;
        } else {
          return false;
        }
      } else {
        if (DeductibleRef.current?.value === "0.00") {
          DeductibleRef.current.focus();
          alert("Deductible  is Required!");
          return true;
        } else if (towingRef.current?.value === "0.00") {
          towingRef.current.focus();
          alert("Towing Required!");
          return true;
        } else if (authorizedRepairLimitRef.current?.value === "0.00") {
          authorizedRepairLimitRef.current.focus();
          alert("Authorized Repair Limit Required!");
          return true;
        } else if (estimatedValueSchedVehicleRef.current?.value === "0.00") {
          estimatedValueSchedVehicleRef.current.focus();
          alert("Estimated Value of Schedule Vehicle Required!");
          return true;
        } else if (dinomination.current?.value === "") {
          dinomination.current.focus();
          alert("Dnomination is Required!");
          return true;
        } else {
          return false;
        }
      }
    },
  }));

  return (
    <div
      className="main-field-container"
      style={{
        display: "flex",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        className="details-content-container"
        style={{
          border: "1px solid #9ca3af",
          height: "100%",
          width: "70%",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          rowGap: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            display: policy === "TPL" ? "flex" : "none",
            alignItems: "center",
          }}
        >
          <input type="checkbox" id="tpl" defaultChecked={true} />
          <label
            htmlFor="tpl"
            style={{
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            THIRD PARTY LIABILITY
          </label>
        </div>

        <div
          className="container-fields-tpl"
          style={{
            height: "auto",
            display: policy === "TPL" ? "flex" : "none",
            border: "1px solid #9ca3af",
            padding: "10px",
            columnGap: "20px",
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-10px",
              left: "20px",
              fontSize: "12px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Section I/II
          </span>
          <SelectInput
            containerClassName="custom-select"
            ref={_typeRef}
            label={{
              title: "Type :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "40px",
              },
            }}
            selectRef={typeRef}
            select={{
              // disabled: !isDisableTPL || props.disabled,
              style: { flex: 1, height: "22px" },
              defaultValue: "",
              onChange: (e) => {},
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  premiumPaidRef.current?.focus();
                }
              },
            }}
            containerStyle={{
              flex: 2,
            }}
            datasource={[
              { key: `` },
              { key: `LIGHT PRIVATE VEHICLE(1YR)` },
              { key: `MEDIUM PRIVATE VEHICLE(1YR)` },
              { key: `HEAVY PRIVATE VEHICLE(1YR)` },
              { key: `MC/TC - MOTORCYCLE/TRICYCLE(1YR)` },
              { key: `LIGHT PRIVATE VEHICLE(3YR)` },
              { key: `MEDIUM PRIVATE VEHICLE(3YR)` },
              { key: `HEAVY PRIVATE VEHICLE(3YR)` },
              { key: `MC/TC - MOTORCYCLE/TRICYCLE(3YR)` },
            ]}
            values={"key"}
            display={"key"}
          />
          <TextFormatedInput
            containerClassName="custom-input"
            label={{
              title: "Premium Paid:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              flex: 1,
            }}
            input={{
              // disabled: !isDisableTPL || props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "100%" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  dinomination.current?.focus();
                }
              },
            }}
            inputRef={premiumPaidRef}
          />
        </div>

        <div
          style={{
            width: "100%",
            display: policy === "COM" ? "flex" : "none",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            id="compre"
            defaultChecked={policy === "COM"}
          />
          <label
            htmlFor="compre"
            style={{ fontSize: "12px", cursor: "pointer", fontWeight: "bold" }}
          >
            COMPREHENSIVE
          </label>
        </div>
        <div
          style={{
            flex: 1,
            display: policy === "COM" ? "flex" : "none",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            border: "1px solid #9ca3af",
            padding: "8px",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-10px",
              left: "20px",
              fontSize: "12px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Section III/IV
          </span>

          <div
            className="container-max-width"
            style={{
              width: "50%",
              height: "auto",
              display: "flex",
              flexDirection: "column",
              rowGap: "5px",
            }}
          >
            <TextFormatedInput
              containerClassName="custom-input"
              onBlur={(e) => {
                let insuredValue = parseFloat(
                  e.currentTarget.value.replace(/,/g, "")
                );
                if (isNaN(insuredValue)) insuredValue = 0;
                let deductible = 0;

                if (process.env.REACT_APP_DEPARTMENT === "UMIS") {
                  deductible = insuredValue * 0.01;
                } else {
                  deductible = insuredValue * 0.0125;
                }

                if (DeductibleRef.current) {
                  DeductibleRef.current.value = deductible.toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  );
                  if (towingRef.current) {
                    let tow = parseFloat(
                      towingRef.current.value.toString().replace(/,/g, "")
                    );

                    if (authorizedRepairLimitRef.current) {
                      authorizedRepairLimitRef.current.value = formatNumber(
                        tow + deductible
                      );
                    }
                  }
                }
              }}
              label={{
                title: "Estimated Value of Schedule Vehicle:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "260px",
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              input={{
                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 260px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    airconRef.current?.focus();
                  }
                },
              }}
              inputRef={estimatedValueSchedVehicleRef}
            />
            <TextFormatedInput
              containerClassName="custom-input"
              label={{
                title: "Aircon:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "260px",
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              input={{
                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 260px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    stereoRef.current?.focus();
                  }
                },
              }}
              inputRef={airconRef}
            />
            <TextFormatedInput
              containerClassName="custom-input"
              label={{
                title: "Stereo:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "260px",
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              input={{
                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 260px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    magwheelsRef.current?.focus();
                  }
                },
              }}
              inputRef={stereoRef}
            />
            <TextFormatedInput
              containerClassName="custom-input"
              label={{
                title: "Magwheels:",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "260px",
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              input={{
                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 260px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    othersSpecifyRef.current?.focus();
                  }
                },
              }}
              inputRef={magwheelsRef}
            />
          </div>
          <div
            className="container-max-width"
            style={{
              width: "65%",
              height: "auto",
              display: "flex",
              columnGap: "5px",
              marginTop: "5px",
            }}
          >
            <TextInput
              containerClassName="custom-input"
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Others (Specify) :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "120px",
                },
              }}
              input={{
                type: "text",
                style: { width: "calc(100% - 120px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    othersSpecifyRef_.current?.focus();
                  }
                },
              }}
              inputRef={othersSpecifyRef}
            />
            <TextFormatedInput
              label={{
                title: "",
                style: {
                  display: "none",
                },
              }}
              containerStyle={{
                width: "53%",
              }}
              input={{
                defaultValue: "0.00",
                type: "text",
                style: { width: "100%" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    typeRef.current?.focus();
                  }
                },
              }}
              inputRef={othersSpecifyRef_}
            />
          </div>
          <div
            className="container-max-width"
            style={{
              width: "65%",
              height: "auto",
              display: "flex",
              columnGap: "5px",
              marginTop: "5px",
            }}
          >
            <SelectInput
              containerClassName="custom-input"
              ref={_typeRef}
              label={{
                title: "Type :",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "120px",
                },
              }}
              selectRef={typeRef}
              select={{
                style: { flex: 1, height: "22px" },
                defaultValue: "",
                onChange: (e) => {},
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    DeductibleRef.current?.focus();
                  }
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              datasource={[
                { key: `` },
                { key: `PRIVATE VEHICLE` },
                { key: `LIGHT AND MEDIUM VEHICLE` },
                { key: `HEAVY VEHICLE` },
                { key: `MC/TC - MOTORCYCLE/TRICYCLE` },
              ]}
              values={"key"}
              display={"key"}
            />
          </div>
          <div
            className="container-fields"
            style={{
              width: "100%",
              height: "auto",
              display: "flex",
              columnGap: "5px",
              marginTop: "5px",
              padding: "5px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                flex: 1,
                border: "1px solid #9ca3af",
                padding: "8px",
              }}
            >
              <TextFormatedInput
                containerClassName="custom-input"
                label={{
                  title: "Deductible:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                containerStyle={{
                  flex: 1,
                }}
                input={{
                  defaultValue: "0.00",
                  type: "text",
                  style: { width: "calc(100% - 150px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      towingRef.current?.focus();
                    }
                  },
                }}
                inputRef={DeductibleRef}
              />
              <TextFormatedInput
                containerClassName="custom-input"
                label={{
                  title: "Towing:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                containerStyle={{
                  flex: 1,
                }}
                input={{
                  defaultValue:
                    process.env.REACT_APP_DEPARTMENT === "UMIS"
                      ? "0.00"
                      : "1,000.00",
                  type: "text",
                  style: { width: "calc(100% - 150px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      authorizedRepairLimitRef.current?.focus();
                    }
                  },
                }}
                onBlur={(e) => {
                  if (DeductibleRef.current) {
                    let tow = parseFloat(
                      e.currentTarget.value.replace(/,/g, "")
                    );
                    const deduc = parseFloat(
                      DeductibleRef.current.value.replace(/,/g, "")
                    );

                    if (authorizedRepairLimitRef.current) {
                      authorizedRepairLimitRef.current.value = formatNumber(
                        tow + deduc
                      );
                    }
                  }
                }}
                inputRef={towingRef}
              />
              <TextFormatedInput
                containerClassName="custom-input"
                label={{
                  title: "Authorized Repair Limit:",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                containerStyle={{
                  flex: 1,
                }}
                input={{
                  defaultValue: "0.00",
                  type: "text",
                  style: { width: "calc(100% - 150px)" },
                  onKeyDown: (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      bodyInjuryRef.current?.focus();
                    }
                  },
                }}
                inputRef={authorizedRepairLimitRef}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "5px",
                flex: 1,
                border: "1px solid #9ca3af",
                padding: "8px",
              }}
            >
              <AutocompleteNumber
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Bodily Injury: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                DisplayMember={"key"}
                DataSource={[
                  { key: "0.00" },
                  { key: "50,000.00" },
                  { key: "75,000.00" },
                  { key: "100,000.00" },
                  { key: "150,000.00" },
                  { key: "200,000.00" },
                  { key: "250,000.00" },
                  { key: "300,000.00" },
                ]}
                inputRef={bodyInjuryRef}
                input={{
                  defaultValue: "0.00",
                  style: {
                    width: "100%",
                    flex: 1,
                  },
                }}
                onChange={(selected: any, e: any) => {
                  if (bodyInjuryRef.current) {
                    bodyInjuryRef.current.value = selected.key;
                  }
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    wait(100).then(() => {
                      propertyDamageRef.current?.focus();
                    });
                  }
                }}
              />
              <AutocompleteNumber
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Property Damage: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                DisplayMember={"key"}
                DataSource={[
                  { key: "0.00" },
                  { key: "50,000.00" },
                  { key: "75,000.00" },
                  { key: "100,000.00" },
                  { key: "150,000.00" },
                  { key: "200,000.00" },
                  { key: "250,000.00" },
                  { key: "300,000.00" },
                ]}
                inputRef={propertyDamageRef}
                input={{
                  defaultValue: "0.00",

                  style: {
                    width: "100%",
                    flex: 1,
                  },
                }}
                onChange={(selected: any, e: any) => {
                  if (propertyDamageRef.current) {
                    propertyDamageRef.current.value = selected.key;
                  }
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    wait(100).then(() => {
                      personalAccidentRef.current?.focus();
                    });
                  }
                }}
              />
              <AutocompleteNumber
                containerClassName="custom-input"
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Personal Accident: ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                  },
                }}
                DisplayMember={"key"}
                DataSource={[
                  { key: "0.00" },
                  { key: "50,000.00" },
                  { key: "75,000.00" },
                  { key: "100,000.00" },
                  { key: "150,000.00" },
                  { key: "200,000.00" },
                  { key: "250,000.00" },
                  { key: "300,000.00" },
                ]}
                inputRef={personalAccidentRef}
                input={{
                  defaultValue: "0.00",

                  style: {
                    width: "100%",
                    flex: 1,
                  },
                }}
                onChange={(selected: any, e: any) => {
                  if (personalAccidentRef.current) {
                    personalAccidentRef.current.value = selected.key;
                  }
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    wait(100).then(() => {
                      dinomination.current?.focus();
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, width: "100%" }}>
          <SelectInput
            containerClassName="custom-input"
            ref={_dinomination}
            label={{
              title: "Denomination :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "120px",
              },
            }}
            selectRef={dinomination}
            select={{
              disabled: props.disabled,
              style: { flex: 1, height: "22px" },
              defaultValue: "",
            }}
            containerStyle={{
              width: "400px",
            }}
            datasource={[]}
            values={"Type"}
            display={"Type"}
          />
        </div>
      </div>
    </div>
  );
});
const PolicyPremium = forwardRef((props: any, ref) => {
  const policy = props.policy;

  const mortgageecheckRef = useRef<HTMLInputElement>(null);
  const mortgageeSelect_ = useRef<any>(null);
  const mortgageeSelect = useRef<HTMLSelectElement>(null);
  const formIndorsementRef = useRef<HTMLTextAreaElement>(null);
  const remarksRef = useRef<HTMLTextAreaElement>(null);

  //Premiums
  const sectionI_IIRef = useRef<HTMLInputElement>(null);
  const sectionIIIRef = useRef<HTMLInputElement>(null);
  const ownDamageRef = useRef<HTMLInputElement>(null);
  const theftRef = useRef<HTMLInputElement>(null);
  const sectionIVARef = useRef<HTMLInputElement>(null);
  const sectionIVBRef = useRef<HTMLInputElement>(null);
  const othersRef = useRef<HTMLInputElement>(null);
  const aogRef = useRef<HTMLInputElement>(null);
  const _aogRef = useRef<HTMLInputElement>(null);
  const totalPremiumRef = useRef<HTMLInputElement>(null);
  const vatRef = useRef<HTMLInputElement>(null);
  const docstampRef = useRef<HTMLInputElement>(null);
  const localGovTaxRef = useRef<HTMLInputElement>(null);
  const _localGovTaxRef = useRef<HTMLInputElement>(null);
  const stradComRef = useRef<HTMLInputElement>(null);
  const totalDueRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    getRefsValue: () => {
      return {
        mortgageeSelect: mortgageeSelect.current?.value,
        formIndorsementRef: formIndorsementRef.current?.value,
        remarksRef: remarksRef.current?.value,
        sectionI_IIRef: sectionI_IIRef.current?.value,
        sectionIIIRef: sectionIIIRef.current?.value,
        ownDamageRef: ownDamageRef.current?.value,
        theftRef: theftRef.current?.value,
        sectionIVARef: sectionIVARef.current?.value,
        sectionIVBRef: sectionIVBRef.current?.value,
        othersRef: othersRef.current?.value,
        aogRef: aogRef.current?.value,
        _aogRef: _aogRef.current?.value,
        totalPremiumRef: totalPremiumRef.current?.value,
        vatRef: vatRef.current?.value,
        docstampRef: docstampRef.current?.value,
        localGovTaxRef: localGovTaxRef.current?.value,
        _localGovTaxRef: _localGovTaxRef.current?.value,
        stradComRef: stradComRef.current?.value,
        totalDueRef: totalDueRef.current?.value,
        mortgageecheckRef: mortgageecheckRef.current?.checked,
      };
    },
    getRefs: () => {
      return {
        mortgageeSelect_,
        mortgageeSelect,
        formIndorsementRef,
        sectionI_IIRef,
        sectionIIIRef,
        ownDamageRef,
        theftRef,
        sectionIVARef,
        sectionIVBRef,
        othersRef,
        aogRef,
        _aogRef,
        totalPremiumRef,
        vatRef,
        docstampRef,
        localGovTaxRef,
        _localGovTaxRef,
        stradComRef,
        totalDueRef,
        mortgageecheckRef,
        remarksRef,
      };
    },
    resetRefs: () => {
      if (mortgageecheckRef.current) {
        mortgageecheckRef.current.checked = false;
      }
      if (mortgageeSelect.current) {
        mortgageeSelect.current.value = "";
      }
      if (formIndorsementRef.current) {
        formIndorsementRef.current.value = `SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVER CLAUSE`;
      }
      if (remarksRef.current) {
        remarksRef.current.value = "";
      }
      if (sectionI_IIRef.current) {
        sectionI_IIRef.current.value = "0.00";
      }
      if (sectionIIIRef.current) {
        sectionIIIRef.current.value = "0.00";
      }
      if (ownDamageRef.current) {
        ownDamageRef.current.value = "0.00";
      }

      if (theftRef.current) {
        theftRef.current.value = "0.00";
      }
      if (sectionIVARef.current) {
        sectionIVARef.current.value = "0.00";
      }
      if (sectionIVBRef.current) {
        sectionIVBRef.current.value = "0.00";
      }
      if (othersRef.current) {
        othersRef.current.value = "0.00";
      }
      if (aogRef.current) {
        aogRef.current.value = "0.50";
      }
      if (_aogRef.current) {
        _aogRef.current.value = "0.00";
      }

      if (totalPremiumRef.current) {
        totalPremiumRef.current.value = "0.00";
      }
      if (vatRef.current) {
        vatRef.current.value = "0.00";
      }
      if (docstampRef.current) {
        docstampRef.current.value = "0.00";
      }

      if (localGovTaxRef.current) {
        localGovTaxRef.current.value = "0.75";
      }
      if (_localGovTaxRef.current) {
        _localGovTaxRef.current.value = "0.00";
      }
      if (stradComRef.current) {
        stradComRef.current.value = "0.00";
      }

      if (totalDueRef.current) {
        totalDueRef.current.value = "0.00";
      }
    },
    refEnableDisable: (disabled: boolean) => {
      if (mortgageecheckRef.current) {
        mortgageecheckRef.current.disabled = disabled;
      }
      if (mortgageeSelect.current) {
        mortgageeSelect.current.disabled = disabled;
      }
      if (formIndorsementRef.current) {
        formIndorsementRef.current.disabled = disabled;
      }
      if (remarksRef.current) {
        remarksRef.current.disabled = disabled;
      }
      if (sectionI_IIRef.current) {
        sectionI_IIRef.current.disabled = disabled;
      }
      if (sectionIIIRef.current) {
        sectionIIIRef.current.disabled = disabled;
      }
      if (ownDamageRef.current) {
        ownDamageRef.current.disabled = disabled;
      }
      if (theftRef.current) {
        theftRef.current.disabled = disabled;
      }

      if (sectionIVARef.current) {
        sectionIVARef.current.disabled = disabled;
      }

      if (sectionIVBRef.current) {
        sectionIVBRef.current.disabled = disabled;
      }
      if (othersRef.current) {
        othersRef.current.disabled = disabled;
      }

      if (aogRef.current) {
        aogRef.current.disabled = disabled;
      }
      if (_aogRef.current) {
        _aogRef.current.disabled = disabled;
      }
      if (totalPremiumRef.current) {
        totalPremiumRef.current.disabled = disabled;
      }
      if (vatRef.current) {
        vatRef.current.disabled = disabled;
      }
      if (docstampRef.current) {
        docstampRef.current.disabled = disabled;
      }
      if (localGovTaxRef.current) {
        localGovTaxRef.current.disabled = disabled;
      }
      if (_localGovTaxRef.current) {
        _localGovTaxRef.current.disabled = disabled;
      }
      if (stradComRef.current) {
        stradComRef.current.disabled = disabled;
      }

      if (totalDueRef.current) {
        totalDueRef.current.disabled = disabled;
      }
    },
    requiredField: () => {
      if (totalDueRef.current?.value === "0.00" && policy === "COM") {
        totalDueRef.current.focus();
        alert("Total Due is Required!");
        return true;
      }
      return false;
    },
  }));

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        className="premuim-content-container"
        style={{
          height: "100%",
          width: "65%",
          padding: "15px",
          display: "flex",
          rowGap: "20px",
          boxSizing: "border-box",
          columnGap: "10px",
        }}
      >
        {/* first layer */}
        <div
          className="container-max-width"
          style={{
            border: "1px solid #9ca3af",
            width: "60%",
            display: "flex",
            padding: "10px",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "10px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Mortgagee
          </span>
          {/* firt layer */}
          <div
            // className="desktop-content-premium"
            style={{
              width: "140px",
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
              padding: "5px",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                columnGap: "10px",
              }}
            >
              <input
                disabled={props.disabled}
                ref={mortgageecheckRef}
                type="checkbox"
                id="mortgagee"
                onChange={(e) => {
                  setFormIndorseValue(
                    e.target.checked,
                    formIndorsementRef,
                    mortgageeSelect
                  );
                }}
              />
              <label
                htmlFor="mortgagee"
                style={{
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Mortgagee:
              </label>
            </div>
            <span style={{ fontSize: "12px", fontWeight: "bold" }}>
              Form and
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                lineHeight: "5px",
              }}
            >
              Endorsement :
            </span>
          </div>
          {/* second layer */}
          <div
            style={{
              flex: 1,
              padding: "5px",
              display: "flex",
              flexDirection: "column",
              rowGap: "10px",
            }}
          >
            <div>
              <Autocomplete
                disableInput={props.disabled}
                ref={mortgageeSelect_}
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Bodily Injury: ",
                  style: {
                    display: "none",
                  },
                }}
                DisplayMember={"Mortgagee"}
                DataSource={[]}
                inputRef={mortgageeSelect}
                input={{
                  style: {
                    width: "100%",
                    flex: 1,
                  },
                }}
                onChange={(selected: any, e: any) => {
                  if (mortgageeSelect.current) {
                    mortgageeSelect.current.value = selected.Mortgagee;
                  }
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    formIndorsementRef.current?.focus();
                  }
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
              }}
            >
              <TextAreaInput
                containerStyle={{
                  flex: 1,
                }}
                label={{
                  title: "Address",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                    display: "none",
                  },
                }}
                textarea={{
                  // rows: 25,
                  disabled: props.disabled,
                  style: { flex: 1 },
                  defaultValue: `SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVER CLAUSE`,
                  onKeyDown: (e: any) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      remarksRef.current?.focus();
                    }
                  },
                }}
                _inputRef={formIndorsementRef}
              />
            </div>
            <div
              style={{
                height: "150px",
                display: "flex",
              }}
            >
              <TextAreaInput
                containerStyle={{
                  flex: 1,
                }}
                label={{
                  title: "Remarks",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "130px",
                    display: "none",
                  },
                }}
                textarea={{
                  disabled: props.disabled,
                  placeholder: "Remarks",
                  style: { flex: 1 },
                  defaultValue: "",
                  onKeyDown: (e: any) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      sectionI_IIRef.current?.focus();
                    }
                  },
                }}
                _inputRef={remarksRef}
              />
            </div>
          </div>
          {/* <div
            className="mobile-content-premium"
            style={{
              flex: 1,
              padding: "5px",
              display: "none",
              flexDirection: "column",
              rowGap: "10px",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                columnGap: "10px",
              }}
            >
              <input
                disabled={props.disabled}
                ref={mortgageecheckRef}
                type="checkbox"
                id="mortgagee"
                onChange={(e) => {
                  setFormIndorseValue(
                    e.target.checked,
                    formIndorsementRef,
                    mortgageeSelect
                  );
                }}
              />
              <label
                htmlFor="mortgagee"
                style={{
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Mortgagee:
              </label>
            </div>
            <div>
              <Autocomplete
                disableInput={props.disabled}
                ref={mortgageeSelect_}
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Bodily Injury: ",
                  style: {
                    display: "none",
                  },
                }}
                DisplayMember={"Mortgagee"}
                DataSource={[]}
                inputRef={mortgageeSelect}
                input={{
                  style: {
                    width: "100%",
                    flex: 1,
                  },
                }}
                onChange={(selected: any, e: any) => {
                  if (mortgageeSelect.current) {
                    mortgageeSelect.current.value = selected.Mortgagee;
                  }
                }}
                onKeydown={(e: any) => {
                  if (e.key === "Enter" || e.key === "NumpadEnter") {
                    e.preventDefault();
                    formIndorsementRef.current?.focus();
                  }
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                Form and Endorsement
              </span>
              <TextAreaInput
                containerStyle={{
                  flex: 1,
                }}
                label={{
                  title: "Address",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "150px",
                    display: "none",
                  },
                }}
                textarea={{
                  rows: 10,
                  disabled: props.disabled,
                  style: { flex: 1 },
                  defaultValue: `SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVER CLAUSE`,
                  onKeyDown: (e: any) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      remarksRef.current?.focus();
                    }
                  },
                }}
                _inputRef={formIndorsementRef}
              />
            </div>
            <div
              style={{
                height: "150px",
                display: "flex",
              }}
            >
              <TextAreaInput
                containerStyle={{
                  flex: 1,
                }}
                label={{
                  title: "Remarks",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "130px",
                    display: "none",
                  },
                }}
                textarea={{
                  disabled: props.disabled,
                  placeholder: "Remarks",
                  style: { flex: 1 },
                  defaultValue: "",
                  onKeyDown: (e: any) => {
                    if (e.key === "Enter" || e.key === "NumpadEnter") {
                      e.preventDefault();
                      sectionI_IIRef.current?.focus();
                    }
                  },
                }}
                _inputRef={remarksRef}
              />
            </div>
          </div> */}
        </div>
        {/* second layer */}
        <div
          className="container-max-width "
          style={{
            border: "1px solid #9ca3af",
            width: "40%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
            padding: "10px",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "10px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Premiums
          </span>
          <TextFormatedInput
            label={{
              title: "Section I/II:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
              display: policy === "COM" ? "none" : "flex",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  props.onComputation();
                  sectionIIIRef.current?.focus();
                }
              },
            }}
            inputRef={sectionI_IIRef}
          />
          <div
            style={{
              display: "flex",
              columnGap: "10px",
              height: "22px",
            }}
          >
            <TextFormatedInput
              label={{
                title: "Section III(%):",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              input={{
                disabled: props.disabled,
                defaultValue: "0.00",
                type: "text",
                style: { width: "calc(100% - 150px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    props.onComputation();
                    ownDamageRef.current?.focus();
                  }
                },
              }}
              inputRef={sectionIIIRef}
            />
            <div
              style={{
                height: "100%",
                width: "50px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconButton
                size="small"
                color="info"
                onClick={props.onComputation}
              >
                <CalculateIcon />
              </IconButton>
            </div>
          </div>
          <TextFormatedInput
            label={{
              title: "Own Damage:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  theftRef.current?.focus();
                }
              },
            }}
            inputRef={ownDamageRef}
          />
          <TextFormatedInput
            label={{
              title: "Theft:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  sectionIVARef.current?.focus();
                }
              },
            }}
            inputRef={theftRef}
          />
          <TextFormatedInput
            label={{
              title: "Section IV-A:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  sectionIVBRef.current?.focus();
                }
              },
            }}
            inputRef={sectionIVARef}
          />
          <TextFormatedInput
            label={{
              title: "Section IV-B:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  othersRef.current?.focus();
                }
              },
            }}
            inputRef={sectionIVBRef}
          />
          <TextFormatedInput
            label={{
              title: "Others:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  aogRef.current?.focus();
                }
              },
            }}
            inputRef={othersRef}
          />
          <div
            style={{
              display: "flex",
              columnGap: "10px",
              height: "22px",
              width: "100%",
            }}
          >
            <TextFormatedInput
              label={{
                title: "AOG",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              containerStyle={{
                width: "70%",
              }}
              input={{
                disabled: props.disabled,
                defaultValue: "0.5",
                type: "text",
                style: { width: "calc(100% - 150px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    _aogRef.current?.focus();
                  }
                },
              }}
              inputRef={aogRef}
            />
            <TextFormatedInput
              label={{
                title: "",
                style: {
                  display: "none",
                },
              }}
              containerStyle={{
                width: "30%",
              }}
              input={{
                disabled: props.disabled,
                defaultValue: "0.00",
                type: "text",
                style: { width: "100%" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    totalPremiumRef.current?.focus();
                  }
                },
              }}
              inputRef={_aogRef}
            />
          </div>
          <div
            style={{
              width: "100%",
              border: "1px dashed black",
              margin: "5px 0px",
            }}
          ></div>
          <TextFormatedInput
            label={{
              title: "Total Premium:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  vatRef.current?.focus();
                }
              },
            }}
            inputRef={totalPremiumRef}
          />
          <TextFormatedInput
            label={{
              title: "Vat:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  docstampRef.current?.focus();
                }
              },
            }}
            inputRef={vatRef}
          />
          <TextFormatedInput
            label={{
              title: "Doc Stamp:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  localGovTaxRef.current?.focus();
                }
              },
            }}
            inputRef={docstampRef}
          />
          <div
            style={{
              display: "flex",
              columnGap: "10px",
              height: "22px",
              width: "100%",
            }}
          >
            <TextFormatedInput
              label={{
                title: "Local Gov Tax",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "150px",
                },
              }}
              containerStyle={{
                width: "70%",
              }}
              input={{
                disabled: props.disabled,
                defaultValue: "0.75",
                type: "text",
                style: { width: "calc(100% - 150px)" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    _localGovTaxRef.current?.focus();
                  }
                },
              }}
              inputRef={localGovTaxRef}
            />
            <TextFormatedInput
              label={{
                title: "",
                style: {
                  display: "none",
                },
              }}
              containerStyle={{
                width: "30%",
              }}
              input={{
                disabled: props.disabled,
                defaultValue: "0.00",
                type: "text",
                style: { width: "100%" },
                onKeyDown: (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    stradComRef.current?.focus();
                  }
                },
              }}
              inputRef={_localGovTaxRef}
            />
          </div>
          <TextFormatedInput
            label={{
              title: "StradCom:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  totalDueRef.current?.focus();
                }
              },
            }}
            inputRef={stradComRef}
          />
          <div
            style={{
              width: "100%",
              border: "1px dashed black",
              margin: "5px 0px",
            }}
          ></div>
          <TextFormatedInput
            label={{
              title: "Total Due:",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "150px",
              },
            }}
            containerStyle={{
              width: "100%",
            }}
            input={{
              disabled: props.disabled,
              defaultValue: "0.00",
              type: "text",
              style: { width: "calc(100% - 150px)" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                }
              },
            }}
            inputRef={totalDueRef}
          />
        </div>
      </div>
    </div>
  );
});

interface CustomButtonProps {
  currentStepIndex: number;
  index: number;
}
export const CustomButton = styled.button`
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
  font-size: 17px;
  color:${(props: CustomButtonProps) => {
    return props.currentStepIndex === props.index ? "#0284c7;" : "#020617;";
  }}
  padding: 0;
  &:hover  {
    color: #64748b;
    background:white;
  },
`;

function formatNumber(Amount: number) {
  return Amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function setFormIndorseValue(
  check: boolean,
  formIndorsementRef: any,
  mortgageeSelect: any
) {
  if (check) {
    if (formIndorsementRef.current) {
      formIndorsementRef.current.value =
        "LOSS and/or DAMAGE, if any under this policy shall be payable to " +
        mortgageeSelect.current?.value +
        " as their interest may appear subject to all terms and conditions, clauses and warranties of this policy. SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING; PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVE CLAUSE THIS POLICY OR ANY RENEWAL THEREOF SHALL NOT BE CANCELLED WITHOUT PRIOR WRITTEN NOTIFICATION AND CONFORMIY TO " +
        mortgageeSelect.current?.value;
    }
  } else {
    if (formIndorsementRef.current) {
      formIndorsementRef.current.value =
        "SUBJECT TO THE ATTACHED STANDARD ACCESSORIES ENDORSEMENT CLAUSE; FULL PREMIUM PAYMENT IN CASE OF LOSS CLAUSE; MEMORANDUM ON DOCUMENTARY STAMPS TAX; ANTI CARNAPING PREVENTION TIPS AND AUTO PA RIDER; DRUNKEN AND DRIVER CLAUSE";
    }
  }
}
