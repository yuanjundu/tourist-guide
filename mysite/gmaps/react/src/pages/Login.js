import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post('http://localhost:8000/api/token/', {
        username: username,
        password: password
      })
      .then((response) => {
        const { refresh, access } = response.data;
        localStorage.setItem('refresh', refresh);
        localStorage.setItem('access', access);

        // redirect to home page after successful login
        navigate('/');
      })
      .catch((error) => {
        console.log(error)
        if (error.response) {
          setErrors(error.response.data);
        }
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div class="group_no">
        <h2>GROUP 16</h2>
      </div>
      <div class="log">
        <h1>Let's log</h1>
        <h1>you in!</h1>
      </div>
      <div class="sub_log">
        <h3>Enter your details to log in your account.</h3>
      </div>
      <label>
        Username:
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
        {errors.username && <p>{errors.username}</p>}
      </label>

      <label>
        Password:
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {errors.password && <p>{errors.password}</p>}
      </label>

      <input type="submit" value="Submit" />

      <div class="container1">
        <span class="psw">Don't have an account? <a href="/signup/"><b>Sign up</b></a></span>
      </div>
    </form>
  );
};

export default Login;
