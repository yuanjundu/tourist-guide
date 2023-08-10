import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SignupStyle from './ResetPassword.module.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(''); 
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(`${process.env.REACT_APP_API_URL}/api/password/reset/`, {
        username: username,
        email: email
      })
      .then((response) => {
        setMessage(response.data.detail);  // show success message
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          setErrors(error.response.data);
          setMessage('');  // clear message when there are errors
        }
      });
  };

  return (
    <body className={SignupStyle.body}>
    <div class={SignupStyle.group_no}>
        <h1>Itinera</h1>
      </div>
    <div className={SignupStyle.wrapper}>
    <form onSubmit={handleSubmit} className="container">
      <div className={SignupStyle.log}>
        <h1>Reset Password</h1>
      </div>
      
      <div className={SignupStyle.sub_log}>
        <h3>Please enter your username and email address to receive password reset instructions.</h3>
      </div>
      <div className={SignupStyle.container}>
        <input className={SignupStyle.input} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        {errors.username && errors.username.map((error, index) => <p key={index} className="error">{error}</p>)}

        <input className={SignupStyle.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        {errors.email && errors.email.map((error, index) => <p key={index} className="error">{error}</p>)}

        <button type="submit" className={SignupStyle.button}>Submit</button>

        {errors.detail && <p className={SignupStyle.error}>{errors.detail}</p>}
        {message && <p className={SignupStyle.message}>{message}</p>}
      </div>
    </form>
    </div>
    </body>
  );
};

export default ResetPassword;
