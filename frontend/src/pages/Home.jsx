
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

export default function Home() {
    const [boards, setBoards] = useState([]);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [isPrivate, setIsPrivate] = useState(true);

    const navigate = useNavigate();

    const loadBoards = () => {
        setLoading(true);

        api.listBoards()
            .then(setBoards)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadBoards();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const board = await api.createBoard({
                name: name.trim() || "Untitled",
                visibility: isPrivate ? "private" : "public",
            });

          navigate(`/boards/${board.boards._id}`);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteBoard(id);
            setBoards((prev) => prev.filter((b) => b._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <main className="home">
            <header className="home-header">
                <h1>Collaborative Whiteboard</h1>
                <p>Create a board or continue working on an existing one.</p>
            </header>

            <form className="create-form" onSubmit={handleCreate}>
                <input
                    type="text"
                    placeholder="Board name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Board name"
                />

                <div className="visibility-control">
                    <span
                        className={`visibility-label ${
                            isPrivate ? "is-private" : "is-public"
                        }`}
                    >
                        {isPrivate ? "Private" : "Public"}
                    </span>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={!isPrivate}
                        aria-label="Make board public"
                        className={`visibility-switch ${
                            !isPrivate ? "is-public" : ""
                        }`}
                        onClick={() => setIsPrivate((prev) => !prev)}
                    >
                        <span className="visibility-knob" />
                    </button>
                </div>

                <button type="submit" className="create-board-btn">
                    + New board
                </button>
            </form>

            {error && <p className="error-text">{error}</p>}

            <section className="boards-section">
                <h2>Your boards</h2>

                {loading ? (
                    <p className="muted">Loading boards...</p>
                ) : boards.length === 0 ? (
                    <p className="empty-state">
                        No boards yet. Create your first board to get started.
                    </p>
                ) : (
                    <ul className="board-list">
                        {boards.map((b) => (
                            <li key={b._id} className="board-item">
                                <button
                                    type="button"
                                    className="board-link"
                                    onClick={() =>
                                        navigate(`/boards/${b._id}`)
                                    }
                                >
                                    <span className="board-name">
                                        {b.name}
                                    </span>

                                    <span className="board-meta">
                                        Updated{" "}
                                        {new Date(
                                            b.updatedAt
                                        ).toLocaleString()}
                                    </span>

                                    <span
                                        className={`board-type ${
                                            b.visibility === "public"
                                                ? "board-type-public"
                                                : "board-type-private"
                                        }`}
                                    >
                                        {b.visibility === "public"
                                            ? "Public"
                                            : "Private"}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
