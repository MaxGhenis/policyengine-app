import { useContext } from "react";
import { Row } from "react-bootstrap";
import Plot from "react-plotly.js";
import PolicyEngineContext from "../../../logic/PolicyEngineContext";
import style from "../../../style";
import { motion } from "framer-motion";
import ParameterOverTime from "./ParameterOverTime";
import { getFormattedParameterAtInstant, getParameterAtInstant, getReformedParameter } from "../../../logic/parameterValues";

function PolicyParameterInput(props) {
    const { parameter } = props;
    const PolicyEngine = useContext(PolicyEngineContext);
    const metadata = PolicyEngine.metadata.parameters[parameter];
    const reformedParameter = getReformedParameter(metadata, PolicyEngine.policyReform);
    const currentValue = getParameterAtInstant(reformedParameter, "2022-01-01");
    const submitValue = value => {
        let policyReform = PolicyEngine.policyReform;
        if (!policyReform[parameter]) {
            policyReform[parameter] = {};
        }
        policyReform[parameter]["2022-01-01.2022-12-31"] = +value;
        PolicyEngine.setState({ policyReform: policyReform });
    }


    return <motion.input
        pattern="[0-9]*"
        style={{
            padding: 20,
            marginLeft: 20,
            marginRight: 20,
            width: 200,
        }}
        whileFocus={{ scale: 1.05 }}
        onKeyUp={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                e.target.blur();
                let value = e.target.value;
                e.target.value = null;
                submitValue(value);
            }
        }}
        placeholder={currentValue}
    />
}


export default function PolicyPage() {
    const PolicyEngine = useContext(PolicyEngineContext);
    const page = PolicyEngine.policyPage;
    const parameters = PolicyEngine.metadata.parameters;
    if (!parameters[page]) {
        return null;
    }
    const parameter = parameters[page];
    // value is in the format: {"1999-01-01": 0.5, "2000-01-01": 0.6, ...}
    // We want to show a line chart with the values over time.

    return <div
        style={{
            padding: 50,
        }}
    >
        <h1>{parameter.label}</h1>
        <h5>{parameter.description}</h5>
        <PolicyParameterInput parameter={page} />
        <ParameterOverTime parameter={page} />
    </div>
}