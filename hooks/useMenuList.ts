import { RiMovie2Line } from "react-icons/ri";
import { MdLiveTv } from "react-icons/md";
import { BsCameraVideo } from "react-icons/bs";
import { FaRegHeart } from "react-icons/fa";

export const menu = [
  { name: "電影", link: "/movie", mobileIcon: RiMovie2Line },
  { name: "影集", link: "/tv", mobileIcon: MdLiveTv },
  { name: "主題館", link: "/theme", mobileIcon: BsCameraVideo },
  { name: "我的片單", link: "/myPlaylist", mobileIcon: FaRegHeart },
];
