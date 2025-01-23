export type MovieList = {
  type?: "movie" | "tv";
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: {
    id: number;
    name: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  genre_ids: number[];
  episode_run_time?: number[];
  homepage: string;
  id: number;
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  first_air_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string;
  title: string;
  name: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  seasons: {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    season_number: number;
    vote_average: number;
  }[];
};

// Cast 型別
export type Cast = {
  adult: boolean; // 預設為 true
  gender: number; // 預設為 0
  id: number; // 預設為 0
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number; // 預設為 0
  profile_path: string | null; // 可以為 null
  cast_id: number; // 預設為 0
  character: string;
  credit_id: string;
  order: number; // 預設為 0
};

// Crew 型別
export type Crew = {
  adult: boolean; // 預設為 true
  gender: number; // 預設為 0
  id: number; // 預設為 0
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number; // 預設為 0
  profile_path: string | null; // 可以為 null
  credit_id: string;
  department: string;
  job: string;
};

export type MovieCredits = {
  id: number;
  cast: Cast[];
  crew: Crew[];
};

export type WatchProvider = {
  link: string;
  flatrate?: {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
  }[];
  ads?: {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
  }[];
};

export type MovieCommon<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
  dates?: {
    mximum: string;
    minmun: string;
  };
};

// 用來表示推薦電影的每一個項目
export type MovieRecommendation = {
  backdrop_path: string; // 背景圖片的路徑，可能為 null
  id: number; // 電影的唯一 ID
  title: string; // 電影標題
  original_title: string; // 電影原標題
  overview: string; // 電影簡介
  poster_path: string; // 電影海報的路徑，可能為 null
  media_type: "movie"; // 目前只會是 'movie'
  vote_average: number; // 評分平均
  vote_count: number; // 評分數量
  release_date: string; // 發行日期 (YYYY-MM-DD)
  video: boolean; // 是否有預告片或相關視頻
  genre_ids: number[]; // 類別 ID 清單，通常是電影類型的 ID
};

// 推薦影片
export type MovieRecommendations = {
  page: number; // 當前頁數
  results: MovieRecommendation[]; // 推薦電影的列表
  total_pages: number; // 總頁數
  total_results: number; // 總結果數量
};

export interface AuthorDetails {
  name: string;
  username: string;
  avatar_path: string;
  rating: string;
}

export interface ReviewResult {
  author: string;
  author_details: AuthorDetails;
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

export interface MovieReview {
  id: number;
  page: number;
  results: Result[];
  total_pages: number;
  total_results: number;
}

export interface Genres {
  genres: {
    id: number;
    name: string;
  }[];
}

export type TokenRes = {
  expires_at: string;
  request_token: string;
  success: boolean;
};

interface LoginRequestBody {
  username: string;
  password: string;
  request_token: string | null;
}

export type ValidateLoginRes = {
  expires_at: string;
  request_token: string;
  success: boolean;
};

export type SessionRes = {
  session_id: string;
  success: boolean;
};

export type AccountDetailRes = {
  avatar: {
    gravatar: {
      hash: string;
    };
    tmdb: {
      avatar_path: string | null;
    };
  };
  id: number;
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  include_adult: boolean;
  username: string;
};

export interface MovieStatus {
  id: number;
  favorite: boolean;
  rated: boolean;
  watchlist: boolean;
}

export type Video = {
  id: number;
  results: VideoResults[];
};

export type VideoResults = {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
};
