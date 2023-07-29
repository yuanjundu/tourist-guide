import axios from 'axios';

export const refreshToken = (callback) => {
    // retrieve refresh token from storage
    const refreshToken = localStorage.getItem('refresh');

    return axios.post(`${process.env.REACT_APP_API_URL}/api/token/refresh/`, { refresh: refreshToken })
        .then((response) => {
            // store the new access token
            localStorage.setItem('access', response.data.access);
            // retry the failed request
            callback();
        })
        .catch((error) => {
            console.log(error);
            alert("An error occurred while refreshing the token.");
        });
};
