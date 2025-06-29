import axios from 'axios';

const BASE_URL = 'https://protected-escarpment-28699-5084c61b5747.herokuapp.com/'
const GET_URL = `${BASE_URL}todos`
const POST_URL = `${BASE_URL}todos`
const DELETE_URL = (id) => `${BASE_URL}todos/${id}`
const UPDATE_URL = (id) => `${BASE_URL}todos/${id}/update_completed`

export const get_todos = async () => {
	// promise - wait for this code before executing any other code so we have data from db
	const response = await axios.get(GET_URL);
	return response.data;
}

export const create_todo = async (todo_name) => {
	// post request to same url as index action with data for attributes included
	const response = await axios.post(POST_URL, {'todo_name': todo_name, 'completed': false});
	return response.data;
}

export const delete_todo = async (id) => {
	// post request to same url as index action with data for attributes included
	const response = await axios.delete(DELETE_URL(id));
	return response.data;
}

export const update_todo = async (id, completed) => {
	// post request to same url as index action with data for attributes included
	const response = await axios.patch(UPDATE_URL(id), {'completed': completed});
	return response.data;
}
