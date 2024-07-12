const WebSocket = require("ws");

const startServer = async () => {
  const app = require("../app");

  const port = process.env.PORT || 3000;

  app.set("port", port);

  const http = require("http");

  const server = http.createServer(app);

  const wss = new WebSocket.Server({ server });

  const jwt = require("jsonwebtoken");

  

  wss.on("connection", (ws, req) => {
    console.log("Client connected");

    // Authenticate WebSocket connection
    const token = req.url.split("token=")[1];
    if (!token) {
      ws.close();
      return;
    }

    jwt.verify(token, secret, async (err, user) => {
      if (err) {
        ws.close();
        return;
      }

      const { username } = user;
      const userReviews = await Review.find({ user: username });
      ws.send(JSON.stringify({ type: "INITIAL", reviews: userReviews }));

      ws.on("message", async (message) => {
        const { type, review, id } = JSON.parse(message);

        if (type === "ADD") {
          const newReview = new Review({
            ...review,
            user: username,
            dateTime: new Date().toISOString(),
          });
          await newReview.save();
          broadcast({ type: "ADD", review: newReview });
        } else if (type === "EDIT") {
          const updatedReview = await Review.findOneAndUpdate(
            { _id: review._id, user: username },
            review,
            { new: true }
          );
          if (updatedReview) broadcast({ type: "EDIT", review: updatedReview });
        } else if (type === "DELETE") {
          await Review.deleteOne({ _id: id, user: username });
          broadcast({ type: "DELETE", id });
        } else if (type === "FETCH") {
          const fetchedReview = await Review.findOne({
            _id: id,
            user: username,
          });
          ws.send(JSON.stringify({ type: "FETCH", review: fetchedReview }));
        }
      });

      ws.on("close", () => console.log("Client disconnected"));
    });
  });

  const broadcast = (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  server.listen(port);

  return server;
};

module.exports.server = () => {
  return startServer();
};
