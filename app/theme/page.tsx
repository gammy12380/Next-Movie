"use client"

import Link from "next/link";
import { themeData } from "@/hooks/theme/useThemeData";

export default function Theme() {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {
                themeData.map((item, idx) => (
                    <Link href={{
                        pathname: `theme/${item.target}`,
                        query: {
                            original: item.original,
                            genreId: item.genreId,
                            keyword: item.keyword
                        }
                    }} key={idx} className="group rounded-[8px] overflow-hidden cursor-pointer relative shadow-[0_2px_8px_0_#0000007A]">
                        <img src={item.src} alt={item.title} className="aspect-[16/9] group-hover:opacity-80 transition-all" />
                        <div className="bg-gradient-shadow absolute top-0 left-0 size-full"></div>
                        <h4 className="text-white absolute right-2 bottom-1">{item.title}</h4>
                    </Link>
                ))
            }
        </div>
    )

}