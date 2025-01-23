"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { usePathname } from 'next/navigation'
import { menu } from "@/hooks/useMenuList";
import { CiSearch } from "react-icons/ci";
import { useRouter } from "next/navigation";
import LazyImage from "@/components/LazyImage";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSearchContext } from "@/context/SearchContext";
import { useAuth } from "@/context/AuthContext";


type HeaderMenu = {
    onOpen: () => void
}

export default function HeaderMenu({ onOpen }: HeaderMenu) {
    const { setQuery } = useSearchContext();
    const { accountDetail, logOut } = useAuth()
    const pathname = usePathname();
    const router = useRouter()
    const [isScrolling, setIsScrolling] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    let scrollTimeout: NodeJS.Timeout;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const newTimeout = setTimeout(() => {
            if (newQuery) {
                setQuery(newQuery);
                router.push('/search');
            }
        }, 1000);

        setDebounceTimeout(newTimeout);
    };


    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 150);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const backgroundColor = isScrolling ? "rgba(27, 30, 37, 1)" : "rgba(27, 30, 37, 0.68)";

    return (
        <header
            className={`w-full fixed top-0 left-0 z-10 h-[var(--header-height)] px-4 md:px-10 gap-15 shadow-[0px_2px_8px_0px_#0000007A] transition-all duration-300`}
            style={{ backgroundColor }}
        >
            <nav className="size-full flex justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <h2 className="w-max flex justify-center items-center gap-2 font-bold">
                            <img src="/wLogo.png" alt="logo" className="size-6 md:size-10" />
                            <span className="text-white tracking-[8px]">挖!影</span>
                        </h2>
                    </Link>
                    <Input
                        className=" md:max-xl:w-40 text-sm h-9 text-white border-[#686B72] placeholder:text-[#686B72]"
                        placeholder="搜尋劇名/演員"
                        icon={<CiSearch className="size-5" />}
                        onChange={handleInputChange}
                    />
                </div>
                <ul className="hidden md:flex items-end gap-8 text-white ">
                    {menu.map((item) => (
                        <li key={item.name} className="pb-1">
                            <Link href={item.link} className={`max-md:text-sm pb-1 ${pathname === item.link ? 'border-gradient' : ''}`}>{item.name}</Link>
                        </li>
                    ))}
                    {
                        accountDetail?.avatar.tmdb.avatar_path || accountDetail?.avatar.gravatar.hash ?
                            <li className="cursor-pointer size-10 flex items-center justify-center rounded-full bg-gray-700 overflow-hidden">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center justify-center outline-none size-full">
                                        {accountDetail?.avatar.tmdb.avatar_path ?
                                            <LazyImage src={`https://image.tmdb.org/t/p/original${accountDetail?.avatar.tmdb.avatar_path}`} alt="logo" imgClass=" object-cover" />
                                            : <LazyImage src={`https://www.gravatar.com/avatar/${accountDetail?.avatar.gravatar.hash}`} alt="logo" imgClass="object-cover" />
                                        }
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-[#161616] text-white border-none">
                                        <DropdownMenuLabel>{accountDetail?.username}</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-gray-500" />
                                        <DropdownMenuItem onClick={() => logOut()} >登出</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </li>
                            :
                            <li className="cursor-pointer" onClick={() => onOpen()}>
                                <img src="/wLogo.svg" alt="logo" className="size-10" />
                            </li>
                    }
                </ul>
            </nav>
        </header>
    );
}
