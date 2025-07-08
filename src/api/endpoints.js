import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/'
// const BASE_URL = 'https://protected-escarpment-28699-5084c61b5747.herokuapp.com/api/'
const GET_URL = `${BASE_URL}presets`
const POST_URL = `${BASE_URL}presets`
const DELETE_URL = (id) => `${BASE_URL}presets/${id}`
const UPDATE_URL = (id) => `${BASE_URL}presets/${id}`

export const get_presets = async () => {
	// promise - wait for this code before executing any other code so we have data from db
	const response = await axios.get(GET_URL);
	return response.data;
}

export const create_preset = async (preset_params) => {
	// {
	//  "title": "Default Settings",
	// 	"ripple_speed": 25,
	// 	"ripple_sustain": 5,
	// 	"amount_of_rain": 300,
	// 	"octave": 2,
	// 	"filter_frequency": 589,
	// 	"filter_q": 1
	// }
	// post request to same url as index action with data for attributes included
	const response = await axios.post(POST_URL, preset_params);
	return response.data;
}

export const delete_preset = async (id) => {
	// post request to same url as index action with data for attributes included
	const response = await axios.delete(DELETE_URL(id));
	return response.data;
}

export const update_preset = async (id, preset_params) => {
	// post request to same url as index action with data for attributes included
	const response = await axios.patch(UPDATE_URL(id), preset_params);
	return response.data;
}
