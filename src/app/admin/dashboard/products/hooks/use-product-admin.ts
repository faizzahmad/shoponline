"use client";
import { useQueryState, parseAsBoolean } from 'nuqs';

export const useProductAdmin = () => {
   
const [descriptionPage, setDescriptionPage] = useQueryState(
  'descriptionPage',
  parseAsBoolean.withDefault(false)
)

    return {
       descriptionPage,
       setDescriptionPage,
    };
};
