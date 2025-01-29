/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search } from "lucide-react";
import React from "react";

function SearchSection({ onSearchInput }: any) {
  return (
    <div className="p-10 m-5 bg-gradient-to-tl from-green-300 via-blue-500 to-purple-600 flex flex-col justify-center items-center text-white rounded-lg">
      <h2 className="text-3xl font-bold">Browse All Services We Provided</h2>
      <p>What would you like to create today?</p>
      <div className="w-full  flex justify-center">
        <div className="flex gap-2 items-center p-2 border rounded-3xl bg-white my-5 w-[50%]">
          <Search className="text-primary" />
          <input
            type="text"
            placeholder="Search"
            onChange={(event) => onSearchInput(event.target.value)}
            className="bg-transparent w-full outline-none text-black"
          />
        </div>
      </div>
    </div>
  );
}

export default SearchSection;
