import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignupStyle from './login.module.css';
import Footer from '../components/Footer';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(`${process.env.REACT_APP_API_URL}/api/token/`, {
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
    <body class={SignupStyle.body}>
    <form onSubmit={handleSubmit} className="container">
      <div class={SignupStyle.group_no}>
        <h2>GROUP 16</h2>
      </div>
      <div class={SignupStyle.log}>
        <h1>Let's log</h1>
        <h1>you in!</h1>
      </div>
      <div class={SignupStyle.sub_log}>
        <h3>Enter your details below to log into your account.</h3>
      </div>
      
      <div class={SignupStyle.container}>
      <input class = {SignupStyle.input} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      {errors.username && errors.username.map((error, index) => <p key={index} className="error">{error}</p>)}

      <input class = {SignupStyle.input}  type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      {errors.password && errors.password.map((error, index) => <p key={index} className="error">{error}</p>)}

      <button type="submit" class = {SignupStyle.button}>Log in</button>
      </div>
      
      
      <div className={SignupStyle.forgot}>
        <a className={SignupStyle.forgotpassword}href= "/resetPassword"> Forget your password? </a>
      </div>

      <div class={SignupStyle.container1}>
        <span className={SignupStyle.psw}>Don't have an account? <a className={SignupStyle.psw2} href="/register"><b>Sign up</b></a></span>
      </div>
    </form>
    <Footer />
    </body>
  );
};

export default Login;
