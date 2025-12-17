import { menu } from "@/hooks/useMenuList";
import { usePathname } from 'next/navigation'
import LazyImage from "@/components/LazyImage";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext";
import Link from "next/link"

type MobileMenu = {
	onOpen: () => void
}

export default function MobileMenu({ onOpen }: MobileMenu) {
	const { accountDetail, logOut } = useAuth()
	const pathname = usePathname();

	return (
		<nav className="md:hidden bg-[#161616] h-[var(--mobile-menu-height)] fixed bottom-0 left-0 right-0 z-50">
			<ul className="size-full grid grid-cols-5 gap-2 place-items-center">
				{menu.map((item) => {
					const Icon = item.mobileIcon;
					return (
						<li key={item.name} className="flex justify-center items-center text-xs font-bold">
							<Link href={item.link} className={`${pathname === item.link ? 'text-white' : 'text-[#686B72]'}`}>
								<div className="flex flex-col gap-1 items-center">
									{Icon && <Icon className="size-6" />}
									<span>{item.name}</span>
								</div>
							</Link>
						</li>
					)
				})}

				{
					accountDetail?.avatar.tmdb.avatar_path ?
						<li className="cursor-pointer size-10 flex items-center justify-center rounded-full bg-gray-700 overflow-hidden" >
							<DropdownMenu>
								<DropdownMenuTrigger className="flex items-center justify-center outline-none size-full"><LazyImage src={`https://image.tmdb.org/t/p/original${accountDetail?.avatar.tmdb.avatar_path}`} alt="logo" imgClass=" object-cover" /></DropdownMenuTrigger>
								<DropdownMenuContent className="bg-[#161616] text-white border-none">
									<DropdownMenuLabel>{accountDetail?.username}</DropdownMenuLabel>
									<DropdownMenuSeparator className="bg-gray-500" />
									<DropdownMenuItem onClick={() => logOut()}>登出</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</li>
						:
						<li className="cursor-pointer" onClick={() => onOpen()}>
							<img src="/wLogo.svg" alt="logo" className="size-10" />
						</li>
				}
			</ul>
		</nav>
	);
}
