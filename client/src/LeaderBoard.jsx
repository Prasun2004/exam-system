import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style/LeaderBoard.css";

export default function LeaderBoard() {
  const [results, setResults] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/leaderboard"
      );

      setResults(res.data);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Test Name</th>
            <th>Marks</th>
            <th>Percentage</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {results.map((item, index) => (
            <tr key={item._id}>
              <td>{index + 1}</td>

              <td>{item.topic}</td>

              <td>{item.marks}</td>

              <td>{item.percentage}%</td>

              <td>
        {new Date(
          item.createdAt
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

              <td>
                <button
                  onClick={() =>
                    navigate(`/result/${item._id}`)
                  }
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}