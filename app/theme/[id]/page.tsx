"use client"
import { useParams, useSearchParams } from 'next/navigation';
import { fetchAPI } from "@/hooks/apiClient";
import LoadingSpin from "@/components/LoadingSpin";
import { MovieCommon, MovieList } from "@/app/types/movie";
import { themeData } from "@/hooks/theme/useThemeData";
import MovieSection from "@/components/MovieSection";
import { useEffect, useState, useMemo, useCallback } from 'react';

export default function ThemeDetail() {
    const [isLoading, setIsLoading] = useState(true);
    const [sectionLoading, setSectionLoading] = useState(false);
    const [list, setList] = useState<MovieList[]>([]);
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)

    const pathname = useParams()
    const genreId = useSearchParams().get('genreId')
    const keyword = useSearchParams().get('keyword')
    const original = useSearchParams().get('original')

    const data = useMemo(() => (themeData.find(item => item.target === pathname.id)), [pathname])

    const discoverTVUrl = '/discover/tv?region=TW'
    const discoverMovieUrl = '/discover/movie?region=TW'

    const fetchMovie = useCallback(async () => {
        const init = page === 1
        init ? setIsLoading(true) : setSectionLoading(true);
        try {
            const res = await fetchAPI<MovieCommon<MovieList>>(data?.type === 'movie' ? discoverMovieUrl : discoverTVUrl, {
                queryParams: {
                    with_genres: genreId ?? undefined,
                    with_original_language: original ?? undefined,
                    with_keywords: keyword ?? undefined,
                    page,
                }
            })
            setTotal(res.total_results ?? 0)
            setList((prev) => {
                const uniqueMovies = [...prev, ...res.results].filter(
                    (movie, index, self) => self.findIndex((m) => m.id === movie.id) === index
                );
                return uniqueMovies;
            });
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            init ? setIsLoading(false) : setSectionLoading(false);
        }
    },[data?.type, genreId, keyword, original, page])


    useEffect(() => {
        fetchMovie();
    }, [fetchMovie]);


    if (isLoading) {
        return <LoadingSpin />
    }

    return (
        <div className="p-4">
            <MovieSection title={data?.title} titleClassName="primary-label" layout="grid"
                isLoading={sectionLoading} total={total}
                type={data?.type as 'movie' | 'tv'} list={list} onSearchMore={() => setPage((prev) => prev + 1)} />
        </div>
    )

}