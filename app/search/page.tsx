"use client";

import { useSearchContext } from "@/context/SearchContext";
import { fetchAPI } from "@/hooks/apiClient";
import CharacterSection from "@/components/CharacterSection";
import MovieSection from "@/components/MovieSection";
import { MovieCommon, MovieList, Cast } from "@/app/types/movie";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button"

type SearchType = 'movie' | 'tv' | 'person'

type ButtonType = {
  title: string,
  value: SearchType
}

export default function Search() {
  const { query } = useSearchContext();
  const [sectionLoading, setSectionLoading] = useState(false);
  const [cast, setCast] = useState<Cast[]>([])
  const [list, setList] = useState<MovieList[]>([]);
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchType, setSearchType] = useState<SearchType>('movie');

  const searchUrl: Record<SearchType, string> = useMemo(()=>{
    return {
      movie: '/search/movie',
      tv: '/search/tv',
      person: '/search/person',
    }
  },[])

  const buttonType: ButtonType[] = [
    { title: '電影', value: 'movie' },
    { title: '影集', value: 'tv' },
    { title: '演員', value: 'person' },
  ]

  const fetchMovie = useCallback(async () => {
    const init = page === 1
    !init && setSectionLoading(true);
    try {
      const res = await fetchAPI<MovieCommon<MovieList>>(searchUrl[searchType], { queryParams: { query, page } })
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
  },[page, query, searchType, searchUrl])

  const fetchCast = useCallback(async () => {
    const res = await fetchAPI<MovieCommon<Cast>>(searchUrl[searchType], { queryParams: { query, page } })
    setTotal(res.total_results)
    setCast((prev) => ([...prev, ...res.results]))

  },[page, query, searchType, searchUrl])

  const changeSearchType = (value: SearchType) => {
    setPage(1)
    setList([])
    setCast([])
    setSearchType(value)
  }

  const searchMore = async () => {
    setPage((prev) => prev + 1)
  }


  useEffect(() => {
    searchType !== 'person' ? fetchMovie() : fetchCast()
  }, [fetchMovie, fetchCast, searchType])

  return (
    <div className="py-4 space-y-4">
      <div className="p-4 bg-[#686B721A] xl:rounded-[20px]" >
        <div className="flex gap-4">
          {
            buttonType.map(item => (
              <Button variant={searchType === item.value ? "gradient" : 'default'} className="w-max" key={item.value} onClick={() => changeSearchType(item.value)}>
                {item.title}
                {searchType === item.value && ` (${item.value !== 'person' ? list.length : cast.length})`}
              </Button>
            ))
          }
        </div>
      </div>
      <div className="px-4">
        {
          searchType !== 'person' &&
          <MovieSection isLoading={sectionLoading} layout="grid" total={total} type={searchType} list={list}
            onSearchMore={searchMore} />
        }
        {
          searchType === 'person' &&
          <CharacterSection isLoading={sectionLoading} layout="grid" total={total} list={cast}
            onSearchMore={searchMore} />
        }
      </div>
    </div>
  );
}
