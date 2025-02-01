"use client"

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import LazyImage from "@/components/LazyImage";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { PiSpinnerGapBold } from "react-icons/pi";

import Link from "next/link";

interface MovieSectionProps<T> {
    title?: string;
    type?: "movie" | "tv"
    layout?: "grid" | "carousel";
    list: T[];
    total?: number
    isLoading?: boolean
    className?: string
    titleClassName?: string
    onSearchMore?: () => void;
}

interface MovieItem {
    id: number;
    poster_path: string;
    vote_average: number;
    title?: string;
    name?: string;
}

const MovieSection = <T extends MovieItem>({ className, title, titleClassName, total = 0, list, type = "movie", isLoading = false, layout = "carousel", onSearchMore }: MovieSectionProps<T>) => {
    const [isShowMoreLoading, setIsShowMoreLoading] = useState(false);
    const prevListRef = useRef<T[]>([]);

    const searchMore = () => {
        setIsShowMoreLoading(true);
        onSearchMore?.();
    }

    useEffect(() => {
        if (list !== prevListRef.current) {
            setIsShowMoreLoading(false);
        }
        prevListRef.current = list;
    }, [list])

    return (
        <section className={cn('flex flex-col gap-4 mt-4', className, layout === 'grid' && 'gap-8')}>
            {title && <h4 className={cn('text-white', titleClassName)}>{title}</h4>}

            {!isLoading && layout === "carousel" &&
                <Carousel className="w-full">
                    <CarouselContent className={cn('flex gap-4')}>
                        {list?.map((item) => (
                            <CarouselItem className="flex-shrink-0 sm:basis-[160px] basis-[calc(100%/3-2rem/3)]" key={item.id}>
                                <Link href={`/${type}/${item.id}`} className="h-full flex flex-col gap-1">
                                    <div className="h-full relative">
                                        {
                                            item.poster_path ?
                                                <LazyImage
                                                    src={`https://image.tmdb.org/t/p/original${item.poster_path}`}
                                                    alt={item.title}
                                                    imgClass="object-cover rounded-[8px] aspect-[4/6]"
                                                />
                                                : <div className="h-full flex items-center justify-center object-contain rounded-[8px] bg-[#1B1E25]">
                                                    <img src="/wEmpty.svg" alt="logo" className="size-10" />
                                                </div>
                                        }
                                        <span
                                            className="bg-gradient absolute bottom-1 right-1 text-white text-sm px-2 py-1 rounded-md"
                                        >
                                            {item.vote_average.toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="text-center text-white text-sm line-clamp-1">
                                        {type === 'movie' && item.title}
                                        {type === 'tv' && item.name}
                                    </div>
                                </Link>
                            </CarouselItem>
                        )) ?? []}
                    </CarouselContent>
                    <CarouselPrevious className="hidden 2xl:flex text-white" />
                    <CarouselNext className="hidden 2xl:flex text-white" />
                </Carousel>}

            {layout === 'grid' &&
                <div className="flex flex-wrap gap-4">
                    {list?.map((item) => (
                        <div className="flex-shrink-0 sm:w-[160px] w-[calc(100%/3-2rem/3)]" key={item.id}>
                            <Link href={`/${type}/${item.id}`} className="flex flex-col gap-1">
                                <div className="size-full relative">
                                    {
                                        item.poster_path ?
                                            <LazyImage
                                                src={`https://image.tmdb.org/t/p/original${item.poster_path}`}
                                                alt={item.title}
                                                imgClass="object-cover rounded-[8px] aspect-[4/6]"
                                            />
                                            : <div className="flex items-center justify-center object-contain rounded-[8px] aspect-[4/6] bg-[#1B1E25]">
                                                <img src="/wEmpty.svg" alt="logo" className="size-10" />
                                            </div>
                                    }
                                    <span
                                        className="bg-gradient absolute bottom-1 right-1 text-white text-sm px-2 py-1 rounded-md"
                                    >
                                        {item.vote_average.toFixed(1)}
                                    </span>
                                </div>
                                <div className="text-center text-white text-sm line-clamp-1">
                                    {type === 'movie' && item.title}
                                    {type === 'tv' && item.name}
                                </div>
                            </Link>
                        </div>
                    )) ?? []}
                </div>

            }

            {layout === 'grid' && list?.length !== 0 && total > list?.length &&
                <div className="flex justify-center">
                    <Button variant="gradient" className="w-40" onClick={searchMore}>
                        載入更多
                        {isShowMoreLoading && <PiSpinnerGapBold className="text-white animate-spin" />}
                    </Button>
                </div>
            }
        </section>
    );
};
MovieSection.displayName = 'MovieSection'
export default React.memo(MovieSection);


