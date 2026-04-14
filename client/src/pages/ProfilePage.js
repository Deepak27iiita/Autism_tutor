import { useEffect, useState } from "react";
import { parseError, usersApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    animationIntensity: "medium",
    soundEnabled: true,
    autoAdvance: false,
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      animationIntensity: user.preferences?.animationIntensity || "medium",
      soundEnabled: user.preferences?.soundEnabled ?? true,
      autoAdvance: user.preferences?.autoAdvance ?? false,
    });
  }, [user]);

  const onChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      const userId = user.id || user._id;
      const response = await usersApi.updatePreferences(userId, formData);
      setUser({ ...user, preferences: response.preferences });
      setStatus({
        type: "success",
        message: "Preferences updated successfully.",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: parseError(err, "Failed to update preferences."),
      });
    }
  };

  return (
    <section className="stack-lg">
      <div className="card">
        <h2>Profile & Learning Preferences</h2>
        <p>
          Personalize animation and interaction settings for better focus and
          comfort.
        </p>
      </div>

      <form className="card stack-md" onSubmit={onSubmit}>
        <label>
          Animation Intensity
          <select
            name="animationIntensity"
            value={formData.animationIntensity}
            onChange={onChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="soundEnabled"
            checked={formData.soundEnabled}
            onChange={onChange}
          />
          Sound enabled
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="autoAdvance"
            checked={formData.autoAdvance}
            onChange={onChange}
          />
          Auto-advance between stages
        </label>

        {status.message && (
          <p
            className={status.type === "error" ? "error-text" : "success-text"}
          >
            {status.message}
          </p>
        )}

        <button className="btn btn-primary" type="submit">
          Save Preferences
        </button>
      </form>
    </section>
  );
};

export default ProfilePage;
