// context/AlertContext.js
import { createContext, useContext, useState, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


type AlertContext = {
	showAlert: (title?: string, content?: string) => void
}

const AlertContext = createContext<AlertContext | undefined>(undefined);

export const useAlert = () => {
	const context = useContext(AlertContext);
	if (!context) {
		throw new Error("useAlert must be used within an AlertProvider");
	}
	return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
	const [alert, setAlert] = useState<{
		visible: boolean, title: string | undefined, content: string | undefined
	}>({ visible: false, title: undefined, content: undefined });

	const showAlert = (title?: string, content?: string) => {
		setAlert({ visible: true, title, content });
		setTimeout(() => {
			setAlert({ visible: false, title: undefined, content: undefined });
		}, 3000);
	};

	return (
		<AlertContext.Provider value={{ showAlert }}>
			{children}
			{alert.visible && (
				<div className="fixed top-0 left-1/2 -translate-x-1/2 z-100 max-w-40 pt-[var(--header-height)]">
					<Alert className="w-max px-4 py-2 bg-[#161616] text-white border-none">
						{alert.title && <AlertTitle className="mb-0">{alert.title}</AlertTitle>}
						{alert.content && <AlertDescription className="mb-0">{alert.content}</AlertDescription>}
					</Alert>
				</div>
			)}
		</AlertContext.Provider>
	);
};
