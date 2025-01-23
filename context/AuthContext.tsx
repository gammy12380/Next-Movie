import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { fetchAPI } from "@/hooks/apiClient";
import { AccountDetailRes } from "@/app/types/movie";
import { useAlert } from "@/context/AlertContext";

type AuthContextType = {
    isLoggedIn: boolean;
    sessionId: string | null
    accountDetail: AccountDetailRes | null
    setIsLoggedIn: (value: boolean) => void
    setSessionId: (value: string) => void
    clear: () => void
    logOut: () => void
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { showAlert } = useAlert()
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [accountDetail, setAccountDetail] = useState<AccountDetailRes | null>(null)

    const detailUrl = '/account'

    const getDetail = async () => {
        const res = await fetchAPI<AccountDetailRes>(`${detailUrl}`)
        setAccountDetail(res)
    }

    const clear = () => {
        setSessionId(null)
        setAccountDetail(null)
        setIsLoggedIn(false)
    }

    const logOut = async () => {
        await fetchAPI('/authentication/session', {
            method: "DELETE", body: {
                session_id: sessionId
            }
        })
        window.localStorage.removeItem('session-id')
        clear()
        showAlert('登出成功')
    }


    useEffect(() => {
        if (window.localStorage.getItem('session-id')) {
            setSessionId(window.localStorage.getItem('session-id'))
        }
    }, [])

    useEffect(() => {
        if (sessionId) {
            getDetail()
            setIsLoggedIn(true)
        }
    }, [sessionId])

    return (
        <AuthContext.Provider value={{ isLoggedIn, sessionId, accountDetail, setIsLoggedIn, setSessionId, clear, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
