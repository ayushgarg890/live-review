import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const getToken = () => localStorage.getItem("token");

const ReviewForm = () => {
  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    ws.current = new WebSocket(`ws://localhost:3000?token=${token}`);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
      if (id) {
        ws.current.send(JSON.stringify({ type: "FETCH", id }));
      }
    };

    ws.current.onmessage = (message) => {
      const { type, review } = JSON.parse(message.data);

      if (type === "INITIAL") {
        if (review && review.title && review.content) {
          setTitle(review.title);
          setContent(review.content);
        }
      } else if (type === "FETCH") {
        setTitle(review.title);
        setContent(review.content);
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
  }, [id, ws]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const review = {
      title,
      content,
      _id: id || `${Date.now()}`,
      dateTime: new Date().toISOString(),
    };
    const type = id ? "EDIT" : "ADD";

    ws.current.send(JSON.stringify({ type, review, id }));
    navigate("/");
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
  };

  return (
    <div>
      <h1>{id ? "Edit Review" : "New Review"}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">Save</button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
        <button type="button" onClick={() => navigate("/")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
