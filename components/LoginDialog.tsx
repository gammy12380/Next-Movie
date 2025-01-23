"use client"

import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchAPI } from "@/hooks/apiClient";
import { ValidateLoginRes, LoginRequestBody, SessionRes, TokenRes } from "@/app/types/movie";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

type LoginDialog = {
    open?: boolean
    onOpenChange: (isOpen: boolean) => void
}

type FieldInput = {
    value: string
    error: boolean
}

export function LoginDialog({ open = false, onOpenChange }: LoginDialog) {
    const { showAlert } = useAlert()
    const { setIsLoggedIn, setSessionId } = useAuth()
    const [resToken, setResToken] = useState('')
    const [username, setUsername] = useState<FieldInput>({
        value: "",
        error: false
    });
    const [password, setPassword] = useState<FieldInput>({
        value: "",
        error: false
    });
    const [loginError, setError] = useState('')


    const resTokenUrl = '/authentication/token/new';
    const validateLoginUrl = '/authentication/token/validate_with_login'
    const sessionUrl = '/authentication/session/new'


    const getResToken = async () => {
        const res = await fetchAPI<TokenRes>(resTokenUrl)

        setResToken(res.request_token)
    }

    const loginHandler = async () => {
        const usernameError = !username.value;
        const passwordError = !password.value;

        setUsername((prevState) => ({
            ...prevState,
            error: !prevState.value,
        }));
        setPassword((prevState) => ({
            ...prevState,
            error: !prevState.value,
        }));

        if (usernameError || passwordError) {
            return;
        }

        await getResToken()

    }

    const getSessionId = async () => {
        const res = await fetchAPI<SessionRes>(sessionUrl, {
            method: 'POST',
            body: {
                request_token: resToken
            }
        })

        if (res.success) {
            setIsLoggedIn(true)
            window.localStorage.setItem('session-id', res.session_id)
            setSessionId(res.session_id)
        }
    }


    const loginApi = async () => {
        const body = {
            username: username.value,
            password: password.value,
            request_token: resToken
        }

        try {
            const res = await fetchAPI<ValidateLoginRes, LoginRequestBody>(validateLoginUrl, {
                method: 'POST', body,
            });
            if (res?.success) {
                await getSessionId()
                onOpenChange(false)
                showAlert('登入成功')
                return
            }
        } catch (error) {
            setError('登入失敗')
            console.log(error)
        }
    }

    useEffect(() => {
        resToken && loginApi()
    }, [resToken])

    const changeUsername = (e: ChangeEvent<HTMLInputElement>) => {
        setUsername({
            value: e.target.value,
            error: !e.target.value,
        });
    }
    const changePassword = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword({
            value: e.target.value,
            error: !e.target.value,
        });
    }



    const openChange = (isOpen: boolean) => {
        if (!isOpen) {
            setUsername({
                value: '',
                error: false,
            });
            setPassword({
                value: '',
                error: false,
            });
        }
        onOpenChange(isOpen)
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => openChange(isOpen)}>
            <DialogContent className="grid sm:max-w-[425px] bg-[#161616] border-none">
                <DialogHeader>
                    <DialogTitle className="text-white">請登入TMDB帳號</DialogTitle>
                    <DialogDescription className="text-red-500">{loginError}</DialogDescription>
                </DialogHeader>
                <form className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className={`text-right text-white text-sm w-max ${username.error && 'text-red-500'}`}>
                            使用者名稱
                        </Label>
                        <Input
                            id="username"
                            value={username.value}
                            autoComplete="username"
                            onChange={(e) => changeUsername(e)}
                            wrapClassName="grid col-span-3"
                            className={`placeholder:text-white text-white border-gray-500 ${username.error && 'border-red-500'}`}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className={`text-right text-white text-sm w-max ${password.error && 'text-red-500'}`}>
                            密碼
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password.value}
                            onChange={(e) => changePassword(e)}
                            wrapClassName="grid col-span-3"
                            className={`placeholder:text-white text-white border-gray-500 ${password.error && 'border-red-500'}`}
                        />
                    </div>
                </form>
                <DialogFooter>
                    <Button type="submit" variant="secondary" onClick={() => loginHandler()}>登入</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}