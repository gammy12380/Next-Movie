"use client"

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type LazyImageProps = {
    src: string;
    alt?: string;
    useNextImage?: boolean;
    imgClass?: string;
    priority?: boolean;
};

const LazyImage = ({ src, alt = '', useNextImage = true, imgClass = '', priority = true }: LazyImageProps) => {
    const imageElement = useRef<HTMLImageElement | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageWidth, setImageWidth] = useState<number | undefined>(undefined);
    const [imageHeight, setImageHeight] = useState<number | undefined>(undefined);


    useEffect(() => {
        if (imageElement.current?.complete) {
            setImageLoaded(true);
        }
    }, []);

    useEffect(() => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => {
            setImageWidth(img.width);
            setImageHeight(img.height);
        };
    }, [src]);

    const handleLoad = () => {
        setImageLoaded(true);
    };

    return (
        <div className="relative w-full h-full">
            {!imageLoaded && <div className="absolute top-0 left-0 z-1 w-full h-full aspect-[4/6] rounded-[8px] bg-gray-700 animate-pulse"></div>}

            {!useNextImage ? (
                <img
                    ref={imageElement}
                    src={src}
                    alt={alt}
                    className={`size-full object-cover ${imgClass}`}
                    draggable="false"
                    onLoad={handleLoad}
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                />
            ) : (imageWidth && imageHeight &&
                <Image
                    ref={imageElement}
                    src={src}
                    alt={alt}
                    className={`h-full ${imgClass}`}
                    draggable="false"
                    onLoad={handleLoad}
                    priority={priority}
                    width={imageWidth}
                    height={imageHeight}
                    style={{ objectFit: 'cover' }}
                />
            )}
        </div>
    );
};

export default LazyImage;
