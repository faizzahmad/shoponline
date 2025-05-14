import { Sidebar } from "./_components/sidebar";

interface DashboardLayoutProps {
    children: React.ReactNode
}

const DashboardLayout = ({children} : DashboardLayoutProps) => {
    return (
        <div className=" w-full flex">
            <aside className="w-[15%] h-screen overflow-y-auto bg-indigo-50 p-5">
            <Sidebar/>
            </aside>
            <section className="flex-1 h-screen overflow-y-auto">
                {children}
            </section>
        </div>
      );
}
 
export default DashboardLayout;