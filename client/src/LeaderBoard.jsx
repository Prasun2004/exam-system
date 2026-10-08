import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "./componat/api.js";

export default function LeaderBoard() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const navigate = useNavigate();


  // =====================================================
  // FETCH LEADERBOARD
  // =====================================================

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");

      /*
        api.js contains:

        withCredentials: true

        So the session cookie is
        automatically sent to backend.
      */

      const response =
        await api.get("/result/leaderboard");

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

      setResults(data);
      setFilteredResults(data);

    } catch (err) {
      console.error(
        "Leaderboard error:",
        err
      );

      // Session expired / not logged in
      if (
        err.response?.status === 401
      ) {
        navigate("/", {
          replace: true,
        });

        return;
      }

      setError(
        err.response?.data?.message ||
        "Failed to load leaderboard."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchLeaderboard();
  }, []);


  // =====================================================
  // FILTER
  // =====================================================

  useEffect(() => {
    let filtered = [
      ...results,
    ];


    // ================================================
    // DATE FILTER
    // ================================================

    if (selectedDate) {
      filtered =
        filtered.filter((item) => {

          const itemDate =
            new Date(
              item.createdAt
            ).toLocaleDateString(
              "en-CA"
            );

          return (
            itemDate ===
            selectedDate
          );
        });
    }


    // ================================================
    // SEARCH FILTER
    // ================================================

    if (
      searchQuery.trim()
    ) {

      const query =
        searchQuery
          .toLowerCase()
          .trim();


      filtered =
        filtered.filter(
          (item) =>
            item.topic
              ?.toLowerCase()
              .includes(query)
        );
    }


    setFilteredResults(
      filtered
    );

  }, [
    selectedDate,
    searchQuery,
    results,
  ]);


  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSelectedDate("");
    setSearchQuery("");
  };


  // =====================================================
  // VIEW RESULT
  // =====================================================

  const handleViewDetails =
    (id) => {

      if (!id) {
        return;
      }

      navigate(
        `/result/${id}`
      );
    };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="
        min-h-screen
        bg-white
        flex
        items-center
        justify-center
      ">

        <div className="
          text-center
        ">

          <div className="
            w-10
            h-10
            border-4
            border-gray-300
            border-t-blue-600
            rounded-full
            animate-spin
            mx-auto
            mb-4
          " />

          <p className="
            text-sm
            text-gray-500
          ">
            Loading your results...
          </p>

        </div>
      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="
      min-h-screen
      bg-white
      px-4
      py-6
      sm:px-6
      lg:px-8
    ">

      <div className="
        mx-auto
        max-w-6xl
      ">


        {/* =============================================
            HEADER
        ============================================= */}

        <div className="
          mb-6
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <div>

            <h1 className="
              text-2xl
              font-bold
              text-gray-900
            ">
              My Results
            </h1>

            <p className="
              mt-1
              text-sm
              text-gray-500
            ">
              View your previous test
              results and performance.
            </p>

          </div>

           <button
            type="button"

            onClick={() =>navigate("/CreateTest")}

            className="
              rounded-md
              bg-gray-100
              px-4
              py-2
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-gray-200
            "
          >
            Create Test 
          </button>

          <button
            type="button"

            onClick={() => navigate("/question")}

            className="
              rounded-md
              bg-gray-100
              px-4
              py-2
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-gray-200
            "
          >
             Question Page 
          </button>

        </div>


        {/* =============================================
            ERROR
        ============================================= */}

        {error && (

          <div className="
            mb-5
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
          ">

            <p className="
              text-sm
              font-medium
              text-red-700
            ">
              {error}
            </p>

          </div>

        )}


        {/* =============================================
            FILTERS
        ============================================= */}

        <div className="
          mb-6
          flex
          flex-col
          gap-4
          rounded-xl
          border
          border-gray-200
          bg-gray-50
          p-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">


          {/* SEARCH */}

          <div className="
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:items-center
          ">

            <label className="
              whitespace-nowrap
              text-sm
              font-medium
              text-gray-700
            ">
              Search by Test Name:
            </label>


            <input
              type="text"

              value={
                searchQuery
              }

              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }

              placeholder="Search test name..."

              className="
                w-full
                max-w-xs
                rounded-md
                border
                border-gray-300
                bg-white
                px-3
                py-2
                text-sm
                shadow-sm
                outline-none

                focus:border-blue-500
                focus:ring-1
                focus:ring-blue-500

                sm:w-64
              "
            />

          </div>


          {/* DATE */}

          <div className="
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:items-center
          ">

            <label className="
              whitespace-nowrap
              text-sm
              font-medium
              text-gray-700
            ">
              Filter by Date:
            </label>


            <input
              type="date"

              value={
                selectedDate
              }

              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }

              className="
                rounded-md
                border
                border-gray-300
                bg-white
                px-3
                py-2
                text-sm
                shadow-sm
                outline-none

                focus:border-blue-500
                focus:ring-1
                focus:ring-blue-500
              "
            />


            {(selectedDate ||
              searchQuery) && (

              <button
                type="button"

                onClick={
                  clearFilters
                }

                className="
                  rounded-md
                  bg-gray-200
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-300
                "
              >
                Clear
              </button>

            )}

          </div>

        </div>


        {/* =============================================
            RESULT COUNT
        ============================================= */}

        <div className="
          mb-3
          flex
          items-center
          justify-between
        ">

          <p className="
            text-sm
            text-gray-500
          ">

            {selectedDate ||
            searchQuery ? (
              <>
                Showing{" "}
                <span className="
                  font-semibold
                  text-gray-700
                ">
                  {filteredResults.length}
                </span>{" "}
                result
                {filteredResults.length !== 1
                  ? "s"
                  : ""}
              </>
            ) : (
              <>
                Total results:{" "}
                <span className="
                  font-semibold
                  text-gray-700
                ">
                  {results.length}
                </span>
              </>
            )}

          </p>

        </div>


        {/* =============================================
            TABLE
        ============================================= */}

        <div className="
          overflow-x-auto
          rounded-lg
          shadow-sm
          ring-1
          ring-gray-200
        ">

          <table className="
            min-w-full
            divide-y
            divide-gray-200
          ">

            {/* =========================================
                HEADER
            ========================================= */}

            <thead className="
              bg-gray-900
            ">

              <tr>

                <th className="
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-semibold
                  text-white
                ">
                  Rank
                </th>


                <th className="
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-semibold
                  text-white
                ">
                  Test Name
                </th>


                <th className="
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-semibold
                  text-white
                ">
                  Marks
                </th>


                <th className="
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-semibold
                  text-white
                ">
                  Difficulty
                </th>


                <th className="
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-semibold
                  text-white
                ">
                  Percentage
                </th>


                <th className="
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-semibold
                  text-white
                ">
                  Date
                </th>


                <th className="
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-semibold
                  text-white
                ">
                  Action
                </th>

              </tr>

            </thead>


            {/* =========================================
                BODY
            ========================================= */}

            <tbody className="
              divide-y
              divide-gray-200
              bg-white
            ">


              {/* NO RESULTS */}

              {filteredResults.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}

                    className="
                      px-4
                      py-10
                      text-center
                      text-sm
                      text-gray-500
                    "
                  >

                    {selectedDate ||
                    searchQuery
                      ? "No exams found matching your filters."
                      : "No results available."}

                  </td>

                </tr>

              ) : (

                filteredResults.map(
                  (item, index) => (

                    <tr
                      key={item._id}

                      className={
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                      }
                    >


                      {/* RANK */}

                      <td className="
                        whitespace-nowrap
                        px-4
                        py-3
                        text-sm
                        text-gray-700
                      ">
                        {index + 1}
                      </td>


                      {/* TEST NAME */}

                      <td className="
                        max-w-xs
                        px-4
                        py-3
                        text-sm
                        text-gray-700
                      ">

                        <div
                          className="
                            truncate
                            font-medium
                          "

                          title={
                            item.topic
                          }
                        >
                          {item.topic ||
                            "Untitled Test"}
                        </div>

                      </td>


                      {/* MARKS */}

                      <td className="
                        whitespace-nowrap
                        px-4
                        py-3
                        text-sm
                        text-gray-700
                      ">
                        {item.marks}
                      </td>


                      {/* DIFFICULTY */}

                      <td className="
                        whitespace-nowrap
                        px-4
                        py-3
                        text-sm
                        text-gray-700
                      ">

                        <span className="
                          capitalize
                        ">
                          {item.difficulty ||
                            "None"}
                        </span>

                      </td>


                      {/* PERCENTAGE */}

                      <td className="
                        whitespace-nowrap
                        px-4
                        py-3
                        text-sm
                      ">

                        <span className="
                          font-semibold
                          text-gray-800
                        ">
                          {item.percentage}%
                        </span>

                      </td>


                      {/* DATE */}

                      <td className="
                        whitespace-nowrap
                        px-4
                        py-3
                        text-sm
                        text-gray-700
                      ">

                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "—"}

                      </td>


                      {/* ACTION */}

                      <td className="
                        whitespace-nowrap
                        px-4
                        py-3
                        text-sm
                      ">

                        <button
                          type="button"

                          onClick={() =>
                            handleViewDetails(
                              item._id
                            )
                          }

                          className="
                            rounded-md
                            bg-blue-500
                            px-4
                            py-1.5
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-blue-600
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            focus:ring-offset-1
                          "
                        >
                          View Details
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}