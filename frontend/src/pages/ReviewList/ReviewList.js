import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const ws = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    ws.current = new WebSocket(`ws://localhost:3000?token=${token}`);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (message) => {
      const {
        type,
        review,
        id,
        reviews: initialReviews,
      } = JSON.parse(message.data);
      if (type === "INITIAL") {
        setReviews(initialReviews);
      } else if (type === "ADD") {
        setReviews((prev) => [review, ...prev]);
      } else if (type === "EDIT") {
        setReviews((prev) =>
          prev.map((r) => (r._id === review._id ? review : r))
        );
      } else if (type === "DELETE") {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = (event) => {
      console.log("WebSocket closed:", event);
    };

    return () => {
      ws.current.close();
    };
  }, [navigate]);

  const deleteReview = (id) => {
    ws.current.send(JSON.stringify({ type: "DELETE", id }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h1>Reviews</h1>
      <button onClick={handleLogout}>Logout</button>
      <Link to="/new">Create New Review</Link>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Content</th>
            <th>Date-Time</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {reviews.length > 0 &&
            reviews.map((review, index) => {
              return (
                <tr key={review._id} >
                  <td>{index + 1}</td>
                  <td>{review.title}</td>
                  <td>{review.content}</td>
                  <td>{new Date(review.dateTime).toLocaleString()}</td>
                  <td>
                    <Link to={`/${review._id}`}>Edit</Link>
                  </td>
                  <td>
                    <button onClick={() => deleteReview(review._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewList;
