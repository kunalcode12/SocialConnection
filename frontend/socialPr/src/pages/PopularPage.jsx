import { useLoaderData } from "react-router-dom";
import HomePage from "./Home";

function PopularPage() {
  const popularData = useLoaderData();
  return <HomePage popularData={popularData} />;
}

export default PopularPage;

export async function loader() {
  try {
    const response = await fetch(
      "http://127.0.0.1:3000/api/v1/content?sort=-upVote"
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not fetch popular posts");
    }

    return {
      data: data.data,
      status: "success",
    };
  } catch (error) {
    return {
      data: [],
      status: "error",
      message: error.message,
    };
  }
}
