import { BannerComponent } from "./_components/banner-component";
import { Suspense } from "react";

const Banner = () => {
    return ( 
        <div className="w-full h-screen overflow-y-auto bg-gray-50">
             <Suspense fallback={<p>Loading data...</p>}>
        <BannerComponent/>
      </Suspense>
      
        </div>
     );
}
 
export default Banner;