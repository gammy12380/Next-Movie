"use client"

import { useState } from 'react';
import Image from 'next/image';

type LazyImageProps = {
	src: string;
	alt?: string;
	useNextImage?: boolean;
	imgClass?: string;
	priority?: boolean;
};

const LazyImage = ({ src, alt = '', useNextImage = true, imgClass = '', priority = false }: LazyImageProps) => {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [error, setError] = useState(false);

	const handleLoad = () => {
		setImageLoaded(true);
	};

	const handleError = () => {
		setError(true);
		setImageLoaded(true); // Stop loading state on error
	};

	if (error) {
		return (
			<span className={`relative block w-full h-full bg-gray-800 flex items-center justify-center ${imgClass}`}>
				<span className="text-gray-500 text-xs">Image Error</span>
			</span>
		);
	}

	return (
		<span className={`relative block w-full h-full overflow-hidden ${imgClass}`}>
			{!imageLoaded && (
				<span className="absolute inset-0 z-10 bg-gray-700 animate-pulse block" />
			)}

			{!useNextImage ? (
				<img
					src={src}
					alt={alt}
					className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
					draggable="false"
					onLoad={handleLoad}
					onError={handleError}
				/>
			) : (
				<Image
					src={src}
					alt={alt}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
					draggable="false"
					onLoad={handleLoad}
					onError={handleError}
					priority={priority}
					unoptimized
				/>
			)}
		</span>
	);
};

export default LazyImage;
