"use client";

import { useState, useEffect } from "react";
import MovieSection from "@/components/MovieSection";
import LoadingSpin from "@/components/LoadingSpin";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from "@/components/ui/carousel"
import LazyImage from "@/components/LazyImage";
import { Button } from "@/components/ui/button"
import { MovieList, MovieCommon, MovieStatus } from "@/app/types/movie";
import { fetchAPI } from "@/hooks/apiClient";
import { useAuth } from '@/context/AuthContext';
import { useAlert } from "@/context/AlertContext";

import Link from "next/link";

export default function Home() {
	const { sessionId, accountDetail } = useAuth()
	const { showAlert } = useAlert();
	const [isLoading, setIsLoading] = useState(true);
	const [movies, setMovies] = useState<Record<string, MovieList[]>>({
		trendingList: [],
		trendingKRList: [],
		trendingTWList: [],
		trendingUSList: [],
		trendingAnimateList: [],
		hotList: [],
	});
	const [movieStatus, setMovieStatus] = useState<MovieStatus[] | null>(null);

	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	const currentDate = `${yyyy}-${mm}-${dd}`;


	// 熱門電影
	const trendingListUrl = '/trending/movie/week?region=TW&sort_by=release_date.desc'
	// 熱門韓劇
	const trendingKRListUrl = `/discover/tv?region=TW&with_original_language=ko&sort_by=first_air_date.desc&first_air_date.lte=${currentDate}`
	// 熱門台劇
	const trendingTWListUrl = `/discover/tv?with_original_language=zh&region=TW&sort_by=first_air_date.desc&first_air_date.lte=${currentDate}`
	// 熱門美劇
	const trendingUSListUrl = `/discover/tv?with_original_language=en&region=TW&sort_by=first_air_date.desc&first_air_date.lte=${currentDate}`
	// 熱門動畫
	const trendingAnimateListUrl = `/discover/tv?with_genres=16&region=TW&sort_by=first_air_date.desc&first_air_date.lte=${currentDate}`

	// 熱門電影
	const hotMovieUrl = '/movie/popular'
	// 熱門影集
	const hotTVUrl = '/tv/popular'

	const fetchMovies = async () => {
		setIsLoading(true);
		try {
			const res = await Promise.all([
				fetchAPI<MovieCommon<MovieList>>(trendingListUrl),
				fetchAPI<MovieCommon<MovieList>>(trendingKRListUrl),
				fetchAPI<MovieCommon<MovieList>>(trendingTWListUrl),
				fetchAPI<MovieCommon<MovieList>>(trendingUSListUrl),
				fetchAPI<MovieCommon<MovieList>>(trendingAnimateListUrl),
				fetchAPI<MovieCommon<MovieList>>(hotMovieUrl),
				fetchAPI<MovieCommon<MovieList>>(hotTVUrl),
			]);

			const hotMoviesAndTV = [
				...res[5].results.slice(0, 5).map(item => ({ ...item, type: 'movie' as const })),
				...res[6].results.slice(0, 5).map(item => ({ ...item, type: 'tv' as const }))
			];

			const sortedHotList = hotMoviesAndTV
				.sort((a, b) => b.popularity - a.popularity)
				.slice(0, 5);

			setMovies({
				trendingList: res[0].results,
				trendingKRList: res[1].results,
				trendingTWList: res[2].results,
				trendingUSList: res[3].results,
				trendingAnimateList: res[4].results,
				hotList: sortedHotList
			});
		} catch (error) {
			console.error("Failed to fetch data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const getMovieFavorite = (item: MovieList) => {
		return movieStatus?.find(movie => movie.id === item.id)?.favorite
	}

	const addFavorite = async (movie: MovieList) => {
		await fetchAPI(`/account/${accountDetail?.id}/favorite`, {
			method: 'POST',
			body: {
				media_type: movie.type,
				media_id: movie.id,
				favorite: !getMovieFavorite(movie),
			}
		})
		showAlert(!getMovieFavorite(movie) ? '加入成功' : '移除成功');
		getMovieStatusApi(movie)
	}

	const getMovieStatusApi = async (movie: MovieList) => {
		const res = await fetchAPI<MovieStatus>(`/${movie?.type}/${movie.id}/account_states`)

		setMovieStatus((prev) => {
			if (!prev) return [res];

			const existingIndex = prev.findIndex((m) => m.id === movie.id);
			if (existingIndex > -1) {
				const updatedStatus = [...prev];
				updatedStatus[existingIndex] = res;
				return updatedStatus;
			}

			return [...prev, res];
		});
	}


	useEffect(() => {
		fetchMovies();
	}, []);

	useEffect(() => {
		sessionId && movies.hotList.forEach(item => {
			getMovieStatusApi(item)
		})
	}, [movies.hotList])


	if (isLoading) {
		return <LoadingSpin />
	}

	return (
		<div className="space-y-4">
			<Carousel
				className="w-full"
			>
				<CarouselContent>
					{movies.hotList.map((item, index) => (
						<CarouselItem key={index}>
							<div className="relative">
								<LazyImage
									src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
									alt={item.name || item.title}
									imgClass="w-full aspect-video"
								/>
								<div className="absolute left-10 top-1/2 -translate-y-1/2 z-[2] w-2/5 flex flex-col gap-2 md:gap-4">
									<span className="text-gradient text-2xl md:text-3xl font-bold">{item.vote_average.toFixed(1)}</span>
									<span className="text-white text-3xl md:text-4xl font-bold">{item.name || item.title}</span>
									<span className="truncate line-clamp-2 whitespace-normal text-white max-sm:text-sm">{item.overview}</span>
									<div className="flex gap-2">
										<Link href={`/${item.type}/${item.id}`}>
											<Button variant="gradient-border" className="w-25 md:w-40 h-[42px] text-white">
												更多資訊
											</Button>
										</Link>
										{sessionId && <Button variant={getMovieFavorite(item) ? "gradient-border" : "gradient"} className="w-25 md:w-40 text-white h-[42px]" onClick={() => addFavorite(item)}>{getMovieFavorite(item) ? "移出片單" : "加入片單"}</Button>}
									</div>
								</div>
								<div className="absolute top-0 left-0 w-full h-full z-[1]"
									style={{
										background: 'radial-gradient(72.5% 427.7% at 96.33% 50%, rgba(27, 30, 37, 0) 39.58%, rgba(27, 30, 37, 0.93) 94.79%),linear-gradient(360deg, #1B1E25 0%, rgba(27, 30, 37, 0) 29.22%)'
									}} />
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
			<div className="p-4">
				<MovieSection title="熱門電影" list={movies.trendingList} />
			</div>
			<div className="p-4 bg-[#686B721A] xl:rounded-[20px]" >
				<MovieSection title="熱門韓劇" type="tv" list={movies.trendingKRList} />
			</div>
			<div className="p-4">
				<MovieSection title="熱門台劇" type="tv" list={movies.trendingTWList} />
			</div>
			<div className="p-4 bg-[#686B721A] xl:rounded-[20px]" >
				<MovieSection title="熱門美劇" type="tv" list={movies.trendingUSList} />
			</div>
			<div className="p-4">
				<MovieSection title="熱門動畫" type="tv" list={movies.trendingAnimateList} />
			</div>
		</div>

	);
}
