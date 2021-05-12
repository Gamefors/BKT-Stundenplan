import { fetchServer } from "../config/config.js";
const getTimetableData = async function getTimetableData() {
  const response = await fetch(fetchServer, {});
  return response.json();
};
export { getTimetableData };
