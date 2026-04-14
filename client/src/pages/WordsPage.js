import { useEffect, useState } from "react";
import { parseError, wordsApi } from "../services/api";

const initialWord = {
  word: "",
  category: "animals",
  imageUrl: "",
  audioUrl: "",
  difficulty: "easy",
  pecsPhase: 1,
};

const WordsPage = () => {
  const [words, setWords] = useState([]);
  const [formData, setFormData] = useState(initialWord);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewFailed, setPreviewFailed] = useState(false);

  const hasImagePreview = Boolean(formData.imageUrl.trim());

  const loadWords = async () => {
    setLoading(true);
    try {
      const data = await wordsApi.list();
      setWords(data);
    } catch (err) {
      setError(parseError(err, "Failed to load words"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  const onChange = (event) => {
    if (event.target.name === "imageUrl") {
      setPreviewFailed(false);
    }

    setFormData((prev) => ({
      ...prev,
      [event.target.name]:
        event.target.name === "pecsPhase"
          ? Number(event.target.value)
          : event.target.value,
    }));
  };

  const resetForm = () => {
    setFormData(initialWord);
    setEditingId("");
    setPreviewFailed(false);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await wordsApi.update(editingId, formData);
      } else {
        await wordsApi.create(formData);
      }
      await loadWords();
      resetForm();
    } catch (err) {
      setError(parseError(err, "Failed to save word"));
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (word) => {
    setEditingId(word._id);
    setFormData({
      word: word.word,
      category: word.category,
      imageUrl: word.imageUrl,
      audioUrl: word.audioUrl || "",
      difficulty: word.difficulty,
      pecsPhase: word.pecsPhase,
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this word?")) {
      return;
    }

    try {
      await wordsApi.remove(id);
      setWords((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(parseError(err, "Failed to delete word"));
    }
  };

  return (
    <section className="grid-2">
      <form className="card stack-md" onSubmit={onSubmit}>
        <h2>{editingId ? "Edit Word" : "Add New Word"}</h2>

        <label>
          Word
          <input
            name="word"
            value={formData.word}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Category
          <select name="category" value={formData.category} onChange={onChange}>
            <option value="animals">Animals</option>
            <option value="food">Food</option>
            <option value="objects">Objects</option>
            <option value="actions">Actions</option>
            <option value="colors">Colors</option>
            <option value="body">Body</option>
            <option value="clothing">Clothing</option>
            <option value="transport">Transport</option>
          </select>
        </label>

        <label>
          Image URL
          <input
            name="imageUrl"
            value={formData.imageUrl}
            onChange={onChange}
            required
            placeholder="https://example.com/image.jpg"
          />
        </label>

        {hasImagePreview && (
          <div className="stack-md">
            <p className="helper-text">Image preview</p>
            {!previewFailed ? (
              <img
                className="image-preview"
                src={formData.imageUrl}
                alt="Preview"
                onError={() => setPreviewFailed(true)}
              />
            ) : (
              <p className="error-text">
                This URL could not be loaded as an image.
              </p>
            )}
          </div>
        )}

        <label>
          Audio URL
          <input
            name="audioUrl"
            value={formData.audioUrl}
            onChange={onChange}
          />
        </label>

        <label>
          Difficulty
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={onChange}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <label>
          PECS Phase
          <select
            name="pecsPhase"
            value={formData.pecsPhase}
            onChange={onChange}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </label>

        {error && <p className="error-text">{error}</p>}

        <div className="row-wrap">
          <button className="btn btn-primary" disabled={saving} type="submit">
            {saving ? "Saving..." : editingId ? "Update Word" : "Create Word"}
          </button>
          {editingId && (
            <button className="btn btn-ghost" onClick={resetForm} type="button">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="card stack-md">
        <h2>Word Library ({words.length})</h2>
        <div className="word-list">
          {loading && <p className="helper-text">Loading words...</p>}
          {!loading && words.length === 0 && (
            <p className="helper-text">
              No words yet. Add your first word from the form.
            </p>
          )}
          {words.map((word) => (
            <article key={word._id} className="word-item">
              <img
                src={word.imageUrl}
                alt={word.word}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://via.placeholder.com/220x170?text=Image+Unavailable";
                }}
              />
              <div>
                <h4>{word.word}</h4>
                <p>
                  {word.category} • {word.difficulty} • Phase {word.pecsPhase}
                </p>
                <div className="row-wrap">
                  <button
                    className="btn btn-secondary"
                    onClick={() => onEdit(word)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => onDelete(word._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WordsPage;
