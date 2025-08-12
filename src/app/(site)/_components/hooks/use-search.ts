"use client"
import {useQueryState,parseAsString} from 'nuqs';
export const useSearch = () => {
   const [search, setSearch] = useQueryState(   
    "search",   
    parseAsString.withDefault("").withOptions({clearOnDefault : true})      
);


return {
    search,
    setSearch
}
   
}