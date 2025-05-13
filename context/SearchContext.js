import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();
export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = (query, allItems) => {
        setSearchQuery(query);
        const filtered = allItems.filter(item =>
            item.name?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
    };

    return (
        <SearchContext.Provider value={{ searchQuery, handleSearch, searchResults }}>
            {children}
        </SearchContext.Provider>
    );
};