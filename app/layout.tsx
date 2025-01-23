"use client";

import React, { useState } from "react";
import "./globals.css";
import './i18n/index';

import HeaderMenu from "@/components/HeaderMenu";
import Footer from "@/components/Footer";
import MobileMenu from "@/components/MobileMenu";
import { LoginDialog } from "@/components/LoginDialog";
import { SearchProvider } from "@/context/SearchContext";
import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/context/AlertContext";


interface AppPropsWithChildren {
  children: React.ReactNode;
}

export default function Layout({ children }: AppPropsWithChildren) {
  const [open, setOpen] = useState(false)


  const onOpen = () => {
    setOpen(true)
  }

  return (
    <html lang="zh-Hant">
      <head>
        <title>挖影</title>
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="description" content="挖影為你帶來最新的電影和影集資訊，評測與推薦，探索更多娛樂內容。" />
        <meta name="keywords" content="電影, 影集, 電影推薦, 影集推薦, 最新電影, 影集資訊" />
      </head>

      <body>
        <AlertProvider>
          <AuthProvider>
            <SearchProvider>
              <HeaderMenu onOpen={() => onOpen()} />

              <main className="w-full min-h-screen grid grid-cols-1 grid-rows-[1fr_auto] justify-center pt-[var(--header-height)]">
                <div className="w-full max-2xl:overflow-hidden 2xl:max-w-7xl justify-self-center">
                  {children}
                </div>
              </main>


              <Footer />
              <MobileMenu onOpen={() => onOpen()} />

              <LoginDialog open={open} onOpenChange={(isOpen) => setOpen(isOpen)} />
            </SearchProvider>
          </AuthProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
