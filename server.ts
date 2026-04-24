import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";

interface QueueEntry {
    id: string;
    guest_name: string;
    party_size: number;
    status: "WAITING" | "CALLED";
    created_at: string;
}

let queue: QueueEntry[] = [];

async function startServer() {
    const app = express();
    const PORT = 3000;

    app.use(cors({ origin: "*" }));
    app.use(express.json());

    // API Routes
    app.post("/api/queue", (req, res) => {
        const { guest_name, party_size } = req.body;
        if (!guest_name || !party_size) {
            return res
                .status(400)
                .json({ error: "Guest name and party size are required" });
        }
        const id = crypto.randomUUID();
        const entry: QueueEntry = {
            id,
            guest_name,
            party_size,
            status: "WAITING",
            created_at: new Date().toISOString(),
        };
        queue.push(entry);
        res.json({ id });
    });

    app.get("/api/queue", (req, res) => {
        res.json(queue);
    });

    app.get("/api/queue/:id", (req, res) => {
        const { id } = req.params;
        const index = queue.findIndex((q) => q.id === id);
        if (index === -1) {
            return res.status(404).json({ error: "Not found" });
        }
        res.json({
            entry: queue[index],
            partiesAhead: index,
        });
    });

    app.patch("/api/queue/:id", (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        const entry = queue.find((q) => q.id === id);
        if (!entry) {
            return res.status(404).json({ error: "Not found" });
        }
        if (status === "WAITING" || status === "CALLED") {
            entry.status = status;
        }
        res.json(entry);
    });

    app.delete("/api/queue/:id", (req, res) => {
        const { id } = req.params;
        queue = queue.filter((q) => q.id !== id);
        res.json({ success: true });
    });

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
