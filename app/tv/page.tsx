"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { fetchAPI } from "@/hooks/apiClient";
import LoadingSpin from "@/components/LoadingSpin";
import MovieSection from "@/components/MovieSection";
import { FaSortAmountDown } from "react-icons/fa";
import { FaSortAmountUp } from "react-icons/fa";
import { Genres, MovieCommon, MovieList } from "@/app/types/movie";
import { useEffect, useState } from "react";
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
    const [score, setScore] = useState(5)
    const [year, setYear] = useState<number | undefined>(undefined)
    const [tvList, setTvList] = useState<MovieList[]>([])
    const [total, setTotal] = useState(0)
    const [genreType, setGenreType] = useState<number | undefined>(undefined)
    const [byType, setByType] = useState({ name: '人氣', value: 'popularity' })
    const [page, setPage] = useState(1)
    const [sort, setSort] = useState('desc')

    const yearArray: number[] = generateYearArray(2010);


    const byTypes = [{ name: '評分', value: 'vote_average' },
    { name: '人氣', value: 'popularity' },
    { name: '首播日期', value: 'first_air_date' },
    { name: '評分數量', value: 'vote_count' }];

    const genresUrl = '/genre/tv/list'
    const discoverTVUrl = '/discover/tv?region=TW'

    const setGenreTypeHandler = (value?: number) => {
        setGenreType(value)
    }

    const setYearHandler = (value?: number) => {
        setYear(value)
    }

    const setByTypeHandler = (value: { name: string, value: string }) => {
        setByType(value)
    }
    const setScoreHandler = (value: number[]) => {
        setScore(value[0])
    }

    const setSortHandler = () => {
        const newSort = sort === 'desc' ? 'asc' : 'desc';
        setSort(newSort)
    }

    const fetchTVData = async (init: boolean = false) => {
        init ? setIsLoading(true) : setSectionLoading(true);
        const queryParams = {
            with_genres: genreType,
            first_air_date_year: year,
            'vote_average.gte': score,
            sort_by: `${byType.value}.${sort}`,
            page,
        }
        try {
            const res = await fetchAPI<MovieCommon<MovieList>>(discoverTVUrl, { queryParams })
            setTotal(res.total_results ?? 0)
            if (page === 1) {
                setTvList(res.results)
            } else {
                setTvList((prev) => ([...prev, ...res.results]))
            }
            if (init) {
                const genresRes = await fetchAPI<Genres>(genresUrl);
                setGenres([{ name: '全部', id: undefined }, ...genresRes.genres]);
            }
            if (isDrawerOpen) {
                setIsDrawerOpen(false)
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            init ? setIsLoading(false) : setSectionLoading(false)
        }
    }

    const searchMore = async () => {
        setPage((prev) => prev + 1)
    }


    useEffect(() => {
        fetchTVData(true)
    }, [])


    useEffect(() => {
        fetchTVData();
    }, [page, sort]);


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
                                <Button size="sm" className="px-4" variant={genreType === item.id ? 'gradient' : undefined} key={item.id ?? item.name}
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
                        <Button size="sm" className="px-4" variant={year === undefined ? 'gradient' : undefined}
                            onClick={() => setYearHandler(undefined)}>
                            全部
                        </Button>
                        {
                            yearArray.map(item => (
                                <Button size="sm" className="px-4" variant={year === item ? 'gradient' : undefined} key={item}
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
                            <Slider defaultValue={[score]} max={10} step={1} onValueChange={setScoreHandler} />
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
                            <Button key={idx} className="max-[395px]:px-2 max-sm:text-xs max-sm:w-fit w-[100px]" variant={byType.name === item.name ? 'gradient' : undefined}
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
                                            <Button size="sm" className="px-4" variant={genreType === item.id ? 'gradient' : undefined} key={item.id ?? item.name}
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
                                    <Button size="sm" className="px-4" variant={year === undefined ? 'gradient' : undefined}
                                        onClick={() => setYearHandler(undefined)}>
                                        全部
                                    </Button>
                                    {
                                        yearArray.map(item => (
                                            <Button size="sm" className="px-4" variant={year === item ? 'gradient' : undefined} key={item}
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
                                        <Slider defaultValue={[score]} max={10} step={1} onValueChange={setScoreHandler} />
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
                        {sort === 'desc' && <FaSortAmountDown className="max-sm:size-4 size-5" />}
                        {sort === 'asc' && <FaSortAmountUp className="max-sm:size-4 size-5" />}
                    </div>
                </div>
                <MovieSection isLoading={sectionLoading} layout="grid" total={total} type="tv" list={tvList} onSearchMore={searchMore} />
            </div>
        </div>
    )

}