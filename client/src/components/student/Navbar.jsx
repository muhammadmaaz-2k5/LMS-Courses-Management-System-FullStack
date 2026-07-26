import React, { use, useContext } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Logger from "../Logger";
import {ExternalLink, ExternalLinkIcon} from "lucide-react"

const Navbar = () => {


	const isCourseListPage = location.pathname.includes("/course-list");
	const {navigate, isEducator, backendUrl, setIsEducator, getToken} = useContext(AppContext);
	const { openSignIn } = useClerk();
	const { user } = useUser();

	const becomeEducator = async () => {
		try {
			if(isEducator){
				navigate('/educator')
				return;
			}

			const token = await getToken();

			const {data} = await axios.get(backendUrl + '/api/educator/update-role' , {headers: {Authorization: `Bearer ${token}`}})
			console.log("educ", data);
			
			if(data.success){
				setIsEducator(true);
				toast.success(data.message)
			}else{
				toast.error(data.message)
			}
		} catch (error) {
			toast.error(error.message)
		}
	}

	return (
		<div
			className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-3 ${
				isCourseListPage ? "bg-white" : "bg-green-100/70"
			} `}
		>
			<h1 onClick={()=>navigate('/')}
				className="text-xl lg:text-2xl font-bold text-green-600 cursor-pointer select-none"
			>
				Maaz LMS
			</h1>
			<div className="hidden md:flex items-center gap-5 text-gray-500">
				<div className="flex items-center gap-5">
					<Logger/>
				</div>
				{!user &&
				<div className="flex items-center gap-5">
					<Link
						to="https://my-portfolio-topaz-seven-21.vercel.app/"
						target="_blank"
						className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-green-600 shadow-sm transition-colors hover:bg-accent hover:text-green-700"
					>
						<ExternalLink className="h-4 w-4 text-green-500" />
						<span>Go Project</span>
					</Link>
				</div>
}

				<div className="flex items-center gap-5">
					{user && (
						<>
							<button onClick={becomeEducator}>{isEducator ? "Educator Dashboard" : "Become Educator" }</button>|{" "}
							<Link to="/my-enrollments">My Enrollments</Link>
						</>
					)}
				</div>

				{user ? (
					// <UserButton />
					<UserButton>
						<UserButton.MenuItems>
                                <UserButton.Action label='Go Projects' labelIcon={<ExternalLinkIcon size={16} className='text-green-500' />}  onClick={() => window.open("https://my-portfolio-topaz-seven-21.vercel.app", "_blank")} />
                            </UserButton.MenuItems>
					</UserButton>
			) : (
				<div className="flex items-center gap-2">
					<button
						onClick={() => openSignIn()}
						className="bg-green-600 text-white px-5 py-2 rounded-full"
					>
						Create Account
					</button>
					<Link
						to="/test-login"
						className="border border-green-600 text-green-600 px-4 py-2 rounded-full text-sm hover:bg-green-50"
					>
						Test Login
					</Link>
				</div>
			)}
			</div>
			<div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
				{/* for phone scree  */}
				
				<div className="flex items-center gap-1 sm:gap-2 max-sm:text-xs">
        {user && (
						<>
						<button onClick={becomeEducator}>{isEducator ? "Educator Dashboard" : "Become Educator" }</button>|{" "}
						<Link to="/my-enrollments">My Enrollments</Link>
					</>
					)}
				</div>
        {
          user ? 
		  		<UserButton>
					<UserButton.MenuItems>
                        <UserButton.Action label='Go Projects' labelIcon={<ExternalLinkIcon size={16} className='text-green-500' />}  onClick={() => window.open("https://my-portfolio-topaz-seven-21.vercel.app", "_blank")} />
                    </UserButton.MenuItems>
				</UserButton> :
		  	

				<div className="flex items-center gap-2">
				<Link
					to="https://my-portfolio-topaz-seven-21.vercel.app/"
					target="_blank"
					className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-green-600 shadow-sm transition-colors hover:bg-accent hover:text-green-700"
				>
					<ExternalLink className="h-4 w-4 text-green-500" />
					<span>Go Project</span>
				</Link>
				<Link
					to="/test-login"
					className="border border-green-600 text-green-600 px-3 py-2 rounded-full text-xs hover:bg-green-50"
				>
					Test
				</Link>
				<button onClick={()=>openSignIn()}>
					<img src={assets.user_icon} alt="" />
				</button>
				</div>

			
        }
			</div>
		</div>
	);
};

export default Navbar;
