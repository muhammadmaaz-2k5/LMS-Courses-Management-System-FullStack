import React from "react";
import { assets, dummyEducatorData } from "../../assets/assets";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import Logger from "../Logger";
const Navbar = () => {
	const educatorData = dummyEducatorData;
	const { user } = useUser();
	const testUser = (() => { try { return JSON.parse(localStorage.getItem('testUser')) } catch { return null } })();
	return (
		<div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3">
			<Link to="/">
				<h1 className="text-xl lg:text-2xl font-bold text-green-600 select-none">Maaz LMS</h1>
			</Link>

			<div className="flex items-center gap-5 text-gray-500 relative">
				<div className="hidden md:block">
					<Logger />
				</div>
				<p>Hi! {user ? user.fullName : testUser ? testUser.name : "Developers"} </p>
				{user ? (
					<UserButton />
				) : testUser ? (
					<div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
						{testUser.name?.charAt(0)?.toUpperCase() || 'T'}
					</div>
				) : (
					<img className="max-w-8" src={assets.profile_img} alt="profile_img" />
				)}
			</div>
		</div>
	);
};

export default Navbar;
