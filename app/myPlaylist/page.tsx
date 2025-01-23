"use client";

import { useSearchContext } from "@/context/SearchContext";
import { fetchAPI } from "@/hooks/apiClient";
import MovieSection from "@/components/MovieSection";
import { MovieCommon, MovieList } from "@/app/types/movie";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext";

type SearchType = 'movie' | 'tv'

type ButtonType = {
    title: string,
    value: SearchType
}

export default function Search() {
    const { query } = useSearchContext();
    const { accountDetail, isLoggedIn } = useAuth()
    const [sectionLoading, setSectionLoading] = useState(false);
    const [list, setList] = useState<MovieList[]>([]);
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [searchType, setSearchType] = useState<SearchType>('movie');

    const favoriteUrl: Record<SearchType, string> = {
        movie: `/account/${accountDetail?.id}/favorite/movies`,
        tv: `/account/${accountDetail?.id}/favorite/tv`,
    }

    const buttonType: ButtonType[] = [
        { title: '電影', value: 'movie' },
        { title: '影集', value: 'tv' },
    ]

    const fetchMovie = async (init: boolean = false) => {
        !init && setSectionLoading(true);
        try {
            const res = await fetchAPI<MovieCommon<MovieList>>(favoriteUrl[searchType], { queryParams: { query, page } })
            setTotal(res.total_results ?? 0)
            if (page === 1) {
                setList(res.results)
            } else {
                setList((prev) => ([...prev, ...res.results]))
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            !init && setSectionLoading(false);
        }
    }


    const changeSearchType = (value: SearchType) => {
        setPage(1)
        setList([])
        setSearchType(value)
    }

    const searchMore = async () => {
        setPage((prev) => prev + 1)
    }


    useEffect(() => {
        isLoggedIn && accountDetail?.id && fetchMovie(true)
    }, [page, searchType, isLoggedIn, accountDetail])

    return (
        <div className="py-4 space-y-4">
            <div className="p-4 bg-[#686B721A] xl:rounded-[20px]" >
                <div className="flex gap-4">
                    {
                        buttonType.map(item => (
                            <Button variant={searchType === item.value ? "gradient" : 'default'} className="w-max" key={item.value} onClick={() => changeSearchType(item.value)}>
                                {item.title}
                            </Button>
                        ))
                    }
                </div>
            </div>
            <div className="px-4">
                {isLoggedIn ? <MovieSection isLoading={sectionLoading} layout="grid" total={total} type={searchType} list={list}
                    onSearchMore={searchMore} />
                    :
                    <span className="text-white">請先登入</span>
                }
            </div>
        </div>
    );
}
