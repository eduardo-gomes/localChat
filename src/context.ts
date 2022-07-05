import React from "react";
import { ContactInfo } from "./lib";


type ContextInfo = {
	contactInfo: ContactInfo[],
	setContactInfo: React.Dispatch<React.SetStateAction<ContactInfo[]>>,
};

const AppContext = React.createContext<ContextInfo | undefined>(undefined);

export default AppContext;
export type { ContextInfo };