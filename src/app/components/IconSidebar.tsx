import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotifications } from "../context/NotificationContext";
import {
  TbHome,
  TbUsers,
  TbBell,
  TbMessageCircle,
  TbBook2,
  TbUser,
} from "react-icons/tb";

const links = [
  { href: "/", icon: TbHome },
  { href: "/users", icon: TbUsers },
  { href: "/classroom", icon: TbBook2 },
  { href: "/notifications", icon: TbBell },
  { href: "/chat", icon: TbMessageCircle },
  { href: "/profile", icon: TbUser },
];

export default function IconSidebar() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-full w-16 bg-[#171717] py-6 flex-col items-center space-y-6">
      {links.map(({ href, icon: Icon }) => {
        const active = pathname === href;
        if (href === "/notifications") {
          return (
            <Link
              key={href}
              href={href}
              className={`relative text-white/60 hover:text-[#30c9e8] transition-colors ${active ? "text-[#30c9e8]" : ""}`}
            >
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <Icon size={24} />
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            className={`text-white/60 hover:text-[#30c9e8] transition-colors ${active ? "text-[#30c9e8]" : ""}`}
          >
            <Icon size={24} />
          </Link>
        );
      })}
    </aside>
  );
}
