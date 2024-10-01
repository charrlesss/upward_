import { useSearchParams } from "react-router-dom";

export default function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams({
    drawer: "true",
    classification: "Client",
    selected: "",
    entrySearch: "",
    page: "1",
    pageSize: "100",
    policySearch: "",
    subaccountSearch: "",
    mortgageeSearch: "",
    sublineSearch: "",
    ratesSearch: "",
    ctplSearch: "",
    bankSearch:'',
    chartAccountSearch:'',
    transactionCodeSearch:'',
    pettyCashtTransactionSearch:'',
    bankAccountSearch:'',
  });

  return {
    searchParams,
    setSearchParams,
  };
}
