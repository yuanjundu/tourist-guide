import React, { useState } from 'react';
import axios from 'axios';
import SignupStyle from './Signup.module.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setpassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    setErrors({}); // reset errors

    if (username === '') {
      setErrors({ username: ['Username cannot be empty.'] });
      return;
    }

    if (password !== password2) {
      setErrors({
        ...errors,
        password2: ['The two passwords do not match.']
      });
      return;
    }

    axios
      .post(`${process.env.REACT_APP_API_URL}/api/signup/`, {
        username: username,
        password: password,
        password2: password2,
        email: email
      })
      .then((response) => {
        console.log(response.data);
        window.location.href = '/';
      })
      .catch((error) => {
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
        <h1>Let's make</h1>
        <h1>memories!</h1>
      </div>
      <div class={SignupStyle.sub_log}>
        <h3>This will create an account for ya</h3>
      </div>

      <input class = {SignupStyle.input} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      {errors.username && errors.username.map((error, index) => <p key={index} className="error">{error}</p>)}
      <li class={SignupStyle.p}>Max 150 characters. Letters, digits, @ . + - _ only.</li>

      <input class = {SignupStyle.input}  type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      {errors.email && errors.email.map((error, index) => <p key={index} className="error">{error}</p>)}

      <input class = {SignupStyle.input}  type="password" placeholder="Password" value={password} onChange={e => setpassword(e.target.value)} required />
      {errors.password && errors.password.map((error, index) => <p key={index} className="error">{error}</p>)}
      
      <input class = {SignupStyle.input}  type="password" placeholder="Confirm Password" value={password2} onChange={e => setPassword2(e.target.value)} required />
      {errors.password2 && errors.password2.map((error, index) => <p key={index} className="error">{error}</p>)}
      <li class={SignupStyle.p}>Your password can't be too similar to personal information.</li>
      <li class={SignupStyle.p}>At least 8 characters.</li>
      <li class={SignupStyle.p}>Can't be just numeric.</li>
      <button type="submit" class = {SignupStyle.button}>Sign Up</button>

      <div class={SignupStyle.container1}>
        <span className={SignupStyle.psw}>You already have an account? <a className={SignupStyle.psw2} href="/login"><b>Log in</b></a></span>
      </div>
    </form>
    </body>

  );
};

export default Signup;
