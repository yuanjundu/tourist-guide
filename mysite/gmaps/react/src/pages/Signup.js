import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';

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
      .post('http://localhost:8000/api/signup/', {
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
    <form onSubmit={handleSubmit} className="container">
      <div class="group_no">
        <h2>GROUP 16</h2>
      </div>
      <div class="log">
        <h1>Let's make</h1>
        <h1>memories!</h1>
      </div>
      <div class="sub_log">
        <h3>This will create an account for ya</h3>
      </div>

      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      {errors.username && errors.username.map((error, index) => <p key={index} className="error">{error}</p>)}
      <p>Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.</p>

      <input type="text" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      {errors.email && errors.email.map((error, index) => <p key={index} className="error">{error}</p>)}

      <input type="password" placeholder="Password" value={password} onChange={e => setpassword(e.target.value)} required />
      {errors.password && errors.password.map((error, index) => <p key={index} className="error">{error}</p>)}
      <li>Your password can’t be too similar to your other personal information.</li>
      <li>Your password must contain at least 8 characters.</li>
      <li>Your password can’t be a commonly used password.</li>
      <li>Your password can’t be entirely numeric.</li>

      <input type="password" placeholder="Confirm Password" value={password2} onChange={e => setPassword2(e.target.value)} required />
      {errors.password2 && errors.password2.map((error, index) => <p key={index} className="error">{error}</p>)}

      <button type="submit">Sign Up</button>

      <div className="container1">
        <span className="psw">You already have an account? <a href="/login"><b>Log in</b></a></span>
      </div>
    </form>

  );
};

export default Signup;
