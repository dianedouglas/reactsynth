import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/'
const GET_URL = `${BASE_URL}todos`
const POST_URL = `${BASE_URL}todos`

export const get_todos = async () => {
	// promise - wait for this code before executing any other code so we have data from db
	const response = await axios.get(GET_URL);
	return response.data
}

export const create_todo = async (todo_name) => {
	// post request to same url as index action with data for attributes included
	const response = await axios.post(POST_URL, {'todo_name': todo_name, 'completed': false});
	return response.data
}
