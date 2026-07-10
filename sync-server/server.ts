import "dotenv/config";
import httpServer from "./api/socket.js"

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});