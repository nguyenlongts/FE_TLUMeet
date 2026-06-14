import { createContext, useContext, useState } from "react";

// Ô tìm kiếm nằm ở Header (layout chung), còn danh sách cần lọc nằm ở trang con
// (Dashboard...). Dùng context để chia sẻ từ khóa tìm kiếm giữa các component anh em.
const SearchContext = createContext({ search: "", setSearch: () => {} });

export const SearchProvider = ({ children }) => {
  const [search, setSearch] = useState("");
  return (
    <SearchContext.Provider value={{ search, setSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
