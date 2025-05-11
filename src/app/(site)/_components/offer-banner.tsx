import Image from "next/image"

export const OfferBanner = () => {
   return (
   <div className="lg:px-10 px-5 rounded-xl overflow-hidden">
  <div className=" w-full h-[300px] relative  mt-5 rounded-xl overflow-hidden">
        <Image src='https://firebasestorage.googleapis.com/v0/b/reactchatapp-58a4d.appspot.com/o/partyweb%2Fpexels-george-dolgikh-551816-2072153.jpg?alt=media&token=db84f386-b5e6-4ca3-966f-48e6f3b8c0d3' alt="offerBanner" fill className=" w-full h-full object-cover"/>
    </div>
   </div>
   )
}