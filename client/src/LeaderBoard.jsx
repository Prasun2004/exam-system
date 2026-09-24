import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LeaderBoard() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    let filtered = [...results];

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.createdAt).toLocaleDateString("en-CA");
        return itemDate === selectedDate;
      });
    }

    // Filter by test name (search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) =>
        item.topic?.toLowerCase().includes(query)
      );
    }

    setFilteredResults(filtered);
  }, [selectedDate, searchQuery, results]);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("http://localhost:8080/leaderboard");
      setResults(res.data);
      setFilteredResults(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Filters Row */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Search by Test Name */}
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm font-medium text-gray-700">
              Search by Test Name:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search test name..."
              className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-64"
            />
          </div>

          {/* Right: Filter by Date */}
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm font-medium text-gray-700">
              Filter by Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {(selectedDate || searchQuery) && (
              <button
                onClick={clearFilters}
                className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {(selectedDate || searchQuery) && (
          <p className="mb-3 text-sm text-gray-500">
            Showing {filteredResults.length} result
            {filteredResults.length !== 1 ? "s" : ""}
          </p>
        )}

        <div className="overflow-x-auto rounded-lg shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Test Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Marks
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Mode
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Percentage
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredResults.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    {selectedDate || searchQuery
                      ? "No exams found matching your filters."
                      : "No results available."}
                  </td>
                </tr>
              ) : (
                filteredResults.map((item, index) => (
                  <tr
                    key={item._id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-sm text-gray-700">
                      <div className="truncate" title={item.topic}>
                        {item.topic}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {item.marks}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {item.difficulty || "None"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {item.percentage}%
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <button
                        onClick={() => navigate(`/result/${item._id}`)}
                        className="rounded-md bg-blue-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}