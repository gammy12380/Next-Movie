"use client"
import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import LoadingSpin from "@/components/LoadingSpin";
import { Button } from "@/components/ui/button"
import type { Video, VideoResults, MovieList, MovieStatus, Cast, Crew, WatchProvider, MovieRecommendations, MovieRecommendation, MovieReview, ReviewResult } from "@/app/types/movie";
import { languageMap } from "@/app/types/languageMap";
import MovieSection from "@/components/MovieSection";
import LazyImage from "@/components/LazyImage";
import CharacterSection from "@/components/CharacterSection";
import { FaStar } from "react-icons/fa";
import { fetchAPI } from "@/hooks/apiClient";
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from '@/context/AuthContext';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import VideoDialog from '@/components/VideoDialog';


const toHHMM = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}小時 ${mins.toString().padStart(2, '0')}分鐘`;
}


type MoviesState = {
    crew: Crew[];
    cast: Cast[];
}

const MovieDetailPage = () => {
    const { sessionId, accountDetail } = useAuth()
    const [isLoading, setIsLoading] = useState(true);
    const [movie, setMovie] = useState<MovieList | null>(null);
    const [watchProviders, setWatchProviders] = useState<WatchProvider | null>(null);
    const [movies, setMovies] = useState<MoviesState>({
        crew: [],
        cast: [],
    });
    const [movieRecommendations, setMovieRecommendations] = useState<MovieRecommendation[]>([]);
    const [movieReview, setMovieReview] = useState<ReviewResult[]>([]);
    const [movieStatus, setMovieStatus] = useState<MovieStatus | null>(null)
    const [video, setVideo] = useState<VideoResults[]>([])
    const [isShowVideo, setIsShowVideo] = useState(false)

    const isMobile = useIsMobile()
    const movieId = useParams().id;
    const movieUrl = `/movie/${movieId}`
    const movieCreditsUrl = `/movie/${movieId}/credits`
    const watchProvidersUrl = `/movie/${movieId}/watch/providers`
    const recommendationsUrl = `/movie/${movieId}/recommendations`
    const reviewsUrl = `/movie/${movieId}/reviews`
    const videoUrl = `/movie/${movieId}/videos`

    const movieBanner = isMobile ? movie?.backdrop_path : movie?.poster_path

    const fetchMovie = async () => {
        setIsLoading(true);
        try {
            const res = await Promise.all([
                fetchAPI<MovieList>(movieUrl),
                fetchAPI<MoviesState>(movieCreditsUrl),
                fetchAPI<{ id: number, results: Record<string, WatchProvider> }>(watchProvidersUrl),
                fetchAPI<MovieRecommendations>(recommendationsUrl),
                fetchAPI<MovieReview>(reviewsUrl),
                fetchAPI<Video>(videoUrl)
            ]);
            setMovie(res[0]);
            setMovies({
                cast: res[1].cast,
                crew: res[1].crew
            });
            setWatchProviders(res[2].results?.TW);
            setMovieRecommendations(res[3].results);
            setMovieReview(res[4].results);
            setVideo(res[5].results)
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);

        }
    }

    const addList = async () => {
        await fetchAPI(`/account/${accountDetail?.id}/favorite`, {
            method: 'POST',
            body: {
                media_type: 'movie',
                media_id: movie?.id,
                favorite: !movieStatus?.favorite,
            }
        })
        getMovieStatus()
    }

    const getMovieStatus = async () => {
        const res = await fetchAPI<MovieStatus>(`/movie/${movieId}/account_states`)

        setMovieStatus(res)
    }

    const videoTrailers = useMemo(() => {
        const YTVideo = video.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official === true);

        return YTVideo
            ? {
                name: YTVideo.name,
                src: `https://www.youtube.com/embed/${YTVideo.key}`,
            }
            : {
                name: 'No Trailer Found',
                src: 'about:blank',
            };
    }, [video])

    useEffect(() => {
        fetchMovie()
    }, [movieId])

    useEffect(() => {
        if (sessionId) {
            getMovieStatus()
        }
    }, [sessionId])

    if (!movie || isLoading) {
        return <LoadingSpin />
    }

    return (
        <div className="space-y-4">
            <VideoDialog src={videoTrailers.src} open={isShowVideo} onOpenChange={(isOpen) => setIsShowVideo(isOpen)} />
            <section className="flex max-sm:flex-col gap-8 p-4 bg-[#686B721A] xl:rounded-[20px]">
                {
                    movieBanner ?
                        <div className="relative max-sm:w-full sm:w-80 sm:min-w-80 sm:h-[480px]">
                            <LazyImage src={`https://image.tmdb.org/t/p/original/${movieBanner}`} alt={movie.title} imgClass="size-full sm:aspect-[2/3] object-cover rounded-[20px]" />
                            {videoTrailers.src !== 'about:blank' && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer bg-gradient rounded-full size-12 flex items-center justify-center" onClick={() => setIsShowVideo(true)} >
                                <div className="w-0 h-0 rounded-sm
                                    border-t-[10px] border-t-transparent
                                    border-l-[13px] border-l-white
                                    border-b-[10px] border-b-transparent
                                    ">
                                </div>
                            </div>}
                        </div>
                        : <div className="flex items-center justify-center max-sm max-sm:w-full sm:w-80 sm:h-[480px] sm:aspect-[2/3] object-cover rounded-[20px]">
                            <LazyImage src="/wEmpty.svg" alt="logo" imgClass="size-10" />
                        </div>
                }
                <div className="w-full flex flex-col gap-4 text-white">
                    <div className="flex max-lg:flex-col lg:justify-between gap-4">
                        <div className="flex gap-2">
                            {
                                movie?.genres.map(genre => (
                                    <span key={genre.id} className="h-fit border border-solid border-white bg-[#161616] rounded-md py-1 px-2">{genre.name}</span>
                                ))
                            }
                        </div>
                        {sessionId && <Button variant={movieStatus?.favorite ? "gradient-border" : "gradient"} className="w-40" onClick={() => addList()}>{movieStatus?.favorite ? "移出片單" : "加入片單"}</Button>}
                    </div>
                    <h2 className="text-3xl font-bold tabular-nums flex gap-4">{movie.title} <span className="text-gradient">{movie.vote_average.toFixed(1)}</span></h2>
                    <p className="flex gap-8">
                        <span className="primary-label">{movie.release_date}</span>
                        <span className="primary-label">{languageMap[movie.original_language] ?? movie.original_language}</span>
                        <span className="primary-label">{toHHMM(movie.runtime)}</span>
                    </p>
                    <p className="primary-label space-x-2">
                        <span>導演</span>
                        <span>
                            {movies.crew.find(member => member.job === "Director")?.name ?? '-'}
                        </span>
                    </p>
                    <p className="primary-label">劇情介紹</p>
                    <p>{movie.overview}</p>
                    <p className="primary-label">播放平台</p>
                    <div className="flex flex-wrap">
                        {
                            watchProviders?.flatrate && watchProviders.flatrate.map(provider => (
                                <a key={provider.provider_id} href={watchProviders.link} target="_blank" rel="noreferrer" >
                                    <img key={provider.provider_id} src={`https://image.tmdb.org/t/p/original/${provider.logo_path}`} alt={provider.provider_name} className="size-10 rounded-[6px]" />
                                </a>
                            ))
                        }
                    </div>
                </div>
            </section>
            <div className='p-4 bg-[#686B721A] xl:rounded-[20px]'>
                <CharacterSection list={movies.cast} />
            </div>

            <div className='p-4 bg-[#686B721A] xl:rounded-[20px] flex flex-col gap-4'>
                <h4 className='text-white'>評論</h4>

                <ul className='flex flex-col gap-2 text-white'>
                    {
                        movieReview.map(item => (
                            <li className='flex gap-4 justify-start' key={item.id}>
                                <img src={`https://image.tmdb.org/t/p/original/${item.author_details.avatar_path}`} alt={item.author} className="min-w-10 size-10 object-cover rounded-full" />

                                <Accordion type="single" collapsible className='text-white w-full'>
                                    <AccordionItem value="item-1" className='border-none'>
                                        <AccordionTrigger>
                                            <div className='flex flex-col items-start'>
                                                <span>{item.author}</span>
                                                <div className='flex gap-1'>
                                                    {
                                                        Array.from({ length: Number(item.author_details.rating) }).map((_, idx) => (
                                                            <FaStar className='text-[#C10171]' key={idx} />
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            {item.content}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </li>
                        ))
                    }
                </ul>
            </div>

            <div className='p-4 bg-[#686B721A] xl:rounded-[20px]'>
                <MovieSection title="推薦影片" type='movie' list={movieRecommendations} />
            </div>
        </div>
    );
};

export default MovieDetailPage;