import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PlantForm from "../components/PlantForm.jsx";
import { ErrorState, Loading } from "../components/Feedback.jsx";
import api, { getErrorMessage } from "../services/api.js";

export default function PlantEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api.get(`/plants/${id}`).then((response) => setPlant(response.data.plant)).catch((requestError) => setError(getErrorMessage(requestError))).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading label="Loading plant details..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  return <PlantForm plant={plant} onSaved={() => navigate("/plants")} />;
}
