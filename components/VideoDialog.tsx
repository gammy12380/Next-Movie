"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog"
import { IoMdClose } from "react-icons/io";


type VideoDialog = {
	src: string
	open?: boolean
	onOpenChange: (isOpen: boolean) => void
}


export default function VideoDialog({ src, open = false, onOpenChange }: VideoDialog) {

	const openChange = (isOpen: boolean) => onOpenChange(isOpen)

	return (
		<Dialog open={open} onOpenChange={(isOpen) => openChange(isOpen)}>
			<DialogContent className="grid md:w-3/5 xl:w-2/5 border-none p-0 [&>button]:hidden">
				<DialogHeader>
					<DialogTitle className="hidden"></DialogTitle>
					<DialogDescription className="hidden"></DialogDescription>
					<IoMdClose className="absolute -top-5 right-0 size-6 cursor-pointer text-white" onClick={() => openChange(false)} />
				</DialogHeader>
				<div className="relative pb-[56.25%] w-full">
					<iframe
						className="absolute top-0 left-0 w-full h-full"
						src={src}
						title="YouTube video"
						allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					></iframe>
				</div>
			</DialogContent>
		</Dialog>
	);
}
