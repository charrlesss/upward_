
import { useRef } from "react";
import { SelectInput, TextInput } from "../../../../components/UpwardFields";

export default function ChekPostponementRequest() {
    const RPCDNoRef = useRef<HTMLSelectElement>(null)
    const Br = useRef<HTMLSelectElement>(null)
    return (
        <div>

            <div>
                <SelectInput
                    label={{
                        title: "Reason : ",
                        style: {
                            fontSize: "12px",
                            fontWeight: "bold",
                            width: "100px",
                        },
                    }}
                    selectRef={RPCDNoRef}
                    select={{
                        style: { flex: 1, height: "22px" },
                        defaultValue: "Non-VAT",
                        onChange: (e) => {

                        }

                    }}
                    containerStyle={{
                        width: "50%",
                        marginBottom: "12px"
                    }}
                    datasource={[
                        { key: "", value: "" },
                        { key: "Fully Paid", value: "Fully Paid" },
                        { key: "Cash Replacement", value: "Cash Replacement" },
                        { key: "Check Replacement", value: "Check Replacement" },
                        { key: "Account Closed", value: "Account Closed" },
                        { key: "Hold", value: "Hold" },
                        { key: "Not Renewed by Camfin", value: "Not Renewed by Camfin" },
                    ]}
                    values={"value"}
                    display={"key"}
                />
                <SelectInput
                    label={{
                        title: "Reason : ",
                        style: {
                            fontSize: "12px",
                            fontWeight: "bold",
                            width: "100px",
                        },
                    }}
                    selectRef={RPCDNoRef}
                    select={{
                        style: { flex: 1, height: "22px" },
                        defaultValue: "Non-VAT",
                        onChange: (e) => {

                        }

                    }}
                    containerStyle={{
                        width: "50%",
                        marginBottom: "12px"
                    }}
                    datasource={[
                        { key: "", value: "" },
                        { key: "Fully Paid", value: "Fully Paid" },
                        { key: "Cash Replacement", value: "Cash Replacement" },
                        { key: "Check Replacement", value: "Check Replacement" },
                        { key: "Account Closed", value: "Account Closed" },
                        { key: "Hold", value: "Hold" },
                        { key: "Not Renewed by Camfin", value: "Not Renewed by Camfin" },
                    ]}
                    values={"value"}
                    display={"key"}
                />
            </div>
            <div></div>
        </div>
    )
}