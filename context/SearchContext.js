import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();
export const useSearch = () => useContext(SearchContext);

let debounceTimer;

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = (query, allItems) => {
        setSearchQuery(query);
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const filtered = allItems.filter(item =>
                item.name?.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filtered);
        }, 200); // 200ms debounce
    };

    return (
        <SearchContext.Provider value={{ searchQuery, handleSearch, searchResults }}>
            {children}
        </SearchContext.Provider>
    );
};