"use client";

import { cn } from "@/lib/utils"

type LoadingSpin = {
	className?: string
}

export default function LoadingSpin({ className }: LoadingSpin) {

	return (
		<div className={cn('absolute inset-0 opacity-100 z-40 flex items-center justify-center', className)}>
			<img src="/loading.gif" alt="loading" className="w-[10rem]" />
		</div>
	);
}
