import { json } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import HomePage from "./Home";

function NewestPage() {
  const postData = useLoaderData();
  return (
    <div>
      <HomePage popularData={postData} />
    </div>
  );
}

export default NewestPage;

export async function loader() {
  const response = await fetch(
    "http://127.0.0.1:3000/api/v1/content?sort=-createdAt"
  );

  const data = await response.json();

  if (!response.ok) {
    return json({ message: "Could not fetch the posts" }, { status: 500 });
  }

  return data.data;
}
