import { useLoaderData, json } from "react-router-dom";
import HomePage from "./Home";

function PopularPage() {
  const postData = useLoaderData();

  return <HomePage popularData={postData} />;
}

export default PopularPage;

export async function loader() {
  const response = await fetch(
    "http://127.0.0.1:3000/api/v1/content?sort=-upVote"
  );

  const data = await response.json();

  if (!response.ok) {
    return json({ message: "Could not fetch the posts" }, { status: 500 });
  }

  return data.data;
}
