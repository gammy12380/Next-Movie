"use client"
import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import LazyImage from "@/components/LazyImage";
import LoadingSpin from "@/components/LoadingSpin";
import { Button } from "@/components/ui/button"
import type { Video, VideoResults, MovieList, Cast, MovieStatus, Crew, WatchProvider, MovieRecommendations, MovieRecommendation, MovieReview, ReviewResult } from "@/app/types/movie";
import { languageMap } from "@/app/types/languageMap";
import MovieSection from "@/components/MovieSection";
import CharacterSection from "@/components/CharacterSection";
import { FaStar } from "react-icons/fa";
import { fetchAPI } from "@/hooks/apiClient";
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from '@/context/AuthContext';
import { useAlert } from "@/context/AlertContext";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import VideoDialog from '@/components/VideoDialog';


const toHHMM = (minutes?: number) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}小時 ${mins.toString().padStart(2, '0')}分鐘`;
}


type MoviesState = {
    crew: Crew[];
    cast: Cast[];
}

const TVDetailPage = () => {
    const { sessionId } = useAuth()
    const { showAlert } = useAlert();
    const [isLoading, setIsLoading] = useState(true);
    const [tv, setTv] = useState<MovieList | null>(null);
    const [watchProviders, setWatchProviders] = useState<WatchProvider | null>(null);
    const [tvs, setTVs] = useState<MoviesState>({
        crew: [],
        cast: [],
    });
    const [tvRecommendations, setTVRecommendations] = useState<MovieRecommendation[]>([]);
    const [movieStatus, setMovieStatus] = useState<MovieStatus | null>(null);
    const [tvReview, setTVReview] = useState<ReviewResult[]>([]);
    const [video, setVideo] = useState<VideoResults[]>([])
    const [isShowVideo, setIsShowVideo] = useState(false)

    const isMobile = useIsMobile()
    const tvId = useParams().id;
    const tvUrl = `/tv/${tvId}`
    const tvCreditsUrl = `/tv/${tvId}/credits`
    const watchProvidersUrl = `/tv/${tvId}/watch/providers`
    const recommendationsUrl = `/tv/${tvId}/recommendations`
    const reviewsUrl = `/tv/${tvId}/reviews`
    const videoUrl = `/tv/${tvId}/videos`


    const movieBanner = isMobile ? tv?.backdrop_path : tv?.poster_path

    const fetchMovie = async () => {
        setIsLoading(true);
        try {
            const res = await Promise.all([
                fetchAPI<MovieList>(tvUrl),
                fetchAPI<MoviesState>(tvCreditsUrl),
                fetchAPI<{ id: number, results: Record<string, WatchProvider> }>(watchProvidersUrl),
                fetchAPI<MovieRecommendations>(recommendationsUrl),
                fetchAPI<MovieReview>(reviewsUrl),
                fetchAPI<Video>(videoUrl)
            ]);
            setTv(res[0]);
            setTVs({
                cast: res[1].cast,
                crew: res[1].crew
            });
            setWatchProviders(res[2].results?.TW);
            setTVRecommendations(res[3].results);
            setTVReview(res[4].results);
            setVideo(res[5].results);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);

        }
    }
    showAlert(!movieStatus?.favorite ? '加入成功' : '移除成功');
    const addList = async () => {
        await fetchAPI(`/account/${sessionId}/favorite`, {
            method: 'POST',
            body: {
                media_type: 'tv',
                media_id: tv?.id,
                favorite: !movieStatus?.favorite,
            }
        })
        showAlert(!movieStatus?.favorite ? '加入成功' : '移除成功');
        getTVStatus()
    }

    const getTVStatus = async () => {
        const res = await fetchAPI<MovieStatus>(`/tv/${tvId}/account_states`)

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
    }, [])

    useEffect(() => {
        if (sessionId) {
            getTVStatus()
        }
    }, [sessionId])

    if (!tv || isLoading) {
        return <LoadingSpin />
    }

    return (
        <div className="space-y-4">
            <VideoDialog src={videoTrailers.src} open={isShowVideo} onOpenChange={(isOpen) => setIsShowVideo(isOpen)} />
            <section className="flex max-sm:flex-col gap-8 p-4 bg-[#686B721A] xl:rounded-[20px]">
                {
                    movieBanner ?
                        <div className="relative max-sm:w-full sm:w-80 sm:min-w-80 sm:h-[480px]">
                            <LazyImage src={`https://image.tmdb.org/t/p/original/${movieBanner}`} alt={tv.name} imgClass="size-full sm:aspect-[2/3] object-cover rounded-[20px]" />
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
                                tv?.genres.map(genre => (
                                    <span key={genre.id} className="h-fit border border-solid border-white bg-[#161616] rounded-md py-1 px-2">{genre.name}</span>
                                ))
                            }
                        </div>
                        {sessionId && <Button variant={movieStatus?.favorite ? "gradient" : "gradient-border"} className="w-40" onClick={() => addList()}>{movieStatus?.favorite ? "移出片單" : "加入片單"}</Button>}
                    </div>
                    <h2 className="text-3xl font-bold tabular-nums flex gap-4">{tv.name} <span className="text-gradient">{tv.vote_average.toFixed(1)}</span></h2>
                    <p className="flex gap-8">
                        <span className="primary-label">{languageMap[tv.original_language] ?? tv.original_language}</span>
                        <span className="primary-label">{toHHMM(tv?.episode_run_time?.[0])}</span>
                    </p>
                    <p className="flex flex-col gap-4">
                        <span className="primary-label">推出時間</span>
                        <div className="flex flex-col gap-4">
                            {
                                tv.seasons && tv.seasons.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <span>{item.name}</span>
                                        <span>{item.air_date}</span>
                                        <span>總集數: {item.episode_count}集</span>
                                    </div>
                                ))
                            }
                        </div>
                    </p>
                    <p className="primary-label space-x-2">
                        <span>導演</span>
                        <span>
                            {tvs.crew.find(member => member.job === "Director")?.name ?? '-'}
                        </span>
                    </p>
                    <p className="primary-label">劇情介紹</p>
                    <p>{tv.overview}</p>
                    <p className="primary-label">播放平台</p>
                    <div className="flex flex-wrap">
                        {
                            watchProviders?.flatrate && watchProviders.flatrate.map(provider => (
                                <a key={provider.provider_id} href={watchProviders.link} target="_blank" rel="noreferrer" >
                                    <img key={provider.provider_id} src={`https://image.tmdb.org/t/p/original/${provider.logo_path}`} alt={provider.provider_name} className="size-10 rounded-[6px]" />
                                </a>
                            ))
                        }
                        {
                            watchProviders?.ads && watchProviders.ads.map(provider => (
                                <a key={provider.provider_id} href={watchProviders.link} target="_blank" rel="noreferrer" >
                                    <img key={provider.provider_id} src={`https://image.tmdb.org/t/p/original/${provider.logo_path}`} alt={provider.provider_name} className="size-10 rounded-[6px]" />
                                </a>
                            ))
                        }
                    </div>
                </div>
            </section>
            <div className='p-4 bg-[#686B721A] xl:rounded-[20px]'>
                <CharacterSection list={tvs.cast} />
            </div>

            <div className='p-4 bg-[#686B721A] xl:rounded-[20px] flex flex-col gap-4'>
                <h4 className='text-white'>評論</h4>

                <ul className='flex flex-col gap-2 text-white'>
                    {
                        tvReview.map(item => (
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
                <MovieSection title="推薦影片" type='tv' list={tvRecommendations} />
            </div>
        </div>
    );
};

export default TVDetailPage;