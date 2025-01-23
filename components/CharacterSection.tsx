"use client"

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils"
import LazyImage from "@/components/LazyImage";
import { Button } from "@/components/ui/button"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { PiSpinnerGapBold } from "react-icons/pi";


interface CharacterSection<T> {
    title?: string;
    layout?: "grid" | "carousel";
    list: T[];
    total?: number
    isLoading?: boolean
    className?: string
    titleClassName?: string
    onSearchMore?: () => void;
}

interface CharacterItem {
    id: number;
    profile_path: string | null;
    name: string
}

const CharacterSection = React.memo(<T extends CharacterItem>({ className, title, titleClassName, list, isLoading = false, total = 0, layout = "carousel", onSearchMore }: CharacterSection<T>) => {
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

            {isLoading && !isShowMoreLoading &&
                <div className="flex justify-center">
                    <img src="/loading.gif" alt="loading" className="w-[10rem]" />
                </div>
            }

            {!isLoading && layout === "carousel" &&
                <Carousel className="w-full">
                    <CarouselContent className={cn('flex gap-4')}>
                        {list?.map((item) => (
                            <CarouselItem className="flex-shrink-0 basis-[75px] flex flex-col gap-1" key={item.id}>
                                <div className="relative">
                                    {
                                        item.profile_path ?
                                            <LazyImage
                                                src={`https://image.tmdb.org/t/p/original/${item.profile_path}`}
                                                alt={item.name}
                                                imgClass="object-contain rounded-[20px]"
                                            />
                                            : <div className="flex items-center justify-center object-contain rounded-[8px] aspect-[4/6] bg-[#1B1E25]">
                                                <LazyImage src="/wEmpty.svg" alt="logo" imgClass="size-10" />
                                            </div>
                                    }
                                </div>
                                <div className="text-center text-white text-sm line-clamp-1">
                                    {item.name}</div>
                            </CarouselItem>
                        )) ?? []}
                    </CarouselContent>
                    <CarouselPrevious className="hidden 2xl:flex text-white" />
                    <CarouselNext className="hidden 2xl:flex text-white" />
                </Carousel>}


            {!isLoading && layout === 'grid' &&
                <div className="flex flex-wrap gap-4">
                    {list?.map((item) => (
                        <div className="flex-shrink-0 sm:basis-[100px] w-[calc(100%/3-2rem/3)]" key={item.id}>
                            <div className="flex flex-col gap-1">
                                <div className="relative">
                                    {
                                        item.profile_path ?
                                            <LazyImage
                                                src={`https://image.tmdb.org/t/p/original/${item.profile_path}`}
                                                alt={item.name}
                                                imgClass="object-contain rounded-[8px] aspect-[4/6]"
                                            />
                                            : <div className="flex items-center justify-center object-contain rounded-[8px] aspect-[4/6] bg-[#1B1E25]">
                                                <LazyImage src="/wEmpty.svg" alt="logo" imgClass="size-10" />
                                            </div>
                                    }
                                </div>
                                <div className="text-center text-white text-sm line-clamp-1">
                                    {item.name}
                                </div>
                            </div>
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
});
CharacterSection.displayName = 'CharacterSection'
export default CharacterSection;
