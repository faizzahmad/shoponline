import { HashLoader} from "react-spinners";
export const FixedLoader = () => {
    return (
        <div className=" bg-gray-900 bg-opacity-[50%] fixed top-0 left-0  h-screen w-full z-[100] flex items-center justify-center">
           <HashLoader

           color="rgb(225 29 72)"
           size={50}
           />
      </div>
    )
}