import CenteredMiddleColumn from "../../../layout/CenteredMiddleColumn";
import ParameterOverTime from "./ParameterOverTime";
import { DatePicker, Switch } from "antd";
import moment from "moment";
import InputField from "../../../controls/InputField";
import {
  getNewPolicyId,
  getParameterAtInstant,
  getReformedParameter,
} from "../../../api/parameters";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { copySearchParams } from "../../../api/call";

const { RangePicker } = DatePicker;

export default function ParameterEditor(props) {
  const { metadata, policy, parameterName } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  const parameter = metadata.parameters[parameterName];
  const reformedParameter = getReformedParameter(parameter, policy.reform.data);

  const [startDate, setStartDate] = useState("2022-01-01");
  const [endDate, setEndDate] = useState("2027-12-31");

  let control;

  if (parameter.unit === "bool" || parameter.unit === "abolition") {
    control = (
      <div style={{ padding: 10 }}>
        <Switch
          checked={getParameterAtInstant(reformedParameter, startDate)}
          onChange={(value) => {
            let newPolicy = { ...policy.reform.data };
            newPolicy[parameterName] = {
              ...newPolicy[parameterName],
              [`${startDate}.${endDate}`]: !!value,
            };
            getNewPolicyId(metadata.countryId, newPolicy).then(
              (newPolicyId) => {
                let newSearch = copySearchParams(searchParams);
                newSearch.set("reform", newPolicyId);
                setSearchParams(newSearch);
              }
            );
          }}
        />
      </div>
    );
  } else {
    control = (
      <InputField
        placeholder={getParameterAtInstant(reformedParameter, startDate)}
        onChange={(value) => {
          let newPolicy = { ...policy.reform.data };
          newPolicy[parameterName] = {
            ...newPolicy[parameterName],
            [`${startDate}.${endDate}`]: +value,
          };
          getNewPolicyId(metadata.countryId, newPolicy).then((newPolicyId) => {
            let newSearch = copySearchParams(searchParams);
            newSearch.set("reform", newPolicyId);
            setSearchParams(newSearch);
          });
        }}
      />
    );
  }
  const editControl = (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 20,
      }}
    >
      <RangePicker
        defaultValue={[moment(startDate), moment(endDate)]}
        onChange={(_, dateStrings) => {
          setStartDate(dateStrings[0]);
          setEndDate(dateStrings[1]);
        }}
        separator="→"
        style={{ padding: 20 }}
      />
      {control}
    </div>
  );

  return (
    <CenteredMiddleColumn
      marginTop="5%"
      marginBottom={0}
      title={parameter.label}
      description={parameter.description}
    >
      {editControl}
      <ParameterOverTime parameter={parameter} policy={policy} />
    </CenteredMiddleColumn>
  );
}
