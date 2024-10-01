import { createContext } from "react";

export const EntryContext = createContext<{
  rows: any;
  setRows: any;
  setLoadingSearch: any;
  loadingSearch: any;
  setSaveButtonDisabled: any;
  saveButtonDisabled: any;
  setExportMode: any;
  exportMode: any;
}>({
  setRows: () => {},
  rows: [],
  setLoadingSearch: () => {},
  loadingSearch: false,
  setSaveButtonDisabled: () => {},
  saveButtonDisabled: false,
  setExportMode: () => {},
  exportMode: false
});
