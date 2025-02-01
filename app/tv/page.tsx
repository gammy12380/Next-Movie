"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { fetchAPI } from "@/hooks/apiClient";
import LoadingSpin from "@/components/LoadingSpin";
import MovieSection from "@/components/MovieSection";
import { FaSortAmountDown } from "react-icons/fa";
import { FaSortAmountUp } from "react-icons/fa";
import { Genres, MovieCommon, MovieList } from "@/app/types/movie";
import { useEffect, useState, useCallback } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

function generateYearArray(startYear: number): number[] {
    const currentYear = new Date().getFullYear();
    const yearArray: number[] = [];
    for (let year = startYear; year <= currentYear; year++) {
        yearArray.push(year);
    }
    return yearArray.reverse();
}


export default function TV() {
    const [isLoading, setIsLoading] = useState(true);
    const [sectionLoading, setSectionLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [genres, setGenres] = useState<{ id: number | undefined, name: string }[]>([])
    const [tvList, setTvList] = useState<MovieList[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [isSearchTriggered, setIsSearchTriggered] = useState(false);
    const [searchParams, setSearchParams] = useState<{
        genreType: number | undefined;
        year: number | undefined;
        score: number;
        byType: { name: string; value: string };
        sort: string;
    }>({
        genreType: undefined,
        year: undefined,
        score: 5,
        byType: { name: '人氣', value: 'popularity' },
        sort: 'desc',
    });
    const [yearArray, setYearArray] = useState<number[]>([]);

    const byTypes = [{ name: '評分', value: 'vote_average' },
    { name: '人氣', value: 'popularity' },
    { name: '首播日期', value: 'first_air_date' },
    { name: '評分數量', value: 'vote_count' }];

    const genresUrl = '/genre/tv/list'
    const discoverTVUrl = '/discover/tv?region=TW'

    const setGenreTypeHandler = (value?: number) => {
        setSearchParams((prev) => ({ ...prev, genreType: value }));
    };
    
    const setYearHandler = (value?: number) => {
        setSearchParams((prev) => ({ ...prev, year: value }));
    };
    
    const setByTypeHandler = (value: { name: string, value: string }) => {
        setSearchParams((prev) => ({ ...prev, byType: value }));
    };
    
    const setScoreHandler = (value: number[]) => {
        setSearchParams((prev) => ({ ...prev, score: value[0] }));
    };

    const setSortHandler = () => {
        const newSort = searchParams.sort === 'desc' ? 'asc' : 'desc';
        setSearchParams((prev) => ({ ...prev, sort: newSort }));
    }


    const fetchTVData = useCallback(async () => {
        const init = page === 1
        init ? setIsLoading(true) : setSectionLoading(true);
        const queryParams = {
            with_genres: searchParams.genreType,
            first_air_date_year: searchParams.year,
            'vote_average.gte': searchParams.score,
            sort_by: `${searchParams.byType.value}.${searchParams.sort}`,
            page,
        };
        try {
            const res = await fetchAPI<MovieCommon<MovieList>>(discoverTVUrl, { queryParams })
            if(init) setTvList([])
            setTotal(res.total_results ?? 0)
            setTvList((prev) => {
                const uniqueMovies = [...prev, ...res.results].filter(
                    (movie, index, self) => self.findIndex((m) => m.id === movie.id) === index
                );
                return uniqueMovies;
            });
            if (isDrawerOpen) {
                setIsDrawerOpen(false)
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            init ? setIsLoading(false) : setSectionLoading(false)
        }
    },[searchParams, page])

    const fetchGenres = useCallback(async()=>{
        const genresRes = await fetchAPI<Genres>(genresUrl);
        setGenres([{ name: '全部', id: undefined }, ...genresRes.genres]);
    },[])


    const searchMore = async () => {
        setIsSearchTriggered(true);
        setPage((prev) => prev + 1)
        fetchTVData()
    }

    useEffect(() => {
        setIsSearchTriggered(false);
    }, [searchParams]);

    useEffect(() => {
        fetchTVData();
    }, [searchParams.sort,page, isSearchTriggered]);

    useEffect(()=>{
        fetchGenres();
    },[fetchGenres])

    useEffect(() => {
        const generatedYearArray = generateYearArray(2010);
        setYearArray(generatedYearArray);
    }, []);


    if (isLoading) {
        return <LoadingSpin />
    }

    return (
        <div className="space-y-4 py-4">
            <div className="max-sm:hidden flex flex-col gap-4 p-8 bg-[#686B721A] xl:rounded-[20px]">
                <div className="flex flex-col gap-4">
                    <h4 className="primary-label text-white">類型</h4>
                    <div className="flex flex-wrap gap-2">
                        {
                            genres.map(item => (
                                <Button size="sm" className="px-4" variant={searchParams.genreType === item.id ? 'gradient' : undefined} key={item.id ?? item.name}
                                    onClick={() => setGenreTypeHandler(item.id)}>
                                    {item.name}
                                </Button>
                            ))
                        }
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <h4 className="primary-label text-white">年份</h4>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="px-4" variant={searchParams.year === undefined ? 'gradient' : undefined}
                            onClick={() => setYearHandler(undefined)}>
                            全部
                        </Button>
                        {
                            yearArray.map(item => (
                                <Button size="sm" className="px-4" variant={searchParams.year === item ? 'gradient' : undefined} key={item}
                                    onClick={() => setYearHandler(item)}>
                                    {item}
                                </Button>
                            ))
                        }
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-1 gap-2">
                        <h4 className="primary-label text-white min-w-max">評分</h4>
                        <div className="flex items-center w-full gap-2 text-white">
                            <span>0</span>
                            <Slider defaultValue={[searchParams.score]} max={10} step={1} onValueChange={setScoreHandler} />
                            <span>10</span>
                        </div>

                    </div>
                    <div className="flex-1 flex justify-end">
                        <Button variant="gradient" className="w-40" onClick={() => fetchTVData()}>搜尋</Button>
                    </div>
                </div>
            </div>
            <div className="max-sm:p-4 p-8 bg-[#686B721A] xl:rounded-[20px] flex items-center justify-between gap-2">
                <div className="flex gap-2 max-sm:flex-wrap">
                    {
                        byTypes.map((item, idx) => (
                            <Button key={idx} className="max-[395px]:px-2 max-sm:text-xs max-sm:w-fit w-[100px]" variant={searchParams.byType.name === item.name ? 'gradient' : undefined}
                                onClick={() => setByTypeHandler(item)}>{item.name}</Button>
                        ))
                    }
                </div>
                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger className="text-white"><img src="/filter.svg" alt="filter" className="sm:hidden" /></DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle><div className="primary-label text-white text-left">類型</div></DrawerTitle>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {
                                        genres.map(item => (
                                            <Button size="sm" className="px-4" variant={searchParams.genreType === item.id ? 'gradient' : undefined} key={item.id ?? item.name}
                                                onClick={() => setGenreTypeHandler(item.id)}>
                                                {item.name}
                                            </Button>
                                        ))
                                    }
                                </div>
                            </div>
                            <DrawerTitle><div className="primary-label text-white text-left">年份</div></DrawerTitle>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" className="px-4" variant={searchParams.year === undefined ? 'gradient' : undefined}
                                        onClick={() => setYearHandler(undefined)}>
                                        全部
                                    </Button>
                                    {
                                        yearArray.map(item => (
                                            <Button size="sm" className="px-4" variant={searchParams.year === item ? 'gradient' : undefined} key={item}
                                                onClick={() => setYearHandler(item)}>
                                                {item}
                                            </Button>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-1 gap-2">
                                    <div className="primary-label text-white min-w-max">評分</div>
                                    <div className="flex items-center w-full gap-2 text-white">
                                        <span>0</span>
                                        <Slider defaultValue={[searchParams.score]} max={10} step={1} onValueChange={setScoreHandler} />
                                        <span>10</span>
                                    </div>

                                </div>
                            </div>
                        </DrawerHeader>
                        <DrawerFooter>
                            <Button variant="gradient" className="w-full" onClick={() => fetchTVData()}>搜尋</Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div>
            <div className="max-sm:p-4 py-4 px-8">
                <div className="flex justify-between">
                    <h4 className="text-white text-lg max-sm:text-sm">影集</h4>
                    <div className="text-white cursor-pointer" onClick={() => setSortHandler()}>
                        {searchParams.sort === 'desc' && <FaSortAmountDown className="max-sm:size-4 size-5" />}
                        {searchParams.sort === 'asc' && <FaSortAmountUp className="max-sm:size-4 size-5" />}
                    </div>
                </div>
                <MovieSection isLoading={sectionLoading} layout="grid" total={total} type="tv" list={tvList} onSearchMore={searchMore} />
            </div>
        </div>
    )

}