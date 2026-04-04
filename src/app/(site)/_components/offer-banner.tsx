import Image from "next/image";

export const OfferBanner = () => {
    return (
        <div className="lg:px-10 px-5 rounded-xl overflow-hidden">
            <div className=" w-full h-[300px] relative  mt-5 rounded-xl overflow-hidden">
                <Image
                    src="https://3903pqvnfg.ufs.sh/f/z0RMgQlNXvIct10uwrpBNn0tkTl1prZxDmiGaIq8QvjSybeK"
                    alt="offerBanner"
                    fill
                    className=" w-full h-full object-cover"
                />
            </div>
        </div>
    );
};
