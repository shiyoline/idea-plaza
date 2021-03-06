/* This file is responsible for sending requests to the server */
import axios from 'axios'
const baseUrl = '/api/users'

/* This function logs in the user. */
const login = async (credentials) => {
  const response = await axios.post(`${baseUrl}/login`, credentials)
  return response.data
}

/* This function creates a new user. */
const create = async (newUserObject) => {
  /* header is given as 3rd param of axios post method */
  const response = await axios.post(baseUrl, newUserObject)
  return response.data
}

// get user data based on id
const getData = async (id) => {
  const response = await axios.post(`${baseUrl}/getUserID`, id)

  return response.data
}

export default { login, create, getData }
