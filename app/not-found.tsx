import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
	return (
		<div className='h-full flex flex-col items-center justify-center gap-4 text-white'>
			<h2>Not Found</h2>
			<Button variant="gradient" >
				<Link href="/">回首頁</Link>
			</Button>
		</div>
	)
}
