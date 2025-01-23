"use client";

import { createContext, useContext, useState } from "react";

interface SearchContextProps {
    query: string;
    setQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const useSearchContext = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearchContext must be used within a SearchContext.Provider");
    }
    return context;
};

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const [query, setQuery] = useState<string>("");

    return (
        <SearchContext.Provider value={{ query, setQuery }}>
            {children}
        </SearchContext.Provider>
    );
};
