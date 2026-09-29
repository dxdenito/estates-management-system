import { Outlet } from "react-router-dom";


export default function Layout(){
    return(
        <div className="flex flex-col min-h-screen">
            <header className="bg-gray-800 text-white p-4">
                <h1 className="text-xl font-bold">Estates Management</h1>
            </header>
            <main className="flex-grow p-4">
                <Outlet />
            </main>
            <footer className="bg-gray-800 text-white p-4 text-center">
                &copy; {new Date().getFullYear()} Estates Management. All rights reserved.
            </footer>
        </div>
    )
}