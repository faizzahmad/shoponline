"use client";
import { useQueryState, parseAsBoolean, parseAsString } from 'nuqs';

export const useBannerAdmin = () => {
   
const [editModal, setEditModal] = useQueryState(
  'descriptionPage',
  parseAsBoolean.withDefault(false)
)

const [bannerId, setBannerId] = useQueryState(
    'banner-id',
   parseAsString.withDefault('').withOptions({ clearOnDefault: true })
    )

    const [bannerImage,setBannerImage] = useQueryState(
    'banner-image',
    parseAsString.withDefault('').withOptions({ clearOnDefault: true })
)

const [bannerlink,setBannerLink] = useQueryState(
    'banner-link',
    parseAsString.withDefault('').withOptions({ clearOnDefault: true })
)

const openEditModal = (id: string, image : string, bannerlink : string) => {
    setBannerId(id);
    setEditModal(true);
    setBannerImage(image);
    setBannerLink(bannerlink);
}

const closeEditModal = () => {
    setEditModal(false);
    setBannerId('');
    setBannerImage('');
    setBannerLink('');
}

    return {
       openEditModal,
       closeEditModal,
       bannerId,
       editModal,
       setBannerImage,
       setBannerLink,
         bannerImage,
            bannerlink,

    };
};
