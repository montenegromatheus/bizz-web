import React from "react";
import { MuiTelInput, MuiTelInputInfo } from "mui-tel-input";

export default function PhoneNumber() {
  const [value, setValue] = React.useState("+55");

  const handleChange = (newValue: string, info: MuiTelInputInfo) => {
    setValue(newValue);
  };

  return <MuiTelInput value={value} onChange={handleChange} />;
}
